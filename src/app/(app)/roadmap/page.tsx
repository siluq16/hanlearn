import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Sparkles,
  Award,
  ArrowRight,
  Dumbbell,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HSK1_UNITS } from "@/features/courses/constants";
import { getLearnerCurriculumProgress } from "@/features/courses/queries";
import { findNineStageLesson } from "@/features/content-library/curriculum-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lộ trình học HSK 1" };

export default async function Roadmap() {
  const prog = await getLearnerCurriculumProgress();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeading
        eyebrow="Khóa học HSK 1 · Sơ cấp toàn diện"
        title="Lộ trình Chuẩn 6 Unit & 32 Bài học"
        description="Xây dựng nền tảng từ Module 0 Pinyin, chinh phục từng Unit, làm chủ bài tập tương tác, vượt qua Unit Test và tự tin thi đạt HSK 1."
      />

      {/* Course Overall Progress Card */}
      <Card className="border-primary/30 bg-card shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Tiến độ tổng quan HSK 1
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-0.5">
                {prog.overallPercent}% Hoàn thành
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/lessons/stage/${prog.nextLessonSlug}`}
                className="inline-flex min-h-11 items-center gap-2 px-5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
              >
                <span>Tiếp tục: {prog.nextLessonTitle.split(":")[0]}</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <Progress
            value={prog.overallPercent}
            label="Tiến độ khóa học HSK 1"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="block text-xl font-extrabold text-foreground">
                {prog.completedLessonsCount} / {prog.totalLessons}
              </span>
              <span className="text-[11px] text-muted-foreground">Bài học hoàn thành</span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="block text-xl font-extrabold text-primary">
                {prog.passedUnitTestsCount} / {prog.totalUnitTests}
              </span>
              <span className="text-[11px] text-muted-foreground">Unit Test đã đạt</span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {prog.vocabularyLearnedCount} / {prog.totalVocabulary}
              </span>
              <span className="text-[11px] text-muted-foreground">Từ vựng đã học</span>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border">
              <span className="block text-xl font-extrabold text-foreground">6 / 6</span>
              <span className="text-[11px] text-muted-foreground">Unit học tập</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module 0: Pinyin Foundation Banner */}
      <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary shrink-0" />
            <h3 className="font-bold text-sm text-foreground">
              Module 0: Ngữ âm &amp; Phát âm Pinyin Nền tảng
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            Nhập môn toàn diện: 21 Thanh mẫu, 36 Vận mẫu, 4 Thanh điệu và quy tắc biến điệu quan trọng (thanh 3, 不, 一) kèm phát âm chuẩn.
          </p>
        </div>
        <Link
          href="/pinyin"
          className="inline-flex min-h-10 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
        >
          Học Module 0 Pinyin
        </Link>
      </div>

      {/* 6 Units Accordions */}
      <div className="space-y-6">
        {HSK1_UNITS.map((unit) => {
          const uProg = prog.unitProgress[unit.unit_id];
          const isCompleted = uProg?.status === "completed";
          const isInProgress = uProg?.status === "in_progress";

          return (
            <Card key={unit.unit_id} className="border-border shadow-xs overflow-hidden">
              <CardContent className="p-5 sm:p-7 space-y-6">
                {/* Unit Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl text-base font-bold ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isInProgress
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {unit.unit_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">
                          {unit.title}
                        </h3>
                        <Badge
                          className={
                            isCompleted
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : isInProgress
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {isCompleted
                            ? "Đã hoàn thành"
                            : isInProgress
                              ? "Đang học"
                              : "Chưa bắt đầu"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unit.topic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/practice?unit=${unit.unit_number}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <Dumbbell className="size-3.5 text-primary" />
                      <span>Luyện tập Unit</span>
                    </Link>
                  </div>
                </div>

                {/* Lessons in this Unit */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Danh sách bài học ({uProg?.completedLessons || 0} / {unit.lesson_slugs.length} bài xong)
                  </span>

                  <div className="grid grid-cols-1 gap-2.5">
                    {unit.lesson_slugs.map((lSlug, idx) => {
                      const lesson = findNineStageLesson(lSlug);
                      const lProg = prog.lessonProgress[lSlug];
                      const isDone = lProg?.isCompleted;

                      return (
                        <details
                          key={lSlug}
                          id={`lesson-${lSlug}`}
                          className="group rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors"
                        >
                          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 p-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono font-bold text-muted-foreground">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              {isDone ? (
                                <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                              ) : (
                                <BookOpen className="size-5 shrink-0 text-primary" />
                              )}
                              <div className="min-w-0">
                                <span className="block text-sm font-semibold text-foreground truncate">
                                  {lesson?.title || lSlug}
                                </span>
                                <span className="block text-[11px] text-muted-foreground">
                                  {isDone
                                    ? "Đã hoàn thành 9 giai đoạn"
                                    : lProg?.completedStagesCount
                                      ? `Đang học · Đã xong ${lProg.completedStagesCount}/10 chặng`
                                      : "Chưa học"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                            </div>
                          </summary>

                          <div className="px-4 pb-4 pt-1 text-xs leading-relaxed border-t border-border/40 space-y-2">
                            <p className="text-muted-foreground">
                              {lesson?.objective_vi || "Học từ vựng, ngữ pháp, bài tập tương tác, hội thoại và mini quiz."}
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock3 className="size-3.5" />
                                Dự kiến {lesson?.estimated_minutes || 25} phút
                              </span>
                              <Link
                                href={`/lessons/stage/${lSlug}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                              >
                                <span>{isDone ? "Xem lại bài học" : "Vào học ngay"}</span>
                                <ArrowRight className="size-3.5" />
                              </Link>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>

                {/* Unit Test Card */}
                <div className="pt-2">
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0">
                        <Award className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            Bài Kiểm tra Đánh giá Unit {unit.unit_number} (20 câu · 20 phút)
                          </h4>
                          {uProg?.isUnitTestPassed ? (
                            <Badge className="bg-emerald-500 text-white font-semibold text-[10px]">
                              Đạt 80% ✓
                            </Badge>
                          ) : (
                            <Badge className="border border-border bg-transparent text-[10px]">
                              Mastery 80%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Kiểm tra tổng hợp 4 kỹ năng: 6 Nghe, 4 Từ vựng, 4 Ngữ pháp, 6 Đọc hiểu.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/exam/unit/${unit.unit_number}`}
                      className="inline-flex min-h-10 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity gap-1.5 shrink-0"
                    >
                      <span>{uProg?.isUnitTestPassed ? "Thi lại Unit Test" : `Làm Unit Test ${unit.unit_number}`}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Official Mock Exam Final Milestone */}
      <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-card shadow-sm">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-semibold">
                CỘT MỐC ĐÁNH GIÁ CUỐI KHÓA HSK 1
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock3 className="size-3.5" /> 35 phút
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Đề thi thử HSK 1 Chuẩn CTI (40 câu)
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sau khi hoàn thành 6 Unit, hãy thử sức với bài thi chuẩn hóa 20 câu Nghe và 20 câu Đọc để kiểm tra độ sẵn sàng trước kỳ thi thật.
            </p>
          </div>

          <Link
            href="/exam/hsk1"
            className="inline-flex min-h-12 items-center px-6 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity gap-2 shrink-0 shadow-md"
          >
            <span>Bắt đầu Thi thử HSK 1</span>
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
