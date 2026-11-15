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

export async function startUnitTestAction(
  unitNumber: number
): Promise<{ ok: boolean; attemptId: string; startedAt: string; durationMinutes: number }> {
  const learner = await requireLearner();
  const raw = loadUnitTestRaw(unitNumber);
  const attemptId = randomUUID();
  const startedAt = new Date().toISOString();
  const quizSlug = `hsk1-unit-test-0${unitNumber}`;

  let dbSaved = false;
  if (learner && learner.supabase && learner.user) {
    try {
      const { error: insertErr } = await learner.supabase
        .from("curriculum_quiz_attempts")
        .insert({
          id: attemptId,
          user_id: learner.user.id,
          quiz_id: attemptId,
          quiz_slug: quizSlug,
          started_at: startedAt,
          question_count: raw.total_questions,
          submitted_at: null,
          correct_count: null,
          passed: null,
        });
      if (!insertErr) {
        dbSaved = true;
      }
    } catch {
      // Table may not yet be migrated
    }

    if (!dbSaved) {
      try {
        const meta = learner.user.user_metadata || {};
        const activeAttempts =
          (meta["active_unit_test_attempts"] as Record<string, { unitNumber: number; startedAt: string }>) || {};
        activeAttempts[attemptId] = { unitNumber, startedAt };
        await learner.supabase.auth.updateUser({
          data: {
            active_unit_test_attempts: activeAttempts,
          },
        });
      } catch {
        // Fallback metadata update
      }
    }
  }

  return {
    ok: true,
    attemptId,
    startedAt,
    durationMinutes: raw.duration_minutes,
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

  let dbAttempt: { id: string; started_at: string; submitted_at: string | null } | null = null;

  if (learner && learner.supabase && learner.user) {
    try {
      const { data } = await learner.supabase
        .from("curriculum_quiz_attempts")
        .select("id, started_at, submitted_at")
        .eq("id", attemptId)
        .eq("user_id", learner.user.id)
        .maybeSingle();
      if (data) {
        dbAttempt = data as { id: string; started_at: string; submitted_at: string | null };
      }
    } catch {
      // DB check failed
    }
  }

  let startedAtMs = 0;

  if (dbAttempt) {
    // Atomic check: attempt must NOT have been submitted already
    if (dbAttempt.submitted_at) {
      throw new Error("Lượt thi này đã được nộp và ghi nhận trước đó. Không được nộp trùng.");
    }
    startedAtMs = new Date(dbAttempt.started_at).getTime();
  } else {
    // Check fallback metadata
    const activeAttempts =
      (learner.user.user_metadata?.["active_unit_test_attempts"] as Record<
        string,
        { unitNumber: number; startedAt: string }
      >) || {};
    const recorded = activeAttempts[attemptId];
    if (!recorded) {
      throw new Error("Lượt thi không tồn tại trên hệ thống. Vui lòng bấm bắt đầu lại từ đầu.");
    }
    startedAtMs = new Date(recorded.startedAt).getTime();
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

  const now = new Date().toISOString();
  const quizSlug = `hsk1-unit-test-0${unitNumber}`;

  // Authoritative server-side submission into curriculum_quiz_attempts
  if (learner && learner.supabase && learner.user) {
    let submitted = false;

    // 1. Try atomic submit RPC
    try {
      const { error: rpcErr } = await learner.supabase.rpc("submit_curriculum_quiz_attempt", {
        p_attempt_id: attemptId,
        p_correct_count: totalScore,
        p_question_count: maxScore,
        p_passed: passed,
        p_answers: answers,
      });
      if (!rpcErr) {
        submitted = true;
      }
    } catch {
      // RPC may not yet be available
    }

    // 2. Direct update fallback if RPC not yet created
    if (!submitted) {
      try {
        const { error: updateErr } = await learner.supabase
          .from("curriculum_quiz_attempts")
          .update({
            submitted_at: now,
            correct_count: totalScore,
            question_count: maxScore,
            passed,
            answers,
          })
          .eq("id", attemptId)
          .eq("user_id", learner.user.id);
        if (!updateErr) {
          submitted = true;
        }
      } catch {
        // Direct update failed
      }
    }

    // 3. Fallback insert if row didn't exist in DB
    if (!submitted) {
      try {
        const { error: insertErr } = await learner.supabase
          .from("curriculum_quiz_attempts")
          .insert({
            id: attemptId,
            user_id: learner.user.id,
            quiz_id: attemptId,
            quiz_slug: quizSlug,
            started_at: new Date(startedAtMs).toISOString(),
            submitted_at: now,
            correct_count: totalScore,
            question_count: maxScore,
            passed,
            answers,
          });
        if (!insertErr) {
          submitted = true;
        }
      } catch {
        // Insert failed
      }
    }

    // 4. Dual-layer safe persistence to user_metadata
    try {
      const { data: userRecord } = await learner.supabase.auth.getUser();
      const meta = userRecord?.user?.user_metadata || {};
      const activeAttempts = { ...(meta["active_unit_test_attempts"] || {}) };
      delete activeAttempts[attemptId];

      const existingAttempts = (meta[`quiz_attempts_${quizSlug}`] as Array<unknown>) || [];
      const updated = [
        ...existingAttempts,
        {
          id: attemptId,
          started_at: new Date(startedAtMs).toISOString(),
          submitted_at: now,
          correct_count: totalScore,
          question_count: maxScore,
          passed,
          answers,
        },
      ];
      await learner.supabase.auth.updateUser({
        data: {
          active_unit_test_attempts: activeAttempts,
          [`quiz_attempts_${quizSlug}`]: updated,
        },
      });
    } catch {}
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
