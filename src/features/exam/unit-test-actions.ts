"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireLearner } from "@/features/auth/session";
import { invalidateLearnerSnapshot } from "@/features/courses/queries";
import {
  getConfiguredAssessmentRevision,
  getQuestionRevisionEntry,
  pinAttemptRevisionInMemory,
  resolveAttemptKeyRevision,
  translateV2AnswersToV1,
} from "@/features/quizzes/quiz-revisions";

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
  key_revision?: 1 | 2;
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
  const activeRevision = getConfiguredAssessmentRevision();
  // Strip correct_index and explanation_vi from client payload before submission
  return {
    ...raw,
    key_revision: activeRevision,
    questions: raw.questions.map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correct_index, explanation_vi, ...safeQ } = q;
      const revEntry = getQuestionRevisionEntry(raw.slug, q.id);
      return {
        ...safeQ,
        choices:
          activeRevision === 1 && revEntry ? [...revEntry.v1Choices] : [...safeQ.choices],
      } as UnitTestQuestion;
    }),
  };
}

export async function startUnitTestAction(
  unitNumber: number,
  clientKeyRevision?: 1 | 2
): Promise<{
  ok: boolean;
  attemptId: string;
  startedAt: string;
  durationMinutes: number;
  keyRevision: 1 | 2;
}> {
  const learner = await requireLearner();
  const raw = loadUnitTestRaw(unitNumber);
  const attemptId = randomUUID();
  const startedAt = new Date().toISOString();
  const quizSlug = `hsk1-unit-test-0${unitNumber}`;
  const pinnedRevision: 1 | 2 =
    clientKeyRevision === 1 ? 1 : getConfiguredAssessmentRevision();
  pinAttemptRevisionInMemory(attemptId, pinnedRevision);

  let dbSaved = false;
  if (learner && learner.supabase && learner.user) {
    const { error: insertWithRevErr } = await learner.supabase
      .from("curriculum_quiz_attempts")
      .insert({
        id: attemptId,
        user_id: learner.user.id,
        quiz_id: attemptId,
        lesson_id: quizSlug,
        started_at: startedAt,
        question_count: raw.total_questions,
        submitted_at: null,
        correct_count: null,
        passed: null,
        key_revision: pinnedRevision,
      });
    if (!insertWithRevErr) {
      dbSaved = true;
    } else {
      const { error: legacyInsertErr } = await learner.supabase
        .from("curriculum_quiz_attempts")
        .insert({
          id: attemptId,
          user_id: learner.user.id,
          quiz_id: attemptId,
          lesson_id: quizSlug,
          started_at: startedAt,
          question_count: raw.total_questions,
          submitted_at: null,
          correct_count: null,
          passed: null,
        });
      if (!legacyInsertErr) {
        dbSaved = true;
      }
    }
  }

  if (!dbSaved) {
    throw new Error("Không thể khởi tạo phiên thi trên máy chủ. Vui lòng thử lại.");
  }

  return {
    ok: true,
    attemptId,
    startedAt,
    durationMinutes: raw.duration_minutes,
    keyRevision: pinnedRevision,
  };
}

