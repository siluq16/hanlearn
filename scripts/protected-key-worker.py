"""Local-only libpq extended-protocol worker. stdin contains synthetic fixtures only.
Never prints payloads, SQL, parameters, libpq error strings, or integrity digests.
"""
import ctypes as C
# CPython builtin hashing avoids a competing OpenSSL DLL before libpq on Windows.
try:
    from _sha2 import sha256
except ImportError:
    from _sha256 import sha256
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
    manifest_bytes = (public_root / "manifest.json").read_bytes()
    if sha256(manifest_bytes).hexdigest() != "dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b":
        raise SafeFailure("PUBLIC_FREEZE_MISMATCH")
    manifest = json.loads(manifest_bytes)
    for file in manifest["files"]:
        if sha256((public_root / file["path"]).read_bytes()).hexdigest() != file["sha256"]:
            raise SafeFailure("PUBLIC_FREEZE_MISMATCH")
    read = lambda name: json.loads((public_root / name).read_text(encoding="utf-8"))
    expected_batches = [
        ["public.syllabus_versions", [manifest["syllabus"]]],
        ["public.courses", [manifest["course"]]], ["public.units", [manifest["unit"]]],
        ["public.vocabulary", read("vocabulary.json")], ["public.grammar_points", read("grammar.json")],
        ["public.lessons", [read(l["file"]) for l in manifest["lessons"]]],
        *[["public." + name, manifest[name]] for name in ("syllabus_vocabulary", "syllabus_grammar", "lesson_vocabulary", "lesson_grammar")],
        ["public.lesson_quizzes", [read(l["quiz_file"])["quiz"] for l in manifest["lessons"]]],
        ["public.quiz_questions", [q for l in manifest["lessons"] for q in read(l["quiz_file"])["questions"]]],
    ]
    batches = request.get("public", {}).get("batches")
    if json.dumps(batches, sort_keys=True) != json.dumps(expected_batches, sort_keys=True):
        raise SafeFailure("PUBLIC_BATCHES_REJECTED")
    operation = request.get("operation", "draft_import")
    if operation not in ("draft_import", "promote_fixture"):
        raise SafeFailure("SYNTHETIC_OPERATION_REQUIRED")
    tables = [table for table, _ in expected_batches] + ["private.quiz_answer_keys"]
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
    allowed_faults = (None, "partial", "duplicate", "foreign_key", "unsafe_logging") if operation == "draft_import" else (None, "promotion_partial", "promotion_metadata", "unsafe_logging")
    if request.get("fault") not in allowed_faults:
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
    public_rows = 0
    promoted = 0

    def execute(sql, parameters=None, scalar=False):
        if parameters is None:
            result = pq.PQexec(connection, sql.encode("utf-8"))
        else:
            encoded = [None if p is None else str(p).encode("utf-8") for p in parameters]
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
        execute("LOCK TABLE " + ",".join(tables) + " IN SHARE ROW EXCLUSIVE MODE")
        if operation == "draft_import":
            # Use the pinned collision query, never caller-provided executable SQL.
            preflight = (public_root.parent.parent.parent / "supabase/verification/pilot_r3_readonly_preflight.sql").read_bytes()
            if sha256(preflight).hexdigest() != "e952c38ab4392221b5f7cdaf1df5e44141536f3f4e2dcad162bab63a89fad908":
                raise SafeFailure("COLLISION_SQL_DRIFT")
            sql = preflight.decode("utf-8")
            start = sql.index("WITH incoming AS (")
            end = sql.index("SELECT jsonb_build_object('collisions'", start)
            execute("DO $guard$ DECLARE hit boolean; BEGIN " + sql[start:end] + "SELECT EXISTS(SELECT 1 FROM incoming i JOIN remote_keys r ON r.table_name=i.item->>'table' AND r.key_data @> (i.item->'key')) INTO hit; IF hit THEN RAISE EXCEPTION 'import_collision' USING ERRCODE='23505'; END IF; END $guard$;")
            for table, records in batches:
                columns = ",".join('"' + c + '"' for c in records[0])
                execute("INSERT INTO " + table + "(" + columns + ") SELECT " + columns + " FROM jsonb_populate_recordset(NULL::" + table + ",$1::jsonb)", [json.dumps(records, ensure_ascii=False)])
                public_rows += len(records)
        else:
            # Promotion is a SEPARATE transaction after an exact draft import.
            for table, records in batches:
                columns = ",".join("'" + c + "',a.\"" + c + '\"' for c in records[0])
                matched = int(execute("SELECT count(*) FROM " + table + " a JOIN jsonb_array_elements($1::jsonb) e ON jsonb_build_object(" + columns + ")=e.value", [json.dumps(records, ensure_ascii=False)], True))
                if matched != len(records) or int(execute("SELECT count(*) FROM " + table, scalar=True)) != len(records):
                    raise SafeFailure("DRAFT_SNAPSHOT_MISMATCH")
        statement = "INSERT INTO private.quiz_answer_keys(question_id,correct_index,explanation_vi) VALUES($1::uuid,$2::integer,$3::text)"
        for row in rows:
            parameters = [row["question_id"], row["correct_index"], row["explanation_vi"]]
            if operation == "draft_import":
                execute(statement, parameters)
                attempted += 1
            elif execute("SELECT count(*) FROM private.quiz_answer_keys WHERE question_id=$1::uuid AND correct_index=$2::integer AND explanation_vi=$3::text", parameters, True) != "1":
                raise SafeFailure("SYNTHETIC_STORED_KEYS_REQUIRED")
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
        if operation == "promote_fixture":
            # Fixed synthetic metadata ONLY; no owner evidence or real license enters this path.
            for table in ("public.syllabus_versions", "public.courses", "public.units", "public.vocabulary", "public.grammar_points", "public.lessons", "public.quiz_questions", "public.lesson_quizzes"):
                ids = [r["id"] for t, records in batches if t == table for r in records]
                license_text = None if request.get("fault") == "promotion_metadata" else "SYNTHETIC FIXTURE - NOT A RIGHTS GRANT; SYNTHETIC FIXTURE ONLY"
                extra = ",verified_at=$3::timestamptz" if table == "public.syllabus_versions" else ""
                execute("UPDATE " + table + " SET status='published',review_status='approved',content_license=$1,reviewed_by=$2,reviewed_at=$3::timestamptz" + extra + " WHERE id IN (SELECT value::uuid FROM jsonb_array_elements_text($4::jsonb)) AND status='draft'", [license_text, "SYNTHETIC FIXTURE REVIEWER", "2026-01-01T00:00:00Z", json.dumps(ids)])
                promoted += len(ids)
                if table == "public.lessons" and request.get("fault") == "promotion_partial":
                    raise SafeFailure("SYNTHETIC_PROMOTION_FAILURE")
            if int(execute("SELECT count(*) FROM public.syllabus_versions WHERE is_active", scalar=True)) != 0 or execute("SELECT bool_and(published_at IS NOT NULL) FROM public.lesson_quizzes", scalar=True) != "t":
                raise SafeFailure("PROMOTION_POSTCONDITION_FAILED")
        execute("COMMIT")
        transaction = False
        return {"status": "LOCAL_PASS", "committedKeys": 24 if operation == "draft_import" else 0, "parameterizedKeyRows": attempted,
                "parameterizedPublicRows": public_rows, "promotedEntities": promoted,
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
    except SafeFailure as error:
        code = str(error)
        outcome = {"status": "BLOCKED", "code": code if re.fullmatch(r"[A-Z0-9_]{1,80}", code) else "LOCAL_GUARD_REJECTED", "committedKeys": 0}
    except Exception as error:
        trace = error.__traceback__
        while trace.tb_next:
            trace = trace.tb_next
        # Type/line only; never exception messages, frames, locals or SQL values.
        outcome = {"status": "BLOCKED", "code": "LOCAL_RUNTIME_" + type(error).__name__.upper() + "_L" + str(trace.tb_lineno), "committedKeys": 0}
    print(json.dumps(outcome))
    sys.exit(0 if outcome["status"] == "LOCAL_PASS" else 2)
