import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requireLearner } from "@/features/auth/session";
import { getLessonBundle } from "@/features/lessons/queries";
import { DataError } from "@/lib/data";
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
