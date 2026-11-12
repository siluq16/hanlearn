import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { getVocabulary } from "@/features/vocabulary/queries";
import { AudioPlayer } from "@/features/vocabulary/components/audio-player";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const metadata = { title: "Chi tiết từ vựng" };
export default async function VocabularyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const data = await getVocabulary(id);
  if (!data) notFound();
  const { word, members, hasAudio } = data;
  const source = word.source_uri?.startsWith("https://")
    ? word.source_uri
    : null;
  return (
    <>
      <Link
        href="/vocabulary"
        className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft size={16} />
        Thư viện từ vựng
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardContent className="p-7 sm:p-10">
            <div className="mb-8 flex flex-wrap gap-2">
              {members.map((m) => (
                <Badge key={m.syllabus_id}>
                  HSK {m.introduced_level} · {m.syllabus?.code}
                </Badge>
              ))}
            </div>
            <h1 className="hanzi break-words text-6xl leading-normal sm:text-7xl">
              {word.simplified}
            </h1>
            {word.traditional && (
              <p className="hanzi mt-3 text-xl text-muted-foreground">
                Phồn thể: {word.traditional}
              </p>
            )}
            <p className="mt-5 text-2xl text-primary">{word.pinyin_marked}</p>
            <p className="mb-7 mt-5 text-xl leading-8">{word.meaning_vi}</p>
            {word.part_of_speech && <Badge>{word.part_of_speech}</Badge>}
            <div className="mt-7">
              {hasAudio ? (
                <AudioPlayer vocabularyId={word.id} />
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Chưa có audio hợp lệ được phát hành cho từ này.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ví dụ trong ngữ cảnh</CardTitle>
            </CardHeader>
            <CardContent>
              {word.example_zh ? (
                <>
                  <p className="hanzi text-2xl leading-loose">
                    {word.example_zh}
                  </p>
                  {word.example_pinyin && (
                    <p className="mt-3 text-sm text-primary">
                      {word.example_pinyin}
                    </p>
                  )}
                  {word.example_vi && (
                    <p className="mt-4 text-sm leading-7">{word.example_vi}</p>
                  )}
                </>
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  Chưa có ví dụ được duyệt cho mục từ này.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nguồn nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6">
              <p className="text-muted-foreground">
                Giấy phép:{" "}
                <span className="text-foreground">
                  {word.content_license ?? "Chưa có thông tin"}
                </span>
              </p>
              {source ? (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
                >
                  Xem nguồn tham khảo
                </a>
              ) : (
                <p className="break-all text-muted-foreground">
                  {word.source_uri}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Thuộc syllabus không đồng nghĩa với đã thành thạo. Tiến độ từ
                vựng được tính riêng từ lịch sử học.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
