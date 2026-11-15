import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Target,
  Clock3,
  Route,
  Dumbbell,
  FileCheck2,
} from "lucide-react";
import { getDashboard } from "@/features/dashboard/queries";
import { getLearnerCurriculumProgress } from "@/features/courses/queries";
import { PageHeading } from "@/components/page-heading";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
export const metadata = { title: "Tổng quan" };
export default async function Dashboard() {
  const [d, prog] = await Promise.all([
    getDashboard(),
    getLearnerCurriculumProgress(),
  ]);
  const name = d.profile?.display_name;
  const date = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  return (
    <>
      <PageHeading
        eyebrow="Không gian học tập"
        title={name ? `Chào ${name}.` : `Một ngày mới để học.`}
        description={date}
      />

      {/* Course Overall Metric Card */}
      <div className="mb-6 p-5 sm:p-6 rounded-2xl border border-primary/30 bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-semibold">
                KHÓA HỌC HIỆN TẠI: HSK 1
              </Badge>
              <span className="text-xs text-muted-foreground">Sơ cấp toàn diện</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              {prog.overallPercent}% Hoàn thành lộ trình
            </h2>
          </div>
          <Link
            href={`/lessons/stage/${prog.nextLessonSlug}`}
            className="inline-flex min-h-10 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 gap-1.5 shadow-xs"
          >
            <span>Tiếp tục: {prog.nextLessonTitle.split(":")[0]}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <Progress value={prog.overallPercent} label="Tiến độ khóa học HSK 1" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center pt-1">
          <div className="p-3 rounded-xl bg-muted/60 border border-border">
            <span className="block text-lg font-bold text-foreground">
              {prog.completedLessonsCount} / 32
            </span>
            <span className="text-[10px] text-muted-foreground">Bài học xong</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/60 border border-border">
            <span className="block text-lg font-bold text-primary">
              {prog.passedUnitTestsCount} / 6
            </span>
            <span className="text-[10px] text-muted-foreground">Unit Test đạt</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/60 border border-border">
            <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {prog.vocabularyLearnedCount} / 300
            </span>
            <span className="text-[10px] text-muted-foreground">Từ vựng đã học</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/60 border border-border">
            <span className="block text-lg font-bold text-foreground">
              {d.dueCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Thẻ SRS đến hạn</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2.5">
        <Button
          asChild
          variant="outline"
          className="min-h-11 w-full whitespace-normal sm:w-auto text-xs"
        >
          <Link href="/practice">
            <Dumbbell size={16} className="text-primary" /> Luyện tập đa kỹ năng
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="min-h-11 w-full whitespace-normal sm:w-auto text-xs"
        >
          <Link href="/exam">
            <FileCheck2 size={16} className="text-primary" /> Kiểm tra &amp; Thi thử
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="min-h-11 w-full whitespace-normal sm:w-auto text-xs"
        >
          <Link href="/review">
            <Layers size={16} /> Ôn tập · {d.dueCount} thẻ đến hạn
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="min-h-11 w-full whitespace-normal sm:w-auto text-xs"
        >
          <Link href="/vocabulary">
            <BookOpen size={16} /> Tra cứu 300 từ vựng
          </Link>
        </Button>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bước tiếp theo</CardTitle>
              <Badge>
                <Route size={12} />
                Lộ trình của bạn
              </Badge>
            </div>
            <CardDescription>
              Tiếp tục từ bài chưa hoàn thành đầu tiên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prog.nextLessonSlug ? (
              <div className="rounded-xl bg-secondary p-5">
                <p className="text-xs font-semibold text-primary">
                  HSK 1 · {prog.nextLessonTitle.split(":")[0]}
                </p>
                <h3 className="my-3 text-xl font-semibold">{prog.nextLessonTitle}</h3>
                <Button
                  asChild
                  className="min-h-12 w-full whitespace-normal sm:w-auto"
                >
                  <Link href={`/lessons/stage/${prog.nextLessonSlug}`}>
                    Tiếp tục bài học (10 chặng) <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                title={
                  d.totalLessons
                    ? "Bạn đã hoàn thành các bài hiện có"
                    : "Chưa có bài tiếp theo"
                }
                description={
                  d.totalLessons
                    ? "Bạn có thể mở lại bài học hoặc làm lại quiz từ lộ trình để ôn tập."
                    : "Bài học sẽ xuất hiện khi có giáo trình được phát hành. Bạn có thể xem các cấp HSK trong lộ trình."
                }
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ giáo trình</CardTitle>
            <CardDescription>
              {d.curriculum.syllabus?.display_name ?? "Chưa chọn syllabus"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {d.totalLessons > 0 ? (
              <>
                <div className="mb-3 flex justify-between text-sm">
                  <span>Bài hoàn thành</span>
                  <span className="font-semibold">
                    {d.completed}/{d.totalLessons}
                  </span>
                </div>
                <Progress
                  value={(d.completed / d.totalLessons) * 100}
                  label="Tiến độ bài học"
                />
                <div className="mb-3 mt-7 flex justify-between text-sm">
                  <span>Phạm vi từ đã nhập</span>
                  <span>
                    {d.coverage === null ? "—" : `${Math.round(d.coverage)}%`}
                  </span>
                </div>
                {d.coverage !== null && (
                  <Progress value={d.coverage} label="Tiếp cận từ đã nhập" />
                )}
                <p className="mt-3 text-xs leading-6 text-muted-foreground">
                  Tính trên {d.importedWords} từ đã nhập theo mục tiêu. Đây
                  không phải tỷ lệ hoàn thành danh sách HSK chính thức.
                </p>
              </>
            ) : (
              <p className="rounded-xl bg-muted p-5 text-sm leading-7 text-muted-foreground">
                Chưa có bài học được phát hành để tính tiến độ. Mức HSK sẽ không
                được suy ra từ số ngày học.
              </p>
            )}
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link href="/roadmap">
                Khám phá lộ trình <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {!d.profile && (
        <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-secondary p-5">
          <div>
            <p className="font-semibold">Bắt đầu bằng hồ sơ của bạn</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn trình độ tự khai báo và mục tiêu học tập.
            </p>
          </div>
          <Button asChild>
            <Link href="/settings">
              Thiết lập hồ sơ <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "HSK hiện tại",
            value: d.profile
              ? `HSK ${d.profile.baseline_hsk_level}`
              : "Chưa thiết lập",
            note: "Trình độ tự khai báo",
            icon: BookOpen,
          },
          {
            label: "Mục tiêu của bạn",
            value: d.profile
              ? `HSK ${d.profile.target_hsk_level}`
              : "Chưa thiết lập",
            note: "Hành trình dài hạn",
            icon: Target,
          },
          {
            label: "Từ đã tiếp cận",
            value: String(d.totalWords),
            note: "Từ có thẻ đang được lưu",
            icon: Layers,
          },
          {
            label: "Thẻ đến hạn ôn",
            value: String(d.dueCount),
            note: "Theo lịch ôn trong database",
            icon: Clock3,
          },
        ].map(({ label, value, note, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {label}
                <Icon className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="my-4 text-xl font-semibold tracking-tight sm:text-2xl">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kết quả Mini Quiz</CardTitle>
              <Badge className="border border-border bg-transparent text-foreground">
                Kiểm tra kiến thức
              </Badge>
            </div>
            <CardDescription>
              Các lần làm bài quiz đã được lưu điểm.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {d.quizHistory.length ? (
              <ul className="divide-y divide-border">
                {d.quizHistory.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {q.lessonTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {q.submittedAt
                          ? new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Ho_Chi_Minh",
                          }).format(new Date(q.submittedAt))
                          : "Đã nộp"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          q.passed
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        }
                      >
                        {q.correctCount}/{q.questionCount} đúng · {q.passed ? "Đạt" : "Chưa đạt"}
                      </Badge>
                      {q.lessonId && (
                        <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs">
                          <Link href={`/lessons/${q.lessonId}/quiz?attempt=${q.id}`}>
                            Xem lại
                          </Link>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Chưa có lượt làm quiz"
                description="Bạn có thể làm quiz ở cuối mỗi bài học để củng cố từ vựng và ngữ pháp."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Những phiên học đã được lưu của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {d.sessions.length ? (
              <ul className="divide-y divide-border">
                {d.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {s.source === "hellochinese_manual"
                          ? "HelloChinese"
                          : s.source === "hanlearn"
                            ? "HanLearn"
                            : "Tự học"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Ho_Chi_Minh",
                        }).format(new Date(s.started_at))}
                      </p>
                    </div>
                    <Badge>
                      {s.evidence === "self_reported"
                        ? "Tự khai báo"
                        : "Timer hệ thống"}
                      {!s.ended_at ? " · Đang mở" : ""}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Chưa có hoạt động học"
                description="Khi bạn ghi nhận một phiên học, lịch sử sẽ được lưu và hiển thị tại đây."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
