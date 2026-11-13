// Offline public plan + synthetic-only native fixture execution. No .env or private-store reads.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { auditPilot } from "./pilot-r3-preflight.mjs";
import { validatePilot } from "./pilot-validation.mjs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const stores = new WeakSet(),
  sessions = new WeakSet();
const root = "content/pilot-hsk1/v1/";
export function loadPilot() {
  auditPilot();
  const manifest = read(root + "manifest.json");
  return {
    manifest,
    vocabulary: read(root + "vocabulary.json"),
    grammar: read(root + "grammar.json"),
    lessons: manifest.lessons.map((l) => read(root + l.file)),
    quizzes: manifest.lessons.map((l) => read(root + l.quiz_file)),
    rights: read(root + "rights-manifest.json"),
  };
}
export function syntheticDelivery(pkg) {
  const store = {
    package_id: pkg.manifest.package_id,
    package_revision: 3,
    review_state: "pending_review",
    human_reviewer: null,
    human_reviewed_at: null,
    quiz_bindings: pkg.quizzes.map((q, i) => ({
      quiz_id: q.quiz.id,
      revision: q.quiz.revision,
      public_sha256: pkg.manifest.files.find(
        (f) => f.path === pkg.manifest.lessons[i].quiz_file,
      ).sha256,
    })),
    keys: pkg.quizzes.flatMap((q) =>
      q.questions.map((question, i) => ({
        question_id: question.id,
        correct_index: (i + 1) % question.choices.length,
        explanation_vi:
          "SYNTHETIC LOCAL IMPORT FIXTURE ONLY - NOT INSTRUCTIONAL FEEDBACK",
      })),
    ),
  };
  stores.add(store);
  return store;
}
export function validateImport(pkg, delivery) {
  auditPilot();
  if (!stores.has(delivery)) throw Error("synthetic_delivery_required");
  const canonical = syntheticDelivery(pkg);
  if (JSON.stringify(delivery) !== JSON.stringify(canonical))
    throw Error("synthetic_delivery_modified_or_missing");
  const source = {
    pdfSha: sha(fs.readFileSync(".local/pilot-hsk1/official-syllabus.pdf")),
    textSha: sha(fs.readFileSync(".local/pilot-hsk1/source-pages.json")),
    pages: read(".local/pilot-hsk1/source-pages.json"),
  };
  const result = validatePilot(pkg, { privateKeys: delivery, source });
  if (result.status !== "PASS")
    throw Error("content_source_or_relationship_validation_failed");
  const snapshot = read("docs/human-review/pilot-hsk1-r3/SOURCE_SNAPSHOT.json");
  const actual = {
    "vocabulary.json": pkg.vocabulary,
    "grammar.json": pkg.grammar,
    "rights-manifest.json": pkg.rights,
  };
  pkg.manifest.lessons.forEach((l, i) => {
    actual[l.file] = pkg.lessons[i];
    actual[l.quiz_file] = pkg.quizzes[i];
  });
  // Compare parsed bytes to frozen public source; prevents changed in-memory data bypassing a file audit.
  if (
    JSON.stringify(pkg.manifest) !==
      JSON.stringify(read(root + "manifest.json")) ||
    Object.entries(actual).some(
      ([file, value]) =>
        JSON.stringify(value) !== JSON.stringify(read(root + file)),
    ) ||
    pkg.manifest.draft_revision !== 3 ||
    snapshot.manifest_sha256 !==
      "dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b"
  )
    throw Error("exact_revision_or_hash_mismatch");
  return result;
}
export function draftPlan(pkg, delivery) {
  validateImport(pkg, delivery);
  const m = pkg.manifest;
  const batches = [
    ["public.syllabus_versions", [m.syllabus]],
    ["public.courses", [m.course]],
    ["public.units", [m.unit]],
    ["public.vocabulary", pkg.vocabulary],
    ["public.grammar_points", pkg.grammar],
    ["public.lessons", pkg.lessons],
    ["public.syllabus_vocabulary", m.syllabus_vocabulary],
    ["public.syllabus_grammar", m.syllabus_grammar],
    ["public.lesson_vocabulary", m.lesson_vocabulary],
    ["public.lesson_grammar", m.lesson_grammar],
    ["public.lesson_quizzes", pkg.quizzes.map((q) => q.quiz)],
    ["public.quiz_questions", pkg.quizzes.flatMap((q) => q.questions)],
  ];
  return {
    packageId: m.package_id,
    revision: 3,
    mode: "DRAFT_ONLY_SYNTHETIC_LOCAL",
    batches,
  };
}
export function preview(plan) {
  return {
    packageId: plan.packageId,
    revision: plan.revision,
    mode: plan.mode,
    orderedBatches: plan.batches.map(([table, rows]) => ({
      table,
      count: rows.length,
    })),
    privateDelivery: {
      mode: "SYNTHETIC_FIXTURE_ONLY",
      records: 24,
      realDelivery: "BLOCKED_SEPARATE_REAL_DB_APPROVAL",
      localProtectedAdapter:
        "SYNTHETIC_PARAMETERIZED_PATH_REAL_READ_AUTH_REQUIRED",
    },
    publication: "BLOCKED_RIGHTS_AND_POLICY_DECISION_REQUIRED",
    cloudExecution: "UNSUPPORTED",
  };
}
const literal = (v) =>
  "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
