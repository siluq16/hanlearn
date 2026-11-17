import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { getCurriculum } from "@/features/roadmap/queries";
import { nextLesson } from "@/features/roadmap/model";
import { getSettings } from "@/features/settings/queries";
import { registerSnapshotInvalidator } from "@/features/courses/queries";
import { dataOrThrow, readAll } from "@/lib/data";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";

type StaticDashboardMetadata = {
  vocabulary: Array<{ id: string }>;
  membership: Array<{
    syllabus_id: string;
    vocabulary_id: string;
    introduced_level: number;
  }>;
  quizzes: Array<{ id: string; lesson_id: string; title: string }>;
  timestamp: number;
};

let staticMetadataCache: StaticDashboardMetadata | null = null;
const METADATA_TTL = 10 * 60 * 1000; // 10 minutes
const DASHBOARD_TTL_MS = process.env.VITEST ? 0 : 30_000;
const dashboardCache = new Map<string, { data: unknown; expiresAt: number }>();
let dashboardRpcFallbackUntil = 0;

registerSnapshotInvalidator((userId?: string) => {
  if (userId) {
    dashboardCache.delete(userId);
  } else {
    dashboardCache.clear();
  }
});

async function getStaticMetadata(supabase: Awaited<ReturnType<typeof requireLearner>>["supabase"]): Promise<StaticDashboardMetadata> {
  const now = Date.now();
  if (staticMetadataCache && now - staticMetadataCache.timestamp < METADATA_TTL) {
    return staticMetadataCache;
  }
  const [vocabulary, membership, quizzes] = await Promise.all([
    readAll((f, t) =>
      supabase.from("vocabulary").select("id").order("id").range(f, t)
    ),
    readAll((f, t) =>
      supabase
        .from("syllabus_vocabulary")
        .select("syllabus_id,vocabulary_id,introduced_level")
        .order("syllabus_id")
        .order("vocabulary_id")
        .range(f, t)
    ),
    readAll((f, t) =>
      supabase
        .from("lesson_quizzes")
        .select("id,lesson_id,title")
        .eq("status", "published")
        .order("id")
        .range(f, t)
    ),
  ]);
  const fresh = { vocabulary, membership, quizzes, timestamp: Date.now() };
  staticMetadataCache = fresh;
  return fresh;
}

export const getDashboard = cache(async () => {
  const { user, supabase } = await requireLearner();
  const now = Date.now();

  if (DASHBOARD_TTL_MS > 0) {
    const cached = dashboardCache.get(user.id);
    if (cached && cached.expiresAt > now) {
      return cached.data as Awaited<ReturnType<typeof computeDashboard>>;
    }
  }

  const result = await computeDashboard(user, supabase);
  if (DASHBOARD_TTL_MS > 0) {
    dashboardCache.set(user.id, {
      data: result,
      expiresAt: Date.now() + DASHBOARD_TTL_MS,
    });
  }
  return result;
});

