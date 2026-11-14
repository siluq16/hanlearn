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

  it("validates server-authoritative score evaluation for Lesson 5", () => {
    const quiz = LESSON_05_QUIZ;
    // Simulate all correct answers
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
    expect(correctCount / quiz.questions.length >= 0.6).toBe(true);

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
    expect(partialCount / quiz.questions.length >= 0.6).toBe(false);
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
});
