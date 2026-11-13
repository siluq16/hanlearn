// SYNTHETIC LOCAL TEST. No pilot question or private answer source is read.
import type { QuizView } from "@/features/quizzes/contracts";
import { lessonIds } from "./lesson";
export const quizId = "80000000-0000-4000-8000-000000000001",
  attemptId = "90000000-0000-4000-8000-000000000001";
export function quizFixture(): QuizView {
  return {
    lessonId: lessonIds.lesson,
    lessonTitle: "Bài kiểm thử synthetic",
    quiz: { id: quizId, title: "Mini quiz kiểm thử", revision: 1 },
    questions: Array.from({ length: 5 }, (_, i) => ({
      id: `a0000000-0000-4000-8000-00000000000${i + 1}`,
      prompt: `Câu hỏi kiểm thử ${i + 1}: chọn một phương án để thử giao diện.`,
      choices: ["Lựa chọn thứ nhất", "Lựa chọn thứ hai"],
    })),
    attempt: null,
    history: [],
    responses: [],
    progress: { studiedAt: null, completedAt: null },
    recoveryScope: "synthetic-owner-quiz-1",
  };
}
export function activeQuiz() {
  const view = quizFixture();
  view.attempt = {
    id: attemptId,
    startedAt: "2026-11-13T01:00:00Z",
    submittedAt: null,
    correctCount: null,
    questionCount: null,
    passed: null,
  };
  return view;
}
export function submittedQuiz(passed = true) {
  const view = activeQuiz();
  Object.assign(view.attempt!, {
    submittedAt: "2026-11-13T01:01:00Z",
    correctCount: passed ? 4 : 3,
    questionCount: 5,
    passed,
  });
  view.history = [view.attempt!];
  view.responses = view.questions.map((q, i) => ({
    question_id: q.id,
    answer_index: null,
    is_correct: passed ? i < 4 : i < 3,
  }));
  return view;
}
