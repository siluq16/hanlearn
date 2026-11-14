import { notFound, redirect } from "next/navigation";
import { findNineStageLesson } from "@/features/content-library/curriculum-data";
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

  // Seamless mapping: If lesson matches any unified 9-stage curriculum lesson (or pilot UUID), redirect to 9-stage reader
  const nineStage = findNineStageLesson(id);
  if (nineStage) {
    redirect(`/lessons/stage/${nineStage.slug}`);
  }

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
