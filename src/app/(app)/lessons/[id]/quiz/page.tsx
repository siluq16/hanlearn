import { notFound } from "next/navigation";
import { z } from "zod";
import { getQuizView } from "@/features/quizzes/queries";
import { startQuiz, submitQuiz, refreshQuiz } from "@/features/quizzes/actions";
import { learningEnabled } from "@/lib/learning";
import { QuizPlayer } from "@/features/quizzes/components/quiz-player";
export const dynamic = "force-dynamic";
export const metadata = { title: "Mini quiz" };
export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string | string[] }>;
}) {
  const { id } = await params,
    { attempt } = await searchParams;
  if (attempt !== undefined && !z.uuid().safeParse(attempt).success) notFound();
  const view = await getQuizView(id, attempt as string | undefined);
  if (!view) notFound();
  return (
    <QuizPlayer
      key={`${view.quiz.id}:${view.attempt?.id ?? "new"}`}
      initial={view}
      enabled={learningEnabled("quiz")}
      start={startQuiz}
      submit={submitQuiz}
      refresh={refreshQuiz}
    />
  );
}
