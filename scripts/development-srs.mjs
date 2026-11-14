// Dedicated test identity only. No private store or fixed answer vector is read.
// Retakes learn from that learner's own POST-submission feedback, never private keys.
import fs from "node:fs";
import { randomUUID } from "node:crypto";
export async function ensureReviewCards(client, account, check) {
  const identity = await client.auth.getUser();
  check(
    "srs-seed-verified-automation-only",
    !identity.error &&
      identity.data.user?.id === account.userId &&
      identity.data.user.app_metadata?.hanlearn_automation === true,
  );
  const lesson = JSON.parse(
    fs.readFileSync("content/pilot-hsk1/v1/lessons/lesson-03.json", "utf8"),
  );
  const progress = await client
    .from("lesson_progress")
    .select("completed_at")
    .eq("user_id", account.userId)
    .eq("lesson_id", lesson.id)
    .maybeSingle();
  check("srs-seed-progress-readable", !progress.error);
  if (!progress.data?.completed_at) {
    const study = await client.rpc("mark_lesson_studied", {
      p_lesson_id: lesson.id,
    });
    check("srs-seed-study-rpc", !study.error);
    const quiz = await client
      .from("lesson_quizzes")
      .select("id")
      .eq("lesson_id", lesson.id)
      .single();
    check("srs-seed-public-quiz", !quiz.error);
    const questions = await client
      .from("quiz_questions")
      .select("id,choices")
      .eq("quiz_id", quiz.data.id)
      .order("sort_order");
    check(
      "srs-seed-public-choices",
      !questions.error && questions.data.length === 6,
    );
    const choices = questions.data;
    const answers = Object.fromEntries(choices.map((q) => [q.id, 0]));
    let passed = false;
    for (
      let n = 0;
      n < Math.max(...choices.map((q) => q.choices.length));
      n++
    ) {
      const started = await client.rpc("start_quiz", {
        p_quiz_id: quiz.data.id,
        p_idempotency_key: randomUUID(),
      });
      check(
        "srs-seed-retake-start",
        !started.error && !!started.data?.attemptId,
      );
      const submitted = await client.rpc("submit_quiz", {
        p_attempt_id: started.data.attemptId,
        p_answers: answers,
      });
      check(
        "srs-seed-database-grading",
        !submitted.error && typeof submitted.data?.passed === "boolean",
      );
      if (submitted.data.passed) {
        passed = true;
        break;
      }
      const feedback = await client
        .from("quiz_responses")
        .select("question_id,answer_index,is_correct")
        .eq("user_id", account.userId)
        .eq("attempt_id", started.data.attemptId);
      check(
        "srs-seed-own-submitted-feedback",
        !feedback.error && feedback.data.length === choices.length,
      );
      for (const q of choices) {
        const row = feedback.data.find((r) => r.question_id === q.id);
        if (!row?.is_correct)
          answers[q.id] = (answers[q.id] + 1) % q.choices.length;
      }
    }
    check("srs-seed-passed-by-database", passed);
  }
  const links = await client
    .from("lesson_vocabulary")
    .select("vocabulary_id")
    .eq("lesson_id", lesson.id);
  check("srs-seed-readable-vocabulary-links", !links.error);
  const ids = links.data.map((r) => r.vocabulary_id);
  const read = () =>
    client
      .from("review_cards")
      .select("id,vocabulary_id,card_type")
      .eq("user_id", account.userId)
      .in("vocabulary_id", ids)
      .in("card_type", ["hanzi_to_vi", "vi_to_hanzi"])
      .order("id");
  const before = await read();
  check(
    "lesson-completion-created-two-directions",
    !before.error && before.data.length === ids.length * 2,
  );
  const repeat = await client.rpc("mark_lesson_studied", {
    p_lesson_id: lesson.id,
  });
  const after = await read();
  check(
    "repeated-completion-no-duplicate-cards",
    !repeat.error &&
      !after.error &&
      JSON.stringify(before.data) === JSON.stringify(after.data),
  );
}
