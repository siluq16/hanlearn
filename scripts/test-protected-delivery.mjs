// All integration delivery is generated synthetic; real-reader entry point is never called.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  loadPilot,
  syntheticDelivery,
  draftPlan,
  localFixtureSession,
} from "./pilot-r3-importer.mjs";
import {
  syntheticProtectedHandle,
  deliverLocalSynthetic,
} from "./protected-local-keys.mjs";
await import("./test-pilot-importer-db.mjs"); // 15 baseline transaction/RLS cases in this same fresh cluster.
const session = localFixtureSession(),
  pkg = loadPilot(),
  cases = [];
const query = (sql) => {
  const r = session.query(sql);
  assert(r.ok, "fixture_query_rejected_" + r.sqlState);
  return r.output;
};
const plan = draftPlan(pkg, syntheticDelivery(pkg));
const tables = [...plan.batches.map(([t]) => t), "private.quiz_answer_keys"];
const total = () =>
  Number(
    query(
      "SELECT " +
        tables.map((t) => `(SELECT count(*) FROM ${t})`).join("+") +
        ";",
    ),
  );
const clear = () => query("TRUNCATE " + tables.join(",") + " CASCADE;");
const pass = (name) => cases.push({ name, status: "PASS" });
// Catalog policy is allowlist-wide, not intrinsically tied to one owner UUID.
const second = "a0000000-0000-4000-8000-000000000002";
query(
  `INSERT INTO auth.users VALUES('${second}','fixture-b@example.invalid',now());INSERT INTO private.allowed_learners VALUES('${second}');`,
);
assert.equal(
  query(
    `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${second}';SELECT count(*) FROM public.lessons;ROLLBACK;`,
  ),
  "1",
);
pass("published_catalog_also_visible_to_second_allowlisted_synthetic_user");
clear();
for (const fault of ["missing_key", "duplicate_id", "binding_mismatch"]) {
  const r = deliverLocalSynthetic(
    pkg,
    syntheticProtectedHandle(pkg, { fault }),
  );
  assert.equal(r.status, "BLOCKED");
  assert.equal(total(), 0);
  pass("prewrite_reject_" + fault);
}
for (const [fault, code] of [
  ["partial", "SYNTHETIC_PARTIAL_FAILURE"],
  ["duplicate", "23505"],
  ["foreign_key", "23503"],
  ["unsafe_logging", "UNSAFE_LOGGING_CONFIGURATION"],
]) {
  const r = deliverLocalSynthetic(pkg, syntheticProtectedHandle(pkg), {
    fault,
  });
  assert.equal(r.status, "BLOCKED");
  assert.equal(r.code, code);
  assert.equal(total(), 0);
  pass("parameterized_rollback_" + fault);
}
const r = deliverLocalSynthetic(pkg, syntheticProtectedHandle(pkg));
assert.equal(r.status, "LOCAL_PASS");
assert.equal(r.committedKeys, 24);
assert.equal(r.matchedSyntheticText, 24);
assert.equal(r.parameterizedPublicRows, 224);
assert.equal(total(), 248);
pass("parameterized_commit_24_keys_and_quoted_unicode_safe_text");
const duplicate = deliverLocalSynthetic(pkg, syntheticProtectedHandle(pkg));
assert.equal(duplicate.code, "23505");
assert.equal(total(), 248);
pass("collision_no_overwrite_parameterized_mode");
// Demonstrate SQLSTATE-only error results and fail-closed formatting, never libpq error detail.
assert(
  Object.values(duplicate).every(
    (v) =>
      typeof v !== "string" || !v.includes("SYNTHETIC PARAMETERIZED FIXTURE"),
  ),
);
pass("no_parameter_text_in_error_result");
for (const [fault, code] of [
  ["promotion_partial", "SYNTHETIC_PROMOTION_FAILURE"],
  ["promotion_metadata", "23514"],
]) {
  const failed = deliverLocalSynthetic(pkg, syntheticProtectedHandle(pkg), {
    operation: "promote_fixture",
    fault,
  });
  assert.equal(failed.status, "BLOCKED");
  assert.equal(failed.code, code);
  assert.equal(total(), 248);
  assert.equal(
    query(
      "SELECT " +
        plan.batches
          .filter(([, rows]) => rows[0].id)
          .map(([t]) => `(SELECT count(*) FROM ${t} WHERE status='published')`)
          .join("+"),
    ),
    "0",
  );
  pass("separate_promotion_rollback_" + fault);
}
const promoted = deliverLocalSynthetic(pkg, syntheticProtectedHandle(pkg), {
  operation: "promote_fixture",
});
assert.equal(promoted.status, "LOCAL_PASS");
assert.equal(promoted.promotedEntities, 91);
assert.equal(promoted.committedKeys, 0);
assert.equal(
  query("SELECT count(*) FROM public.syllabus_versions WHERE is_active"),
  "0",
);
assert.equal(
  query(
    "SELECT count(*) FROM public.lesson_quizzes WHERE published_at IS NOT NULL",
  ),
  "4",
);
assert.equal(
  query(
    `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${second}';SELECT count(*) FROM public.lessons;ROLLBACK;`,
  ),
  "4",
);
pass("separate_parameterized_promotion_91_entities_quizzes_last_no_activation");
assert.equal(
  deliverLocalSynthetic(pkg, syntheticProtectedHandle(pkg), {
    operation: "promote_fixture",
  }).code,
  "DRAFT_SNAPSHOT_MISMATCH",
);
pass("promotion_rejects_non_draft_or_drift_no_blind_overwrite");
// PRIVATE_INVITE_ONLY: real SQL RLS/ownership checks on synthetic A/B only.
const firstUser = "a0000000-0000-4000-8000-000000000001";
const outsider = "a0000000-0000-4000-8000-000000000003";
query(
  `INSERT INTO auth.users VALUES('${outsider}','outsider@example.invalid',now());`,
);
const asUser = (user, sql) =>
  query(
    `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${user}';${sql};COMMIT;`,
  );
