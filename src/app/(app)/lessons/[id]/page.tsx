import { notFound } from "next/navigation";
import { getLessonBundle } from "@/features/lessons/queries";
import { LessonView } from "@/features/lessons/components/lesson-view";
import { InvalidLessonContent } from "@/features/lessons/components/lesson-states";
export const dynamic = "force-dynamic";
export const metadata = { title: "Bài học" };
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getLessonBundle(id);
  if (!result) notFound();
  return result.kind === "ready" ? (
    <LessonView bundle={result.bundle} />
  ) : (
    <InvalidLessonContent />
  );
}
