// Manually invoked, approved DEVELOPMENT checks only. No provisioning or migrations.
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
const env = process.env;
assert.equal(
  env.HANLEARN_CLOUD_READ_TESTS,
  "approved",
  "BLOCKED: approve dedicated Development Auth/API read tests locally first",
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert(
  url && key?.startsWith("sb_publishable_"),
  "Missing public Development configuration",
);
assert.equal(
  new URL(url).hostname,
  `${env.HANLEARN_APPROVED_DEV_PROJECT_REF}.supabase.co`,
  "Development project ref does not match approved target",
);
for (const name of [
  "HANLEARN_TEST_A_EMAIL",
  "HANLEARN_TEST_A_PASSWORD",
  "HANLEARN_TEST_B_EMAIL",
  "HANLEARN_TEST_B_PASSWORD",
])
  assert(env[name], `Missing local ${name}; do not send credentials to chat`);
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const anon = createClient(url, key, options),
  a = createClient(url, key, options),
  b = createClient(url, key, options);
function ok(condition, label) {
  assert(condition, label);
  console.log(`PASS ${label}`);
}
try {
  const anonymous = await anon.from("profiles").select("id").limit(1);
  ok(!!anonymous.error && anonymous.data === null, "anonymous profiles denied");
  const aLogin = await a.auth.signInWithPassword({
    email: env.HANLEARN_TEST_A_EMAIL,
    password: env.HANLEARN_TEST_A_PASSWORD,
  });
  const bLogin = await b.auth.signInWithPassword({
    email: env.HANLEARN_TEST_B_EMAIL,
    password: env.HANLEARN_TEST_B_PASSWORD,
  });
  assert(
    !aLogin.error && !bLogin.error && aLogin.data.user && bLogin.data.user,
    "Auth login failed; details suppressed",
  );
  const aId = aLogin.data.user.id,
    bId = bLogin.data.user.id;
  assert.notEqual(aId, bId, "Two distinct approved test users required");
  const aAccess = await a.rpc("get_learner_access"),
    bAccess = await b.rpc("get_learner_access");
  ok(
    !aAccess.error &&
      aAccess.data === true &&
      !bAccess.error &&
      bAccess.data === true,
    "both approved learners pass real JWT/DB authorization",
  );
  for (const [client, ownId, otherId, label] of [
    [a, aId, bId, "A"],
    [b, bId, aId, "B"],
  ]) {
    for (const table of [
      "profiles",
      "review_cards",
      "lesson_progress",
      "study_sessions",
    ]) {
      const column = table === "profiles" ? "id" : "user_id";
      const rows = await client.from(table).select(column).limit(1000);
      ok(
        !rows.error && rows.data.every((row) => row[column] === ownId),
        `${label} only receives owned ${table}`,
      );
      const foreign = await client
        .from(table)
        .select(column)
        .eq(column, otherId)
        .limit(1);
      ok(
        !foreign.error && foreign.data.length === 0,
        `${label} cannot read other learner ${table}`,
      );
    }
    const keys = await client
      .schema("private")
      .from("quiz_answer_keys")
      .select("question_id")
      .limit(1);
    ok(
      !!keys.error && keys.data === null,
      `${label} private answer schema denied`,
    );
    // Nonexistent UUID guarantees no data mutation even if grants are broken.
    const blockedUpdate = await client
      .from("review_cards")
      .update({ interval_days: 0 })
      .eq("id", "00000000-0000-0000-0000-000000000000");
    ok(
      blockedUpdate.error?.code === "42501",
      `${label} direct SRS schedule UPDATE denied`,
    );
    // Missing mandatory fields prevent row creation even if INSERT is accidentally granted.
    const blockedInsert = await client.from("review_events").insert({});
    ok(
      blockedInsert.error?.code === "42501",
      `${label} direct review event INSERT denied`,
    );
  }
  const user = await a.auth.getUser();
  ok(
    !user.error && user.data.user.id === aId,
    "session revalidation via real Auth",
  );
  const signedOut = await a.auth.signOut({ scope: "local" });
  ok(!signedOut.error, "real local-session logout");
  console.log(
    "PARTIAL: read-only Auth/API checks passed. Browser refresh/reload, Storage, fixture write isolation and transactional cloud tests remain separate approval gates.",
  );
} catch {
  console.error(
    "FAIL cloud verification; credential/response details suppressed. Check approved Development settings locally.",
  );
  process.exitCode = 1;
} finally {
  await Promise.allSettled([
    a.auth.signOut({ scope: "local" }),
    b.auth.signOut({ scope: "local" }),
  ]);
}