for (const user of [firstUser, second]) {
  assert.equal(asUser(user, "SELECT count(*) FROM public.lessons"), "4");
  assert.equal(asUser(user, "SELECT count(*) FROM public.vocabulary"), "44");
  assert.equal(
    asUser(user, "SELECT count(*) FROM public.quiz_questions"),
    "24",
  );
}
pass("invitees_A_B_share_published_catalog");
query(
  `INSERT INTO public.profiles(id) VALUES('${firstUser}'),('${second}') ON CONFLICT(id) DO NOTHING;`,
);
for (const user of [firstUser, second]) {
  assert.equal(asUser(user, "SELECT count(*) FROM public.profiles"), "1");
  assert.equal(
    asUser(user, "SELECT count(*) FROM public.profiles WHERE id<>auth.uid()"),
    "0",
  );
}
assert.equal(
  asUser(
    firstUser,
    `WITH changed AS (UPDATE public.profiles SET target_hsk_level=4 WHERE id='${second}' RETURNING id) SELECT count(*) FROM changed`,
  ),
  "0",
);
assert.equal(
  query(`SELECT target_hsk_level FROM public.profiles WHERE id='${second}'`),
  "5",
);
pass("invitee_profiles_read_and_update_are_user_scoped");
assert.equal(asUser(outsider, "SELECT count(*) FROM public.lessons"), "0");
assert.equal(
  session.query(
    "BEGIN;SET LOCAL ROLE anon;SELECT count(*) FROM public.lessons;ROLLBACK;",
  ).sqlState,
  "42501",
);
assert.equal(
  session.query(
    `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${outsider}';SELECT public.mark_lesson_studied('${pkg.lessons[0].id}');ROLLBACK;`,
  ).sqlState,
  "42501",
);
pass("anonymous_and_nonallowlisted_denied_catalog_or_mutation");
asUser(firstUser, `SELECT public.mark_lesson_studied('${pkg.lessons[0].id}')`);
asUser(second, `SELECT public.mark_lesson_studied('${pkg.lessons[1].id}')`);
const quiz = pkg.quizzes[0],
  correct = Object.fromEntries(
    quiz.questions.map((q, i) => [q.id, (i + 1) % q.choices.length]),
  );
