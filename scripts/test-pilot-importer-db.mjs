// Disposable native PostgreSQL only; public draft + synthetic keys, never the private store.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  loadPilot,
  syntheticDelivery,
  draftPlan,
  executeSynthetic,
  localFixtureSession,
} from "./pilot-r3-importer.mjs";
const pkg = loadPilot(),
  delivery = syntheticDelivery(pkg),
  plan = draftPlan(pkg, delivery),
  session = localFixtureSession();
const cases = [];
const tables = [...plan.batches.map(([t]) => t), "private.quiz_answer_keys"];
const query = (sql) => {
  const r = session.query(sql);
  assert(r.ok, "fixture_query_failed_" + r.sqlState);
  return r.output;
};
const count = () =>
  Number(
    query(
      `SELECT ${tables.map((t) => `(SELECT count(*) FROM ${t})`).join("+")};`,
    ),
  );
const clear = () => query(`TRUNCATE ${tables.join(",")} CASCADE;`);
const pass = (name) => cases.push({ name, status: "PASS" });
assert.equal(count(), 0);
let r = executeSynthetic(session, pkg, delivery, { rollback: true });
assert.equal(r.status, "ROLLED_BACK_SYNTHETIC_LOCAL");
assert.equal(count(), 0);
pass("explicit_single_transaction_rollback");
for (const [fault, state] of [
  ["FK_AFTER_LESSONS", "23503"],
  ["CHECK_AFTER_KEYS", "23514"],
]) {
  r = executeSynthetic(session, pkg, delivery, { fault });
  assert.equal(r.status, "ROLLED_BACK_ERROR");
  assert.equal(r.sqlState, state);
  assert.equal(count(), 0);
  pass("atomic_rollback_" + fault);
}
r = executeSynthetic(session, pkg, delivery);
assert.equal(r.status, "IMPORTED_SYNTHETIC_LOCAL");
assert.equal(count(), 248);
pass("draft_import_all_248_rows");
for (const [table, rows] of plan.batches)
  assert.equal(Number(query(`SELECT count(*) FROM ${table};`)), rows.length);
assert.equal(
  Number(query("SELECT count(*) FROM private.quiz_answer_keys;")),
  24,
);
pass("all_tables_and_joins_exact_counts");
r = executeSynthetic(session, pkg, delivery);
assert.equal(r.sqlState, "23505");
assert.equal(count(), 248);
pass("duplicate_import_fail_closed_no_overwrite");
const uid = "a0000000-0000-4000-8000-000000000001";
query(
  `INSERT INTO auth.users VALUES('${uid}','fixture@example.invalid',now()); INSERT INTO private.allowed_learners VALUES('${uid}');`,
);
assert.equal(
  query(
    `BEGIN; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='${uid}'; SELECT count(*) FROM public.lessons; ROLLBACK;`,
  ),
  "0",
);
pass("draft_hidden_from_allowlisted_synthetic_learner");
assert.equal(
  session.query(
    `BEGIN; SET LOCAL ROLE authenticated; SELECT count(*) FROM private.quiz_answer_keys; ROLLBACK;`,
  ).sqlState,
  "42501",
);
pass("learner_cannot_read_private_keys");
const first = pkg.lessons[0].id;
assert.equal(
  session.query(
    `BEGIN; UPDATE public.lessons SET status='published' WHERE id='${first}'; COMMIT;`,
  ).sqlState,
  "23514",
);
assert.equal(
  query(`SELECT status FROM public.lessons WHERE id='${first}';`),
  "draft",
);
pass("unreviewed_publication_rejected");
const sid = pkg.manifest.syllabus.id;
assert.equal(
  session.query(
    `BEGIN; UPDATE public.syllabus_versions SET status='published',review_status='approved',content_license='SYNTHETIC-TEST-ONLY',reviewed_by='SYNTHETIC-FIXTURE',reviewed_at=now() WHERE id='${sid}'; COMMIT;`,
  ).sqlState,
  "23514",
);
assert.equal(
  query(`SELECT status FROM public.syllabus_versions WHERE id='${sid}';`),
  "draft",
);
pass("syllabus_missing_verified_at_rejected");
clear();
assert.equal(count(), 0);
// Existing vocabulary natural key with a different ID must block the whole candidate plan.
const v = pkg.vocabulary[0];
const str = (x) => "'" + x.replaceAll("'", "''") + "'";
query(
  `INSERT INTO public.vocabulary(id,simplified,pinyin_marked,sense_key,meaning_vi) VALUES('b0000000-0000-4000-8000-000000000001',${str(v.simplified)},${str(v.pinyin_marked)},${str(v.sense_key)},'SYNTHETIC COLLISION');`,
);
r = executeSynthetic(session, pkg, delivery);
assert.equal(r.sqlState, "23505");
assert.equal(count(), 1);
pass("natural_key_collision_before_any_import_writes");
clear();
const g = pkg.grammar[0];
query(
  `INSERT INTO public.grammar_points(id,title,pattern,explanation_vi) VALUES('b0000000-0000-4000-8000-000000000002',${str(g.title)},${str(g.pattern)},'SYNTHETIC COLLISION');`,
);
r = executeSynthetic(session, pkg, delivery);
assert.equal(r.sqlState, "23505");
assert.equal(count(), 1);
pass("advisory_semantic_duplicate_blocks");
clear();
// Entirely synthetic publication fixture; never approve/publish the r3 teaching content.
const metadata =
  "'published','approved','urn:hanlearn:synthetic-import-test','SYNTHETIC-NOT-A-LICENSE','SYNTHETIC-NOT-A-HUMAN-REVIEWER',now()";
