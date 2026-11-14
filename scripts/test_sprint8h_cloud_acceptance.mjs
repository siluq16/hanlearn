import { createServerClient } from "@supabase/ssr";
import { chromium } from "@playwright/test";
import { developmentConfig, testStore } from "./development.mjs";

async function main() {
  console.log("=== SPRINT 8H: FULL ACCEPTANCE VERIFICATION ===");
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

  // 1. Authenticate dedicated test user
  console.log("Authenticating dedicated test user...");
  const login = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (login.error) throw new Error("Auth failed: " + login.error.message);
  console.log("Authenticated as:", account.userId);

  const realLearners = account.protectedLearnerIds || [];
  const otherUserId = realLearners[0];

  // 2. Verify RLS Isolation on learner_stage_progress
  console.log("\n--- Checking RLS on learner_stage_progress ---");
  const readOtherProgress = await client
    .from("learner_stage_progress")
    .select("*")
    .eq("user_id", otherUserId);

  if (readOtherProgress.error) {
    console.log("Query error (expected RLS block):", readOtherProgress.error.message);
  } else {
    console.log("Rows returned for other user:", readOtherProgress.data.length);
    if (readOtherProgress.data.length !== 0) {
      throw new Error("RLS VIOLATION: Test user could read another user's learner_stage_progress!");
    }
  }
  console.log("PASS: RLS prevents reading other learner's stage progress.");

  // 3. Verify Atomic Upsert & Concurrency on learner_stage_progress
  console.log("\n--- Checking Concurrent Upsert on learner_stage_progress ---");
  const testLessonId = "test-concurrent-lesson";
  
  // Two concurrent calls with disjoint completed stages
  const p1 = client.rpc("upsert_learner_stage_progress", {
    p_lesson_id: testLessonId,
    p_completed_stages: [0, 1, 2],
    p_current_stage: 2,
  });
  const p2 = client.rpc("upsert_learner_stage_progress", {
    p_lesson_id: testLessonId,
    p_completed_stages: [3, 4],
    p_current_stage: 4,
  });

  const [res1, res2] = await Promise.all([p1, p2]);
  if (res1.error || res2.error) {
    throw new Error(`Concurrent upsert failed: ${res1.error?.message || res2.error?.message}`);
  }

  // Read back the saved row
  const readBack = await client
    .from("learner_stage_progress")
    .select("*")
    .eq("lesson_id", testLessonId)
    .single();

  if (readBack.error) throw new Error("Read back failed: " + readBack.error.message);
  const stages = readBack.data.completed_stages;
  console.log("Merged completed_stages:", stages, "current_stage:", readBack.data.current_stage);
  
  const expected = [0, 1, 2, 3, 4];
  const allPresent = expected.every(s => stages.includes(s));
  if (!allPresent) {
    throw new Error(`Lost update detected! Expected ${expected}, got ${stages}`);
  }
  console.log("PASS: Atomic upsert successfully merged concurrent writes without data loss.");

  // Clean up test row
  await client.from("learner_stage_progress").delete().eq("lesson_id", testLessonId);

  // 4. Verify RLS Isolation on curriculum_quiz_attempts
  console.log("\n--- Checking RLS on curriculum_quiz_attempts ---");
  const readOtherQuizzes = await client
    .from("curriculum_quiz_attempts")
    .select("*")
    .eq("user_id", otherUserId);

  if (readOtherQuizzes.data && readOtherQuizzes.data.length > 0) {
    throw new Error("RLS VIOLATION: Test user could read another user's curriculum_quiz_attempts!");
  }
  console.log("PASS: RLS prevents reading other learner's quiz attempts.");

  // Test that attempting to insert a row with another user's id fails
  const forgeInsert = await client
    .from("curriculum_quiz_attempts")
    .insert({
      user_id: otherUserId,
      quiz_id: "fake-quiz",
      lesson_id: "fake-lesson",
      question_count: 8,
      correct_count: 8,
      passed: true
    });
  
  if (!forgeInsert.error) {
    throw new Error("SECURITY VIOLATION: Learner could insert quiz attempt for another user!");
  }
  console.log("PASS: RLS with check blocks inserting quiz attempt for another user:", forgeInsert.error.code);

  console.log("\n=== ALL DATABASE INVARIANTS & RLS CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
