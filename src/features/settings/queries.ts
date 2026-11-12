import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { DataError, dataOrThrow, readAll } from "@/lib/data";
export const getSettings = cache(async () => {
  const { user, supabase } = await requireLearner();
  const [profileResult, syllabuses] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,display_name,timezone,daily_goal_minutes,baseline_hsk_level,target_hsk_level,preferred_syllabus_id,created_at",
      )
      .eq("id", user.id)
      .maybeSingle(),
    readAll((from, to) =>
      supabase
        .from("syllabus_versions")
        .select("id,code,display_name,is_active,status")
        .order("id")
        .range(from, to),
    ),
  ]);
  if (profileResult.error) throw new DataError();
  return {
    user,
    profile: profileResult.data,
    syllabuses: dataOrThrow({ data: syllabuses, error: null }),
  };
});
export const getActiveSyllabus = cache(async () => {
  const { profile, syllabuses } = await getSettings();
  return (
    syllabuses.find((s) => s.id === profile?.preferred_syllabus_id) ??
    syllabuses.find((s) => s.is_active) ??
    syllabuses[0] ??
    null
  );
});
