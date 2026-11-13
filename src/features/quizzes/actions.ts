"use server";
import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";
import { getQuizView } from "./queries";
import {
  readInput,
  startInput,
  submitInput,
  startReceipt,
  submitReceipt,
  validAnswers,
  localQuizTarget,
  type QuizResult,
} from "./contracts";
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
  const { supabase } = await requireLearner();
  const parsed = startInput.safeParse(input);
  if (!parsed.success) return failure("INVALID_INPUT");
  if (
    !localQuizTarget(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.HANLEARN_LOCAL_MINI_QUIZ,
    )
  )
    return failure("LOCAL_ONLY");
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
  const { supabase } = await requireLearner();
  const parsed = submitInput.safeParse(input);
  if (!parsed.success) return failure("INVALID_INPUT");
  if (
    !localQuizTarget(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.HANLEARN_LOCAL_MINI_QUIZ,
    )
  )
    return failure("LOCAL_ONLY");
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
