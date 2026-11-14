"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import type { LibraryExercise, ExerciseOption } from "@/features/content-library/types";

interface ExerciseEngineProps {
  exercises: LibraryExercise[];
  title?: string;
  onComplete?: (result: { total: number; correct: number }) => void;
}

export function ExerciseEngine({
  exercises,
  onComplete,
}: ExerciseEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // For sentence ordering
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);

  // Audio speech hook
  const { speak, preferredRate } = useMandarinSpeech();

  const currentExercise = exercises[currentIndex];
  const progressPercent = exercises.length
    ? Math.round((currentIndex / exercises.length) * 100)
    : 0;

  if (!exercises.length) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Không có bài tập nào để hiển thị.</p>
      </Card>
    );
  }

  // --- SUMMARY SCREEN ---
  if (isCompleted) {
    const total = exercises.length;
    const isPass = score >= total * 0.7;

    return (
      <Card className="border-border shadow-xs text-center p-8 space-y-6 max-w-xl mx-auto">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          {isPass ? <Award className="size-8" /> : <Sparkles className="size-8" />}
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Hoàn thành bài luyện tập!</CardTitle>
          <CardDescription className="mt-1">
            Bạn đã trả lời đúng {score} trên {total} câu ({Math.round((score / total) * 100)}%).
          </CardDescription>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOptionId(null);
              setIsAnswered(false);
              setIsCorrect(false);
              setScore(0);
              setSelectedTokenIds([]);
              setIsCompleted(false);
            }}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="size-4 mr-2" />
            Luyện tập lại
          </Button>
        </div>
      </Card>
    );
  }

  // Handle standard option click
  function handleSelectOption(option: ExerciseOption) {
    if (isAnswered) return;
    setSelectedOptionId(option.id);
    setIsAnswered(true);
    const correct = option.isCorrect;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  }

  // Handle sentence order click
  function handleToggleToken(tokenId: string) {
    if (isAnswered) return;
    if (selectedTokenIds.includes(tokenId)) {
      setSelectedTokenIds((prev) => prev.filter((id) => id !== tokenId));
    } else {
      setSelectedTokenIds((prev) => [...prev, tokenId]);
    }
  }

  function handleCheckSentenceOrder() {
    if (!currentExercise.orderTokens || isAnswered) return;
    setIsAnswered(true);
    // Check if the order matches correctIndex
    const sortedTokens = [...currentExercise.orderTokens].sort((a, b) => a.correctIndex - b.correctIndex);
    const correctIds = sortedTokens.map((t) => t.id);
    const isMatch =
      correctIds.length === selectedTokenIds.length &&
      correctIds.every((id, idx) => id === selectedTokenIds[idx]);

    setIsCorrect(isMatch);
    if (isMatch) setScore((prev) => prev + 1);
  }

  function handleNext() {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedTokenIds([]);

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      onComplete?.({ total: exercises.length, correct: score + (isCorrect ? 0 : 0) });
    }
  }

  return (
    <Card className="border-border shadow-xs max-w-2xl mx-auto">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <Badge className="px-2.5 py-0.5">
            Câu {currentIndex + 1} / {exercises.length}
          </Badge>
          <span className="text-muted-foreground font-medium">
            {currentExercise.kind === "vocab-mcq"
              ? "Trắc nghiệm từ vựng"
              : currentExercise.kind === "sentence-order"
                ? "Sắp xếp câu"
                : currentExercise.kind === "grammar-choice"
                  ? "Ngữ pháp"
                  : currentExercise.kind === "dialogue-response"
                    ? "Hội thoại"
                    : currentExercise.kind === "reading-mcq"
                      ? "Đọc hiểu"
                      : "Luyện tập"}
          </span>
        </div>
        <Progress value={progressPercent} label={`Tiến độ câu ${currentIndex + 1}`} />
        <CardTitle className="text-base font-semibold text-foreground pt-1">
          {currentExercise.promptVi}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Target Content Display (Hanzi, Audio) */}
        {currentExercise.targetContent?.hanzi && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-6 text-center space-y-2">
            <h3 className="hanzi font-serif text-3xl sm:text-4xl font-bold text-foreground">
              {currentExercise.targetContent.hanzi}
            </h3>
            {currentExercise.targetContent.pinyin && (
              <p className="text-primary font-medium text-base">
                {currentExercise.targetContent.pinyin}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => speak(currentExercise.targetContent?.hanzi || "", preferredRate)}
              className="mt-2 text-xs"
            >
              <Volume2 className="size-3.5 mr-1.5" />
              Nghe phát âm
            </Button>
          </div>
        )}

        {/* 1. Sentence Ordering Mode */}
        {currentExercise.kind === "sentence-order" && currentExercise.orderTokens && (
          <div className="space-y-4">
            {/* Selected tokens display area */}
            <div className="min-h-16 rounded-xl border-2 border-dashed border-border bg-card p-3 flex flex-wrap gap-2 items-center">
              {selectedTokenIds.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  Bấm vào các từ bên dưới theo thứ tự đúng để tạo thành câu...
                </span>
              ) : (
                selectedTokenIds.map((id) => {
                  const token = currentExercise.orderTokens?.find((t) => t.id === id);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleToggleToken(id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-xs"
                    >
                      {token?.text}
                    </button>
                  );
                })
              )}
            </div>

            {/* Available tokens pool */}
            <div className="flex flex-wrap gap-2">
              {currentExercise.orderTokens.map((token) => {
                const isPicked = selectedTokenIds.includes(token.id);
                return (
                  <button
                    key={token.id}
                    type="button"
                    disabled={isAnswered || isPicked}
                    onClick={() => handleToggleToken(token.id)}
                    className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                      isPicked
                        ? "border-dashed border-border/40 text-muted-foreground/40 bg-muted/30 cursor-not-allowed"
                        : "border-border bg-card hover:bg-muted text-foreground shadow-xs"
                    }`}
                  >
                    {token.text}
                  </button>
                );
              })}
            </div>

            {!isAnswered && (
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleCheckSentenceOrder}
                  disabled={selectedTokenIds.length === 0}
                >
                  Kiểm tra câu
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 2. Standard Multiple Choice Options */}
        {currentExercise.options && currentExercise.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentExercise.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let btnClass = "border-border hover:bg-muted text-foreground";
              if (isAnswered) {
                if (opt.isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold";
                } else if (isSelected && !opt.isCorrect) {
                  btnClass = "border-destructive bg-destructive/15 text-destructive font-semibold";
                } else {
                  btnClass = "border-border opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`flex items-center justify-between min-h-14 p-4 rounded-xl border text-left text-sm transition-all shadow-xs ${btnClass}`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle className="size-4 text-destructive shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Section after answering */}
        {isAnswered && (
          <div
            className={`rounded-xl border p-4 text-sm space-y-1.5 animate-in fade-in-50 ${
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Chính xác! Làm rất tốt.</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4" />
                  <span>Chưa chính xác. Hãy quan sát lại câu hỏi và ghi nhớ nhé.</span>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button type="button" onClick={handleNext} className="font-semibold">
                <span>{currentIndex + 1 < exercises.length ? "Câu tiếp theo" : "Xem tổng kết"}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
