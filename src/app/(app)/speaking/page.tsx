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

      <div className="mt-6">
        <SpeakingPlayer
          curriculum={curriculum}
          initialLessonId={lessonParam}
        />
      </div>
    </>
  );
}
