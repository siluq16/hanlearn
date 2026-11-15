"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireLearner } from "@/features/auth/session";

export interface UnitTestQuestion {
  id: string;
  section: "listening" | "vocabulary" | "grammar" | "reading";
  prompt: string;
  audioText?: string;
  choices: string[];
  correct_index?: number;
  explanation_vi?: string;
}

export interface UnitTestDefinition {
  id: string;
  slug: string;
  unit_id: string;
  unit_number: number;
  title: string;
  scope_vi: string;
  duration_minutes: number;
  passing_score: number;
  total_questions: number;
  lessons_covered: string[];
  questions: UnitTestQuestion[];
}

export interface UnitTestQuestionResult {
  questionId: string;
  section: "listening" | "vocabulary" | "grammar" | "reading";
  userChoice: number | null;
  correctChoice: number;
  isCorrect: boolean;
  explanationVi: string;
}

export interface UnitTestResult {
  unitNumber: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  breakdown: {
    listening: { correct: number; total: number };
    vocabulary: { correct: number; total: number };
    grammar: { correct: number; total: number };
    reading: { correct: number; total: number };
  };
  questionResults: UnitTestQuestionResult[];
  recommendedLessons: string[];
}

function loadUnitTestRaw(unitNumber: number): UnitTestDefinition {
  const filePath = path.join(
    process.cwd(),
    "content/hsk_library/unit_tests",
    `hsk1_unit_test_0${unitNumber}.json`
  );
  if (!fs.existsSync(filePath)) {
    throw new Error(`Unit test 0${unitNumber} not found`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as UnitTestDefinition;
}

export async function getUnitTestDefinition(
  unitNumber: number
): Promise<UnitTestDefinition> {
  const raw = loadUnitTestRaw(unitNumber);
  // Strip correct_index and explanation_vi from client payload before submission
  return {
    ...raw,
    questions: raw.questions.map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correct_index, explanation_vi, ...safeQ } = q;
      return safeQ as UnitTestQuestion;
    }),
  };
}

export async function submitUnitTestAction(
  unitNumber: number,
  answers: Record<string, number>,
  timeSpentSeconds: number
): Promise<UnitTestResult> {
  const learner = await requireLearner();
  const raw = loadUnitTestRaw(unitNumber);
  const clampedTimeSpent = Math.max(1, Math.min(Number(timeSpentSeconds) || 0, raw.duration_minutes * 60));

  let listeningCorrect = 0;
  let vocabularyCorrect = 0;
  let grammarCorrect = 0;
  let readingCorrect = 0;

  const listeningTotal = raw.questions.filter((q) => q.section === "listening").length;
  const vocabularyTotal = raw.questions.filter((q) => q.section === "vocabulary").length;
  const grammarTotal = raw.questions.filter((q) => q.section === "grammar").length;
  const readingTotal = raw.questions.filter((q) => q.section === "reading").length;

  const questionResults: UnitTestQuestionResult[] = raw.questions.map((q) => {
    const userChoice = answers[q.id] ?? null;
    const isCorrect = userChoice === q.correct_index;

    if (isCorrect) {
      if (q.section === "listening") listeningCorrect += 1;
      else if (q.section === "vocabulary") vocabularyCorrect += 1;
      else if (q.section === "grammar") grammarCorrect += 1;
      else if (q.section === "reading") readingCorrect += 1;
    }

    return {
      questionId: q.id,
      section: q.section,
      userChoice,
      correctChoice: q.correct_index ?? 0,
      isCorrect,
      explanationVi: q.explanation_vi || "",
    };
  });

  const totalScore = listeningCorrect + vocabularyCorrect + grammarCorrect + readingCorrect;
  const maxScore = raw.total_questions;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const passed = totalScore >= raw.passing_score; // >= 16 / 20 (80%)

  const attemptId = randomUUID();
  const now = new Date().toISOString();
  const quizSlug = `hsk1-unit-test-0${unitNumber}`;

  // Authoritative server-side insertion into curriculum_quiz_attempts
  if (learner && learner.supabase && learner.user) {
    const { error: insertError } = await learner.supabase
      .from("curriculum_quiz_attempts")
      .insert({
        id: attemptId,
        user_id: learner.user.id,
        quiz_id: attemptId,
        quiz_slug: quizSlug,
        started_at: new Date(Date.now() - clampedTimeSpent * 1000).toISOString(),
        submitted_at: now,
        correct_count: totalScore,
        question_count: maxScore,
        passed,
        answers,
        metadata: {
          unit_number: unitNumber,
          score_percentage: percentage,
          breakdown: {
            listening: `${listeningCorrect}/${listeningTotal}`,
            vocabulary: `${vocabularyCorrect}/${vocabularyTotal}`,
            grammar: `${grammarCorrect}/${grammarTotal}`,
            reading: `${readingCorrect}/${readingTotal}`,
          },
        },
      });

    // Dual-layer safe persistence
    if (insertError) {
      try {
        const { data: userRecord } = await learner.supabase.auth.getUser();
        const existingAttempts =
          (userRecord?.user?.user_metadata?.[`quiz_attempts_${quizSlug}`] as Array<unknown>) || [];
        const updated = [
          ...existingAttempts,
          {
            id: attemptId,
            started_at: new Date(Date.now() - clampedTimeSpent * 1000).toISOString(),
            submitted_at: now,
            correct_count: totalScore,
            question_count: maxScore,
            passed,
            answers,
          },
        ];
        await learner.supabase.auth.updateUser({
          data: {
            [`quiz_attempts_${quizSlug}`]: updated,
          },
        });
      } catch {}
    }
  }

  revalidatePath("/exam");
  revalidatePath("/roadmap");
  revalidatePath("/dashboard");

  return {
    unitNumber,
    totalScore,
    maxScore,
    percentage,
    passed,
    timeSpentSeconds,
    breakdown: {
      listening: { correct: listeningCorrect, total: listeningTotal },
      vocabulary: { correct: vocabularyCorrect, total: vocabularyTotal },
      grammar: { correct: grammarCorrect, total: grammarTotal },
      reading: { correct: readingCorrect, total: readingTotal },
    },
    questionResults,
    recommendedLessons: passed ? [] : raw.lessons_covered,
  };
}
