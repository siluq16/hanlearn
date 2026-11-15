import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

async function main() {
  console.log("=== SPRINT 8I-G: COMPREHENSIVE CLOUD ACCEPTANCE & RPC VERIFICATION ===");
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

  // 1. Authenticate test account
  console.log("\n[1/5] Authenticating test user...");
  const login = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (login.error) throw new Error("Auth failed: " + login.error.message);
  console.log("Authenticated User ID:", account.userId);

  const otherUserId = account.protectedLearnerIds?.[0] || "11111111-1111-4111-8111-111111111111";
  console.log("Target Other User ID for isolation tests:", otherUserId);

  // 2. Test learner_stage_progress & Atomic Upsert RPC
  console.log("\n[2/5] Testing learner_stage_progress & Atomic Upsert RPC...");
  const testLesson = "l-hsk1-test-concurrency";
  
  // Call 1
  const rpc1 = await client.rpc("upsert_learner_stage_progress", {
    p_lesson_id: testLesson,
    p_completed_stages: [0, 1],
    p_current_stage: 1,
  });
  if (rpc1.error) throw new Error("RPC upsert 1 failed: " + rpc1.error.message);

  // Call 2 (concurrent stage completion)
  const rpc2 = await client.rpc("upsert_learner_stage_progress", {
    p_lesson_id: testLesson,
    p_completed_stages: [1, 2, 3],
    p_current_stage: 3,
  });
  if (rpc2.error) throw new Error("RPC upsert 2 failed: " + rpc2.error.message);

  // Verify merged state in Cloud DB
  const { data: progressRow, error: progErr } = await client
    .from("learner_stage_progress")
    .select("*")
    .eq("lesson_id", testLesson)
    .single();

  if (progErr) throw new Error("Read back stage progress failed: " + progErr.message);
  console.log("Persisted completed_stages in Cloud:", progressRow.completed_stages);
  console.log("Persisted current_stage in Cloud:", progressRow.current_stage);
  
  const expectedStages = [0, 1, 2, 3];
  const allStagesPresent = expectedStages.every((s) => progressRow.completed_stages.includes(s));
  if (!allStagesPresent) {
    throw new Error(`Lost update in RPC! Expected ${expectedStages}, got ${progressRow.completed_stages}`);
  }
  console.log("PASS: Atomic upsert_learner_stage_progress safely merged stages on PostgreSQL Cloud.");

  // Clean up test stage progress
  await client.from("learner_stage_progress").delete().eq("lesson_id", testLesson);

  // 3. Test learner_practice_history persistence & upsert
  console.log("\n[3/5] Testing learner_practice_history table persistence...");
  const testPracticeId = "ps-test-cloud-01";
  
  // Upsert initial score
  const { error: pInsertErr } = await client
    .from("learner_practice_history")
    .upsert({
      user_id: account.userId,
      practice_set_id: testPracticeId,
      skill: "vocabulary",
      best_score: 4,
      total_questions: 5,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,practice_set_id" });

  if (pInsertErr) throw new Error("Insert into learner_practice_history failed: " + pInsertErr.message);

  // Upsert higher score
  const { error: pUpdateErr } = await client
    .from("learner_practice_history")
    .upsert({
      user_id: account.userId,
      practice_set_id: testPracticeId,
      skill: "vocabulary",
      best_score: 5,
      total_questions: 5,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,practice_set_id" });

  if (pUpdateErr) throw new Error("Update learner_practice_history failed: " + pUpdateErr.message);

  // Read back
  const { data: pRow, error: pReadErr } = await client
    .from("learner_practice_history")
    .select("*")
    .eq("practice_set_id", testPracticeId)
    .single();

  if (pReadErr) throw new Error("Read back practice history failed: " + pReadErr.message);
  console.log("Persisted Practice History: best_score =", pRow.best_score, "/", pRow.total_questions);
  if (pRow.best_score !== 5) {
    throw new Error("Practice history best_score mismatch! Expected 5, got " + pRow.best_score);
  }
  console.log("PASS: learner_practice_history persisted and updated on PostgreSQL Cloud.");

  // Clean up practice row
  await client.from("learner_practice_history").delete().eq("practice_set_id", testPracticeId);

  // 4. Test curriculum_quiz_attempts, RPC submit & Anti-Replay duplicate submission
  console.log("\n[4/5] Testing curriculum_quiz_attempts, submit RPC & Anti-Replay...");
  const testAttemptId = crypto.randomUUID();
  const testQuizSlug = "hsk1-unit-test-01";
  const startedAt = new Date().toISOString();

  // A. Legitimate start of attempt (scores null)
  const { error: startErr } = await client
    .from("curriculum_quiz_attempts")
    .insert({
      id: testAttemptId,
      user_id: account.userId,
      quiz_id: testAttemptId,
      lesson_id: testQuizSlug,
      started_at: startedAt,
      question_count: 20,
      submitted_at: null,
      correct_count: null,
      passed: null,
    });

  if (startErr) throw new Error("Legitimate start insert failed: " + startErr.message);
  console.log("PASS: Legitimate start of attempt inserted into curriculum_quiz_attempts.");

  // B. Server-side submission via atomic RPC
  const { data: submittedAttempt, error: submitRpcErr } = await client.rpc(
    "submit_curriculum_quiz_attempt",
    {
      p_attempt_id: testAttemptId,
      p_correct_count: 18,
      p_question_count: 20,
      p_passed: true,
      p_answers: { "q1": 1, "q2": 0 },
    }
  );

  if (submitRpcErr) throw new Error("submit_curriculum_quiz_attempt RPC failed: " + submitRpcErr.message);
  console.log("PASS: submit_curriculum_quiz_attempt RPC succeeded.");
  console.log("Result: correct_count =", submittedAttempt.correct_count, "passed =", submittedAttempt.passed);

  // C. Anti-Replay duplicate submission test: submit AGAIN with the same attempt ID
  console.log("Testing Anti-Replay (duplicate submission attack)...");
  const { data: duplicateRes, error: duplicateErr } = await client.rpc(
    "submit_curriculum_quiz_attempt",
    {
      p_attempt_id: testAttemptId,
      p_correct_count: 20,
      p_question_count: 20,
      p_passed: true,
      p_answers: { "q1": 0, "q2": 0 },
    }
  );

  if (!duplicateErr) {
    throw new Error("SECURITY FAILURE: Duplicate submission of an already finished attempt was allowed!");
  }
  console.log("PASS: Duplicate submission rejected with atomic error:", duplicateErr.message);

  // Clean up attempt
  await client.from("curriculum_quiz_attempts").delete().eq("id", testAttemptId);

  // 5. Verify RLS Isolation & Anti-Forging across all 3 tables
  console.log("\n[5/5] Testing Cross-User RLS Isolation & Anti-Forging via REST API...");

  // 5A: Cross-user reads
  const rlsRead1 = await client.from("learner_stage_progress").select("*").eq("user_id", otherUserId);
  const rlsRead2 = await client.from("learner_practice_history").select("*").eq("user_id", otherUserId);
  const rlsRead3 = await client.from("curriculum_quiz_attempts").select("*").eq("user_id", otherUserId);

  if ((rlsRead1.data?.length ?? 0) > 0 || (rlsRead2.data?.length ?? 0) > 0 || (rlsRead3.data?.length ?? 0) > 0) {
    throw new Error("RLS VIOLATION: User was able to read another user's rows!");
  }
  console.log("PASS: Cross-user SELECT returns 0 rows across all tables.");

  // 5B: Cross-user write attempt
  const crossInsert = await client.from("learner_practice_history").insert({
    user_id: otherUserId,
    practice_set_id: "forged-practice",
    skill: "reading",
    best_score: 5,
    total_questions: 5,
  });
  if (!crossInsert.error) {
    throw new Error("RLS VIOLATION: User was able to INSERT row for another user!");
  }
  console.log("PASS: Cross-user INSERT blocked by RLS:", crossInsert.error.message);

  // 5C: Self-forging score on direct INSERT (should be blocked)
  const forgeScoreInsert = await client.from("curriculum_quiz_attempts").insert({
    user_id: account.userId,
    quiz_id: "self-forge-quiz",
    lesson_id: "l-fake",
    question_count: 20,
    correct_count: 20,
    passed: true,
  });
  if (!forgeScoreInsert.error) {
    throw new Error("SECURITY VIOLATION: User could directly INSERT forged score via REST API!");
  }
  console.log("PASS: Direct INSERT with forged score blocked by RLS:", forgeScoreInsert.error.message);

  // 5D: Self-forging score on direct UPDATE (should be blocked by permission denied)
  const forgeScoreUpdate = await client.from("curriculum_quiz_attempts").update({
    correct_count: 20,
    passed: true,
  }).eq("user_id", account.userId);

  if (!forgeScoreUpdate.error) {
    throw new Error("SECURITY VIOLATION: User could directly UPDATE score via REST API!");
  }
  console.log("PASS: Direct UPDATE on scores blocked by table permission:", forgeScoreUpdate.error.message);

  console.log("\n========================================================");
  console.log(">>> VERIFICATION STATUS: CLOUD_PASS <<<");
  console.log("All 5 acceptance suites passed with 100% compliance.");
  console.log("========================================================");
}

main().catch((err) => {
  console.error("CLOUD ACCEPTANCE FAILED:", err);
  process.exit(1);
});
