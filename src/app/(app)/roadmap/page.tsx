import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronDown, Clock3, Sparkles } from "lucide-react";
import { getCurriculum } from "@/features/roadmap/queries";
import { buildRoadmap } from "@/features/roadmap/model";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
export const metadata = { title: "Lộ trình học" };
export default async function Roadmap() {
  const c = await getCurriculum();
  const levels = buildRoadmap(c.courses, c.units, c.lessons, c.progress);
  return (
    <>
      <PageHeading
        eyebrow="Hành trình dài hạn"
        title="Mỗi cấp độ, một nền tảng."
        description="Đi từng bước từ HSK 1 đến HSK 5. Tiến độ phản ánh bài đã hoàn thành, không phải số ngày đã trôi qua."
      />
      {c.syllabus && (
        <p className="mb-6 text-sm text-muted-foreground">
          Syllabus:{" "}
          <span className="font-medium text-foreground">
            {c.syllabus.display_name}
          </span>{" "}
          · {c.syllabus.code}
        </p>
      )}

      {/* 9-Stage Interactive Lessons Banner */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-primary/30 bg-primary/5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Lộ trình Tương tác 9 Giai đoạn (HSK 1 Chuẩn 2025)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Trải nghiệm mô hình học 9 bước toàn diện: Khởi động ngữ âm → Từ vựng → Bài tập nối từ → Ngữ pháp → Hội thoại đóng vai → Luyện nghe ẩn transcript → Luyện nhại âm shadowing (kèm chế độ thủ công) → Đọc hiểu Đúng/Sai → Mini Quiz → Thẻ ôn tập SRS.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/lessons/stage/hsk1-lesson-01"
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-xs"
          >
            Bài 1: Chào hỏi &amp; Tự giới thiệu
          </Link>
          <Link
            href="/lessons/stage/hsk1-lesson-05"
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted shadow-xs"
          >
            Bài 5: Gia đình &amp; Nghề nghiệp
          </Link>
          <Link
            href="/lessons/stage/hsk1-lesson-06"
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted shadow-xs"
          >
            Bài 6: Bây giờ là mấy giờ?
          </Link>
        </div>
      </div>
      <div className="space-y-5">
        {levels.map((l) => (
          <Card key={l.level}>
            <CardContent className="p-5 sm:p-7">
              <div className="flex items-start gap-4 sm:gap-6">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-semibold ${l.total ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {l.level}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">HSK {l.level}</h2>
                    <Badge>
                      {l.total === 0
                        ? "Chưa có nội dung"
                        : l.completed === l.total
                          ? "Đã hoàn thành"
                          : l.completed || l.studied
                            ? "Đang học"
                            : "Sẵn sàng khám phá"}
                    </Badge>
                  </div>
                  {l.total > 0 ? (
                    <>
                      <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        {l.completed}/{l.total} bài hoàn thành ·{" "}
                        {l.units.length} unit
                      </p>
                      <Progress
                        value={l.percent!}
                        label={`Tiến độ HSK ${l.level}`}
                      />
                    </>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Nội dung sẽ mở khi được biên soạn, kiểm duyệt và cấp quyền
                      sử dụng.
                    </p>
                  )}
                </div>
              </div>
              {l.units.map((u) => (
                <section
                  key={u.id}
                  className="mt-7 border-t border-border pt-6"
                >
                  <h3 className="mb-4 text-sm font-semibold">{u.title}</h3>
                  <div className="space-y-3">
                    {u.lessons.map((lesson, i) => (
                      <details
                        key={lesson.id}
                        id={`lesson-${lesson.id}`}
                        className="scroll-mt-8 rounded-xl bg-muted/60"
                      >
                        <summary className="flex min-h-16 list-none items-center gap-3 p-4">
                          <span className="text-xs text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {lesson.completed ? (
                            <CheckCircle2
                              size={18}
                              className="shrink-0 text-success"
                            />
                          ) : (
                            <BookOpen
                              size={18}
                              className="shrink-0 text-primary"
                            />
                          )}
                          <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                            {lesson.title}
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              {lesson.completed
                                ? "Đã hoàn thành"
                                : lesson.studied
                                  ? "Đã xác nhận học · Chờ quiz đạt"
                                  : "Chưa xác nhận học"}
                            </span>
                          </span>
                          <ChevronDown size={16} />
                        </summary>
                        <div className="px-4 pb-5 text-sm leading-7">
                          {lesson.objective_vi && <p>{lesson.objective_vi}</p>}
                          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 size={14} />
                            Dự kiến {lesson.estimated_minutes} phút
                          </p>
                          <Link
                            href={`/lessons/${lesson.id}`}
                            className="mt-3 inline-flex min-h-11 items-center text-primary underline underline-offset-4"
                          >
                            Đọc bài học
                          </Link>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs leading-6 text-muted-foreground">
        Kiến trúc dữ liệu hỗ trợ đến HSK 9. Các cấp chưa có nội dung được giữ
        trống để bảo đảm chất lượng giáo trình.
      </p>
    </>
  );
}
