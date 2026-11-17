import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { DataError, dataOrThrow, readAll } from "@/lib/data";
import { registerSnapshotInvalidator } from "@/features/courses/queries";

type SyllabusRow = {
  id: string;
  code: string;
  display_name: string;
  is_active: boolean;
  status: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  timezone: string;
  daily_goal_minutes: number;
  baseline_hsk_level: number;
  target_hsk_level: number;
  preferred_syllabus_id: string | null;
  created_at: string;
};

let syllabusesCache: { data: SyllabusRow[]; timestamp: number } | null = null;
const SYLLABUS_TTL_MS = process.env.VITEST ? 0 : 10 * 60 * 1000;
const PROFILE_TTL_MS = process.env.VITEST ? 0 : 30_000;
const profileCache = new Map<string, { data: ProfileRow | null; expiresAt: number }>();

registerSnapshotInvalidator((userId?: string) => {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
});

export const getSettings = cache(async () => {
  const { user, supabase } = await requireLearner();
  const now = Date.now();
  const cachedProfile = PROFILE_TTL_MS > 0 ? profileCache.get(user.id) : undefined;
  const isProfileFresh = Boolean(cachedProfile && cachedProfile.expiresAt > now);
  const isSyllabusesFresh = Boolean(
    SYLLABUS_TTL_MS > 0 &&
      syllabusesCache &&
      now - syllabusesCache.timestamp < SYLLABUS_TTL_MS
  );

  const [profileResult, syllabuses] = await Promise.all([
    isProfileFresh
      ? Promise.resolve({ data: cachedProfile!.data, error: null })
      : supabase
          .from("profiles")
          .select(
            "id,display_name,timezone,daily_goal_minutes,baseline_hsk_level,target_hsk_level,preferred_syllabus_id,created_at"
          )
          .eq("id", user.id)
          .maybeSingle(),
    isSyllabusesFresh
      ? Promise.resolve(syllabusesCache!.data)
      : readAll((from, to) =>
          supabase
            .from("syllabus_versions")
            .select("id,code,display_name,is_active,status")
            .order("id")
            .range(from, to)
        ).then((rows) => {
          if (SYLLABUS_TTL_MS > 0) {
            syllabusesCache = { data: rows as SyllabusRow[], timestamp: Date.now() };
          }
          return rows as SyllabusRow[];
        }),
  ]);

  if (profileResult.error) throw new DataError();
  if (!isProfileFresh && PROFILE_TTL_MS > 0) {
    profileCache.set(user.id, {
      data: (profileResult.data as ProfileRow | null) ?? null,
      expiresAt: Date.now() + PROFILE_TTL_MS,
    });
  }

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