const cols =
  "status,review_status,source_uri,content_license,reviewed_by,reviewed_at";
query(`BEGIN;
INSERT INTO public.syllabus_versions(id,code,display_name,verified_at,${cols}) VALUES('c0000000-0000-4000-8000-000000000001','SYNTHETIC-ONLY','SYNTHETIC',now(),${metadata});
INSERT INTO public.courses(id,syllabus_id,hsk_level,title,${cols}) VALUES('c0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001',1,'SYNTHETIC',${metadata});
INSERT INTO public.units(id,course_id,title,${cols}) VALUES('c0000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000002','SYNTHETIC',${metadata});
INSERT INTO public.lessons(id,unit_id,title,${cols}) VALUES('c0000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000003','SYNTHETIC',${metadata});
INSERT INTO public.lesson_quizzes(id,lesson_id,title) VALUES('c0000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000004','SYNTHETIC');
INSERT INTO public.quiz_questions(id,quiz_id,sort_order,prompt,choices,${cols}) SELECT ('d0000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'c0000000-0000-4000-8000-000000000005',i,'SYNTHETIC','["SYNTHETIC A","SYNTHETIC B"]'::jsonb,${metadata} FROM generate_series(1,5) i;
COMMIT;`);
assert.equal(
  session.query(
    `BEGIN; UPDATE public.lesson_quizzes SET status='published',review_status='approved',source_uri='urn:hanlearn:synthetic',content_license='SYNTHETIC-NOT-A-LICENSE',reviewed_by='SYNTHETIC',reviewed_at=now() WHERE id='c0000000-0000-4000-8000-000000000005';COMMIT;`,
  ).sqlState,
  "23514",
);
pass("quiz_cannot_seal_without_keys");
query(`BEGIN; INSERT INTO private.quiz_answer_keys SELECT id,0,'SYNTHETIC ONLY' FROM public.quiz_questions;
UPDATE public.lesson_quizzes SET status='published',review_status='approved',source_uri='urn:hanlearn:synthetic',content_license='SYNTHETIC-NOT-A-LICENSE',reviewed_by='SYNTHETIC',reviewed_at=now() WHERE id='c0000000-0000-4000-8000-000000000005';COMMIT;`);
assert.equal(
  query(
    `BEGIN; SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${uid}'; SELECT count(*) FROM public.lessons;ROLLBACK;`,
  ),
  "1",
);
pass("synthetic_published_ancestry_readable");
assert.equal(
  session.query(
    `BEGIN; UPDATE private.quiz_answer_keys SET correct_index=1;COMMIT;`,
  ).sqlState,
  "55000",
);
pass("sealed_synthetic_keys_immutable");
const result = {
  status: "PASS",
  scope: "DISPOSABLE_NATIVE_AUTH_SHIM_SYNTHETIC_KEYS",
  database: process.env.HANLEARN_IMPORT_DATABASE,
  cases,
  counts: {
    syllabuses: 1,
    courses: 1,
    units: 1,
    lessons: 4,
    sections: 29,
    vocabulary: 44,
    grammar: 12,
    questions: 24,
    syllabusVocabulary: 43,
    syllabusGrammar: 12,
    lessonVocabulary: 66,
    lessonGrammar: 12,
    syntheticKeys: 24,
    transactionRows: 248,
  },
  realPrivateStoreRead: false,
  cloudAccess: false,
  realR3Published: false,
};
fs.mkdirSync(".local/pilot-importer", { recursive: true });
fs.writeFileSync(
  ".local/pilot-importer/database-result.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `PASS ${cases.length} disposable database cases; 248 draft rows; actual rollback and RLS/constraint checks. Synthetic keys only.`,
);
