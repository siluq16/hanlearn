import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

async function main() {
  console.log("=== SECURITY AUDIT: CHECKING RPC SCORE TAMPERING & STARTED_AT FORGERY ===");
  const config = developmentConfig();
  const account = testStore("Read");

  const cookies = new Map();
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (rows) => {
        for (const row of rows) {
          if (row.value) cookies.set(row.name, row.value);
          else cookies.delete(row.name);
        }
      },
    },
  });

  await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });

  // TEST 1: Check if authenticated user can pass custom started_at on insert
  console.log("\n--- Checking Vulnerability 2: Fake started_at on INSERT ---");
  const fakeFutureDate = "2026-11-15T23:59:59.000Z";
  const fakeAttemptId = crypto.randomUUID();

  const insertRes = await client.from("curriculum_quiz_attempts").insert({
    id: fakeAttemptId,
    user_id: account.userId,
    quiz_id: "test-fake-start",
    lesson_id: "l-fake-start",
    question_count: 20,
    started_at: fakeFutureDate,
    submitted_at: null,
    correct_count: null,
    passed: null,
  }).select().single();

  if (!insertRes.error && insertRes.data?.started_at === fakeFutureDate) {
    console.log("VULNERABILITY CONFIRMED: User successfully inserted arbitrary started_at:", insertRes.data.started_at);
  } else {
    console.log("Protected: Cannot insert arbitrary started_at (Error: " + insertRes.error?.message + ")");
  }

  // TEST 2: Check if authenticated user can forge correct_count/passed via submit_curriculum_quiz_attempt RPC
  console.log("\n--- Checking Vulnerability 1: Forging score via submit_curriculum_quiz_attempt RPC ---");
  const rpcRes = await client.rpc("submit_curriculum_quiz_attempt", {
    p_attempt_id: fakeAttemptId,
    p_correct_count: 20, // 100% score forged by client!
    p_question_count: 20,
    p_passed: true,
    p_answers: { "hacked": 1 },
  });

  if (!rpcRes.error && rpcRes.data?.correct_count === 20 && rpcRes.data?.passed === true) {
    console.log("VULNERABILITY CONFIRMED: Authenticated caller successfully forged 20/20 score via direct RPC call!");
  } else {
    console.log("Protected: RPC rejected client score parameter (Error: " + rpcRes.error?.message + ")");
  }

  // Clean up
  await client.from("curriculum_quiz_attempts").delete().eq("id", fakeAttemptId);
}

main().catch(console.error);
