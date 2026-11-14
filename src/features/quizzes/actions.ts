"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";
import { getQuizView } from "./queries";
import { findCurriculumQuiz } from "./curriculum-quizzes";
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
    const newAttempt = {
      id: attemptId,
      started_at: new Date().toISOString(),
      submitted_at: null,
      correct_count: null,
      question_count: curriculum.questions.length,
      passed: null,
    };
    const metaKey = `quiz_attempts_${curriculum.quiz.id}`;
    const prevAttempts = Array.isArray(user.user_metadata?.[metaKey])
      ? user.user_metadata[metaKey]
      : [];
    const nextAttempts = [newAttempt, ...prevAttempts].slice(0, 20);
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        [metaKey]: nextAttempts,
      },
    });
    if (error) return failure("RETRY", true, true);
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
    const metaKey = `quiz_attempts_${curriculum.quiz.id}`;
    const prevAttempts: Array<{
      id: string;
      started_at: string;
      submitted_at: string | null;
      correct_count: number | null;
      question_count: number | null;
      passed: boolean | null;
      answers?: Record<string, number>;
    }> = Array.isArray(user.user_metadata?.[metaKey]) ? [...user.user_metadata[metaKey]] : [];

    const targetAttempt = prevAttempts.find((a) => a.id === p.attemptId);
    if (!targetAttempt) return failure("UNAVAILABLE");
    if (targetAttempt.submitted_at) return failure("CONFLICT", false, true);

    let correctCount = 0;
    for (const q of curriculum.questions) {
      const key = curriculum.answerKeys[q.id];
      const given = p.answers[q.id];
      if (given !== undefined && given === key?.correct_index) {
        correctCount++;
      }
    }
    const questionCount = curriculum.questions.length;
    // Unified 80% Mastery Threshold (consistent with PostgreSQL submit_quiz rubric in 202611120003_quiz.sql)
    const passed = correctCount * 100 >= questionCount * 80;
    const submittedAt = new Date().toISOString();

    targetAttempt.submitted_at = submittedAt;
    targetAttempt.correct_count = correctCount;
    targetAttempt.question_count = questionCount;
    targetAttempt.passed = passed;
    targetAttempt.answers = p.answers;

    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        [metaKey]: prevAttempts,
      },
    });
    if (error) return failure("RETRY", true, true);

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
