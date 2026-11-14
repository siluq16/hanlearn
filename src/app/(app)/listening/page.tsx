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

      <div className="mt-6">
        <ListeningPlayer
          curriculum={curriculum}
          initialLessonId={lessonParam}
        />
      </div>
    </>
  );
}
