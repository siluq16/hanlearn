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
