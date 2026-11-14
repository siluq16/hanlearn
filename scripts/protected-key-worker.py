"""Protected operator libpq worker: synthetic by default; explicit approved Development mode.
Payloads and credentials travel in memory through stdin, never command arguments/files.
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
import socket
from pathlib import Path


class SafeFailure(Exception):
    pass


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def verify_development_schema(execute, root):
    expected = json.loads((root / "supabase/verification/expected_schema.json").read_text(encoding="utf-8-sig"))
    reviewed = json.loads((root / "supabase/verification/reviewed_platform.json").read_text(encoding="utf-8-sig"))
    names = set()
    files = expected["migrationHashes"]
    allowed = [f"20261112000{i}_{name}.sql" for i, name in enumerate(("catalog", "srs", "quiz", "plans_sessions", "learner_access", "catalog_queries"), 1)]
    if [m["file"] for m in files] != allowed:
        raise SafeFailure("MIGRATION_SET_CHANGED")
    for m in files:
        data = (root / "supabase/migrations" / m["file"]).read_bytes()
        if sha256(data).hexdigest().upper() != m["sha256"]:
            raise SafeFailure("MIGRATION_HASH_CHANGED")
        names.update(re.findall(r"create\s+function\s+((?:public|private)\.[a-z_]+)\s*\(", data.decode("utf-8"), re.I))
    def snapshot(file, pinned):
        data = (root / "supabase/verification" / file).read_bytes()
        if sha256(data).hexdigest() != pinned:
            raise SafeFailure("VERIFICATION_SQL_DRIFT")
        return json.loads(execute(data.decode("utf-8"), scalar=True))
    actual = snapshot("cloud_schema_manifest.sql", "a19aa25a74c75a4e5846713c6a4400ac9cb812b5a72e2c5d5bd05791835d5c23")
    extras = [f for f in actual["functions"] if f["schema"] + "." + f["name"] not in names]
    if canonical(extras) != canonical([reviewed["manifestFunction"]]):
        raise SafeFailure("UNCLASSIFIED_PLATFORM_FUNCTION")
    for key, reference in expected["sections"].items():
        records = actual[key] if key != "functions" else [f for f in actual[key] if f["schema"] + "." + f["name"] in names]
        if len(records) != reference["count"] or sha256(canonical(records).encode("utf-8")).hexdigest() != reference["sha256"]:
            raise SafeFailure("SCHEMA_SECURITY_DRIFT")
    platform = snapshot("cloud_platform_security.sql", "f123a5632ae35a959db4e1c0897d45973593feec04c2abc332f0f002e7352fbc")
    f = platform["functions"][0] if len(platform["functions"]) == 1 else {}
    if (canonical({k: v for k, v in f.items() if k not in ("body", "definition")}) != canonical(reviewed["functionMetadata"]) or
            sha256(f.get("body", "").encode()).hexdigest() != reviewed["functionBodySha256"] or
            sha256(f.get("definition", "").encode()).hexdigest() != reviewed["functionDefinitionSha256"] or
            any(canonical(platform[k]) != canonical(reviewed[v]) for k, v in (("event_triggers", "eventTriggers"), ("schema_privileges", "schemaPrivileges"), ("role_flags", "roleFlags")))):
        raise SafeFailure("PLATFORM_SECURITY_DRIFT")
    history = [{"version": m["file"].split("_")[0], "name": m["file"][13:-4]} for m in files]
    if canonical(platform["history"]) != canonical(history):
        raise SafeFailure("REMOTE_MIGRATION_HISTORY_CHANGED")


def run(request):
    database, nonce = request.get("database", ""), request.get("nonce", "")
    development = request.get("mode") == "APPROVED_DEVELOPMENT_INVITE"
    if development:
        if (sys.argv[1:] != ["--apply-approved-invite"] or request.get("project_ref") != "hhgxrjqkuwdgurphopok"
                or not isinstance(request.get("password"), str) or not request["password"]):
            raise SafeFailure("EXPLICIT_DEVELOPMENT_APPROVAL_REQUIRED")
        if os.name != "nt" or os.environ.get("NODE_ENV") == "production" or any(os.environ.get(k) for k in ("CI", "VITEST", "NEXT_RUNTIME", "GITHUB_ACTIONS", "TF_BUILD", "JENKINS_URL", "BUILD_BUILDID", "VERCEL", "NETLIFY")):
            raise SafeFailure("TRUSTED_DEVELOPMENT_RUNTIME_REQUIRED")
    elif (request.get("mode") != "SYNTHETIC_DISPOSABLE" or
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
    if operation not in (("draft_import", "promote_approved") if development else ("draft_import", "promote_fixture")):
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
                (not development and (r["correct_index"] != expected[r["question_id"]] or r.get("explanation_vi") != sentinel)) or
                (development and (not isinstance(r.get("explanation_vi"), str) or not r["explanation_vi"].strip() or "\x00" in r["explanation_vi"] or len(r["explanation_vi"]) > 4000 or
                                  not 0 <= r["correct_index"] < len(next(q for _, rs in expected_batches if _ == "public.quiz_questions" for q in rs if q["id"] == r["question_id"])["choices"]))) for r in rows)):
        raise SafeFailure("SYNTHETIC_PAYLOAD_REQUIRED")
    overlay = None
    if development:
        overlay_bytes = (public_root.parent.parent / "proposals/pilot-hsk1-r3/publication-overlay.v6.json").read_bytes()
        if sha256(overlay_bytes).hexdigest() != request.get("overlay_sha256"):
            raise SafeFailure("PUBLIC_OVERLAY_CHANGED")
        overlay = json.loads(overlay_bytes)
        if overlay.get("content_policy", {}).get("level") != "PRIVATE_INVITE_ONLY" or overlay.get("scope") != "ALLOWLISTED_INVITEES_ONLY" or overlay.get("apply_authorized") is not False:
            raise SafeFailure("INVITE_POLICY_REQUIRED")
        bindings = [{"quiz_id": read(l["quiz_file"])["quiz"]["id"], "revision": read(l["quiz_file"])["quiz"]["revision"], "public_sha256": next(f["sha256"] for f in manifest["files"] if f["path"] == l["quiz_file"])} for l in manifest["lessons"]]
        if request.get("quiz_bindings") != bindings or request.get("fault") is not None:
            raise SafeFailure("DEVELOPMENT_BINDINGS_REQUIRED")
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
        "PQsslInUse": ([C.c_void_p], C.c_int),
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
    if development:
        host = "aws-1-ap-southeast-2.pooler.supabase.com"
        ipv4 = request.get("ipv4")
        if ipv4 not in {r[4][0] for r in socket.getaddrinfo(host, 5432, socket.AF_INET)}:
            raise SafeFailure("DEVELOPMENT_IPV4_MISMATCH")
        cert = public_root.parent.parent.parent / ".local/cloud-preflight/prod-supabase.cer"
        if not cert.is_file():
            raise SafeFailure("TRUSTED_CA_REQUIRED")
        fields.update(host=host, hostaddr=ipv4, port="5432", dbname="postgres", user="postgres.hhgxrjqkuwdgurphopok",
                      sslmode="verify-full", sslrootcert=str(cert), password=request["password"], connect_timeout="15")
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
    committing = False
    committed = False

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
        identity = execute("SELECT current_database()='postgres' AND current_user='postgres'", scalar=True) if development else execute("SELECT current_database()=$1 AND current_user='postgres' AND inet_server_addr()='127.0.0.1'::inet AND inet_server_port()=55449 AND (SELECT count(*) FROM importer_fixture.guard WHERE token=$2)=1", [database, nonce], True)
        if identity != "t":
            raise SafeFailure("LOCAL_IDENTITY_FAILED")
        if development and pq.PQsslInUse(connection) != 1:
            raise SafeFailure("VERIFIED_TLS_REQUIRED")
        if request.get("fault") == "unsafe_logging":
            execute("SET log_error_verbosity='verbose'")  # Synthetic-only negative test, session-local.
        expected_settings = {"log_statement": "none", "log_min_error_statement": "panic",
                             "log_parameter_max_length_on_error": "0", "log_error_verbosity": "terse",
                             "log_min_messages": "panic", "shared_preload_libraries": "",
                             "session_preload_libraries": "", "local_preload_libraries": ""}
        for setting, expected_value in ({} if development else expected_settings).items():
            if execute("SELECT current_setting($1)", [setting], True) != expected_value:
                raise SafeFailure("UNSAFE_LOGGING_CONFIGURATION")
        execute("BEGIN ISOLATION LEVEL SERIALIZABLE")
        transaction = True
        execute("SET LOCAL search_path=pg_catalog; SET LOCAL standard_conforming_strings=on; SET LOCAL statement_timeout='30s'; SET LOCAL lock_timeout='5s'")
        if development:
            execute("SET LOCAL log_min_messages='panic'")
            if execute("SELECT current_setting('log_min_messages')='panic' AND coalesce(current_setting('auto_explain.log_level',true),'log')='log' AND coalesce(current_setting('pgaudit.log_client',true),'off')='off'", scalar=True) != "t":
                raise SafeFailure("SESSION_LOGGING_GUARD_FAILED")
            execute("LOCK TABLE private.allowed_learners IN SHARE MODE")
            invitees = request.get("expected_invitees")
            if not isinstance(invitees, list) or not invitees or any(not re.fullmatch(r"[a-f0-9-]{36}", x) for x in invitees) or len(set(invitees)) != len(invitees):
                raise SafeFailure("INVITEE_SNAPSHOT_REQUIRED")
            if execute("SELECT (SELECT coalesce(jsonb_agg(user_id::text ORDER BY user_id),'[]'::jsonb) FROM private.allowed_learners)=$1::jsonb AND NOT EXISTS(SELECT 1 FROM private.allowed_learners a JOIN auth.users u ON u.id=a.user_id WHERE u.email_confirmed_at IS NULL)", [json.dumps(sorted(invitees))], True) != "t":
                raise SafeFailure("INVITEE_SNAPSHOT_CHANGED")
            verify_development_schema(execute, public_root.parent.parent.parent)
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
        if operation in ("draft_import", "promote_fixture", "promote_approved"):
            # Verify all scoped draft rows after insert and again before separate promotion.
            scopes = {"public.courses": ("syllabus_id", "public.syllabus_versions"), "public.units": ("course_id", "public.courses"),
                      "public.lessons": ("unit_id", "public.units"), "public.lesson_quizzes": ("lesson_id", "public.lessons"),
                      "public.quiz_questions": ("quiz_id", "public.lesson_quizzes"),
                      "public.syllabus_vocabulary": ("syllabus_id", "public.syllabus_versions"), "public.syllabus_grammar": ("syllabus_id", "public.syllabus_versions"),
                      "public.lesson_vocabulary": ("lesson_id", "public.lessons"), "public.lesson_grammar": ("lesson_id", "public.lessons")}
            for table, records in batches:
                columns = ",".join("'" + c + "',a.\"" + c + '\"' for c in records[0])
                matched = int(execute("SELECT count(*) FROM " + table + " a JOIN jsonb_array_elements($1::jsonb) e ON jsonb_build_object(" + columns + ")=e.value", [json.dumps(records, ensure_ascii=False)], True))
                column, parent = scopes.get(table, ("id", table))
                filters = [(column, parent)]
                if table in ("public.lesson_vocabulary", "public.syllabus_vocabulary"):
                    filters.append(("vocabulary_id", "public.vocabulary"))
                if table in ("public.lesson_grammar", "public.syllabus_grammar"):
                    filters.append(("grammar_id", "public.grammar_points"))
                where = " OR ".join(col + " IN (SELECT value::uuid FROM jsonb_array_elements_text($" + str(i + 1) + "::jsonb))" for i, (col, _) in enumerate(filters))
                scope_params = [json.dumps([r["id"] for t, rs in batches if t == parent_table for r in rs]) for _, parent_table in filters]
                scoped_count = int(execute("SELECT count(*) FROM " + table + " WHERE " + where, scope_params, True))
                if matched != len(records) or scoped_count != len(records):
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
        matches = (sum(int(execute("SELECT count(*) FROM private.quiz_answer_keys WHERE question_id=$1::uuid AND correct_index=$2::integer AND explanation_vi=$3::text", [r["question_id"], r["correct_index"], r["explanation_vi"]], True)) for r in rows) if development else int(execute("SELECT count(*) FROM private.quiz_answer_keys WHERE explanation_vi=$1", [sentinel], True)))
        if matches != 24:
            raise SafeFailure("PARAMETER_ROUNDTRIP_MISMATCH")
        if operation in ("promote_fixture", "promote_approved"):
            # Fixed synthetic metadata ONLY; no owner evidence or real license enters this path.
            for table in ("public.syllabus_versions", "public.courses", "public.units", "public.vocabulary", "public.grammar_points", "public.lessons", "public.quiz_questions", "public.lesson_quizzes"):
                ids = [r["id"] for t, records in batches if t == table for r in records]
                license_text = None if request.get("fault") == "promotion_metadata" else "SYNTHETIC FIXTURE - NOT A RIGHTS GRANT; SYNTHETIC FIXTURE ONLY"
                extra = ",verified_at=$3::timestamptz" if table == "public.syllabus_versions" else ""
                metadata = next(g["metadata"] for g in overlay["groups"] if g["entities"][0]["table"] == table or any(e["table"] == table for e in g["entities"])) if development else None
                if development:
                    extra = ",verified_at=$5::timestamptz" if table == "public.syllabus_versions" else ""
                params = [metadata["content_license"], metadata["reviewed_by"], metadata["reviewed_at"], json.dumps(ids)] if development else [license_text, "SYNTHETIC FIXTURE REVIEWER", "2026-01-01T00:00:00Z", json.dumps(ids)]
                if development and table == "public.syllabus_versions":
                    params.append(overlay["syllabus_verification"]["verified_at"])
                affected = execute("WITH changed AS (UPDATE " + table + " SET status='published',review_status='approved',content_license=$1,reviewed_by=$2,reviewed_at=$3::timestamptz" + extra + " WHERE id IN (SELECT value::uuid FROM jsonb_array_elements_text($4::jsonb)) AND status='draft' RETURNING 1) SELECT count(*) FROM changed", params, True)
                if int(affected) != len(ids):
                    raise SafeFailure("PROMOTION_SCOPE_MISMATCH")
                promoted += len(ids)
                if table == "public.lessons" and request.get("fault") == "promotion_partial":
                    raise SafeFailure("SYNTHETIC_PROMOTION_FAILURE")
            quiz_ids = [q["id"] for t, rs in batches if t == "public.lesson_quizzes" for q in rs]
            if int(execute("SELECT count(*) FROM public.syllabus_versions WHERE id=$1::uuid AND is_active", [manifest["syllabus"]["id"]], True)) != 0 or int(execute("SELECT count(*) FROM public.lesson_quizzes WHERE id IN (SELECT value::uuid FROM jsonb_array_elements_text($1::jsonb)) AND published_at IS NOT NULL", [json.dumps(quiz_ids)], True)) != 4:
                raise SafeFailure("PROMOTION_POSTCONDITION_FAILED")
        committing = True
        execute("COMMIT")
        committing = False
        transaction = False
        committed = True
        rls_readers = 0
        if operation in ("promote_fixture", "promote_approved"):
            # Post-commit read-only verification under each invitee's database role.
            readers = request.get("expected_invitees", []) if development else ["a0000000-0000-4000-8000-000000000002"]
            for reader in readers:
                execute("BEGIN READ ONLY")
                transaction = True
                execute("SET LOCAL ROLE authenticated")
                execute("SELECT set_config('request.jwt.claim.sub',$1,true)", [reader], True)
                for table, expected in (("public.lessons", 4), ("public.vocabulary", 44), ("public.quiz_questions", 24)):
                    ids = [r["id"] for t, rs in batches if t == table for r in rs]
                    count = execute("SELECT count(*) FROM " + table + " WHERE id IN (SELECT value::uuid FROM jsonb_array_elements_text($1::jsonb))", [json.dumps(ids)], True)
                    if int(count) != expected:
                        raise SafeFailure("POSTCOMMIT_INVITEE_RLS_READ_FAILED")
                execute("ROLLBACK")
                transaction = False
                rls_readers += 1
        return {"status": "DEVELOPMENT_COMMITTED" if development else "LOCAL_PASS", "committedKeys": 24 if operation == "draft_import" else 0, "parameterizedKeyRows": attempted,
                "parameterizedPublicRows": public_rows, "promotedEntities": promoted,
                "matchedSyntheticText": matches, "rawErrorsExposed": False, "verifiedRlsReaders": rls_readers}
    except SafeFailure as error:
        if transaction:
            try:
                execute("ROLLBACK")
            except Exception:
                pass  # Connection close also rolls back; never expose libpq diagnostics.
        return {"status": "COMMIT_OUTCOME_UNKNOWN" if committing else "COMMITTED_VERIFICATION_FAILED" if committed else "BLOCKED", "code": str(error), "committedKeys": 0,
                "parameterizedKeyRows": attempted, "rawErrorsExposed": False}
    except Exception as error:
        if transaction:
            try:
                execute("ROLLBACK")
            except Exception:
                pass
        return {"status": "COMMIT_OUTCOME_UNKNOWN" if committing else "COMMITTED_VERIFICATION_FAILED" if committed else "BLOCKED", "code": "PROTECTED_RUNTIME_" + type(error).__name__.upper(), "committedKeys": 0}
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
    sys.exit(0 if outcome["status"] in ("LOCAL_PASS", "DEVELOPMENT_COMMITTED") else 2)
