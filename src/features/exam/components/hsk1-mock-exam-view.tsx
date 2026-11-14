"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Headphones,
  BookOpen,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton } from "@/components/mandarin-audio";
import { submitMockExamAction } from "../actions";
import type { MockExamDefinition, MockExamResult } from "../types";

export interface Hsk1MockExamViewProps {
  exam: MockExamDefinition;
}

export function Hsk1MockExamView({ exam }: Hsk1MockExamViewProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState<"all" | "listening" | "reading">("all");
  const [secondsRemaining, setSecondsRemaining] = useState(exam.duration_minutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [showListeningTranscripts, setShowListeningTranscripts] = useState(false);
  const [isPending, startTransition] = useTransition();

  const startTimeRef = useRef<number | null>(null);

  // Set startTime on mount
  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, []);

  const executeSubmission = useCallback(() => {
    const startedAt = startTimeRef.current ?? Date.now();
    const timeSpent = Math.min(
      exam.duration_minutes * 60,
      Math.floor((Date.now() - startedAt) / 1000)
    );

    startTransition(async () => {
      try {
        const res = await submitMockExamAction(answers, timeSpent);
        setResult(res);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Submission failed:", err);
      }
    });
  }, [answers, exam.duration_minutes]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          executeSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, executeSubmission]);

  const handleSelectAnswer = (questionId: string, choiceIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    const answeredCount = Object.keys(answers).length;
    if (
      answeredCount < exam.total_questions &&
      !window.confirm(
        `Bạn mới trả lời ${answeredCount}/${exam.total_questions} câu. Bạn có chắc chắn muốn nộp bài thi ngay không?`
      )
    ) {
      return;
    }

    executeSubmission();
  };

  const handleRetake = () => {
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);
    setSecondsRemaining(exam.duration_minutes * 60);
    startTimeRef.current = Date.now();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredQuestions = exam.questions.filter((q) => {
    if (currentSection === "listening") return q.section === "listening";
    if (currentSection === "reading") return q.section === "reading";
    return true;
  });

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* EXAM STICKY HEADER */}
      <div className="sticky top-16 z-20 rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                HSK 1 Official Format
              </Badge>
              <span className="text-xs text-muted-foreground">
                Đã làm: {answeredCount}/{exam.total_questions} câu
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-sm font-bold ${
                  secondsRemaining < 300
                    ? "bg-destructive/10 text-destructive border border-destructive/30 animate-pulse"
                    : "bg-muted text-foreground"
                }`}
              >
                <Clock className="size-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}

            {!isSubmitted ? (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-primary text-primary-foreground font-semibold px-4 rounded-xl min-h-10"
              >
                {isPending ? "Đang chấm điểm..." : "Nộp bài thi"}
              </Button>
            ) : (
              <Button
                onClick={handleRetake}
                variant="outline"
                className="gap-2 rounded-xl border-primary/30 text-primary"
              >
                <RotateCcw className="size-4" />
                Làm lại đề này
              </Button>
            )}
          </div>
        </div>

        {/* Question Palette Grid */}
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-2">Câu hỏi:</span>
          {exam.questions.map((q) => {
            const isAnswered = answers[q.id] !== undefined;
            const qResult = result?.questionResults.find((qr) => qr.questionId === q.id);

            let bgClass = "bg-muted text-muted-foreground hover:bg-muted/80";
            if (isSubmitted && qResult) {
              bgClass = qResult.isCorrect
                ? "bg-emerald-500 text-white font-bold"
                : "bg-destructive text-white font-bold";
            } else if (isAnswered) {
              bgClass = "bg-primary text-primary-foreground font-semibold";
            }

            return (
              <a
                key={q.id}
                href={`#question-${q.id}`}
                className={`flex size-6 sm:size-7 items-center justify-center rounded-lg text-xs transition-all ${bgClass}`}
              >
                {q.sort_order}
              </a>
            );
          })}
        </div>
      </div>

      {/* RESULT REPORT BANNER (IF SUBMITTED) */}
      {isSubmitted && result && (
        <div
          className={`rounded-3xl border p-6 sm:p-8 shadow-sm ${
            result.passed
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle2 className="size-6 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-6 text-amber-500" />
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {result.passed
                    ? "CHÚC MỪNG! BẠN ĐÃ ĐẠT CHUẨN HSK 1"
                    : "KẾT QUẢ THI THỬ: CHƯA ĐẠT"}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.passed
                  ? `Xuất sắc! Bạn đã đạt ${result.totalScore}/${result.maxScore} điểm (ngưỡng đỗ chính thức là ${exam.pass_score} điểm). Bạn đã làm chủ toàn diện 300 từ vựng và ngữ pháp HSK 1!`
                  : `Bạn đạt ${result.totalScore}/${result.maxScore} điểm (cần tối thiểu ${exam.pass_score} điểm để đạt). Hãy xem lại các câu giải thích chi tiết phía dưới để ôn luyện thêm!`}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center rounded-2xl bg-card border border-border px-5 py-3 shadow-xs">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block font-medium">
                  Tổng điểm
                </span>
                <span
                  className={`text-3xl font-extrabold ${
                    result.passed ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {result.totalScore}
                </span>
                <span className="text-xs text-muted-foreground block">/ {result.maxScore}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones className="size-5 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground block">Phần I: Nghe hiểu</span>
                  <span className="text-sm font-bold text-foreground">
                    {result.listeningCorrect}/20 câu đúng
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-primary">{result.listeningScore}/100</span>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="size-5 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground block">Phần II: Đọc hiểu</span>
                  <span className="text-sm font-bold text-foreground">
                    {result.readingCorrect}/20 câu đúng
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-primary">{result.readingScore}/100</span>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS & TRANSCRIPT TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={currentSection === "all" ? "default" : "outline"}
            onClick={() => setCurrentSection("all")}
            className="rounded-xl text-xs"
          >
            Tất cả 40 câu
          </Button>
          <Button
            size="sm"
            variant={currentSection === "listening" ? "default" : "outline"}
            onClick={() => setCurrentSection("listening")}
            className="rounded-xl text-xs gap-1.5"
          >
            <Headphones className="size-3.5" />
            Phần I: Nghe (1–20)
          </Button>
          <Button
            size="sm"
            variant={currentSection === "reading" ? "default" : "outline"}
            onClick={() => setCurrentSection("reading")}
            className="rounded-xl text-xs gap-1.5"
          >
            <BookOpen className="size-3.5" />
            Phần II: Đọc (21–40)
          </Button>
        </div>

        {/* Transcript toggle for listening (revealed only after submission for review) */}
        {isSubmitted && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowListeningTranscripts((prev) => !prev)}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {showListeningTranscripts ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {showListeningTranscripts ? "Ẩn Transcript Nghe" : "Hiện Transcript Nghe"}
          </Button>
        )}
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-5">
        {filteredQuestions.map((q) => {
          const userSelected = answers[q.id];
          const qResult = result?.questionResults.find((qr) => qr.questionId === q.id);

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`rounded-2xl border bg-card p-5 sm:p-6 shadow-xs scroll-mt-36 transition-all ${
                isSubmitted && qResult
                  ? qResult.isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-destructive/40 bg-destructive/5"
                  : userSelected !== undefined
                  ? "border-primary/40"
                  : "border-border"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge className="border border-border bg-muted/60 text-muted-foreground font-mono text-xs">
                    Câu {q.sort_order}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {q.section === "listening" ? "Phần I: Nghe hiểu" : "Phần II: Đọc hiểu"} · Dạng {q.part}
                  </span>
                </div>

                {isSubmitted && qResult && (
                  <Badge
                    className={
                      qResult.isCorrect
                        ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    }
                  >
                    {qResult.isCorrect ? "Đúng (+5đ)" : "Sai (0đ)"}
                  </Badge>
                )}
              </div>

              {/* Listening Audio Player */}
              {q.section === "listening" && q.audio_text && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Headphones className="size-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Bấm loa để nghe audio đề thi:
                    </span>
                    <MandarinAudioButton text={q.audio_text} />
                  </div>

                  {showListeningTranscripts && (
                    <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                      Audio: {q.audio_text}
                    </span>
                  )}
                </div>
              )}

              {/* Question Prompt */}
              <p className="mt-3.5 text-sm sm:text-base font-medium text-foreground whitespace-pre-line leading-relaxed">
                {q.prompt}
              </p>

              {/* Choices */}
              <div className="mt-4 space-y-2">
                {q.choices.map((choice, idx) => {
                  const isChosen = userSelected === idx;
                  const isTheCorrectOne = isSubmitted && qResult?.correctChoice === idx;
                  const isWrongChoice = isSubmitted && isChosen && !qResult?.isCorrect;

                  let choiceClass = "border-border hover:border-primary/40 hover:bg-muted/40 text-foreground";
                  if (isTheCorrectOne) {
                    choiceClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 font-semibold";
                  } else if (isWrongChoice) {
                    choiceClass = "border-destructive bg-destructive/15 text-destructive font-semibold";
                  } else if (isChosen) {
                    choiceClass = "border-primary bg-primary/10 text-primary font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectAnswer(q.id, idx)}
                      className={`w-full text-left rounded-xl border p-3 sm:p-3.5 text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${choiceClass}`}
                    >
                      <span className="min-w-0 flex-1 break-words">{choice}</span>
                      {isTheCorrectOne && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                      {isWrongChoice && <XCircle className="size-4 text-destructive shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when submitted) */}
              {isSubmitted && qResult && (
                <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground border border-border">
                  <span className="font-semibold text-foreground">Giải thích chi tiết: </span>
                  {qResult.explanationVi}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTION */}
      <div className="pt-6 flex justify-end">
        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full sm:w-auto min-h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-md text-sm"
          >
            {isPending ? "Đang xử lý nộp bài..." : "Hoàn thành & Nộp bài thi HSK 1"}
          </Button>
        ) : (
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex-1 sm:flex-none min-h-12 px-6 rounded-2xl border-primary/30 text-primary font-bold"
            >
              Làm lại bài thi
            </Button>
            <Link
              href="/roadmap"
              className="flex-1 sm:flex-none inline-flex min-h-12 items-center justify-center px-6 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              Xem Lộ trình học tập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
