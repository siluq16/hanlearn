"use client";

import { useEffect, useState } from "react";
import {
  Volume2,
  VolumeX,
  Snail,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Headphones,
  Award,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MandarinAudioButton,
  MandarinSpeedToggle,
} from "@/components/mandarin-audio";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { stopMandarin, MANDARIN_RATES } from "@/lib/mandarin-speech";
import type {
  ListeningCurriculumData,
  ListeningQuestion,
  ListeningQuestionType,
  ListeningSessionConfig,
} from "../types";
import { generateListeningSession } from "../generator";

interface ListeningPlayerProps {
  curriculum: ListeningCurriculumData;
  initialLessonId?: string;
}

type SessionStage = "setup" | "playing" | "summary";

export function ListeningPlayer({
  curriculum,
  initialLessonId,
}: ListeningPlayerProps) {
  // Configuration State
  const [stage, setStage] = useState<SessionStage>("setup");
  const [selectedLessonId, setSelectedLessonId] = useState<string | "all">(
    initialLessonId || "all",
  );
  const [selectedType, setSelectedType] = useState<ListeningQuestionType | "all">(
    "all",
  );
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Playing Session State
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>
  >([]);

  // Speech hook
  const {
    speak,
    stop,
    isPlaying,
    currentRate,
    preferredRate,
    isSlowMode,
    setPreferredRate,
    isSupported,
    hasVoice,
    errorMessage,
  } = useMandarinSpeech();

  // Stop audio on unmount or stage change
  useEffect(() => {
    return () => {
      stopMandarin();
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const wrongCount = answers.filter((a) => !a.isCorrect).length;
  const progressPercent = questions.length
    ? Math.round((currentIndex / questions.length) * 100)
    : 0;

  // Handlers
  function startSession() {
    stopMandarin();
    const config: ListeningSessionConfig = {
      lessonId: selectedLessonId,
      questionType: selectedType,
      questionCount,
    };
    const generated = generateListeningSession(config, curriculum);
    if (!generated.length) return;

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setAnswers([]);
    setStage("playing");
  }

  function handlePlayAudio(explicitRate?: number) {
    if (!currentQuestion) return;
    const targetRate = explicitRate ?? preferredRate;
    if (isPlaying && currentRate === targetRate) {
      stop();
    } else {
      speak(currentQuestion.audioText, targetRate);
    }
  }

  function handleSelectOption(optionId: string) {
    if (isSubmitted) return;
    setSelectedOptionId(optionId);
    setIsSubmitted(true);

    const chosen = currentQuestion.options.find((o) => o.id === optionId);
    const isCorrect = chosen?.isCorrect ?? false;

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        isCorrect,
      },
    ]);
  }

  function handleNext() {
    stopMandarin();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    } else {
      setStage("summary");
    }
  }

  function handleRestartCurrentConfig() {
    startSession();
  }

  function handleExitToSetup() {
    stopMandarin();
    setStage("setup");
  }

  // --- 1. SETUP STAGE ---
  if (stage === "setup") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Headphones className="size-6 text-primary" />
                  Thiết lập bài luyện nghe
                </CardTitle>
                <CardDescription>
                  Chọn bài học và dạng câu hỏi để rèn luyện phản xạ nghe tiếng Trung HSK 1.
                </CardDescription>
              </div>
              <MandarinSpeedToggle />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Warning if no voice */}
            {(!isSupported || !hasVoice) && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <VolumeX className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Chưa phát hiện giọng phát âm tiếng Trung zh-CN</p>
                  <p className="mt-1 text-xs opacity-90 leading-relaxed">
                    {errorMessage ||
                      "Thiết bị hoặc trình duyệt của bạn chưa cài đặt giọng đọc tiếng Trung. Để trải nghiệm tính năng luyện nghe tốt nhất, bạn nên dùng Google Chrome, Microsoft Edge hoặc cài đặt gói ngôn ngữ Chinese (Simplified) trên Windows."}
                  </p>
                </div>
              </div>
            )}

            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                1. Phạm vi nội dung HSK 1
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedLessonId("all")}
                  data-testid="scope-all"
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-colors ${
                    selectedLessonId === "all"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span>Toàn bộ HSK 1 (43 từ HSK + 1 từ bổ trợ & đàm thoại)</span>
                  {selectedLessonId === "all" && <CheckCircle2 className="size-4 text-primary" />}
                </button>

                {curriculum.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    data-testid={`scope-lesson-${lesson.sortOrder}`}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-colors ${
                      selectedLessonId === lesson.id
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="truncate">
                      Bài {lesson.sortOrder}: {lesson.title.split("—")[0].trim()}
                    </span>
                    {selectedLessonId === lesson.id && (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                2. Dạng bài luyện nghe
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  data-testid="type-all"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "all"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Tất cả các dạng bài</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Kết hợp nghe chọn nghĩa, chọn chữ Hán và câu đàm thoại
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("word_to_meaning")}
                  data-testid="type-word-to-meaning"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "word_to_meaning"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Dạng A: Nghe chọn nghĩa tiếng Việt</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Phát âm từ vựng $\rightarrow$ chọn nghĩa tiếng Việt đúng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("word_to_hanzi")}
                  data-testid="type-word-to-hanzi"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "word_to_hanzi"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Dạng B: Nghe chọn chữ Hán</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Phát âm từ vựng $\rightarrow$ chọn chữ Hán tương ứng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("sentence_comprehension")}
                  data-testid="type-sentence-comprehension"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "sentence_comprehension"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Dạng C: Nghe câu đàm thoại</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Phát âm câu hội thoại $\rightarrow$ chọn câu trả lời đúng
                  </span>
                </button>
              </div>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                3. Số lượng câu hỏi mỗi phiên
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    data-testid={`count-${n}`}
                    className={`min-h-11 min-w-16 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                      questionCount === n
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {n} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              type="button"
              onClick={startSession}
              data-testid="start-listening-btn"
              className="min-h-12 w-full text-base font-semibold"
            >
              <Headphones className="size-5 mr-2" />
              Bắt đầu luyện nghe
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 2. SUMMARY STAGE ---
  if (stage === "summary") {
    const total = questions.length;
    const scorePercent = total ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="mx-auto max-w-3xl space-y-6" data-testid="listening-summary">
        <Card className="border-border text-center shadow-xs">
          <CardHeader className="space-y-3 pb-4">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              {scorePercent >= 80 ? (
                <Award className="size-8" />
              ) : (
                <Sparkles className="size-8" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              {scorePercent === 100
                ? "Xuất sắc! Bạn đúng toàn bộ câu hỏi."
                : scorePercent >= 70
                  ? "Rất tốt! Khả năng nghe đang tiến bộ rõ rệt."
                  : "Đã hoàn thành phiên luyện nghe!"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Kết quả phiên: {correctCount}/{total} câu đúng ({scorePercent}%)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" /> {correctCount} đúng
              </span>
              <span className="flex items-center gap-1.5 font-medium text-destructive">
                <XCircle className="size-4" /> {wrongCount} chưa đúng
              </span>
            </div>

            {/* Review of all practiced questions */}
            <div className="space-y-3 text-left">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Xem lại danh sách từ & câu đã luyện:
              </h3>
              <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
                {questions.map((q) => {
                  const ans = answers.find((a) => a.questionId === q.id);
                  const isCorrect = ans?.isCorrect ?? false;

                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                            isCorrect
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {isCorrect ? "✓" : "✗"}
                        </span>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="hanzi font-serif text-lg font-semibold">
                              {q.reveal.hanzi}
                            </span>
                            <span className="text-xs text-primary font-medium">
                              {q.reveal.pinyin}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {q.reveal.meaningVi}
                          </p>
                        </div>
                      </div>

                      <MandarinAudioButton
                        text={q.reveal.hanzi}
                        showSlow
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={handleRestartCurrentConfig}
                className="min-h-12 w-full sm:flex-1"
                data-testid="restart-listening-btn"
              >
                <RotateCcw className="size-4 mr-2" />
                Luyện lại bài này
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExitToSetup}
                className="min-h-12 w-full sm:flex-1"
                data-testid="exit-to-setup-btn"
              >
                Chọn bài luyện khác
              </Button>
              <Button
                asChild
                variant="ghost"
                className="min-h-12 w-full sm:w-auto"
              >
                <a href="/dashboard">Về Tổng quan</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 3. PLAYING SESSION STAGE ---
  if (!currentQuestion) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6" data-testid="listening-session-screen">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleExitToSetup}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Thoát
        </button>

        <div className="flex items-center gap-3">
          <Badge className="text-xs">
            Câu {currentIndex + 1} / {questions.length}
          </Badge>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ {correctCount}
          </span>
          <span className="text-xs font-semibold text-destructive">
            ✗ {wrongCount}
          </span>
        </div>

        <MandarinSpeedToggle />
      </div>

      <Progress value={progressPercent} label={`Câu ${currentIndex + 1} trên ${questions.length}`} />

      {/* Audio Player Question Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="space-y-6 p-6 sm:p-8 text-center">
          <p className="text-sm font-semibold text-muted-foreground" data-testid="question-prompt">
            {currentQuestion.prompt}
          </p>

          {/* Primary Audio Player Controls */}
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <Button
              type="button"
              data-testid="play-audio-btn"
              onClick={() => handlePlayAudio()}
              className={`min-h-16 px-8 rounded-2xl text-base font-semibold shadow-xs transition-all ${
                isPlaying
                  ? "bg-primary text-primary-foreground animate-pulse scale-105"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {isSlowMode ? (
                <Snail className="size-6 mr-2.5" />
              ) : (
                <Volume2 className="size-6 mr-2.5" />
              )}
              <span>
                {isPlaying
                  ? "Đang phát... (Bấm để dừng)"
                  : `Phát âm (${isSlowMode ? "0.55x" : "1.0x"})`}
              </span>
            </Button>

            {/* Quick replay / alternate speed */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Có thể nghe lại nhiều lần.</span>
              <button
                type="button"
                data-testid="alt-speed-btn"
                onClick={() => {
                  const altRate = isSlowMode
                    ? MANDARIN_RATES.NORMAL
                    : MANDARIN_RATES.SLOW;
                  setPreferredRate(altRate);
                  handlePlayAudio(altRate);
                }}
                className="underline hover:text-foreground font-medium"
              >
                Nghe ở {isSlowMode ? "1.0x" : "0.55x"}
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="grid gap-3 pt-2 text-left" role="radiogroup" aria-label="Các lựa chọn đáp án">
            {currentQuestion.options.map((opt, idx) => {
              const letter = ["A", "B", "C", "D"][idx] || String(idx + 1);
              const isSelected = selectedOptionId === opt.id;
              let optionStyle =
                "border-border bg-card hover:bg-muted text-foreground";

              if (isSubmitted) {
                if (opt.isCorrect) {
                  optionStyle =
                    "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs";
                } else if (isSelected) {
                  optionStyle =
                    "border-destructive bg-destructive/10 text-destructive line-through";
                } else {
                  optionStyle = "border-border opacity-50";
                }
              } else if (isSelected) {
                optionStyle = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt.id)}
                  data-testid={`option-${idx}`}
                  data-correct={opt.isCorrect ? "true" : "false"}
                  className={`flex min-h-14 items-center justify-between rounded-xl border p-4 text-left transition-all ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className={`${currentQuestion.type === "word_to_hanzi" ? "hanzi text-2xl font-serif" : "text-sm sm:text-base"}`}>
                      {opt.text}
                    </span>
                  </div>

                  {isSubmitted && opt.isCorrect && (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {isSubmitted && isSelected && !opt.isCorrect && (
                    <XCircle className="size-5 shrink-0 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Reveal & Explanation Section (Shown after submitting) */}
          {isSubmitted && (
            <div
              className="mt-6 rounded-2xl border border-border bg-muted/60 p-5 text-left space-y-4 animate-in fade-in-50 duration-200"
              data-testid="reveal-section"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span
                      lang="zh-Hans"
                      className="hanzi font-serif text-3xl font-bold leading-normal text-foreground"
                      data-testid="revealed-hanzi"
                    >
                      {currentQuestion.reveal.hanzi}
                    </span>
                    <span
                      className="text-primary font-semibold text-lg"
                      data-testid="revealed-pinyin"
                    >
                      {currentQuestion.reveal.pinyin}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {currentQuestion.reveal.meaningVi}
                  </p>
                </div>

                <MandarinAudioButton
                  text={currentQuestion.reveal.hanzi}
                  showSlow
                  size="sm"
                  variant="outline"
                />
              </div>

              {currentQuestion.reveal.explanation && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentQuestion.reveal.explanation}
                </p>
              )}

              <Button
                type="button"
                onClick={handleNext}
                data-testid="next-question-btn"
                className="min-h-12 w-full text-base font-semibold"
              >
                <span>
                  {currentIndex + 1 < questions.length
                    ? "Tiếp tục"
                    : "Xem kết quả"}
                </span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
