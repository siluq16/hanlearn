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

      {/* Module 0 & 9-Stage Interactive Lessons Banner */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 0 Pinyin Foundation */}
        <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary shrink-0" />
              <h3 className="font-semibold text-sm text-foreground">
                Module 0: Ngữ âm &amp; Phát âm Pinyin Nền tảng
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Nhập môn toàn diện: 21 Thanh mẫu, 36 Vận mẫu, 4 Thanh điệu và quy tắc biến điệu quan trọng (thanh 3, 不, 一) kèm phát âm chuẩn.
            </p>
          </div>
          <div>
            <Link
              href="/pinyin"
              className="inline-flex min-h-10 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all"
            >
              Học Module 0 (Pinyin)
            </Link>
          </div>
        </div>

        {/* 9-Stage Interactive Reader Notice */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary shrink-0" />
              <h3 className="font-semibold text-sm text-foreground">
                Giáo trình Chuẩn 9 Giai đoạn Tương tác
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mỗi bài học được chia thành 9 chặng bài bản: Khởi động, từ vựng, ngữ pháp, bài tập tương tác, hội thoại đóng vai, nghe ẩn transcript, nhại âm, đọc hiểu Đúng/Sai, Mini Quiz (80% Mastery) và SRS.
            </p>
          </div>
          <div>
            <Link
              href="/lessons/stage/hsk1-lesson-01"
              className="inline-flex min-h-10 items-center px-4 rounded-xl border border-primary/30 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
            >
              Học thử Bài 1 (9 Giai đoạn)
            </Link>
          </div>
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
                            Chặng 1 Checkpoint &amp; Bài học tiếp theo (Interactive 9 Stages)
                          </h4>
                        </div>

                        {/* Checkpoint 1 */}
                        <details id="lesson-hsk1-cp01" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP1</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 1: Tổng ôn &amp; Đánh giá Nền tảng (Bài 1–4)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc đánh giá Chặng 1 · Chào hỏi, họ tên, quốc tịch, số đếm 0–100, tuổi tác &amp; biến điệu ngữ âm
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Đánh giá năng lực toàn diện Chặng 1 với 9 giai đoạn: ôn tập biến điệu hai thanh 3, câu 是/不是, trợ từ 吗, bài tập nối câu, hội thoại đối đáp và Mini Quiz chuẩn 80% Mastery.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-01"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 1
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 5 */}
                        <details id="lesson-hsk1-05" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">05</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 5: Gia đình &amp; Nghề nghiệp của tôi (我的家与职业)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Gia đình, nghề nghiệp, trợ từ 的, lượng từ 口/个)
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
                                9 Giai đoạn tương tác (Giờ giấc 点/分, buổi sáng/chiều, các thứ trong tuần)
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

                        {/* Lesson 7 */}
                        <details id="lesson-hsk1-07" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">07</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 7: Mua sắm &amp; Giá cả (买东西与多少钱)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Hỏi giá 多少钱, tiền tệ 块/元, cảm thán 太...了, hoa quả 苹果)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Học cách hỏi giá cả (...多少钱), trả giá với mẫu câu cảm thán 太...了, đơn vị tiền tệ 块/元, và các từ vựng mua sắm hoa quả (苹果, 东西, 便宜, 贵).</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-07"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 7 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 8 */}
                        <details id="lesson-hsk1-08" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">08</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 8: Ăn uống &amp; Gọi món (吃饭与喝水)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Ăn uống 吃/喝, món ăn 菜/米饭/面条儿, ý muốn 想, sở thích 喜欢)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Nắm vững trợ động từ biểu thị ý muốn 想 + V, động từ tâm lý 喜欢, từ vựng đồ ăn thức uống (吃, 喝, 米饭, 面条儿, 水, 茶, 中国菜) và cách gọi món trong quán ăn.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-08"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 8 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Checkpoint 2 */}
                        <details id="lesson-hsk1-cp02" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP2</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 2: Tổng ôn &amp; Đánh giá Đời sống &amp; Mua sắm (Bài 5–8)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc đánh giá Chặng 2 · Gia đình, nghề nghiệp, thời gian, ngày tháng, mua sắm &amp; ẩm thực
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Đánh giá tổng hợp Chặng 2 với 9 giai đoạn: nối cặp từ vựng, diễn đạt thời gian, mẫu câu hỏi giá và ý muốn, đọc hiểu ngày Chủ nhật và Mini Quiz chuẩn 80% Mastery.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-02"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 2
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 9 */}
                        <details id="lesson-hsk1-09" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">09</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 9: Vị trí, Phương hướng &amp; Nơi chốn (在哪儿与去学校)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Giới từ 在, đại từ 哪儿, phương vị 前/后, nơi chốn 学校/商店/医院)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hỏi đường và chỉ vị trí với mẫu câu S + 在 + Nơi chốn, phương vị từ đứng sau danh từ (学校前, 商店后), và các địa điểm công cộng phổ biến.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-09"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 9 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 10 */}
                        <details id="lesson-hsk1-10" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">10</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 10: Thói quen &amp; Kỹ năng hàng ngày (日常与做事情)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Năng nguyện động từ 会/能, kỹ năng ngôn ngữ 看/写/读/听/说, chữ Hán 汉字)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Nắm chắc năng nguyện động từ 会 (biết do học hỏi) và 能 (khả năng/điều kiện cho phép), các động từ kỹ năng tiếng Trung (看书, 写汉字, 读, 听, 说汉语).</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-10"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 10 (9 Giai đoạn)
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
