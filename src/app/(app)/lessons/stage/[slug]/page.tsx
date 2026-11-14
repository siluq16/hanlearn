import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireLearner } from "@/features/auth/session";
import { findNineStageLesson, HSK1_NINE_STAGE_LESSONS } from "@/features/content-library/curriculum-data";
import { NineStageReader } from "@/features/lessons/components/nine-stage-reader";
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
    title: lesson ? `${lesson.title} · 9 Giai đoạn` : "Bài học 9 Giai đoạn",
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Về Lộ trình học
        </Link>

        {/* Switcher between 9-stage lessons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Bài học:</span>
          {HSK1_NINE_STAGE_LESSONS.filter((l) => l.slug.startsWith("hsk1-lesson-")).map((l) => (
            <Link
              key={l.slug}
              href={`/lessons/stage/${l.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                l.slug === slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {l.title.split(":")[0]}
            </Link>
          ))}
        </div>
      </div>

      <NineStageReader
        lesson={lesson}
        initialProgress={initialProgress}
        userId={user.id}
      />
    </div>
  );
}