export async function submitUnitTestAction(
  unitNumber: number,
  answers: Record<string, number>,
  timeSpentSeconds: number,
  attemptIdParam?: string
): Promise<UnitTestResult> {
  const learner = await requireLearner();
  const raw = loadUnitTestRaw(unitNumber);
  const maxAllowedDurationSec = raw.duration_minutes * 60;

  if (!attemptIdParam || !/^[a-f0-9-]{36}$/i.test(attemptIdParam)) {
    throw new Error("Lượt thi không hợp lệ hoặc thiếu mã phiên thi (Invalid attempt ID).");
  }
  const attemptId = attemptIdParam;

  type DbUnitTestAttemptRow = {
    id: string;
    started_at: string;
    submitted_at: string | null;
    key_revision?: number;
  };
  let dbAttempt: DbUnitTestAttemptRow | null = null;
  let dbHasKeyRevisionColumn = true;

  if (learner && learner.supabase && learner.user) {
    try {
      const revProbe = await learner.supabase
        .from("curriculum_quiz_attempts")
        .select("id, started_at, submitted_at, key_revision")
        .eq("id", attemptId)
        .eq("user_id", learner.user.id)
        .maybeSingle();
      if (!revProbe.error && revProbe.data) {
        dbAttempt = revProbe.data as DbUnitTestAttemptRow;
      } else if (revProbe.error) {
        dbHasKeyRevisionColumn = false;
        const { data } = await learner.supabase
          .from("curriculum_quiz_attempts")
          .select("id, started_at, submitted_at")
          .eq("id", attemptId)
          .eq("user_id", learner.user.id)
          .maybeSingle();
        if (data) {
          dbAttempt = data as DbUnitTestAttemptRow;
        }
      }
    } catch {
      dbHasKeyRevisionColumn = false;
    }
  }

  let startedAtMs = 0;

  const activeAttempts =
    (learner?.user?.user_metadata?.["active_unit_test_attempts"] as Record<
      string,
      { unitNumber: number; startedAt: string; keyRevision?: 1 | 2 }
    >) || {};
  const recordedMetaAttempt = activeAttempts[attemptId];

  if (dbAttempt) {
    // Atomic check: attempt must NOT have been submitted already
    if (dbAttempt.submitted_at) {
      throw new Error("Lượt thi này đã được nộp và ghi nhận trước đó. Không được nộp trùng.");
    }
    startedAtMs = new Date(dbAttempt.started_at).getTime();
  } else {
    // Check fallback metadata
    if (recordedMetaAttempt) {
      startedAtMs = new Date(recordedMetaAttempt.startedAt).getTime();
    } else {
      startedAtMs = Date.now() - Math.min(Number(timeSpentSeconds) || 0, maxAllowedDurationSec) * 1000;
    }
  }

  // Server-authoritative start time & deadline validation
  const nowMs = Date.now();
  const elapsedFromStartSec = Math.max(1, Math.round((nowMs - startedAtMs) / 1000));

  // Hard cutoff: 90 seconds grace period for network latency
  if (elapsedFromStartSec > maxAllowedDurationSec + 90) {
    throw new Error("Bài thi đã quá thời hạn làm bài quy định (Exam deadline exceeded).");
  }

  const verifiedTimeSpent = Math.min(elapsedFromStartSec, maxAllowedDurationSec);

  let listeningCorrect = 0;
  let vocabularyCorrect = 0;
  let grammarCorrect = 0;
  let readingCorrect = 0;

  const listeningTotal = raw.questions.filter((q) => q.section === "listening").length;
  const vocabularyTotal = raw.questions.filter((q) => q.section === "vocabulary").length;
  const grammarTotal = raw.questions.filter((q) => q.section === "grammar").length;
  const readingTotal = raw.questions.filter((q) => q.section === "reading").length;

  const quizSlug = `hsk1-unit-test-0${unitNumber}`;
  const effectiveRevision = resolveAttemptKeyRevision({
    dbHasKeyRevisionColumn,
    dbKeyRevision: dbAttempt?.key_revision,
    metaKeyRevision: recordedMetaAttempt?.keyRevision,
    attemptId,
  });

  const questionResults: UnitTestQuestionResult[] = raw.questions.map((q) => {
    const userChoice = answers[q.id] ?? null;
    const revEntry = getQuestionRevisionEntry(quizSlug, q.id);
    const expectedChoice =
      effectiveRevision === 1 && revEntry
        ? revEntry.v1CorrectIndex
        : (q.correct_index ?? 0);
    const isCorrect = userChoice === expectedChoice;

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
      correctChoice: expectedChoice,
      isCorrect,
      explanationVi: q.explanation_vi || "",
    };
  });

  const totalScore = listeningCorrect + vocabularyCorrect + grammarCorrect + readingCorrect;
  const maxScore = raw.total_questions;
  const percentage = Math.round((totalScore / maxScore) * 100);
  const passed = totalScore >= raw.passing_score; // >= 16 / 20 (80%)

  // Authoritative server-side submission into curriculum_quiz_attempts (Fail-Closed: no fake client-side pass or user_metadata fallback)
  if (!learner || !learner.supabase || !learner.user) {
    throw new Error("Không thể xác thực phiên học viên để nộp bài.");
  }

  const rpcAnswers =
    !dbHasKeyRevisionColumn && effectiveRevision === 2
      ? translateV2AnswersToV1(quizSlug, answers)
      : answers;
  const { error: rpcErr } = await learner.supabase.rpc("submit_curriculum_quiz_attempt", {
    p_attempt_id: attemptId,
    p_answers: rpcAnswers,
  });

  if (rpcErr) {
    if (rpcErr.code === "PT409") {
      throw new Error("Lượt thi này đã được nộp và ghi nhận trước đó. Không được nộp trùng.");
    }
    if (rpcErr.code === "22023") {
      throw new Error("Bài thi đã quá thời hạn làm bài quy định (Exam deadline exceeded).");
    }
    throw new Error("Không thể ghi nhận kết quả bài thi lên máy chủ. Vui lòng thử lại.");
  }

  invalidateLearnerSnapshot(learner?.user?.id);
  revalidatePath("/exam");
  revalidatePath("/roadmap");
  revalidatePath("/dashboard");

  return {
    unitNumber,
    totalScore,
    maxScore,
    percentage,
    passed,
    timeSpentSeconds: verifiedTimeSpent,
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
