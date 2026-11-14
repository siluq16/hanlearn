"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";
import { getLessonBundle } from "./queries";
import { PROGRESS_COLUMNS } from "./columns";
import { progressRowSchema } from "./schemas";
import { studyInputSchema, type StudyResult } from "./study-contract";
import { learningEnabled } from "@/lib/learning";

export async function confirmLessonStudy(input: unknown): Promise<StudyResult> {
  // Keep redirects/control-flow outside the mutation error handler.
  const { user, supabase } = await requireLearner();
  const error = (
    code: string,
    message: string,
    retryable = false,
    outcomeUnknown = false,
  ): StudyResult => ({
    ok: false,
    error: { code, message, retryable, outcomeUnknown },
  });
  const parsed = studyInputSchema.safeParse(input);
  if (!parsed.success)
    return error("INVALID_INPUT", "Yêu cầu xác nhận bài học không hợp lệ.");
  if (!learningEnabled("study"))
    return error(
      "LOCAL_ONLY",
      "Chức năng xác nhận học chưa được mở trong môi trường này.",
    );
  const lessonId = parsed.data.lessonId;
  let attempted = false;
  try {
    // Recheck readable ancestry/content; never trust a hidden form or client visibility.
    const readable = await getLessonBundle(lessonId);
    if (!readable || readable.kind !== "ready")
      return error("UNAVAILABLE", "Bài học chưa khả dụng để xác nhận.");
    attempted = true;
    const receipt = await supabase.rpc("mark_lesson_studied", {
      p_lesson_id: lessonId,
    });
    if (receipt.error) {
      if (receipt.error.code === "PT404")
        return error("UNAVAILABLE", "Bài học chưa khả dụng để xác nhận.");
      if (["42501", "28000"].includes(receipt.error.code))
        return error("FORBIDDEN", "Bạn chưa được phép xác nhận bài học này.");
      if (receipt.error.code === "22023")
        return error("INVALID_INPUT", "Yêu cầu xác nhận bài học không hợp lệ.");
      return error(
        "RETRY",
        "Chưa xác định được kết quả. Tải lại tiến độ hoặc thử xác nhận lại cùng bài học.",
        true,
        true,
      );
    }
    if (
      !z.object({ completed: z.boolean() }).strict().safeParse(receipt.data)
        .success
    )
      return error(
        "READBACK",
        "Chưa xác định được kết quả. Tải lại tiến độ hoặc thử xác nhận lại cùng bài học.",
        true,
        true,
      );
    const readback = await supabase
      .from("lesson_progress")
      .select(PROGRESS_COLUMNS)
      .eq("lesson_id", lessonId)
      .eq("user_id", user.id)
      .maybeSingle();
    const progress = progressRowSchema.safeParse(readback.data);
    if (
      readback.error ||
      !progress.success ||
      progress.data.user_id !== user.id ||
      progress.data.lesson_id !== lessonId ||
      !progress.data.studied_at
    )
      return error(
        "READBACK",
        "Đã gửi xác nhận nhưng chưa đọc lại được tiến độ. Tải lại hoặc thử lại cùng bài học.",
        true,
        true,
      );
    // Validate identity and timestamps again; receipt.completed never manufactures UI state.
    for (const path of [`/lessons/${lessonId}`, "/roadmap", "/dashboard"])
      revalidatePath(path);
    return {
      ok: true,
      progress: {
        studiedAt: progress.data.studied_at,
        completedAt: progress.data.completed_at,
      },
    };
  } catch {
    return error(
      "RETRY",
      attempted
        ? "Chưa xác định được kết quả. Tải lại tiến độ hoặc thử xác nhận lại cùng bài học."
        : "Chưa kiểm tra được bài học. Vui lòng thử lại.",
      true,
      attempted,
    );
  }
}
