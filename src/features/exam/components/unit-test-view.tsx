"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Headphones,
  BookOpen,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton } from "@/components/mandarin-audio";
import {
  startUnitTestAction,
  submitUnitTestAction,
  type UnitTestDefinition,
  type UnitTestResult,
} from "../unit-test-actions";

interface UnitTestViewProps {
  unitTest: UnitTestDefinition;
}

export function UnitTestView({ unitTest }: UnitTestViewProps) {
  const [stage, setStage] = useState<"intro" | "exam" | "result">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(unitTest.duration_minutes * 60);
  const [attemptId, setAttemptId] = useState<string>("");
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<UnitTestResult | null>(null);

  const handleStartExam = async () => {
    setIsStarting(true);
    let resolvedId = "";
    try {
      const res = await startUnitTestAction(unitTest.unit_number);
      if (res && res.attemptId) {
        resolvedId = res.attemptId;
      }
    } catch {
      resolvedId = crypto.randomUUID();
    } finally {
      const finalId = resolvedId || crypto.randomUUID();
      setAttemptId(finalId);
      setStage("exam");
      setSecondsRemaining(unitTest.duration_minutes * 60);
      setIsStarting(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !attemptId) return;
    setIsSubmitting(true);
    try {
      const timeSpent = unitTest.duration_minutes * 60 - secondsRemaining;
      const res = await submitUnitTestAction(
        unitTest.unit_number,
        answers,
        timeSpent,
        attemptId
      );
      setResult(res);
      setStage("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi khi nộp bài. Vui lòng thử lại!";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting, secondsRemaining, unitTest.duration_minutes, unitTest.unit_number, attemptId]);

  // Timer countdown
  useEffect(() => {
    if (stage !== "exam") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, handleSubmit]);

  const questions = unitTest.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSelectChoice = (choiceIndex: number) => {
    if (stage !== "exam") return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceIndex,
    }));
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // INTRO SCREEN
  if (stage === "intro") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Về Lộ trình học
        </Link>

        <Card className="border-primary/20 bg-card shadow-sm">
          <CardHeader className="text-center pb-4 border-b border-border space-y-3">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Award className="size-8" />
            </div>
            <div>
              <Badge className="bg-primary/10 text-primary font-semibold mb-2">
                Bài kiểm tra Đánh giá Unit {unitTest.unit_number}
              </Badge>
              <CardTitle className="text-2xl font-bold text-foreground">
                {unitTest.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {unitTest.scope_vi}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/60 border border-border">
                <span className="block text-xl font-bold text-foreground">20</span>
                <span className="text-[11px] text-muted-foreground">Câu hỏi</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/60 border border-border">
                <span className="block text-xl font-bold text-foreground">20</span>
                <span className="text-[11px] text-muted-foreground">Phút làm bài</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/60 border border-border">
                <span className="block text-xl font-bold text-primary">16 / 20</span>
                <span className="text-[11px] text-muted-foreground">Điểm đạt (80%)</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/60 border border-border">
                <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">4</span>
                <span className="text-[11px] text-muted-foreground">Kỹ năng tổng hợp</span>
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                Cấu trúc đề kiểm tra Unit:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Phần Nghe (6 câu):</strong> Nghe phát âm câu/đối thoại và chọn đáp án chính xác.</li>
                <li><strong>Phần Từ vựng (4 câu):</strong> Kiểm tra nhận diện nghĩa, Hán tự, Pinyin và lượng từ.</li>
                <li><strong>Phần Ngữ pháp (4 câu):</strong> Cấu trúc câu, trật tự từ và trợ từ trọng tâm của Unit.</li>
                <li><strong>Phần Đọc hiểu (6 câu):</strong> Đọc đoạn văn ngắn/thông báo và trả lời câu hỏi.</li>
              </ul>
            </div>

            <Button
              type="button"
              disabled={isStarting}
              onClick={handleStartExam}
              className="w-full min-h-12 text-sm font-semibold gap-2"
            >
              <span>{isStarting ? "Đang khởi tạo đề thi..." : `Bắt đầu làm bài kiểm tra Unit ${unitTest.unit_number}`}</span>
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // EXAM SCREEN
  if (stage === "exam") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        {/* Sticky Exam Header */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card/95 backdrop-blur-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">
              Unit {unitTest.unit_number} Test
            </span>
            <Badge className="border border-border bg-transparent text-xs capitalize">
              {currentQuestion.section === "listening"
                ? "Kỹ năng Nghe"
                : currentQuestion.section === "vocabulary"
                  ? "Từ vựng"
                  : currentQuestion.section === "grammar"
                    ? "Ngữ pháp"
                    : "Đọc hiểu"}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 font-mono text-sm font-bold ${
              secondsRemaining < 180 ? "text-red-500 animate-pulse" : "text-primary"
            }`}>
              <Clock className="size-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (!confirm(`Bạn mới trả lời ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài?`)) {
                    return;
                  }
                }
                handleSubmit();
              }}
              className="min-h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? "Đang nộp..." : "Nộp bài thi"}
            </Button>
          </div>
        </div>

        {/* Question Palette / Navigation */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tiến độ làm bài ({answeredCount}/{questions.length} câu)</span>
            <span>Câu {currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`size-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-2"
                      : isAnswered
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Content Card */}
        <Card className="border-border shadow-xs">
          <CardHeader className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                CÂU HỎI {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentQuestion.section.toUpperCase()}
              </span>
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground whitespace-pre-line leading-relaxed">
              {currentQuestion.prompt}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Audio Button for Listening Questions */}
            {currentQuestion.audioText && (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Headphones className="size-5 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground">
                    Nghe đoạn ghi âm và chọn phương án đúng
                  </span>
                </div>
                <MandarinAudioButton
                  text={currentQuestion.audioText}
                  size="sm"
                  className="rounded-lg bg-primary text-white"
                />
              </div>
            )}

            {/* Options Choices */}
            <div className="space-y-2.5">
              {currentQuestion.choices.map((choice, cIdx) => {
                const isSelected = answers[currentQuestion.id] === cIdx;
                const letter = ["A", "B", "C", "D"][cIdx] || `${cIdx + 1}`;

                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleSelectChoice(cIdx)}
                    className={`flex w-full items-center gap-3.5 p-3.5 rounded-xl border text-left text-sm transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{choice}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4" />
                Câu trước
              </Button>

              <span className="text-xs text-muted-foreground">
                {answers[currentQuestion.id] !== undefined ? "Đã chọn" : "Chưa chọn"}
              </span>

              <Button
                type="button"
                size="sm"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="gap-1.5"
              >
                Câu tiếp theo
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RESULT SCREEN
  if (stage === "result" && result) {
    const isPassed = result.passed;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
          >
            <ArrowLeft className="size-4" />
            Về Lộ trình học
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAnswers({});
              setResult(null);
              setStage("intro");
            }}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Làm lại bài thi
          </Button>
        </div>

        {/* Big Banner Result */}
        <Card className={`border ${
          isPassed
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-red-500/30 bg-red-500/10"
        }`}>
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-card text-foreground shadow-sm">
              {isPassed ? (
                <CheckCircle2 className="size-10 text-emerald-500" />
              ) : (
                <XCircle className="size-10 text-red-500" />
              )}
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                KẾT QUẢ BÀI KIỂM TRA UNIT {unitTest.unit_number}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                {isPassed ? "CHÚC MỪNG: ĐẠT TIÊU CHUẨN MASTERY!" : "KẾT QUẢ: CHƯA ĐẠT (CẦN ÔN TẬP THÊM)"}
              </h2>
            </div>

            <div className="inline-flex items-baseline gap-2 py-2 px-6 rounded-2xl bg-card border border-border shadow-xs">
              <span className="text-4xl font-extrabold text-foreground">
                {result.totalScore}
              </span>
              <span className="text-muted-foreground text-sm font-semibold">
                / {result.maxScore} câu ({result.percentage}%)
              </span>
            </div>

            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isPassed
                ? `Bạn đã xuất sắc vượt qua bài kiểm tra Unit ${unitTest.unit_number} với tỷ lệ đúng ${result.percentage}% (ngưỡng đạt là 80%). Các kiến thức của Unit đã được làm chủ!`
                : `Điểm của bạn là ${result.percentage}%, chưa đạt ngưỡng tối thiểu 80% (16/20 câu). Bạn hãy xem lại các câu sai bên dưới và ôn tập các bài học liên quan trước khi thi lại.`}
            </p>
          </CardContent>
        </Card>

        {/* 4 Skills Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-4 space-y-1 text-center">
              <span className="text-xs text-muted-foreground">Nghe hiểu</span>
              <p className="text-xl font-bold text-foreground">
                {result.breakdown.listening.correct} / {result.breakdown.listening.total}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 space-y-1 text-center">
              <span className="text-xs text-muted-foreground">Từ vựng</span>
              <p className="text-xl font-bold text-foreground">
                {result.breakdown.vocabulary.correct} / {result.breakdown.vocabulary.total}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 space-y-1 text-center">
              <span className="text-xs text-muted-foreground">Ngữ pháp</span>
              <p className="text-xl font-bold text-foreground">
                {result.breakdown.grammar.correct} / {result.breakdown.grammar.total}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 space-y-1 text-center">
              <span className="text-xs text-muted-foreground">Đọc hiểu</span>
              <p className="text-xl font-bold text-foreground">
                {result.breakdown.reading.correct} / {result.breakdown.reading.total}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Chi tiết Đáp án &amp; Giải thích từng câu
          </h3>

          <div className="space-y-3">
            {result.questionResults.map((qr, idx) => {
              const q = questions.find((item) => item.id === qr.questionId);
              if (!q) return null;

              return (
                <div
                  key={qr.questionId}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    qr.isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Câu {idx + 1}:</span>
                      <Badge className="border border-border bg-transparent text-[10px] uppercase">
                        {qr.section}
                      </Badge>
                    </div>
                    {qr.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="size-4" /> Chính xác
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                        <XCircle className="size-4" /> Chưa đúng
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-foreground whitespace-pre-line text-sm">
                    {q.prompt}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border">
                      <span className="text-muted-foreground block text-[10px]">Câu bạn chọn:</span>
                      <span className={qr.isCorrect ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                        {qr.userChoice !== null ? q.choices[qr.userChoice] : "(Chưa trả lời)"}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-card border border-border">
                      <span className="text-muted-foreground block text-[10px]">Đáp án đúng:</span>
                      <span className="text-emerald-600 font-medium">
                        {q.choices[qr.correctChoice]}
                      </span>
                    </div>
                  </div>

                  {qr.explanationVi && (
                    <div className="p-2.5 rounded-lg bg-card/60 text-muted-foreground text-[11px] leading-relaxed border border-border/60">
                      <strong>Giải thích:</strong> {qr.explanationVi}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Lessons */}
        {!isPassed && result.recommendedLessons.length > 0 && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="size-4 text-primary" />
              Các bài học trọng tâm cần ôn tập:
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.recommendedLessons.map((lSlug) => (
                <Link
                  key={lSlug}
                  href={`/lessons/stage/${lSlug}`}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-semibold text-primary transition-colors"
                >
                  Học lại {lSlug}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