function insert(table, rows) {
  const columns = Object.keys(rows[0]);
  if (
    !/^(public\.[a-z_]+|private\.quiz_answer_keys)$/.test(table) ||
    columns.some((c) => !/^[a-z_]+$/.test(c))
  )
    throw Error("invalid_static_identifier");
  const names = columns.map((c) => '"' + c + '"').join(",");
  return `INSERT INTO ${table}(${names}) SELECT ${names} FROM jsonb_populate_recordset(NULL::${table},${literal(rows)});`;
}
function collisionGuard() {
  // Same 315 audited frozen-public probes as Development preflight; no private data.
  const sql = fs.readFileSync(
    "supabase/verification/pilot_r3_readonly_preflight.sql",
    "utf8",
  );
  const start = sql.indexOf("WITH incoming AS (");
  const end = sql.indexOf("SELECT jsonb_build_object('collisions'", start);
  if (start < 0 || end < 0) throw Error("collision_query_missing");
  return `DO $guard$ DECLARE hit boolean; BEGIN ${sql.slice(start, end)}
    SELECT EXISTS(SELECT 1 FROM incoming i JOIN remote_keys r ON r.table_name=i.item->>'table' AND r.key_data @> (i.item->'key')) INTO hit;
    IF hit THEN RAISE EXCEPTION 'import_collision' USING ERRCODE='23505'; END IF; END $guard$;`;
}
// Public SQL only, shared by the protected parameterized worker. Never contains keys.
export function publicDraftParts(pkg) {
  const plan = draftPlan(pkg, syntheticDelivery(pkg));
  return {
    lock: `LOCK TABLE ${[...plan.batches.map(([t]) => t), "private.quiz_answer_keys"].join(",")} IN SHARE ROW EXCLUSIVE MODE;`,
    collision: collisionGuard(),
    inserts: plan.batches.map(([table, rows]) => insert(table, rows)),
  };
}
function transaction(pkg, delivery, { fault = null, rollback = false } = {}) {
  auditPilot();
  const plan = draftPlan(pkg, delivery);
  if (![null, "FK_AFTER_LESSONS", "CHECK_AFTER_KEYS"].includes(fault))
    throw Error("unknown_fixture_fault");
  const batches = [
    ...plan.batches,
    ["private.quiz_answer_keys", delivery.keys],
  ];
  const statements = batches.flatMap(([table, rows]) => {
    const result = [insert(table, rows)];
    if (table === "public.lessons" && fault === "FK_AFTER_LESSONS")
      result.push(
        "INSERT INTO public.lesson_vocabulary(lesson_id,vocabulary_id) VALUES('ffffffff-ffff-4fff-8fff-ffffffffffff','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');",
      );
    if (table === "private.quiz_answer_keys" && fault === "CHECK_AFTER_KEYS")
      result.push(
        "INSERT INTO public.lessons(id,unit_id,title,estimated_minutes) VALUES('ffffffff-ffff-4fff-8fff-ffffffffffff','ffffffff-ffff-4fff-8fff-ffffffffffff','SYNTHETIC_INVALID',0);",
      );
    return result;
  });
  return `BEGIN ISOLATION LEVEL SERIALIZABLE; SET LOCAL search_path=pg_catalog; SET LOCAL standard_conforming_strings=on; SET LOCAL statement_timeout='30s'; SET LOCAL lock_timeout='5s';
    LOCK TABLE ${batches.map(([table]) => table).join(",")} IN SHARE ROW EXCLUSIVE MODE;
    ${collisionGuard()} ${statements.join("\n")}
    ${rollback ? "ROLLBACK" : "COMMIT"};`;
}
export function localFixtureSession() {
  const database = process.env.HANLEARN_IMPORT_DATABASE,
    nonce = process.env.HANLEARN_IMPORT_NONCE;
  if (
    process.env.HANLEARN_IMPORT_LOCAL_ONLY !== "SYNTHETIC_DISPOSABLE" ||
    !/^hanlearn_import_r3_[a-f0-9]{32}$/.test(database ?? "") ||
    !/^[a-f0-9]{32}$/.test(nonce ?? "")
  )
    throw Error("disposable_local_target_required");
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^PG|^SUPABASE_|^DEBUG$|^NODE_DEBUG$/.test(key),
    ),
  );
  Object.assign(env, {
    PGHOSTADDR: "127.0.0.1",
    PGSSLMODE: "disable",
    PGCLIENTENCODING: "UTF8",
    PGPASSFILE: path.resolve(".local/absent-importer-passfile"),
    PGCONNECT_TIMEOUT: "5",
  });
  const guard = `DO $identity$ BEGIN IF current_database()<>'${database}' OR current_user<>'postgres' OR inet_server_addr()<>'127.0.0.1'::inet OR inet_server_port()<>55449 OR (SELECT count(*) FROM importer_fixture.guard WHERE token='${nonce}')<>1 THEN RAISE EXCEPTION 'disposable_identity_mismatch'; END IF; END $identity$;`;
  const query = (sql) => {
    const r = spawnSync(
      "C:/Program Files/PostgreSQL/18/bin/psql.exe",
      [
        "-X",
        "-w",
        "-h",
        "127.0.0.1",
        "-p",
        "55449",
        "-U",
        "postgres",
        "-d",
        database,
        "-Atq",
        "-v",
        "ON_ERROR_STOP=1",
        "-v",
        "VERBOSITY=sqlstate",
      ],
      {
        input: guard + "\n" + sql,
        encoding: "utf8",
        env,
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      },
    );
    return {
      ok: r.status === 0,
      sqlState:
        r.status === 0
          ? null
          : ((r.stderr ?? "").match(/ERROR:\s+([A-Z0-9]{5})/)?.[1] ??
            "LOCAL_EXECUTION_FAILED"),
      output: r.status === 0 ? r.stdout.trim() : "",
    };
  };
  if (!query("SELECT 1;").ok) throw Error("disposable_identity_rejected");
  const session = Object.freeze({ query });
  sessions.add(session);
  return session;
}
export function executeSynthetic(session, pkg, delivery, options = {}) {
  if (!sessions.has(session)) throw Error("untrusted_database_session");
  const r = session.query(transaction(pkg, delivery, options));
  return {
    status: r.ok
      ? options.rollback
        ? "ROLLED_BACK_SYNTHETIC_LOCAL"
        : "IMPORTED_SYNTHETIC_LOCAL"
      : "ROLLED_BACK_ERROR",
    sqlState: r.sqlState,
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (process.argv[2] !== "--preview") throw Error("preview_only_cli");
    const pkg = loadPilot();
    console.log(
      JSON.stringify(preview(draftPlan(pkg, syntheticDelivery(pkg))), null, 2),
    );
  } catch {
    console.error(
      "BLOCKED: offline importer validation failed; raw input/private values suppressed.",
    );
    process.exitCode = 2;
  }
}
