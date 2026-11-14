import "server-only";
import { requireLearner } from "@/features/auth/session";
import { getCurriculum } from "@/features/roadmap/queries";
import { nextLesson } from "@/features/roadmap/model";
import { getSettings } from "@/features/settings/queries";
import { dataOrThrow, readAll } from "@/lib/data";
import { LESSON_05_QUIZ, LESSON_06_QUIZ } from "@/features/quizzes/curriculum-quizzes";
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
    quizzesResult,
    quizAttemptsResult,
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
    readAll((f, t) =>
      supabase
        .from("lesson_quizzes")
        .select("id,lesson_id,title")
        .eq("status", "published")
        .order("id")
        .range(f, t),
    ),
    supabase
      .from("quiz_attempts")
      .select(
        "id,quiz_id,started_at,submitted_at,correct_count,question_count,passed",
      )
      .eq("user_id", user.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
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
  const quizzes = quizzesResult;
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));
  const lessonMap = new Map(curriculum.lessons.map((l) => [l.id, l]));

  const quizAttempts = dataOrThrow(quizAttemptsResult);
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
  for (const qDef of [LESSON_05_QUIZ, LESSON_06_QUIZ]) {
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
    },
  );

  return {
    ...settings,
    curriculum,
    totalWords: introduced.size,
    dueCount: dataOrThrow(dueResult),
    sessions: dataOrThrow(sessionsResult),
    quizHistory: combinedQuizHistory,
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
