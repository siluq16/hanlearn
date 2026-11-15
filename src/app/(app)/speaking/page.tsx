import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getListeningCurriculum } from "@/features/listening/queries";
import { SpeakingPlayer } from "@/features/speaking/components/speaking-player";

export const metadata = {
  title: "Luyện nói HSK 1",
};

export default async function SpeakingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lessonParam = typeof params.lesson === "string" ? params.lesson : undefined;
  const curriculum = await getListeningCurriculum();

  return (
    <>
      <PageHeading
        eyebrow="Luyện kỹ năng"
        title="Luyện nói tiếng Trung HSK 1."
        description="Thực hành phát âm từ vựng và câu đàm thoại tiếng Trung HSK 1 với công nghệ nhận dạng giọng nói zh-CN trực tiếp trên trình duyệt."
      />

      <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Mic className="size-5 text-primary shrink-0" />
          <span className="text-xs text-foreground font-medium">
            Khám phá <strong>8 bộ Luyện nói</strong> và <strong>8 bộ Hội thoại đóng vai</strong> chuẩn bị sẵn tại Trung tâm Luyện tập.
          </span>
        </div>
        <Link
          href="/practice?skill=speaking"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 shrink-0"
        >
          <span>Luyện nói &amp; Hội thoại</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-6">
        <SpeakingPlayer
          curriculum={curriculum}
          initialLessonId={lessonParam}
        />
      </div>
    </>
  );
}