const wrong = Object.fromEntries(
  quiz.questions.map((q, i) => [q.id, (i + 2) % q.choices.length]),
);
const attemptA = JSON.parse(
  asUser(
    firstUser,
    `SELECT public.start_quiz('${quiz.quiz.id}','b0000000-0000-4000-8000-000000000001')`,
  ),
);
const attemptB = JSON.parse(
  asUser(
    second,
    `SELECT public.start_quiz('${quiz.quiz.id}','b0000000-0000-4000-8000-000000000002')`,
  ),
);
const resultA = JSON.parse(
  asUser(
    firstUser,
    `SELECT public.submit_quiz('${attemptA.attemptId}','${JSON.stringify(correct)}'::jsonb)`,
  ),
);
const resultB = JSON.parse(
  asUser(
    second,
    `SELECT public.submit_quiz('${attemptB.attemptId}','${JSON.stringify(wrong)}'::jsonb)`,
  ),
);
assert.equal(resultA.passed, true);
assert.equal(resultB.passed, false);
assert.equal(
  asUser(
    firstUser,
    "SELECT count(*) FROM public.lesson_progress WHERE completed_at IS NOT NULL",
  ),
  "1",
);
assert.equal(
  asUser(
    second,
    "SELECT count(*) FROM public.lesson_progress WHERE studied_at IS NOT NULL",
  ),
  "1",
);
assert(
  Number(asUser(firstUser, "SELECT count(*) FROM public.review_cards")) > 0,
);
assert.equal(
  asUser(firstUser, "SELECT count(*) FROM public.quiz_responses"),
  "6",
);
assert.equal(asUser(second, "SELECT count(*) FROM public.quiz_responses"), "6");
assert.equal(
  asUser(firstUser, "SELECT count(*) FROM public.quiz_attempts"),
  "1",
);
assert.equal(asUser(second, "SELECT count(*) FROM public.quiz_attempts"), "1");
assert.equal(
  asUser(
    firstUser,
    `SELECT count(*) FROM public.quiz_attempts WHERE id='${attemptB.attemptId}'`,
  ),
  "0",
);
assert.equal(
  asUser(
    second,
    `SELECT count(*) FROM public.quiz_attempts WHERE id='${attemptA.attemptId}'`,
  ),
  "0",
);
for (const user of [firstUser, second]) {
  for (const table of ["lesson_progress", "quiz_responses", "review_cards"])
    assert.equal(
      asUser(
        user,
        `SELECT count(*) FROM public.${table} WHERE user_id<>auth.uid()`,
      ),
      "0",
    );
}
pass("invitee_progress_quiz_results_responses_and_cards_are_user_scoped");
for (const [i, user] of [firstUser, second].entries()) {
  query(
    `INSERT INTO public.study_sessions(user_id,source,evidence,started_at,ended_at,idempotency_key,request_payload) VALUES('${user}','other_manual','self_reported','2026-01-01T00:00:00Z','2026-01-01T00:05:00Z','c0000000-0000-4000-8000-00000000000${i + 1}','{}');`,
  );
  assert.equal(asUser(user, "SELECT count(*) FROM public.study_sessions"), "1");
  assert.equal(
    asUser(
      user,
      "SELECT count(*) FROM public.study_sessions WHERE user_id<>auth.uid()",
    ),
    "0",
  );
  for (const table of [
    "lesson_progress",
    "quiz_attempts",
    "study_sessions",
    "review_cards",
  ])
    assert.equal(
      session.query(
        `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${user}';UPDATE public.${table} SET user_id='${user}';ROLLBACK;`,
      ).sqlState,
      "42501",
    );
  assert.equal(
    session.query(
      `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${user}';SELECT correct_index FROM private.quiz_answer_keys;ROLLBACK;`,
    ).sqlState,
    "42501",
  );
}
assert.equal(
  session.query(
    `BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claim.sub='${second}';SELECT public.submit_quiz('${attemptA.attemptId}','{}');ROLLBACK;`,
  ).sqlState,
  "PT404",
);
pass(
  "invitee_learning_history_isolated_direct_edits_and_cross_user_submission_denied",
);
const posture = JSON.parse(
  query(
    fs.readFileSync(
      "supabase/verification/pilot_r3_security_posture.sql",
      "utf8",
    ),
  ),
).security_posture;
assert.equal(posture.read_only, "on");
assert.equal(posture.authenticated_private_keys_select, false);
assert.equal(posture.anon_private_keys_select, false);
assert.equal(posture.confirmed_allowlisted_count, 2);
pass("readonly_security_posture_supplement_detects_multi_learner_fixture");
const run = process.env.HANLEARN_IMPORT_DATABASE.replace(
  "hanlearn_import_r3_",
  "",
);
const log = fs.readFileSync(
  `.local/pilot-importer/cluster-${run}/fixture.log`,
  "utf8",
);
assert(!log.includes("SYNTHETIC PARAMETERIZED FIXTURE"));
pass("no_synthetic_parameter_canary_in_postgres_log");
const result = {
  status: "LOCAL_PASS",
  scope: "PARAMETERIZED_SYNTHETIC_ONLY",
  database: process.env.HANLEARN_IMPORT_DATABASE,
  baselineCases: 15,
  cases,
  parameterizedKeyRows: 24,
  realStoreRead: false,
  realKeysInDatabase: false,
  cloudConnection: false,
};
fs.writeFileSync(
  ".local/pilot-importer/protected-result.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `PASS ${cases.length} protected-delivery native cases plus 15 baseline; actual rollback; no real store read.`,
);
