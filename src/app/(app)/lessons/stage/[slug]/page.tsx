import { notFound } from "next/navigation";
import { requireLearner } from "@/features/auth/session";
import { findNineStageLesson } from "@/features/content-library/curriculum-data";
import { NineStageReader } from "@/features/lessons/components/nine-stage-reader";
import { LessonNavHeader } from "@/features/lessons/components/lesson-nav-header";
import { getStageProgress } from "@/features/lessons/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = findNineStageLesson(slug);
  return {
    title: lesson ? `${lesson.title} · 10 Chặng Học tập` : "Bài học HSK 1",
  };
}

export default async function NineStageLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { user } = await requireLearner();
  const { slug } = await params;
  const lesson = findNineStageLesson(slug);

  if (!lesson) {
    notFound();
  }

  const initialProgress = await getStageProgress(lesson.slug || lesson.id);

  return (
    <div className="space-y-6">
      {/* Redesigned Breadcrumb & Lesson Switcher (replaces 32 horizontal buttons) */}
      <LessonNavHeader
        currentSlug={slug}
        lessonTitle={lesson.title}
        unitId={lesson.unit_id}
        completedStagesCount={initialProgress?.completedStages?.length ?? 0}
        totalStages={lesson.stages.length}
      />

      <NineStageReader
        lesson={lesson}
        initialProgress={initialProgress}
        userId={user.id}
      />
    </div>
  );
}
