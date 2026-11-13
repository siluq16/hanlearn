"""Local-only libpq extended-protocol worker. stdin contains synthetic fixtures only.
Never prints payloads, SQL, parameters, libpq error strings, or integrity digests.
"""
import ctypes as C
import json
import os
import re
import sys
from pathlib import Path


class SafeFailure(Exception):
    pass


def run(request):
    database, nonce = request.get("database", ""), request.get("nonce", "")
    if (request.get("mode") != "SYNTHETIC_DISPOSABLE" or
            not re.fullmatch(r"hanlearn_import_r3_[a-f0-9]{32}", database) or
            not re.fullmatch(r"[a-f0-9]{32}", nonce)):
        raise SafeFailure("LOCAL_SYNTHETIC_TARGET_REQUIRED")
    # Independent worker gate: a forged Node handle cannot deliver real content here.
    public_root = Path(__file__).resolve().parent.parent / "content/pilot-hsk1/v1"
    expected = {}
    for index in range(1, 5):
        quiz = json.loads((public_root / f"quizzes/lesson-0{index}.json").read_text(encoding="utf-8"))
        for i, question in enumerate(quiz["questions"]):
            expected[question["id"]] = (i + 1) % len(question["choices"])
    rows = request.get("rows", [])
    sentinel = "SYNTHETIC PARAMETERIZED FIXTURE 'quoted' \\ slash\nCHỈ THỬ NGHIỆM — NOT LEARNING FEEDBACK"
    if (len(rows) != 24 or len({r.get("question_id") for r in rows}) != 24 or
            any(set(r) != {"question_id", "correct_index", "explanation_vi"} or
                r.get("question_id") not in expected or
                type(r.get("correct_index")) is not int or
                r["correct_index"] != expected[r["question_id"]] or
                r.get("explanation_vi") != sentinel for r in rows)):
        raise SafeFailure("SYNTHETIC_PAYLOAD_REQUIRED")
    if request.get("fault") not in (None, "partial", "duplicate", "foreign_key", "unsafe_logging"):
        raise SafeFailure("UNKNOWN_FIXTURE_FAULT")
    pg_bin = r"C:\Program Files\PostgreSQL\18\bin"
    dll_directory = os.add_dll_directory(pg_bin)
    pq = C.CDLL(str(Path(pg_bin) / "libpq.dll"))
    signatures = {
        "PQconnectdbParams": ([C.POINTER(C.c_char_p), C.POINTER(C.c_char_p), C.c_int], C.c_void_p),
        "PQstatus": ([C.c_void_p], C.c_int),
        "PQexec": ([C.c_void_p, C.c_char_p], C.c_void_p),
        "PQexecParams": ([C.c_void_p, C.c_char_p, C.c_int, C.c_void_p, C.POINTER(C.c_char_p), C.c_void_p, C.c_void_p, C.c_int], C.c_void_p),
        "PQresultStatus": ([C.c_void_p], C.c_int),
        "PQresultErrorField": ([C.c_void_p, C.c_int], C.c_char_p),
        "PQgetvalue": ([C.c_void_p, C.c_int, C.c_int], C.c_char_p),
        "PQntuples": ([C.c_void_p], C.c_int),
        "PQclear": ([C.c_void_p], None),
        "PQfinish": ([C.c_void_p], None),
        "PQsetNoticeProcessor": ([C.c_void_p, C.c_void_p, C.c_void_p], C.c_void_p),
    }
    for name, (arguments, result) in signatures.items():
        getattr(pq, name).argtypes, getattr(pq, name).restype = arguments, result
    # Ignore inherited PG* configuration; no credentials, URLs, services or passfile lookup.
    for key in list(os.environ):
        if key.startswith("PG"):
            os.environ.pop(key, None)
    fields = {"host": "127.0.0.1", "hostaddr": "127.0.0.1", "port": "55449", "dbname": database,
              "user": "postgres", "sslmode": "disable", "connect_timeout": "5",
              "passfile": str(Path(__file__).resolve().parent.parent / ".local/absent-protected-passfile"),
              "client_encoding": "UTF8", "options": "-c search_path=pg_catalog -c client_min_messages=error"}
    keys = (C.c_char_p * (len(fields) + 1))(*[v.encode() for v in fields], None)
    values = (C.c_char_p * (len(fields) + 1))(*[v.encode() for v in fields.values()], None)
    connection = pq.PQconnectdbParams(keys, values, 0)
    quiet_notice = C.CFUNCTYPE(None, C.c_void_p, C.c_char_p)(lambda _arg, _message: None)
    if connection:
        pq.PQsetNoticeProcessor(connection, C.cast(quiet_notice, C.c_void_p), None)
    transaction = False
    attempted = 0

    def execute(sql, parameters=None, scalar=False):
        if parameters is None:
            result = pq.PQexec(connection, sql.encode("utf-8"))
        else:
            encoded = [str(p).encode("utf-8") for p in parameters]
            args = (C.c_char_p * len(encoded))(*encoded)
            result = pq.PQexecParams(connection, sql.encode("utf-8"), len(encoded), None, args, None, None, 0)
        if not result:
            raise SafeFailure("LOCAL_PROTOCOL_FAILURE")
        try:
            if pq.PQresultStatus(result) not in (1, 2):
                state = pq.PQresultErrorField(result, ord("C")) or b""
                code = state.decode("ascii", errors="ignore")
                raise SafeFailure(code if re.fullmatch("[A-Z0-9]{5}", code) else "LOCAL_DATABASE_ERROR")
            if scalar:
                if pq.PQntuples(result) != 1:
                    raise SafeFailure("LOCAL_RESULT_SHAPE")
                return pq.PQgetvalue(result, 0, 0).decode("utf-8")
            return None
        finally:
            pq.PQclear(result)

    try:
        if not connection or pq.PQstatus(connection) != 0:
            raise SafeFailure("LOCAL_CONNECTION_FAILED")
        identity = execute("SELECT current_database()=$1 AND current_user='postgres' AND inet_server_addr()='127.0.0.1'::inet AND inet_server_port()=55449 AND (SELECT count(*) FROM importer_fixture.guard WHERE token=$2)=1", [database, nonce], True)
        if identity != "t":
            raise SafeFailure("LOCAL_IDENTITY_FAILED")
        if request.get("fault") == "unsafe_logging":
            execute("SET log_error_verbosity='verbose'")  # Synthetic-only negative test, session-local.
        expected_settings = {"log_statement": "none", "log_min_error_statement": "panic",
                             "log_parameter_max_length_on_error": "0", "log_error_verbosity": "terse",
                             "log_min_messages": "panic", "shared_preload_libraries": "",
                             "session_preload_libraries": "", "local_preload_libraries": ""}
        for setting, expected_value in expected_settings.items():
            if execute("SELECT current_setting($1)", [setting], True) != expected_value:
                raise SafeFailure("UNSAFE_LOGGING_CONFIGURATION")
        execute("BEGIN ISOLATION LEVEL SERIALIZABLE")
        transaction = True
        execute("SET LOCAL search_path=pg_catalog; SET LOCAL standard_conforming_strings=on; SET LOCAL statement_timeout='30s'; SET LOCAL lock_timeout='5s'")
        execute(request["public"]["lock"])
        execute(request["public"]["collision"])
        for statement in request["public"]["inserts"]:
            execute(statement)  # Frozen public rows only. No private values in these statements.
        statement = "INSERT INTO private.quiz_answer_keys(question_id,correct_index,explanation_vi) VALUES($1::uuid,$2::integer,$3::text)"
        for row in rows:
            parameters = [row["question_id"], row["correct_index"], row["explanation_vi"]]
            execute(statement, parameters)
            attempted += 1
            if attempted == 7:
                if request.get("fault") == "partial":
                    raise SafeFailure("SYNTHETIC_PARTIAL_FAILURE")
                if request.get("fault") == "duplicate":
                    execute(statement, parameters)
                if request.get("fault") == "foreign_key":
                    execute(statement, ["ffffffff-ffff-4fff-8fff-ffffffffffff", 0, sentinel])
        matches = int(execute("SELECT count(*) FROM private.quiz_answer_keys WHERE explanation_vi=$1", [sentinel], True))
        if matches != 24:
            raise SafeFailure("PARAMETER_ROUNDTRIP_MISMATCH")
        execute("COMMIT")
        transaction = False
        return {"status": "LOCAL_PASS", "committedKeys": 24, "parameterizedKeyRows": 24,
                "matchedSyntheticText": matches, "rawErrorsExposed": False}
    except SafeFailure as error:
        if transaction:
            try:
                execute("ROLLBACK")
            except Exception:
                pass  # Connection close also rolls back; never expose libpq diagnostics.
        return {"status": "BLOCKED", "code": str(error), "committedKeys": 0,
                "parameterizedKeyRows": attempted, "rawErrorsExposed": False}
    finally:
        if connection:
            pq.PQfinish(connection)
        dll_directory.close()


if __name__ == "__main__":
    try:
        request_bytes = sys.stdin.buffer.read(4_000_001)
        if len(request_bytes) > 4_000_000:
            raise SafeFailure("INPUT_LIMIT")
        outcome = run(json.loads(request_bytes))
    except Exception:
        outcome = {"status": "BLOCKED", "code": "LOCAL_INPUT_OR_RUNTIME_REJECTED", "committedKeys": 0}
    print(json.dumps(outcome))
    sys.exit(0 if outcome["status"] == "LOCAL_PASS" else 2)
