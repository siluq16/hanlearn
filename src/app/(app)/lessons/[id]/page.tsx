import { notFound } from "next/navigation";
import { getLessonBundle } from "@/features/lessons/queries";
import { LessonView } from "@/features/lessons/components/lesson-view";
import { InvalidLessonContent } from "@/features/lessons/components/lesson-states";
import { StudyConfirmation } from "@/features/lessons/components/study-confirmation";
import { confirmLessonStudy } from "@/features/lessons/actions";
import { learningEnabled } from "@/lib/learning";
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
    <LessonView
      bundle={result.bundle}
      studyConfirmation={
        <StudyConfirmation
          key={id}
          lessonId={id}
          progress={result.bundle.progress}
          enabled={learningEnabled("study")}
          confirm={confirmLessonStudy}
        />
      }
    />
  ) : (
    <InvalidLessonContent />
  );
}
