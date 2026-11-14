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

const stageProgressInputSchema = z.object({
  lessonId: z.string().min(1).max(100),
  completedStages: z.array(z.number().int().min(0).max(9)).max(10),
  currentStage: z.number().int().min(0).max(9),
});

export type StageProgressData = {
  lessonId: string;
  userId: string;
  completedStages: number[];
  currentStage: number;
  updatedAt: string;
};

export async function saveStageProgress(input: unknown): Promise<{
  ok: boolean;
  progress?: StageProgressData;
  error?: string;
}> {
  try {
    const { user, supabase } = await requireLearner();
    const parsed = stageProgressInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "INVALID_INPUT" };
    }

    const { lessonId, completedStages, currentStage } = parsed.data;
    const updatedAt = new Date().toISOString();

    // 1. Read existing row from learner_stage_progress table
    const { data: existingRow } = await supabase
      .from("learner_stage_progress")
      .select("current_stage, completed_stages, updated_at")
      .eq("lesson_id", lessonId)
      .maybeSingle();

    // 2. Migration support: Check legacy user_metadata if no existing table row yet
    const key = `stage_prog_${lessonId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const legacyMeta = user.user_metadata?.[key];
    const legacyCompleted = Array.isArray(legacyMeta?.completed_stages)
      ? legacyMeta.completed_stages
      : [];
    const legacyStage =
      typeof legacyMeta?.current_stage === "number" ? legacyMeta.current_stage : 0;

    // 3. Safe Union & Conflict Resolution:
    // Merge stages from current request, existing table row, and legacy metadata.
    // Set union guarantees stages are never lost even with near-simultaneous multi-device updates.
    const mergedStagesSet = new Set<number>([
      ...completedStages,
      ...(existingRow?.completed_stages || []),
      ...legacyCompleted,
    ]);
    const mergedStages = Array.from(mergedStagesSet).sort((a, b) => a - b);

    // Resolve current_stage: If existing row has newer timestamp, avoid overwriting with stale current_stage
    let resolvedCurrentStage = currentStage;
    if (existingRow && existingRow.updated_at && existingRow.updated_at > updatedAt) {
      resolvedCurrentStage = existingRow.current_stage;
    } else if (!existingRow && legacyStage > currentStage) {
      resolvedCurrentStage = legacyStage;
    }

    // 4. Upsert into learner_stage_progress table with auth.uid() bound
    const { data: upserted, error: upsertError } = await supabase
      .from("learner_stage_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          current_stage: resolvedCurrentStage,
          completed_stages: mergedStages,
          updated_at: updatedAt,
        },
        { onConflict: "user_id,lesson_id" },
      )
      .select("lesson_id, current_stage, completed_stages, updated_at")
      .single();

    if (upsertError) {
      // If table is not present yet, fall back gracefully to user_metadata without failing user flow
      if (upsertError.code === "PGRST205" || upsertError.code === "42P01") {
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            [key]: {
              completed_stages: mergedStages,
              current_stage: resolvedCurrentStage,
              updated_at: updatedAt,
            },
          },
        });
        return {
          ok: true,
          progress: {
            lessonId,
            userId: user.id,
            completedStages: mergedStages,
            currentStage: resolvedCurrentStage,
            updatedAt,
          },
        };
      }
      return { ok: false, error: upsertError.message };
    }

    return {
      ok: true,
      progress: {
        lessonId: upserted.lesson_id,
        userId: user.id,
        completedStages: upserted.completed_stages,
        currentStage: upserted.current_stage,
        updatedAt: upserted.updated_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return { ok: false, error: message };
  }
}

export async function getStageProgress(lessonId: string): Promise<StageProgressData | null> {
  try {
    const { user, supabase } = await requireLearner();

    // 1. Try reading from authoritative learner_stage_progress table
    const { data: row, error } = await supabase
      .from("learner_stage_progress")
      .select("lesson_id, current_stage, completed_stages, updated_at")
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (!error && row) {
      return {
        lessonId: row.lesson_id,
        userId: user.id,
        completedStages: row.completed_stages,
        currentStage: row.current_stage,
        updatedAt: row.updated_at,
      };
    }

    // 2. Migration fallback: If table is empty or pending, read from legacy user_metadata
    const key = `stage_prog_${lessonId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const stored = user.user_metadata?.[key];
    if (stored && Array.isArray(stored.completed_stages)) {
      return {
        lessonId,
        userId: user.id,
        completedStages: stored.completed_stages,
        currentStage: typeof stored.current_stage === "number" ? stored.current_stage : 0,
        updatedAt: stored.updated_at || new Date().toISOString(),
      };
    }

    return null;
  } catch {
    return null;
  }
}
