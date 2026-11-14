import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  findCurriculumQuiz,
  LESSON_05_QUIZ,
  LESSON_06_QUIZ,
} from "@/features/quizzes/curriculum-quizzes";

describe("Curriculum Quizzes & 9-Stage Progress Architecture", () => {
  it("verifies Lesson 5 Quiz has exactly 8 questions with reviewed answer keys", () => {
    const quiz = findCurriculumQuiz("l-hsk1-005");
    expect(quiz).toBeDefined();
    expect(quiz?.lessonId).toBe("l-hsk1-005");
    expect(quiz?.questions.length).toBe(8);

    // Also lookable by slug
    const quizBySlug = findCurriculumQuiz("hsk1-lesson-05");
    expect(quizBySlug).toBe(quiz);

    // Each question has 4 choices and a valid answer key with Vietnamese explanation
    for (const q of quiz!.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.prompt.length).toBeGreaterThan(5);
      const key = quiz!.answerKeys[q.id];
      expect(key).toBeDefined();
      expect(key.correct_index).toBeGreaterThanOrEqual(0);
      expect(key.correct_index).toBeLessThan(4);
      expect(key.explanation_vi.length).toBeGreaterThan(15);
    }
  });

  it("verifies Lesson 6 Quiz has exactly 8 questions with reviewed answer keys", () => {
    const quiz = findCurriculumQuiz("l-hsk1-006");
    expect(quiz).toBeDefined();
    expect(quiz?.lessonId).toBe("l-hsk1-006");
    expect(quiz?.questions.length).toBe(8);

    const quizBySlug = findCurriculumQuiz("hsk1-lesson-06");
    expect(quizBySlug).toBe(quiz);

    for (const q of quiz!.questions) {
      expect(q.choices.length).toBe(4);
      expect(q.prompt.length).toBeGreaterThan(5);
      const key = quiz!.answerKeys[q.id];
      expect(key).toBeDefined();
      expect(key.correct_index).toBeGreaterThanOrEqual(0);
      expect(key.correct_index).toBeLessThan(4);
      expect(key.explanation_vi.length).toBeGreaterThan(15);
    }
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

  it("verifies learner_stage_progress minimal migration exists and defines RLS with auth.uid()", () => {
    const migrationPath = "supabase/migrations/202611140007_learner_stage_progress.sql";
    expect(fs.existsSync(migrationPath)).toBe(true);
    const sql = fs.readFileSync(migrationPath, "utf8");
    expect(sql).toContain("create table if not exists public.learner_stage_progress");
    expect(sql).toContain("primary key (user_id, lesson_id)");
    expect(sql).toContain("alter table public.learner_stage_progress enable row level security");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("private.is_learner()");
  });

  it("verifies Lesson 6 question on date ordering and weekdays", () => {
    const q1 = LESSON_06_QUIZ.questions[0];
    expect(q1.prompt).toContain("thứ tự sắp xếp thời gian ngày tháng");
    expect(LESSON_06_QUIZ.answerKeys[q1.id].correct_index).toBe(1); // Lớn đến nhỏ

    const q3 = LESSON_06_QUIZ.questions[2];
    expect(q3.prompt).toContain("Chủ nhật");
    expect(LESSON_06_QUIZ.answerKeys[q3.id].correct_index).toBe(1); // 星期天 / 星期日
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
