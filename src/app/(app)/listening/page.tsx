import Link from "next/link";
import { Headphones, ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getListeningCurriculum } from "@/features/listening/queries";
import { ListeningPlayer } from "@/features/listening/components/listening-player";

export const metadata = {
  title: "Luyện nghe HSK 1",
};

export default async function ListeningPage({
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
        title="Luyện nghe tiếng Trung HSK 1."
        description="Rèn luyện phản xạ nghe chữ Hán, từ vựng và câu đàm thoại HSK 1 với giọng phát âm chuẩn zh-CN và chế độ nghe chậm 0.55x."
      />

      <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Headphones className="size-5 text-primary shrink-0" />
          <span className="text-xs text-foreground font-medium">
            Bạn cũng có thể luyện nghe theo <strong>10 bộ bài tập chuẩn bị sẵn</strong> (tranh ảnh, câu chuyện, tình huống đời sống).
          </span>
        </div>
        <Link
          href="/practice?skill=listening"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 shrink-0"
        >
          <span>10 Bộ bài tập Luyện nghe</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-6">
        <ListeningPlayer
          curriculum={curriculum}
          initialLessonId={lessonParam}
        />
      </div>
    </>
  );
}
