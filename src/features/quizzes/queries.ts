import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requireLearner } from "@/features/auth/session";
import { getLessonBundle } from "@/features/lessons/queries";
import { DataError } from "@/lib/data";
import { findCurriculumQuiz } from "./curriculum-quizzes";
import { getQuestionRevisionEntry } from "./quiz-revisions";
import {
  responseRow,
  readInput,
  type QuizView,
  type Attempt,
} from "./contracts";
import { quizRow, questionRow, attemptRow } from "./server-schemas";
const provenance =
  "status,review_status,source_uri,content_license,reviewed_by,reviewed_at";
export const QUIZ_COLUMNS = `id,lesson_id,revision,title,published_at,${provenance}`;
export const QUESTION_COLUMNS = `id,quiz_id,sort_order,prompt,choices,${provenance}`;
export const ATTEMPT_COLUMNS =
  "id,user_id,quiz_id,started_at,submitted_at,correct_count,question_count,passed";
export const RESPONSE_COLUMNS = "question_id,answer_index,is_correct";
const project = (a: z.infer<typeof attemptRow>): Attempt => ({
  id: a.id,
  startedAt: a.started_at,
  submittedAt: a.submitted_at,
  correctCount: a.correct_count,
  questionCount: a.question_count,
  passed: a.passed,
});
export async function getQuizView(
  lessonId: string,
  attemptId?: string,
): Promise<QuizView | null> {
  const { user, supabase } = await requireLearner();
  if (!readInput.safeParse({ lessonId, attemptId }).success) return null;

  // Handle curriculum quizzes (Lesson 5, 6, etc.)
  const curriculum = findCurriculumQuiz(lessonId);
  if (curriculum) {
    // 1. Try reading from curriculum_quiz_attempts table first (with key_revision if migrated)
    let dbRows: unknown[] | null = null;
    const withRev = await supabase
      .from("curriculum_quiz_attempts")
      .select(
        "id, started_at, submitted_at, correct_count, question_count, passed, answers, key_revision"
      )
      .eq("quiz_id", curriculum.quiz.id)
      .order("started_at", { ascending: false });

    if (!withRev.error && withRev.data) {
      dbRows = withRev.data;
    } else {
      const legacyRes = await supabase
        .from("curriculum_quiz_attempts")
        .select("id, started_at, submitted_at, correct_count, question_count, passed, answers")
        .eq("quiz_id", curriculum.quiz.id)
        .order("started_at", { ascending: false });
      dbRows = legacyRes.data;
    }

    const metaKey = `quiz_attempts_${curriculum.quiz.id}`;
    const metaAttempts: Array<{
      id: string;
      started_at: string;
      submitted_at: string | null;
      correct_count: number | null;
      question_count: number | null;
      passed: boolean | null;
      answers?: Record<string, number>;
      key_revision?: number;
    }> = Array.isArray(user.user_metadata?.[metaKey]) ? user.user_metadata[metaKey] : [];

    // Use DB rows if present; otherwise fallback to user_metadata
    type RawCurriculumAttempt = {
      id: string;
      started_at: string;
      submitted_at: string | null;
      correct_count: number | null;
      question_count: number | null;
      passed: boolean | null;
      answers?: Record<string, number>;
      key_revision?: number;
    };
    const rawAttempts: RawCurriculumAttempt[] =
      dbRows && dbRows.length > 0
        ? (dbRows as unknown as RawCurriculumAttempt[])
        : metaAttempts;

    const history: Attempt[] = rawAttempts.map((a) => ({
      id: a.id,
      startedAt: a.started_at,
      submittedAt: a.submitted_at,
      correctCount: a.correct_count,
      questionCount: a.question_count,
      passed: a.passed,
    }));

    const attemptRaw = attemptId ? rawAttempts.find((a) => a.id === attemptId) : null;
    const attempt: Attempt | null = attemptRaw ? {
      id: attemptRaw.id,
      startedAt: attemptRaw.started_at,
      submittedAt: attemptRaw.submitted_at,
      correctCount: attemptRaw.correct_count,
      questionCount: attemptRaw.question_count,
      passed: attemptRaw.passed,
    } : null;

    const effectiveRevision = attemptRaw?.key_revision === 1 ? 1 : 2;

    let responses: Array<{ question_id: string; answer_index: number | null; is_correct: boolean }> = [];
    if (attemptRaw?.submitted_at && attemptRaw.answers) {
      responses = curriculum.questions.map((q) => {
        const ans = attemptRaw.answers ? attemptRaw.answers[q.id] : null;
        const revEntry = getQuestionRevisionEntry(curriculum.slug, q.id);
        const expectedIdx =
          effectiveRevision === 1 && revEntry
            ? revEntry.v1CorrectIndex
            : curriculum.answerKeys[q.id]?.correct_index;
        const isCorrect = ans !== undefined && ans !== null && ans === expectedIdx;
        return {
          question_id: q.id,
          answer_index: ans ?? null,
          is_correct: isCorrect,
        };
      });
    }

    return {
      lessonId: curriculum.lessonId,
      lessonTitle: curriculum.lessonTitle,
      quiz: curriculum.quiz,
      questions: curriculum.questions.map((q) => {
        const revEntry = getQuestionRevisionEntry(curriculum.slug, q.id);
        return {
          id: q.id,
          prompt: q.prompt,
          choices:
            effectiveRevision === 1 && revEntry ? revEntry.v1Choices : q.choices,
        };
      }),
      attempt,
      history,
      responses,
      progress: {
        studiedAt: new Date().toISOString(),
        completedAt: history.some((h) => h.passed === true) ? new Date().toISOString() : null,
      },
      recoveryScope: createHash("sha256")
        .update(`${user.id}:${curriculum.quiz.id}:${effectiveRevision}`)
        .digest("hex"),
    };
  }

  const lesson = await getLessonBundle(lessonId);
  if (!lesson || lesson.kind !== "ready") return null;
  const result = await supabase
    .from("lesson_quizzes")
    .select(QUIZ_COLUMNS)
    .eq("lesson_id", lessonId)
    .eq("status", "published")
    .eq("review_status", "approved")
    .maybeSingle();
  if (result.error) throw new DataError();
  if (!result.data) return null;
  const quiz = quizRow.safeParse(result.data);
  if (!quiz.success || quiz.data.lesson_id !== lessonId) throw new DataError();
  const [qs, hs, as] = await Promise.all([
    supabase
      .from("quiz_questions")
      .select(QUESTION_COLUMNS)
      .eq("quiz_id", quiz.data.id)
      .eq("status", "published")
      .eq("review_status", "approved")
      .order("sort_order")
      .order("id")
      .limit(11),
    supabase
      .from("quiz_attempts")
      .select(ATTEMPT_COLUMNS)
      .eq("user_id", user.id)
      .eq("quiz_id", quiz.data.id)
      .order("started_at", { ascending: false })
      .order("id")
      .limit(20),
    attemptId
      ? supabase
          .from("quiz_attempts")
          .select(ATTEMPT_COLUMNS)
          .eq("id", attemptId)
          .eq("user_id", user.id)
          .eq("quiz_id", quiz.data.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (qs.error || hs.error || as.error) throw new DataError();
  const questions = z.array(questionRow).min(5).max(10).parse(qs.data);
  const history = z.array(attemptRow).max(20).parse(hs.data);
  const attempt = as.data ? attemptRow.parse(as.data) : null;
  if (attemptId && !attempt) return null;
  if (
    new Set(questions.map((q) => q.id)).size !== questions.length ||
    new Set(questions.map((q) => q.sort_order)).size !== questions.length ||
    questions.some((q) => q.quiz_id !== quiz.data.id) ||
    [...history, ...(attempt ? [attempt] : [])].some(
      (a) =>
        a.user_id !== user.id ||
        a.quiz_id !== quiz.data.id ||
        (a.submitted_at && a.question_count !== questions.length),
    )
  )
    throw new DataError();
  let responses: z.infer<typeof responseRow>[] = [];
  if (attempt?.submitted_at) {
    const rows = await supabase
      .from("quiz_responses")
      .select(RESPONSE_COLUMNS)
      .eq("attempt_id", attempt.id)
      .eq("user_id", user.id)
      .order("question_id")
      .limit(11);
    if (rows.error) throw new DataError();
    responses = z.array(responseRow).parse(rows.data);
    if (
      responses.length !== questions.length ||
      responses.filter((r) => r.is_correct).length !== attempt.correct_count ||
      responses.some((r) => r.answer_index === null && r.is_correct) ||
      new Set(responses.map((r) => r.question_id)).size !== responses.length ||
      responses.some(
        (r) =>
          !questions.some(
            (q) =>
              q.id === r.question_id &&
              (r.answer_index === null || r.answer_index < q.choices.length),
          ),
      )
    )
      throw new DataError();
  }
  return {
    lessonId,
    lessonTitle: lesson.bundle.lesson.title,
    quiz: {
      id: quiz.data.id,
      title: quiz.data.title,
      revision: quiz.data.revision,
    },
    questions: questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices,
    })),
    history: history.map(project),
    attempt: attempt ? project(attempt) : null,
    responses,
    progress: lesson.bundle.progress,
    recoveryScope: createHash("sha256")
      .update(`${user.id}:${quiz.data.id}:${quiz.data.revision}`)
      .digest("hex"),
  };
}
