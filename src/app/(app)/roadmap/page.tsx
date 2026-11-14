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

      {/* 9-Stage Interactive Lessons Notice */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 shadow-xs flex items-start gap-3">
        <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-sm text-foreground">
            Lộ trình học đã tích hợp Chế độ Luyện tập 9 Giai đoạn
          </p>
          <p>
            Mỗi bài học hỗ trợ chuyển đổi linh hoạt giữa <strong>Đọc lý thuyết</strong> và <strong>Luyện tập tương tác 9 bước</strong> (Khởi động ngữ âm, từ vựng, bài tập nối từ, ngữ pháp, hội thoại đóng vai, nghe ẩn transcript, nhại âm, đọc hiểu Đúng/Sai, Quiz và SRS).
          </p>
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
                            Đọc bài học &amp; Luyện tập 9 giai đoạn
                          </Link>
                        </div>
                      </details>
                    ))}
                    {l.level === 1 && (
                      <div className="pt-3 space-y-3">
                        <div className="flex items-center gap-2 pt-2">
                          <Sparkles className="size-4 text-primary" />
                          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Bài học tiếp theo trong lộ trình (Interactive 9 Stages)
                          </h4>
                        </div>
                        {/* Lesson 5 */}
                        <details id="lesson-hsk1-05" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">05</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 5: Gia đình &amp; Nghề nghiệp của tôi (我的家与职业)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Bài tiếp theo · 9 Giai đoạn tương tác (Gia đình, nghề nghiệp, trợ từ 的, lượng từ 口/个)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Học từ vựng về thành viên gia đình (爸爸, 妈妈, 哥哥...), nghề nghiệp (老师, 医生), mẫu câu sở hữu 的 và cấu trúc hỏi số lượng 口/个.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-05"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 5 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>
                        {/* Lesson 6 */}
                        <details id="lesson-hsk1-06" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">06</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 6: Bây giờ là mấy giờ? (现在几点？)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Bài tiếp theo · 9 Giai đoạn tương tác (Giờ giấc 点/分, buổi sáng/chiều, các thứ trong tuần)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hỏi và nói giờ giấc (点, 分), các buổi trong ngày (上午, 下午), các thứ trong tuần (星期一..), và diễn đạt lịch sinh hoạt thường ngày.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-06"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 6 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
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
