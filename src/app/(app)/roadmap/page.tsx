import Link from "next/link";
import {
  Clock3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HSK1_UNITS } from "@/features/courses/constants";
import { getLearnerCurriculumProgress } from "@/features/courses/queries";
import { findNineStageLesson } from "@/features/content-library/curriculum-data";
import {
  RoadmapUnitAccordion,
  type LessonSummaryInfo,
} from "@/features/roadmap/components/roadmap-unit-accordion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lộ trình học HSK 1" };

export default async function Roadmap() {
  const prog = await getLearnerCurriculumProgress();

  const lessonSummaries: Record<string, LessonSummaryInfo> = {};
  for (const unit of HSK1_UNITS) {
    for (const slug of unit.lesson_slugs) {
      const l = findNineStageLesson(slug);
      if (l) {
        lessonSummaries[slug] = {
          slug: l.slug,
          title: l.title,
          objective_vi: l.objective_vi,
          estimated_minutes: l.estimated_minutes,
        };
      }
    }
  }

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
                <span>Tiếp tục: {prog.nextLessonTitle}</span>
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
      <RoadmapUnitAccordion
        units={HSK1_UNITS}
        prog={prog}
        lessonSummaries={lessonSummaries}
      />

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
              Đề thi thử HSK 1 (40 câu)
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
