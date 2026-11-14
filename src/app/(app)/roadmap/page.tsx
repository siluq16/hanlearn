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

                        {/* Lesson 11 */}
                        <details id="lesson-hsk1-lesson-11" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">11</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 11: Thời tiết &amp; Khí hậu (今天天气怎么样)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Hỏi thời tiết 怎么样, hiện tượng mưa tuyết 下雨/下雪, tính từ nóng lạnh 冷/热, trời râm/nắng 阴/晴)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Học cách hỏi và miêu tả thời tiết các mùa trong năm, nhiệt độ nóng lạnh, hiện tượng mưa tuyết và tính chất thời tiết râm/nắng.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-11"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 11 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 12 */}
                        <details id="lesson-hsk1-lesson-12" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">12</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 12: Phương tiện &amp; Đi lại (你怎么去车站)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Phương tiện xe cộ 车/出租车/飞机/火车, cách đi lại 坐/开/走路, cự ly xa gần 远/近, động từ đến/về 来/到/回)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Biết gọi tên phương tiện giao thông, cách thức di chuyển và diễn đạt đích đến hoặc quay về.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-12"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 12 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 13 */}
                        <details id="lesson-hsk1-lesson-13" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">13</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 13: Trường học &amp; Giảng đường (我们在大学学中文)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Cấp học đại học/trung học/tiểu học, sinh viên/học sinh, sách vở 本/本子/书, hiệu sách 书店, bạn học 同学)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Mở rộng hệ thống giáo dục, xưng hô sinh viên học sinh, lượng từ 本 cho sách vở và môi trường trường học.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-13"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 13 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 14 */}
                        <details id="lesson-hsk1-lesson-14" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">14</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 14: Lớp học &amp; Bài tập (上课与做练习)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Vào lớp/tan học 上课/下课, phòng học 教室, bàn ghế 桌子/椅子, cặp sách 书包, máy tính 电脑, câu hỏi 问题, thi cử 考试)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Các hoạt động học tập trên lớp, xử lý bài tập, kỳ thi và sử dụng đồ dùng học tập.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-14"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 14 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Checkpoint 3 */}
                        <details id="lesson-hsk1-checkpoint-03" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP3</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 3: Tổng ôn &amp; Đánh giá Năng lực (Bài 9–14)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc đánh giá Chặng 3 · Phương tiện giao thông, thời tiết, trường học đại học, đồ dùng lớp học &amp; thi cử
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Đánh giá toàn diện 9 giai đoạn: ôn tập từ vựng thời tiết, hỏi phương tiện 怎么去, lượng từ 本, từ chỉ phòng học và Mini Quiz 80% Mastery.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-03"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 3
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 15 */}
                        <details id="lesson-hsk1-lesson-15" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">15</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 15: Gia đình, Người thân &amp; Thú cưng (我的家人和房间)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Người nhà 家人, em trai 弟弟, em gái 妹妹, con cái 儿子/女儿/孩子, cư trú 住, căn phòng 房间, thú cưng 猫/狗, lượng từ 只)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Giới thiệu người thân trong gia đình, các thế hệ, miêu tả căn nhà phòng ở và thú cưng yêu quý.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-15"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 15 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 16 */}
                        <details id="lesson-hsk1-lesson-16" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">16</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 16: Sức khỏe, Cơ thể &amp; Khám bệnh (身体健康与运动)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Sức khỏe 身体, ốm đau/khám bệnh 生病/看病, uống thuốc 吃药, sinh hoạt 起床/睡觉/休息, thể thao 跑步/踢足球/游泳)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hỏi thăm sức khỏe, diễn đạt tình trạng ốm đau, đi bệnh viện khám và các thói quen vận động rèn luyện.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-16"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 16 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 17 */}
                        <details id="lesson-hsk1-lesson-17" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">17</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 17: Trang phục, Màu sắc &amp; Mua sắm (这件衣服很漂亮)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Trang phục 衣服, mặc 穿, lượng từ 件, màu sắc 红/白/黑/蓝/绿/黄, tính từ 漂亮/长/短/新/旧, bán 卖)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Gọi tên trang phục, chọn màu sắc yêu thích, so sánh đồ mới cũ và mua bán quần áo.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-17"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 17 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 18 */}
                        <details id="lesson-hsk1-lesson-18" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">18</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 18: Ăn uống, Bữa ăn &amp; Món ngon (今天吃什么饭)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Bữa ăn 早饭/午饭/晚饭, nấu ăn 做饭, món ăn 包子/面包/饺子/鸡蛋/米饭, hoa quả 苹果/西瓜, đồ uống 牛奶/咖啡/茶, vị ngon 好吃/好喝/甜, đói 饿)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Từ vựng ẩm thực phong phú, gọi món ăn ba bữa, miêu tả cảm giác vị giác và thói quen ăn uống lành mạnh.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-18"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 18 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 19 */}
                        <details id="lesson-hsk1-lesson-19" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">19</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 19: Quán xá, Siêu thị &amp; Nơi làm việc (去超市与在公司上班)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Quán ăn 饭馆, nhà hàng lớn 饭店, siêu thị 超市, công ty 公司, đi làm/tan ca 上班/下班, bận rộn 忙, không sao 没事)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Giao tiếp tại nơi làm việc, hẹn bạn bè sau giờ tan sở, đi siêu thị mua sắm.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-19"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 19 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 20 */}
                        <details id="lesson-hsk1-lesson-20" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">20</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 20: Giải trí, Phim ảnh &amp; Ca hát (周末看电影与唱歌)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Ti vi 电视, phim ảnh 电影, rạp chiếu phim 电影院, ca hát 唱歌, khiêu vũ 跳舞, vui chơi 玩儿, âm nhạc 音乐, tính từ 好看/好听/好玩儿)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Diễn đạt sở thích giải trí cuối tuần, xem phim rạp, thưởng thức âm nhạc và vui chơi cùng bạn bè.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-20"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 20 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Checkpoint 4 */}
                        <details id="lesson-hsk1-checkpoint-04" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP4</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 4: Tổng ôn &amp; Đánh giá Năng lực (Bài 15–20)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc đánh giá Chặng 4 · Gia đình, thú cưng, sức khỏe, trang phục màu sắc, món ăn &amp; giải trí cuối tuần
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Kiểm tra năng lực tích hợp: miêu tả thành viên gia đình, hỏi thăm sức khỏe, mua sắm quần áo, gọi món ăn và các sở thích xem phim ca hát.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-04"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 4
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 21 */}
                        <details id="lesson-hsk1-lesson-21" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">21</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 21: Giao tiếp, Trò chuyện &amp; Điện thoại (喂，请问您找谁)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Nghe gọi điện thoại 喂/打电话/手机, trò chuyện 说话, nghe/nhìn thấy 听见/看见, nhờ vả lịch sự 请问/帮助, bạn bè 朋友/男朋友/女朋友, xưng hô 先生/女士)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Kỹ năng nghe gọi điện thoại thực tế, giao tiếp xưng hô chuẩn mực và tạo dựng mối quan hệ bạn bè.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-21"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 21 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 22 */}
                        <details id="lesson-hsk1-lesson-22" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">22</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 22: Đại từ nhân xưng &amp; Chỉ định (大家都是好朋友)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Mọi người 大家, kính ngữ 您, đại từ 他/她/它/他们/她们/它们/我们/你们, hậu tố 们, chỉ định 这/这个/这些/这儿/这里, 那/那个/那些/那儿/那里, 哪/哪个/哪里/哪些)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hệ thống hóa toàn diện đại từ nhân xưng và đại từ chỉ định gần/xa/nghi vấn của toàn bộ HSK 1.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-22"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 22 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 23 */}
                        <details id="lesson-hsk1-lesson-23" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">23</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 23: Phương hướng &amp; Vị trí không gian (学校在前面)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Trên/dưới 上/下, trong/ngoài 里/外, bên cạnh 旁边, hướng địa lý Đông/Tây/Nam/Bắc 东南西北, phía trước/phía sau 前边/后边, bên trong/bên ngoài 里边/外边)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Định vị vị trí trong không gian, chỉ dẫn phương hướng chính xác trong trường học và thành phố.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-23"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 23 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 24 */}
                        <details id="lesson-hsk1-lesson-24" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">24</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 24: Số đếm lớn, Số thứ tự &amp; Lượng từ (几只小狗与几岁)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Số không 零, số 8/9/10 八/九/十, hàng trăm/nghìn/vạn 百/千/万, số hai 两, một nửa 一半, một vài 些/一些/有些/有的, lượng từ động vật 只, tuổi 岁, thứ tự 第, nhiều/ít 多/少, một lát 一下, một chút 一点儿)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Làm chủ số đếm lớn, biểu thị tuổi tác, số thứ tự và các lượng từ định lượng thường gặp.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-24"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 24 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 25 */}
                        <details id="lesson-hsk1-lesson-25" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">25</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 25: Thời gian, Lịch trình &amp; Ngày tháng (去年、今年与明年)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Năm/tháng/ngày 年/月/日/号, các thứ/Chủ nhật 星期/星期天/星期日, phút/giờ 分钟/小时, thời gian 时间/时候, các buổi 白天/早上/中午/晚上, sớm/muộn 早/晚, hôm qua/ngày mai 昨天/明天, năm ngoái/năm nay/năm sau 去年/今年/明年, trước/sau 以前/以后)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Hệ thống hóa toàn bộ các mốc thời gian quá khứ, hiện tại, tương lai, trật tự thời gian và diễn đạt lịch trình sinh hoạt.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-25"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 25 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Lesson 26 */}
                        <details id="lesson-hsk1-lesson-26" className="scroll-mt-8 rounded-xl border border-primary/20 bg-primary/5">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">26</span>
                            <BookOpen size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Bài 26: Tâm lý, Năng nguyện &amp; Trợ từ ngữ khí (我们都爱学中文)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                9 Giai đoạn tương tác (Yêu/thích 爱/喜欢, cảm nhận 觉得/知道/希望, năng nguyện 会/能/可以/想/要, giúp đỡ/tìm 给/找, cấm chỉ 别/不要, phó từ mức độ 非常/真/太/最/还/也/都, tiếp diễn 正在/已经/有点儿, trợ từ ngữ khí 吧/呢/了, hỏi thế nào 怎么/怎么样, đúng/sai 对/错, phủ định 没有/再, đại từ tính từ 大/小/男/女/国)
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Bài tổng kết hoàn tất 100% 300 từ vựng và toàn bộ cấu trúc ngữ pháp trọng yếu của HSK 1.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 25 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-lesson-26"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Học bài 26 (9 Giai đoạn)
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* Checkpoint 5 */}
                        <details id="lesson-hsk1-checkpoint-05" className="scroll-mt-8 rounded-xl border border-primary/40 bg-primary/10">
                          <summary className="flex min-h-16 list-none items-center gap-3 p-4 cursor-pointer">
                            <span className="text-xs font-bold text-primary">CP5</span>
                            <Sparkles size={18} className="shrink-0 text-primary" />
                            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6">
                              Chặng 5: Tổng ôn Toàn diện HSK 1 (Bài 21–26)
                              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                Cột mốc đánh giá Chặng 5 · Giao tiếp nghe gọi điện thoại, đại từ nhân xưng, phương hướng không gian, số đếm lớn &amp; trợ từ ngữ khí
                              </span>
                            </span>
                            <ChevronDown size={16} />
                          </summary>
                          <div className="px-4 pb-5 text-sm leading-7">
                            <p>Tổng kết toàn bộ 300 từ vựng: đối thoại qua điện thoại, hỏi phương hướng, sử dụng chính xác năng nguyện từ và trợ từ ngữ khí chuẩn người bản ngữ.</p>
                            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock3 size={14} />
                              Dự kiến 30 phút
                            </p>
                            <div className="mt-3 flex gap-3">
                              <Link
                                href="/lessons/stage/hsk1-checkpoint-05"
                                className="inline-flex min-h-11 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90"
                              >
                                Làm bài Đánh giá Chặng 5
                              </Link>
                            </div>
                          </div>
                        </details>

                        {/* HSK 1 Official Mock Exam Banner */}
                        <div className="mt-6 rounded-2xl border-2 border-primary/50 bg-primary/15 p-5 sm:p-6 shadow-sm">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-5 text-primary shrink-0" />
                                <span className="font-bold text-xs uppercase tracking-wider text-primary">
                                  Cột mốc Tốt nghiệp HSK 1
                                </span>
                              </div>
                              <h3 className="text-base sm:text-lg font-bold text-foreground">
                                Đề thi thử HSK 1 Chuẩn Quốc tế CTI (40 câu / 35 phút)
                              </h3>
                              <p className="text-xs leading-relaxed text-muted-foreground max-w-2xl">
                                Đề thi toàn diện bao phủ 100% 300 từ vựng đề cương HSK 2025. Cấu trúc chuẩn: 20 câu Nghe hiểu (100 điểm) + 20 câu Đọc hiểu (100 điểm), đồng hồ đếm ngược 35 phút, chấm điểm phân tích hai kỹ năng và chứng nhận kết quả.
                              </p>
                            </div>
                            <Link
                              href="/exam/hsk1"
                              className="inline-flex min-h-12 items-center justify-center px-6 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition-all shrink-0 w-full sm:w-auto"
                            >
                              Bắt đầu Thi thử HSK 1
                            </Link>
                          </div>
                        </div>
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
