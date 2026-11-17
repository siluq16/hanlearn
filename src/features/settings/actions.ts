"use server";
import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";
import { invalidateLearnerSnapshot } from "@/features/courses/queries";
import { settingsSchema } from "./schemas";
export type SettingsState = { error?: string; success?: boolean };
export async function saveSettings(
  _state: SettingsState,
  form: FormData,
): Promise<SettingsState> {
  const { user, supabase } = await requireLearner(); // recheck for every mutation, never accept browser user ID
  const parsed = settingsSchema.safeParse(
    Object.fromEntries(
      [
        "display_name",
        "baseline_hsk_level",
        "target_hsk_level",
        "preferred_syllabus_id",
      ].map((key) => [key, form.get(key)]),
    ),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;
  if (p.preferred_syllabus_id) {
    const syllabus = await supabase
      .from("syllabus_versions")
      .select("id")
      .eq("id", p.preferred_syllabus_id)
      .maybeSingle();
    if (syllabus.error || !syllabus.data)
      return { error: "Phiên bản syllabus chưa khả dụng." };
  }
  // Explicit columns: do not send created_at or fixed timezone/goal on UPDATE.
  const existing = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing.error)
    return { error: "Chưa đọc được hồ sơ. Vui lòng thử lại." };
  const changes = {
    display_name: p.display_name || null,
    baseline_hsk_level: p.baseline_hsk_level,
    target_hsk_level: p.target_hsk_level,
    preferred_syllabus_id: p.preferred_syllabus_id || null,
  };
  const result = existing.data
    ? await supabase
        .from("profiles")
        .update(changes)
        .eq("id", user.id)
        .select("id")
        .single()
    : await supabase
        .from("profiles")
        .insert({ id: user.id, ...changes })
        .select("id")
        .single();
  if (result.error)
    return {
      error: "Chưa lưu được hồ sơ. Kiểm tra quyền truy cập và thử lại.",
    };
  invalidateLearnerSnapshot(user.id);
  revalidatePath("/", "layout");
  return { success: true };
}
