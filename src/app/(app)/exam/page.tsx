import Link from "next/link";
import { Award, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireLearner } from "@/features/auth/session";
import { getLearnerCurriculumProgress } from "@/features/courses/queries";
import { UNIFIED_UNITS, getUnitMeta } from "@/features/curriculum/unified-metadata";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kiểm tra HSK 1" };

export default async function ExamOverviewPage() {
  const { user, supabase } = await requireLearner();

  // Parallel fetch curriculum progress and mock exam attempts
  const [prog, mockAttemptsRes] = await Promise.all([
    getLearnerCurriculumProgress(),
    supabase
      .from("curriculum_quiz_attempts")
      .select("correct_count, question_count, passed, submitted_at, answers")
      .eq("user_id", user.id)
      .eq("lesson_id", "exam-hsk1-official-mock")
      .order("submitted_at", { ascending: false }),
  ]);

  const mockAttempts = mockAttemptsRes.data;

  const latestMock = mockAttempts?.[0];
  const bestMockScore = mockAttempts?.reduce((max, cur) => {
    const rawScore = (cur.answers as { totalScore?: number })?.totalScore;
    const score = typeof rawScore === "number" ? rawScore : Math.round(((cur.correct_count || 0) / (cur.question_count || 40)) * 200);
    return Math.max(max, score);
  }, 0) ?? 0;
  const isMockPassed = mockAttempts?.some((a) => a.passed) ?? false;
  const hasMockAttempt = Boolean(mockAttempts && mockAttempts.length > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeading
        eyebrow="Đánh giá năng lực chuẩn hóa"
        title="Kiểm tra HSK 1"
        description="Đo lường sự tiến bộ chuẩn xác qua 6 bài Unit Test theo từng chặng và Đề thi thử HSK 1."
      />

      {/* Mock Exam Card */}
      <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-card shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-semibold text-xs">
                ĐỀ THI TỔNG HỢP CUỐI KHÓA
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3.5" /> 35 phút · 40 câu
              </span>
              {hasMockAttempt && (
                <Badge
                  className={`text-xs font-semibold ${
                    isMockPassed
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {isMockPassed
                    ? `Đã đạt · Cao nhất ${bestMockScore}/200 điểm`
                    : `Chưa đạt · Cao nhất ${bestMockScore}/200 điểm`}
                </Badge>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Đề thi thử HSK 1 (40 câu)
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Cấu trúc gồm 20 câu Nghe (100 điểm) và 20 câu Đọc (100 điểm). Điểm đạt yêu cầu từ 120/200 điểm trở lên.
            </p>

            {hasMockAttempt && latestMock && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                {isMockPassed ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                )}
                <span>
                  Lần làm gần nhất: {latestMock.submitted_at ? new Date(latestMock.submitted_at).toLocaleDateString("vi-VN") : "Gần đây"}
                </span>
              </p>
            )}
          </div>

          <Link
            href="/exam/hsk1"
            className="inline-flex min-h-12 items-center px-6 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity gap-2 shrink-0 shadow-md"
          >
            <span>{hasMockAttempt ? "Làm lại Đề thi thử" : "Bắt đầu làm bài"}</span>
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>

      {/* 6 Unit Tests Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                6 Bài Kiểm tra Unit Test
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Mỗi Unit Test gồm 20 câu hỏi tổng hợp 4 kỹ năng (Nghe, Từ vựng, Ngữ pháp, Đọc hiểu) trong 20 phút. Chuẩn đạt 80% (16/20).
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold shrink-0 self-start sm:self-auto">
            {prog.passedUnitTestsCount} / 6 Unit đã đạt
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNIFIED_UNITS.map((unit) => {
            const uMeta = getUnitMeta(unit.id);
            const uProg = prog.unitProgress[unit.id];
            const isPassed = Boolean(uProg?.isUnitTestPassed);
            const hasAttempt = uProg?.unitTestBestScore !== null && uProg?.unitTestBestScore !== undefined;

            return (
              <Card key={unit.id} className="border-border hover:border-primary/40 transition-colors bg-card shadow-xs">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                          UNIT {unit.unitNumber}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3.5" /> 20 phút · 20 câu
                        </span>
                      </div>

                      {isPassed ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold gap-1">
                          <CheckCircle2 className="size-3" />
                          Đã đạt ({uProg.unitTestBestScore}/20)
                        </Badge>
                      ) : hasAttempt ? (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
                          Chưa đạt ({uProg.unitTestBestScore}/20)
                        </Badge>
                      ) : (
                        <Badge className="border border-border bg-card text-[11px] font-semibold text-muted-foreground">
                          Chưa làm
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {uMeta.fullTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {uMeta.topic}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Chuẩn đạt: 80% (16/20 điểm)
                    </span>
                    <Link
                      href={`/exam/unit/${unit.unitNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <span>{hasAttempt ? "Làm lại" : "Bắt đầu kiểm tra"}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
