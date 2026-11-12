import "server-only";
import { requireLearner } from "@/features/auth/session";
import { getCurriculum } from "@/features/roadmap/queries";
import { nextLesson } from "@/features/roadmap/model";
import { getSettings } from "@/features/settings/queries";
import { dataOrThrow, readAll } from "@/lib/data";
export async function getDashboard() {
  const { user, supabase } = await requireLearner();
  const [
    settings,
    curriculum,
    cards,
    vocabulary,
    membership,
    dueResult,
    sessionsResult,
  ] = await Promise.all([
    getSettings(),
    getCurriculum(),
    readAll((f, t) =>
      supabase
        .from("review_cards")
        .select("id,vocabulary_id")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("id")
        .range(f, t),
    ),
    readAll((f, t) =>
      supabase.from("vocabulary").select("id").order("id").range(f, t),
    ),
    readAll((f, t) =>
      supabase
        .from("syllabus_vocabulary")
        .select("syllabus_id,vocabulary_id,introduced_level")
        .order("syllabus_id")
        .order("vocabulary_id")
        .range(f, t),
    ),
    supabase.rpc("get_due_review_count"),
    supabase
      .from("study_sessions")
      .select("id,user_id,source,evidence,started_at,ended_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(5),
  ]);
  const published = new Set(vocabulary.map((v) => v.id));
  const introduced = new Set(
    cards
      .filter((c) => published.has(c.vocabulary_id))
      .map((c) => c.vocabulary_id),
  );
  const members = membership.filter(
    (m) =>
      m.syllabus_id === curriculum.syllabus?.id &&
      m.introduced_level <= (settings.profile?.target_hsk_level ?? 5),
  );
  const covered = members.filter((m) => introduced.has(m.vocabulary_id)).length;
  const lessonIds = new Set(curriculum.lessons.map((l) => l.id));
  const completed = curriculum.progress.filter(
    (p) => p.completed_at && lessonIds.has(p.lesson_id),
  ).length;
  return {
    ...settings,
    curriculum,
    totalWords: introduced.size,
    dueCount: dataOrThrow(dueResult),
    sessions: dataOrThrow(sessionsResult),
    next: nextLesson(
      curriculum.courses,
      curriculum.units,
      curriculum.lessons,
      curriculum.progress,
      settings.profile?.target_hsk_level ?? 5,
    ),
    completed,
    totalLessons: curriculum.lessons.length,
    coverage: members.length ? (covered / members.length) * 100 : null,
    importedWords: members.length,
  };
}