async function computeDashboard(
  user: Awaited<ReturnType<typeof requireLearner>>["user"],
  supabase: Awaited<ReturnType<typeof requireLearner>>["supabase"]
) {
  let rpcSnapshot: {
    cards: Array<{ id: string; vocabulary_id: string }>;
    dueCount: number;
    sessions: Array<{
      id: string;
      user_id: string;
      source: string;
      evidence: string | null;
      started_at: string;
      ended_at: string | null;
    }>;
    quizAttempts: Array<{
      id: string;
      quiz_id: string;
      started_at: string;
      submitted_at: string | null;
      correct_count: number;
      question_count: number;
      passed: boolean;
    }>;
  } | null = null;

  if (typeof supabase.rpc === "function" && Date.now() >= dashboardRpcFallbackUntil) {
    try {
      const rpcRes = await supabase.rpc("get_learner_dashboard_snapshot");
      if (
        rpcRes &&
        !rpcRes.error &&
        rpcRes.data &&
        typeof rpcRes.data === "object" &&
        !Array.isArray(rpcRes.data)
      ) {
        const d = rpcRes.data as Record<string, unknown>;
        rpcSnapshot = {
          cards: Array.isArray(d.review_cards)
            ? (d.review_cards as Array<{ id: string; vocabulary_id: string }>)
            : [],
          dueCount: typeof d.due_count === "number" ? d.due_count : 0,
          sessions: Array.isArray(d.study_sessions)
            ? (d.study_sessions as NonNullable<typeof rpcSnapshot>["sessions"])
            : [],
          quizAttempts: Array.isArray(d.quiz_attempts)
            ? (d.quiz_attempts as NonNullable<typeof rpcSnapshot>["quizAttempts"])
            : [],
        };
      } else if (rpcRes?.error && !process.env.VITEST) {
        dashboardRpcFallbackUntil = Date.now() + 60_000;
      }
    } catch {
      if (!process.env.VITEST) {
        dashboardRpcFallbackUntil = Date.now() + 60_000;
      }
    }
  }

  const [
    settings,
    curriculum,
    staticMeta,
    cards,
    dueCount,
    sessions,
    quizAttempts,
  ] = rpcSnapshot
    ? await Promise.all([
        getSettings(),
        getCurriculum(),
        getStaticMetadata(supabase),
        Promise.resolve(rpcSnapshot.cards),
        Promise.resolve(rpcSnapshot.dueCount),
        Promise.resolve(rpcSnapshot.sessions),
        Promise.resolve(rpcSnapshot.quizAttempts),
      ])
    : await Promise.all([
        getSettings(),
        getCurriculum(),
        getStaticMetadata(supabase),
        readAll((f, t) =>
          supabase
            .from("review_cards")
            .select("id,vocabulary_id")
            .eq("user_id", user.id)
            .is("archived_at", null)
            .order("id")
            .range(f, t)
        ),
        supabase.rpc("get_due_review_count").then((r) => dataOrThrow(r)),
        supabase
          .from("study_sessions")
          .select("id,user_id,source,evidence,started_at,ended_at")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(5)
          .then((r) => dataOrThrow(r)),
        supabase
          .from("quiz_attempts")
          .select(
            "id,quiz_id,started_at,submitted_at,correct_count,question_count,passed"
          )
          .eq("user_id", user.id)
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: false })
          .limit(5)
          .then((r) => dataOrThrow(r)),
      ]);

  const vocabulary = staticMeta.vocabulary;
  const membership = staticMeta.membership;
  const quizzesResult = staticMeta.quizzes;

  const published = new Set(vocabulary.map((v) => v.id));
  const introduced = new Set(
    cards
      .filter((c) => published.has(c.vocabulary_id))
      .map((c) => c.vocabulary_id)
  );
  const members = membership.filter(
    (m) =>
      m.syllabus_id === curriculum.syllabus?.id &&
      m.introduced_level <= (settings.profile?.target_hsk_level ?? 5)
  );
  const covered = members.filter((m) => introduced.has(m.vocabulary_id)).length;
  const lessonIds = new Set(curriculum.lessons.map((l) => l.id));
  const completed = curriculum.progress.filter(
    (p) => p.completed_at && lessonIds.has(p.lesson_id)
  ).length;
  const quizzes = quizzesResult;
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));
  const lessonMap = new Map(curriculum.lessons.map((l) => [l.id, l]));

  const quizHistory = quizAttempts.map((a) => {
    const quiz = quizMap.get(a.quiz_id);
    const lesson = quiz ? lessonMap.get(quiz.lesson_id) : undefined;
    return {
      id: a.id,
      quizId: a.quiz_id,
      lessonId: quiz?.lesson_id,
      lessonTitle: lesson ? lesson.title : (quiz?.title ?? "Mini Quiz"),
      correctCount: a.correct_count,
      questionCount: a.question_count,
      passed: a.passed,
      submittedAt: a.submitted_at,
    };
  });

  const curriculumAttempts: typeof quizHistory = [];
  for (const qDef of ALL_CURRICULUM_QUIZZES) {
    const metaKey = `quiz_attempts_${qDef.quiz.id}`;
    const rawList = Array.isArray(user.user_metadata?.[metaKey])
      ? user.user_metadata[metaKey]
      : [];
    for (const a of rawList) {
      if (a.submitted_at) {
        curriculumAttempts.push({
          id: a.id,
          quizId: qDef.quiz.id,
          lessonId: qDef.lessonId,
          lessonTitle: qDef.lessonTitle,
          correctCount: a.correct_count ?? 0,
          questionCount: a.question_count ?? 8,
          passed: a.passed ?? false,
          submittedAt: a.submitted_at,
        });
      }
    }
  }

  const combinedQuizHistory = [...quizHistory, ...curriculumAttempts].sort(
    (a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    }
  );

  return {
    ...settings,
    curriculum,
    totalWords: introduced.size,
    dueCount,
    sessions,
    quizHistory: combinedQuizHistory,
    next: nextLesson(
      curriculum.courses,
      curriculum.units,
      curriculum.lessons,
      curriculum.progress,
      settings.profile?.target_hsk_level ?? 5
    ),
    completed,
    totalLessons: curriculum.lessons.length,
    coverage: members.length ? (covered / members.length) * 100 : null,
    importedWords: members.length,
  };
}
