"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";
import { getQuizView } from "./queries";
import { findCurriculumQuiz } from "./curriculum-quizzes";
import {
  getConfiguredAssessmentRevision,
  getQuestionRevisionEntry,
  pinAttemptRevisionInMemory,
  resolveAttemptKeyRevision,
  translateV2AnswersToV1,
} from "./quiz-revisions";
import {
  readInput,
  startInput,
  submitInput,
  startReceipt,
  submitReceipt,
  validAnswers,
  type QuizResult,
} from "./contracts";
import { learningEnabled } from "@/lib/learning";
function failure(
  code: string,
  retryable = false,
  outcomeUnknown = false,
): QuizResult {
  const messages: Record<string, string> = {
    LOCAL_ONLY: "Làm quiz chưa được mở trong môi trường này.",
    INVALID_INPUT: "Dữ liệu trả lời không hợp lệ.",
    UNAVAILABLE: "Quiz hoặc lượt làm chưa khả dụng.",
    FORBIDDEN: "Bạn chưa được phép thực hiện thao tác này.",
    CONFLICT: "Lượt làm đã thay đổi. Hãy đọc lại kết quả đã lưu.",
    RETRY:
      "Chưa xác định được kết quả. Thử lại đúng yêu cầu cũ hoặc đọc lại kết quả.",
  };
  return {
    ok: false,
    error: {
      code,
      message: messages[code] ?? messages.RETRY,
      retryable,
      outcomeUnknown,
    },
  };
}
function rpcFailure(code: string): QuizResult {
  if (code === "PT404") return failure("UNAVAILABLE");
  if (["42501", "28000"].includes(code)) return failure("FORBIDDEN");
  if (code === "22023") return failure("INVALID_INPUT");
  if (code === "PT409") return failure("CONFLICT", false, true);
  return failure("RETRY", true, true);
}
export async function startQuiz(input: unknown): Promise<QuizResult> {
  const { user, supabase } = await requireLearner();
  const parsed = startInput.safeParse(input);
  if (!parsed.success) return failure("INVALID_INPUT");
  if (!learningEnabled("quiz")) return failure("LOCAL_ONLY");

  const curriculum = findCurriculumQuiz(parsed.data.lessonId);
  if (curriculum) {
    const attemptId = randomUUID();
    const startedAt = new Date().toISOString();
    const pinnedRevision = getConfiguredAssessmentRevision();
    pinAttemptRevisionInMemory(attemptId, pinnedRevision);

    const newAttempt = {
      id: attemptId,
      started_at: startedAt,
      submitted_at: null,
      correct_count: null,
      question_count: curriculum.questions.length,
      passed: null,
      key_revision: pinnedRevision,
    };

    // 1. Persist to authoritative curriculum_quiz_attempts table with explicit pinned key_revision
    let insertError: unknown = null;
    let dbAcceptedKeyRevision = false;
    const withRevInsert = await supabase
      .from("curriculum_quiz_attempts")
      .insert({
        id: attemptId,
        user_id: user.id,
        quiz_id: curriculum.quiz.id,
        lesson_id: curriculum.lessonId,
        started_at: startedAt,
        question_count: curriculum.questions.length,
        key_revision: pinnedRevision,
      });

    if (!withRevInsert.error) {
      dbAcceptedKeyRevision = true;
    } else {
      // Pre-Migration 0011 DB fallback: insert without key_revision column
      const legacyInsert = await supabase
        .from("curriculum_quiz_attempts")
        .insert({
          id: attemptId,
          user_id: user.id,
          quiz_id: curriculum.quiz.id,
          lesson_id: curriculum.lessonId,
          started_at: startedAt,
          question_count: curriculum.questions.length,
        });
      insertError = legacyInsert.error;
    }

    // 2. Mirror pinned revision to user_metadata if DB lacks key_revision column or table is not created yet
    if (insertError || !dbAcceptedKeyRevision) {
      const metaKey = `quiz_attempts_${curriculum.quiz.id}`;
      const prevAttempts = Array.isArray(user.user_metadata?.[metaKey])
        ? user.user_metadata[metaKey]
        : [];
      const nextAttempts = [newAttempt, ...prevAttempts].slice(0, 20);
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            [metaKey]: nextAttempts,
          },
        });
        if (insertError && error) return failure("RETRY", true, true);
      } catch {
        if (insertError) return failure("RETRY", true, true);
      }
    }

    const readback = await getQuizView(curriculum.lessonId, attemptId);
    if (!readback) return failure("RETRY", true, true);
    revalidatePath(`/lessons/${curriculum.lessonId}/quiz`);
    return { ok: true, view: readback };
  }

  let attempted = false;
  try {
    const view = await getQuizView(parsed.data.lessonId);
    if (!view) return failure("UNAVAILABLE");
    attempted = true;
    const response = await supabase.rpc("start_quiz", {
      p_quiz_id: view.quiz.id,
      p_idempotency_key: parsed.data.startKey,
    });
    if (response.error) return rpcFailure(response.error.code);
    const receipt = startReceipt.safeParse(response.data);
    if (!receipt.success || receipt.data.quizId !== view.quiz.id)
      return failure("RETRY", true, true);
    const readback = await getQuizView(view.lessonId, receipt.data.attemptId);
    if (!readback) return failure("RETRY", true, true);
    revalidatePath(`/lessons/${view.lessonId}/quiz`);
    return { ok: true, view: readback };
  } catch {
    return failure("RETRY", true, attempted);
  }
}
export async function submitQuiz(input: unknown): Promise<QuizResult> {
  const { user, supabase } = await requireLearner();
  const parsed = submitInput.safeParse(input);
  if (!parsed.success) return failure("INVALID_INPUT");
  if (!learningEnabled("quiz")) return failure("LOCAL_ONLY");

  const curriculum = findCurriculumQuiz(parsed.data.lessonId);
  if (curriculum) {
    const p = parsed.data;
    if (!validAnswers(p.answers, curriculum.questions)) {
      return failure("INVALID_INPUT");
    }

    // 1. Check authoritative curriculum_quiz_attempts row first (with key_revision probe)
    type DbCurriculumAttemptRow = {
      id: string;
      started_at: string;
      submitted_at: string | null;
      key_revision?: number;
    };
    let dbAttempt: DbCurriculumAttemptRow | null = null;
    let dbHasKeyRevisionColumn = true;

    try {
      const revProbe = await supabase
        .from("curriculum_quiz_attempts")
        .select("id, started_at, submitted_at, key_revision")
        .eq("id", p.attemptId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!revProbe.error && revProbe.data) {
        dbAttempt = revProbe.data as DbCurriculumAttemptRow;
      } else if (revProbe.error) {
        dbHasKeyRevisionColumn = false;
        const legacyProbe = await supabase
          .from("curriculum_quiz_attempts")
          .select("id, started_at, submitted_at")
          .eq("id", p.attemptId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (legacyProbe.data) {
          dbAttempt = legacyProbe.data as DbCurriculumAttemptRow;
        }
      }
    } catch {
      dbHasKeyRevisionColumn = false;
    }

    const metaKey = `quiz_attempts_${curriculum.quiz.id}`;
    const prevAttempts: Array<{
      id: string;
      started_at: string;
      submitted_at: string | null;
      correct_count: number | null;
      question_count: number | null;
      passed: boolean | null;
      answers?: Record<string, number>;
      key_revision?: number;
    }> = Array.isArray(user.user_metadata?.[metaKey]) ? [...user.user_metadata[metaKey]] : [];

    const metaAttempt = prevAttempts.find((a) => a.id === p.attemptId);
    if (!dbAttempt && !metaAttempt) return failure("UNAVAILABLE");
    if (dbAttempt?.submitted_at || metaAttempt?.submitted_at) {
      return failure("CONFLICT", false, true);
    }

    const effectiveRevision = resolveAttemptKeyRevision({
      dbHasKeyRevisionColumn,
      dbKeyRevision: dbAttempt?.key_revision,
      metaKeyRevision: metaAttempt?.key_revision,
      attemptId: p.attemptId,
    });

    let correctCount = 0;
    for (const q of curriculum.questions) {
      const revEntry = getQuestionRevisionEntry(curriculum.slug, q.id);
      const expectedIdx =
        effectiveRevision === 1 && revEntry
          ? revEntry.v1CorrectIndex
          : curriculum.answerKeys[q.id]?.correct_index;
      const given = p.answers[q.id];
      if (given !== undefined && given === expectedIdx) {
        correctCount++;
      }
    }
    const questionCount = curriculum.questions.length;
    const passed = correctCount * 100 >= questionCount * 80;
    const submittedAt = new Date().toISOString();

    // 2. Authoritative PostgreSQL RPC submission (translates v2->v1 if DB is still pre-Migration 0011)
    let rpcSucceeded = false;
    if (typeof supabase.rpc === "function") {
      try {
        const rpcPayloadAnswers =
          !dbHasKeyRevisionColumn && effectiveRevision === 2
            ? translateV2AnswersToV1(curriculum.slug, p.answers)
            : p.answers;
        const { error: rpcErr } = await supabase.rpc(
          "submit_curriculum_quiz_attempt",
          {
            p_attempt_id: p.attemptId,
            p_answers: rpcPayloadAnswers,
          }
        );
        if (!rpcErr) {
          rpcSucceeded = true;
        } else if (rpcErr.code === "PT409") {
          return failure("CONFLICT", false, true);
        } else if (rpcErr.code === "22023") {
          return failure("INVALID_INPUT");
        }
      } catch {
        // Fallback below
      }
    }

    if (!rpcSucceeded) {
      if (metaAttempt) {
        metaAttempt.submitted_at = submittedAt;
        metaAttempt.correct_count = correctCount;
        metaAttempt.question_count = questionCount;
        metaAttempt.passed = passed;
        metaAttempt.answers = p.answers;
      }
      const dbFallbackAnswers =
        !dbHasKeyRevisionColumn && effectiveRevision === 2
          ? translateV2AnswersToV1(curriculum.slug, p.answers)
          : p.answers;
      const { error: updateError } = await supabase
        .from("curriculum_quiz_attempts")
        .update({
          submitted_at: submittedAt,
          correct_count: correctCount,
          question_count: questionCount,
          passed,
          answers: dbFallbackAnswers,
        })
        .eq("id", p.attemptId)
        .eq("user_id", user.id);

      if (updateError && metaAttempt) {
        const { error } = await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            [metaKey]: prevAttempts,
          },
        });
        if (error) return failure("RETRY", true, true);
      }
    }

    const readback = await getQuizView(curriculum.lessonId, p.attemptId);
    if (!readback) return failure("RETRY", true, true);

    for (const path of [
      `/lessons/${curriculum.lessonId}/quiz`,
      `/lessons/stage/${curriculum.slug}`,
      "/roadmap",
      "/dashboard",
    ]) {
      revalidatePath(path);
    }
    return { ok: true, view: readback };
  }

  let attempted = false;
  try {
    const p = parsed.data;
    const view = await getQuizView(p.lessonId, p.attemptId);
    if (!view) return failure("UNAVAILABLE");
    if (!validAnswers(p.answers, view.questions))
      return failure("INVALID_INPUT");
    attempted = true;
    const response = await supabase.rpc("submit_quiz", {
      p_attempt_id: p.attemptId,
      p_answers: p.answers,
    });
    if (response.error) return rpcFailure(response.error.code);
    const receipt = submitReceipt.safeParse(response.data);
    if (!receipt.success || receipt.data.attemptId !== p.attemptId)
      return failure("RETRY", true, true);
    const readback = await getQuizView(p.lessonId, p.attemptId);
    if (
      !readback?.attempt?.submittedAt ||
      readback.attempt.correctCount !== receipt.data.correctCount ||
      readback.attempt.questionCount !== receipt.data.questionCount ||
      readback.attempt.passed !== receipt.data.passed
    )
      return failure("RETRY", true, true);
    for (const path of [
      `/lessons/${p.lessonId}/quiz`,
      `/lessons/${p.lessonId}`,
      "/roadmap",
      "/dashboard",
    ])
      revalidatePath(path);
    return { ok: true, view: readback };
  } catch {
    return failure("RETRY", true, attempted);
  }
}
export async function refreshQuiz(input: unknown): Promise<QuizResult> {
  await requireLearner();
  const parsed = readInput.safeParse(input);
  if (!parsed.success) return failure("INVALID_INPUT");
  try {
    const view = await getQuizView(parsed.data.lessonId, parsed.data.attemptId);
    return view ? { ok: true, view } : failure("UNAVAILABLE");
  } catch {
    return failure("RETRY", true);
  }
}
