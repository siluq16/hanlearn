"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import mockExamData from "../../../content/hsk_library/hsk1_mock_exam_official.json";
import { requireLearner } from "@/features/auth/session";
import type { MockExamDefinition, MockExamResult } from "./types";

const mockExam = mockExamData as unknown as MockExamDefinition;

export async function getMockExamDefinition(): Promise<MockExamDefinition> {
  // Strip explanation_vi and correct answers from client payload before submission
  return {
    ...mockExam,
    questions: mockExam.questions.map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correct_index, explanation_vi, ...safeQ } = q;
      return safeQ as unknown as typeof q;
    }),
  };
}

export async function submitMockExamAction(
  answers: Record<string, number>,
  timeSpentSeconds: number
): Promise<MockExamResult> {
  const learner = await requireLearner();

  let listeningCorrect = 0;
  let readingCorrect = 0;

  const rawQuestions = mockExamData.questions as {
    id: string;
    sort_order: number;
    section: "listening" | "reading";
    correct_index: number;
    explanation_vi: string;
  }[];

  const questionResults = rawQuestions.map((q) => {
    const userChoice = answers[q.id] ?? null;
    const isCorrect = userChoice === q.correct_index;

    if (isCorrect) {
      if (q.section === "listening") {
        listeningCorrect += 1;
      } else {
        readingCorrect += 1;
      }
    }

    return {
      questionId: q.id,
      sortOrder: q.sort_order,
      section: q.section,
      userChoice,
      correctChoice: q.correct_index,
      isCorrect,
      explanationVi: q.explanation_vi || "",
    };
  });

  // HSK 1 Official Scoring:
  // Listening: 20 questions * 5 pts = 100 max
  // Reading: 20 questions * 5 pts = 100 max
  // Total: 200 max, Passing score >= 120
  const listeningScore = listeningCorrect * 5;
  const readingScore = readingCorrect * 5;
  const totalScore = listeningScore + readingScore;
  const passed = totalScore >= 120;

  if (learner && learner.supabase && learner.user) {
    const attemptId = randomUUID();
    const now = new Date().toISOString();

    const { error: insertError } = await learner.supabase
      .from("curriculum_quiz_attempts")
      .insert({
        id: attemptId,
        user_id: learner.user.id,
        quiz_id: "77777777-7777-4777-8777-000000000999",
        lesson_id: "exam-hsk1-official-mock",
        started_at: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
        submitted_at: now,
        question_count: 40,
        correct_count: listeningCorrect + readingCorrect,
        passed,
        answers: {
          listeningScore,
          readingScore,
          totalScore,
          timeSpentSeconds,
        },
      });

    if (insertError) {
      console.warn("curriculum_quiz_attempts insert warning for mock exam:", insertError.message);
    }
  }

  revalidatePath("/exam/hsk1");
  revalidatePath("/dashboard");

  return {
    examId: mockExam.id,
    totalQuestions: 40,
    totalScore,
    maxScore: 200,
    listeningCorrect,
    listeningScore,
    readingCorrect,
    readingScore,
    passed,
    timeSpentSeconds,
    questionResults,
  };
}
