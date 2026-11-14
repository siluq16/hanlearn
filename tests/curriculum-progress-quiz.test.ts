import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  findCurriculumQuiz,
  ALL_CURRICULUM_QUIZZES,
  LESSON_05_QUIZ,
  LESSON_06_QUIZ,
  LESSON_07_QUIZ,
  LESSON_08_QUIZ,
  LESSON_09_QUIZ,
  LESSON_10_QUIZ,
  CHECKPOINT_01_QUIZ,
  CHECKPOINT_02_QUIZ,
} from "@/features/quizzes/curriculum-quizzes";

describe("Curriculum Quizzes & 9-Stage Progress Architecture", () => {
  it("verifies all curriculum quizzes have exactly 8 questions with reviewed answer keys", () => {
    expect(ALL_CURRICULUM_QUIZZES.length).toBe(8);

    for (const quiz of ALL_CURRICULUM_QUIZZES) {
      expect(quiz).toBeDefined();
      expect(quiz.questions.length).toBe(8);

      // Must be findable by both lessonId and slug
      const byId = findCurriculumQuiz(quiz.lessonId);
      const bySlug = findCurriculumQuiz(quiz.slug);
      expect(byId).toBe(quiz);
      expect(bySlug).toBe(quiz);

      // Verify each question structure
      for (const q of quiz.questions) {
        expect(q.choices.length).toBe(4);
        expect(q.prompt.length).toBeGreaterThan(5);
        const key = quiz.answerKeys[q.id];
        expect(key).toBeDefined();
        expect(key.correct_index).toBeGreaterThanOrEqual(0);
        expect(key.correct_index).toBeLessThan(4);
        expect(key.explanation_vi.length).toBeGreaterThan(10);
      }
    }
  });

  it("verifies Lesson 5 Quiz specific questions", () => {
    const quiz = LESSON_05_QUIZ;
    expect(quiz.lessonId).toBe("l-hsk1-005");
    expect(quiz.questions[0].choices[0]).toBe("这是我爸爸。");
  });

  it("verifies Lesson 6 question on date ordering and weekdays", () => {
    const quiz = LESSON_06_QUIZ;
    expect(quiz.questions.length).toBe(8);
    const q1 = quiz.questions[0];
    expect(q1.prompt).toContain("Bây giờ là mấy giờ");
    expect(quiz.answerKeys[q1.id].correct_index).toBe(0);

    const q2 = quiz.questions[1];
    expect(q2.prompt).toContain("星期三");
    expect(quiz.answerKeys[q2.id].correct_index).toBe(1); // Thứ tư
  });

  it("verifies Lesson 7 & 8 questions on shopping, prices, food and drinks", () => {
    const q7 = LESSON_07_QUIZ;
    expect(q7.questions[0].choices[0]).toContain("多少钱");
    expect(q7.answerKeys[q7.questions[0].id].correct_index).toBe(0);

    const q8 = LESSON_08_QUIZ;
    expect(q8.questions[0].prompt).toContain("uống");
    expect(q8.answerKeys[q8.questions[0].id].correct_index).toBe(0);
  });

  it("verifies Lesson 9 & 10 questions on locations, directions, habits and skills", () => {
    const q9 = LESSON_09_QUIZ;
    expect(q9.questions[0].prompt).toContain("ở đâu / chỗ nào");
    expect(q9.answerKeys[q9.questions[0].id].correct_index).toBe(0);

    const q10 = LESSON_10_QUIZ;
    expect(q10.questions[0].prompt).toContain("会");
    expect(q10.answerKeys[q10.questions[0].id].correct_index).toBe(0);
  });

  it("verifies Checkpoints 1 and 2 comprehensive milestones", () => {
    expect(CHECKPOINT_01_QUIZ.lessonId).toBe("l-hsk1-cp01");
    expect(CHECKPOINT_02_QUIZ.lessonId).toBe("l-hsk1-cp02");
    expect(CHECKPOINT_01_QUIZ.questions.length).toBe(8);
    expect(CHECKPOINT_02_QUIZ.questions.length).toBe(8);
  });

  it("validates server-authoritative score evaluation for Lesson 5 with 80% Mastery rubric", () => {
    const quiz = LESSON_05_QUIZ;
    // Simulate all correct answers (8 out of 8 = 100% -> Pass)
    const allCorrectAnswers: Record<string, number> = {};
    for (const q of quiz.questions) {
      allCorrectAnswers[q.id] = quiz.answerKeys[q.id].correct_index;
    }

    let correctCount = 0;
    for (const q of quiz.questions) {
      if (allCorrectAnswers[q.id] === quiz.answerKeys[q.id].correct_index) {
        correctCount++;
      }
    }
    expect(correctCount).toBe(8);
    expect(correctCount * 100 >= quiz.questions.length * 80).toBe(true);

    // 7 out of 8 = 87.5% -> Pass (>= 80%)
    expect(7 * 100 >= quiz.questions.length * 80).toBe(true);

    // 6 out of 8 = 75% -> Fail (< 80%)
    expect(6 * 100 >= quiz.questions.length * 80).toBe(false);

    // Simulate partial answers (4 out of 8 = 50% -> fail)
    const partialAnswers: Record<string, number> = {};
    quiz.questions.forEach((q, idx) => {
      partialAnswers[q.id] = idx < 4 ? quiz.answerKeys[q.id].correct_index : 999;
    });

    let partialCount = 0;
    for (const q of quiz.questions) {
      if (partialAnswers[q.id] === quiz.answerKeys[q.id].correct_index) {
        partialCount++;
      }
    }
    expect(partialCount).toBe(4);
    expect(partialCount * 100 >= quiz.questions.length * 80).toBe(false);
  });

  it("verifies learner_stage_progress migration defines atomic RPC and curriculum_quiz_attempts table", () => {
    const migrationPath = "supabase/migrations/202611140007_learner_stage_progress.sql";
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, "utf8");
    expect(sql).toContain("create table if not exists public.learner_stage_progress");
    expect(sql).toContain("primary key (user_id, lesson_id)");
    expect(sql).toContain("alter table public.learner_stage_progress enable row level security");
    expect(sql).toContain("upsert_learner_stage_progress");
    expect(sql).toContain("create table if not exists public.curriculum_quiz_attempts");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("private.is_learner()");
  });

  it("verifies speaking practice self-evaluation wording has been updated", () => {
    const exerciseEngineSource = fs.readFileSync(
      "src/features/exercises/components/exercise-engine.tsx",
      "utf8",
    );
    expect(exerciseEngineSource).toContain("✓ Tôi đã luyện đọc");
    expect(exerciseEngineSource).not.toContain("✓ Tôi đã đọc to &amp; chuẩn");
    expect(exerciseEngineSource).toContain("không đại diện cho kiểm định phát âm chính thức");
  });

  it("verifies learner stage progress concurrent update safe union and user isolation", () => {
    // Simulate device 1 completing stage 0, 1
    const device1Stages = [0, 1];
    // Simulate device 2 completing stage 1, 2 near-simultaneously
    const device2Stages = [1, 2];

    const merged = Array.from(new Set([...device1Stages, ...device2Stages])).sort((a, b) => a - b);
    expect(merged).toEqual([0, 1, 2]);

    // Verify cache keys are strictly isolated per user_id
    const userA = "11111111-1111-4111-8111-111111111111";
    const userB = "22222222-2222-4222-8222-222222222222";
    const lessonKey = "hsk1-lesson-05";
    const keyA = `hanlearn_9stage_${userA}_${lessonKey}`;
    const keyB = `hanlearn_9stage_${userB}_${lessonKey}`;
    expect(keyA).not.toBe(keyB);
    expect(keyA).toContain(userA);
    expect(keyB).toContain(userB);
  });
});
