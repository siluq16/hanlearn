import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";
import fs from "node:fs";
import path from "node:path";

async function runCloudSecurityAcceptance() {
  console.log("===============================================================================");
  console.log("=== SPRINT 8I: LIVE SUPABASE CLOUD DEVELOPMENT ACCEPTANCE & SECURITY AUDIT ===");
  console.log("===============================================================================\n");

  const config = developmentConfig();
  console.log("Target Cloud Database URL:", config.url);
  if (!config.url.includes("hhgxrjqkuwdgurphopok")) {
    throw new Error("ABORT: Target is NOT Supabase Development hhgxrjqkuwdgurphopok!");
  }

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

  console.log("[AUTH] Authenticating dedicated test user...");
  const login = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (login.error) throw new Error("Cloud Auth failed: " + login.error.message);
  console.log("Authenticated User ID:", account.userId);

  const otherUserId = account.protectedLearnerIds?.[0] || "11111111-1111-4111-8111-111111111111";

  const RESULTS = {
    passed: 0,
    failed: 0,
    checks: [],
  };

  function record(name, pass, detail = "") {
    if (pass) {
      RESULTS.passed++;
      RESULTS.checks.push({ name, status: "PASS", detail });
      console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ""}`);
    } else {
      RESULTS.failed++;
      RESULTS.checks.push({ name, status: "FAIL", detail });
      console.error(`[FAIL] ${name} - ${detail}`);
    }
  }

  // --- ATTACK VECTOR 1: Legacy 5-argument RPC must not be callable ---
  console.log("\n--- [1] Attack Vector: Invoking Legacy 5-argument submit_curriculum_quiz_attempt ---");
  const legacyAttemptId = crypto.randomUUID();
  const legacyRes = await client.rpc("submit_curriculum_quiz_attempt", {
    p_attempt_id: legacyAttemptId,
    p_correct_count: 20,
    p_question_count: 20,
    p_passed: true,
    p_answers: {},
  });
  const legacyBlocked = legacyRes.error !== null;
  record(
    "legacy_5arg_rpc_unusable",
    legacyBlocked,
    `Calling 5-argument overload rejected: ${legacyRes.error?.message || "none"}`
  );

  // --- ATTACK VECTOR 2: Direct REST API Access to Answer Keys & Quiz Definitions ---
  console.log("\n--- [2] Attack Vector: Leaking Answer Keys & Definitions via PostgREST REST API ---");
  const keysRead = await client.from("curriculum_quiz_keys").select("*");
  record(
    "answer_keys_rest_inaccessible",
    keysRead.error !== null,
    `curriculum_quiz_keys blocked from REST: ${keysRead.error?.message || "none"}`
  );

  const defsRead = await client.from("curriculum_quiz_definitions").select("*");
  record(
    "quiz_definitions_rest_inaccessible",
    defsRead.error !== null,
    `curriculum_quiz_definitions blocked from REST: ${defsRead.error?.message || "none"}`
  );

  // --- ATTACK VECTOR 3: Direct Forged Score INSERT via REST API ---
  console.log("\n--- [3] Attack Vector: Inserting Forged Score Directly via REST API ---");
  const forgeAttemptId = crypto.randomUUID();
  const forgeInsert = await client.from("curriculum_quiz_attempts").insert({
    id: forgeAttemptId,
    user_id: account.userId,
    quiz_id: "forged-exam",
    lesson_id: "hsk1-unit-test-01",
    question_count: 20,
    correct_count: 20,
    passed: true,
    submitted_at: new Date().toISOString(),
  }).select("correct_count, passed, submitted_at").single();

  let scoreForged = false;
  if (!forgeInsert.error && forgeInsert.data) {
    // If the insert was allowed through, check if trigger stripped the scores to null
    if (forgeInsert.data.correct_count !== null || forgeInsert.data.passed !== null || forgeInsert.data.submitted_at !== null) {
      scoreForged = true;
    }
    // Clean up
    await client.from("curriculum_quiz_attempts").delete().eq("id", forgeAttemptId);
  }

  record(
    "direct_score_insert_sanitized_or_blocked",
    !scoreForged,
    forgeInsert.error
      ? `RLS blocked insert: ${forgeInsert.error.message}`
      : `Trigger sanitized client scores to NULL (correct_count=${forgeInsert.data?.correct_count}, passed=${forgeInsert.data?.passed})`
  );

  // --- ATTACK VECTOR 4: Direct Forged Score UPDATE via REST API ---
  console.log("\n--- [4] Attack Vector: Updating Scores Directly via REST API ---");
  const forgeUpdate = await client.from("curriculum_quiz_attempts").update({
    correct_count: 20,
    passed: true,
  }).eq("user_id", account.userId);
  record(
    "direct_score_update_blocked",
    forgeUpdate.error !== null,
    `Direct UPDATE on attempts blocked by permissions: ${forgeUpdate.error?.message}`
  );

  // --- ATTACK VECTOR 5: Forging started_at Timestamp on Legitimate INSERT ---
  console.log("\n--- [5] Security Verification: Server Clock Timestamp Trigger Override ---");
  const testAttemptId = crypto.randomUUID();
  const fakeFutureDate = "2099-01-01T00:00:00.000Z";
  const startInsert = await client.from("curriculum_quiz_attempts").insert({
    id: testAttemptId,
    user_id: account.userId,
    quiz_id: "hsk1-unit-test-01",
    lesson_id: "hsk1-unit-test-01",
    question_count: 20,
    started_at: fakeFutureDate,
    submitted_at: null,
    correct_count: null,
    passed: null,
  });

  if (startInsert.error) {
    record("trigger_stamps_server_clock", false, "Insert failed: " + startInsert.error.message);
  } else {
    // Read back started_at
    const { data: row } = await client
      .from("curriculum_quiz_attempts")
      .select("started_at")
      .eq("id", testAttemptId)
      .single();

    const storedYear = new Date(row.started_at).getUTCFullYear();
    const isServerStamped = storedYear === new Date().getUTCFullYear();
    record(
      "trigger_stamps_server_clock",
      isServerStamped && storedYear !== 2099,
      `Client specified 2099; server trigger recorded: ${row.started_at}`
    );
  }

  // --- POSITIVE FLOW: Server-Authoritative Grading for Unit Test 1 ---
  console.log("\n--- [6] Positive Flow: Server-Authoritative Grading for Unit Test 1 ---");
  const ut1Data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "content/hsk_library/unit_tests/hsk1_unit_test_01.json"), "utf-8")
  );
  
  // Build answers: 18 correct, 2 incorrect
  const testAnswers = {};
  for (let i = 0; i < ut1Data.questions.length; i++) {
    const q = ut1Data.questions[i];
    if (i < 18) {
      testAnswers[q.id] = q.correct_index;
    } else {
      testAnswers[q.id] = (q.correct_index + 1) % 4; // intentionally wrong
    }
  }

  const { data: gradedAttempt, error: submitErr } = await client.rpc(
    "submit_curriculum_quiz_attempt",
    {
      p_attempt_id: testAttemptId,
      p_answers: testAnswers,
    }
  );

  if (submitErr) {
    record("server_grading_accuracy", false, "Submit RPC error: " + submitErr.message);
  } else {
    const isAccurate = gradedAttempt.correct_count === 18 && gradedAttempt.question_count === 20 && gradedAttempt.passed === true;
    record(
      "server_grading_accuracy",
      isAccurate,
      `Graded on Cloud server: ${gradedAttempt.correct_count}/${gradedAttempt.question_count}, passed=${gradedAttempt.passed}`
    );
  }

  // --- ATTACK VECTOR 6: Anti-Replay Duplicate Submission ---
  console.log("\n--- [7] Attack Vector: Duplicate Submission of Finished Attempt (Anti-Replay) ---");
  const { error: replayErr } = await client.rpc("submit_curriculum_quiz_attempt", {
    p_attempt_id: testAttemptId,
    p_answers: testAnswers,
  });
  const isReplayBlocked = replayErr !== null && (replayErr.message.includes("ALREADY_SUBMITTED") || replayErr.code === "PT409");
  record(
    "anti_replay_duplicate_blocked",
    isReplayBlocked,
    `Duplicate submission rejected: ${replayErr?.message}`
  );

  // --- ATTACK VECTOR 7: Cross-User Attempt Isolation ---
  console.log("\n--- [8] Attack Vector: Cross-User Attempt Read & Submission ---");
  const crossUserRead = await client
    .from("curriculum_quiz_attempts")
    .select("*")
    .eq("user_id", otherUserId);
  record(
    "cross_user_attempts_invisible",
    crossUserRead.data?.length === 0,
    `Other user attempts count returned: ${crossUserRead.data?.length || 0}`
  );

  // Clean up test attempt
  await client.from("curriculum_quiz_attempts").delete().eq("id", testAttemptId);

  // --- POSITIVE FLOW: Mini Quiz Compatibility ---
  console.log("\n--- [9] Compatibility Verification: Mini Quiz (Lesson 1) Server Grading ---");
  const miniAttemptId = crypto.randomUUID();
  const miniAnswers = {
    "10000001-0000-4000-8000-000000000001": 2,
    "10000001-0000-4000-8000-000000000002": 1,
    "10000001-0000-4000-8000-000000000003": 0,
    "10000001-0000-4000-8000-000000000004": 0,
    "10000001-0000-4000-8000-000000000005": 0,
    "10000001-0000-4000-8000-000000000006": 0,
    "10000001-0000-4000-8000-000000000007": 0,
    "10000001-0000-4000-8000-000000000008": 0,
  };

  // Start mini quiz
  const miniStart = await client.from("curriculum_quiz_attempts").insert({
    id: miniAttemptId,
    user_id: account.userId,
    quiz_id: "08f2e3a1-e171-5aa6-93b9-ac777b053a41",
    lesson_id: "l-hsk1-001",
    question_count: 8,
    submitted_at: null,
    correct_count: null,
    passed: null,
  });

  if (miniStart.error) {
    record("mini_quiz_flow_compatible", false, "Mini quiz insert error: " + miniStart.error.message);
  } else {
    const { data: miniResult, error: miniSubmitErr } = await client.rpc(
      "submit_curriculum_quiz_attempt",
      {
        p_attempt_id: miniAttemptId,
        p_answers: miniAnswers,
      }
    );

    if (miniSubmitErr) {
      record("mini_quiz_flow_compatible", false, "Mini quiz submit RPC error: " + miniSubmitErr.message);
    } else {
      const miniPass = miniResult.correct_count === 8 && miniResult.passed === true;
      record(
        "mini_quiz_flow_compatible",
        miniPass,
        `Mini quiz graded: ${miniResult.correct_count}/${miniResult.question_count}, passed=${miniResult.passed}`
      );
    }

    // Clean up mini attempt
    await client.from("curriculum_quiz_attempts").delete().eq("id", miniAttemptId);
  }

  // --- POSITIVE FLOW: All 6 Unit Tests Server Grading Compatibility ---
  console.log("\n--- [9B] Compatibility Verification: All 6 Unit Tests Server Grading ---");
  for (let u = 1; u <= 6; u++) {
    const slug = `hsk1-unit-test-0${u}`;
    const testFile = `hsk1_unit_test_0${u}.json`;
    const utData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), `content/hsk_library/unit_tests/${testFile}`), "utf-8")
    );
    const utAttemptId = crypto.randomUUID();

    // Start attempt
    const utStart = await client.from("curriculum_quiz_attempts").insert({
      id: utAttemptId,
      user_id: account.userId,
      quiz_id: slug,
      lesson_id: slug,
      question_count: utData.questions.length,
      submitted_at: null,
      correct_count: null,
      passed: null,
    });

    if (utStart.error) {
      record(`unit_test_${u}_flow`, false, "Insert error: " + utStart.error.message);
      continue;
    }

    // Submit answers with all correct answers
    const answers = {};
    for (const q of utData.questions) {
      answers[q.id] = q.correct_index;
    }

    const { data: res, error: err } = await client.rpc(
      "submit_curriculum_quiz_attempt",
      {
        p_attempt_id: utAttemptId,
        p_answers: answers,
      }
    );

    if (err) {
      record(`unit_test_${u}_flow`, false, "Submit RPC error: " + err.message);
    } else {
      const pass = res.correct_count === utData.questions.length && res.passed === true;
      record(
        `unit_test_${u}_flow`,
        pass,
        `${slug} graded on server: ${res.correct_count}/${res.question_count}, passed=${res.passed}`
      );
    }

    // Clean up
    await client.from("curriculum_quiz_attempts").delete().eq("id", utAttemptId);
  }

  // --- PROGRESS & PRACTICE PERSISTENCE VERIFICATION ---
  console.log("\n--- [10] Verification: Practice History & Stage Progress Persistence ---");
  const practiceCheck = await client
    .from("learner_practice_history")
    .select("practice_set_id, best_score, total_questions")
    .eq("user_id", account.userId)
    .limit(1);
  record(
    "practice_history_table_ready",
    practiceCheck.error === null,
    `learner_practice_history is functional on remote`
  );

  const stageCheck = await client
    .from("learner_stage_progress")
    .select("lesson_id, completed_stages, current_stage")
    .eq("user_id", account.userId)
    .limit(1);
  record(
    "stage_progress_table_ready",
    stageCheck.error === null,
    `learner_stage_progress is functional on remote`
  );

  console.log("\n===============================================================================");
  console.log("=== CLOUD ACCEPTANCE AUDIT SUMMARY ===");
  console.log(`Total Checks: ${RESULTS.passed + RESULTS.failed}`);
  console.log(`Passed:       ${RESULTS.passed}`);
  console.log(`Failed:       ${RESULTS.failed}`);
  console.log(`Verdict:      ${RESULTS.failed === 0 ? ">>> CLOUD_PASS <<<" : ">>> CLOUD_FAIL <<<"}`);
  console.log("===============================================================================\n");

  if (RESULTS.failed > 0) {
    process.exit(1);
  }
}

runCloudSecurityAcceptance().catch((err) => {
  console.error("FATAL ERROR IN CLOUD ACCEPTANCE:", err);
  process.exit(1);
});
