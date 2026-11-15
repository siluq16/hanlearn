"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Headphones,
  Volume2,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton } from "@/components/mandarin-audio";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { savePracticeAttempt } from "../actions";
import type { PracticeSet, PracticeQuestion, DialogueTurn } from "../types";

interface PracticePlayerProps {
  practiceSet: PracticeSet;
}

export function PracticePlayer({ practiceSet }: PracticePlayerProps) {
  const isDialogue = practiceSet.skill === "dialogue" && practiceSet.turns;
  const isSpeaking = practiceSet.skill === "speaking";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Speaking state
  const [spokenDone, setSpokenDone] = useState<Record<number, boolean>>({});

  // Sentence ordering interactive state
  const [orderedTokenIndices, setOrderedTokenIndices] = useState<number[]>([]);

  // Matching pairs interactive state
  const [selectedLeftIdx, setSelectedLeftIdx] = useState<number | null>(null);
  const [matchedPairIndices, setMatchedPairIndices] = useState<number[]>([]);

  // Fill in the blank / text input state
  const [typedAnswer, setTypedAnswer] = useState("");

  // Dialogue roleplay state
  const [selectedRole, setSelectedRole] = useState<"A" | "B" | "ALL">("A");
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const { speak } = useMandarinSpeech();

  const questions: PracticeQuestion[] = practiceSet.questions || [];
  const turns: DialogueTurn[] = practiceSet.turns || [];
  const totalCount = isDialogue ? turns.length : questions.length;

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedChoice(idx);
    setIsAnswerChecked(true);

    if (currentQ && currentQ.correct_index === idx) {
      setScore((s) => s + 1);
    }
  };

  const cleanForComparison = (str?: string) =>
    (str || "").toLowerCase().replace(/[\s\.\,\!\?，。！？'’\-]/g, "");

  // Interactive Sentence Ordering Check
  const handleCheckSentenceOrder = () => {
    if (!currentQ?.tokens || isAnswerChecked) return;
    setIsAnswerChecked(true);
    const userSentence = orderedTokenIndices.map((i) => currentQ.tokens![i]).join("");
    const isCorrect = cleanForComparison(userSentence) === cleanForComparison(currentQ.targetSentence);
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  // Interactive Matching Pairs Selection
  const handleSelectMatchingLeft = (leftIdx: number) => {
    if (isAnswerChecked || matchedPairIndices.includes(leftIdx)) return;
    setSelectedLeftIdx(leftIdx);
  };

  const handleSelectMatchingRight = (rightIdx: number) => {
    if (isAnswerChecked || selectedLeftIdx === null) return;
    if (selectedLeftIdx === rightIdx) {
      const nextMatched = [...matchedPairIndices, selectedLeftIdx];
      setMatchedPairIndices(nextMatched);
      setSelectedLeftIdx(null);
      if (nextMatched.length === (currentQ.pairs?.length || 0)) {
        setIsAnswerChecked(true);
        setScore((s) => s + 1);
      }
    } else {
      setSelectedLeftIdx(null);
    }
  };

  // Interactive Text / Fill Blank Check
  const handleCheckTypedAnswer = () => {
    if (!typedAnswer.trim() || isAnswerChecked) return;
    setIsAnswerChecked(true);
    const cleanUser = cleanForComparison(typedAnswer);
    const cleanTarget = cleanForComparison(currentQ.targetText || currentQ.hanzi || currentQ.pinyin);
    const isCorrect = cleanUser === cleanTarget;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoice(null);
      setIsAnswerChecked(false);
      setOrderedTokenIndices([]);
      setSelectedLeftIdx(null);
      setMatchedPairIndices([]);
      setTypedAnswer("");
    } else {
      setIsFinished(true);
      const finalScore = isDialogue || isSpeaking ? totalCount : score + (currentQ?.correct_index === selectedChoice ? 0 : 0);
      savePracticeAttempt(practiceSet.practice_set_id, finalScore, totalCount, practiceSet.skill).catch(() => {});
    }
  };

  // DIALOGUE SCRIPTED ROLEPLAY VIEW
  if (isDialogue) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/practice?skill=dialogue"
            className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
          >
            <ArrowLeft className="size-4" />
            Về Trung tâm luyện tập
          </Link>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPinyin(!showPinyin)}
              className="text-xs h-8 gap-1"
            >
              {showPinyin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowVi(!showVi)}
              className="text-xs h-8 gap-1"
            >
              {showVi ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showVi ? "Ẩn Dịch" : "Hiện Dịch"}
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-2 pb-4 border-b border-border">
            <Badge className="w-fit bg-primary/10 text-primary font-medium">
              Luyện Hội thoại Đóng vai kịch bản
            </Badge>
            <CardTitle className="text-xl font-bold text-foreground">
              {practiceSet.title}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {practiceSet.description}
            </CardDescription>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-muted-foreground">Chọn vai của bạn:</span>
              {(["A", "B", "ALL"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === r
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {r === "A" ? "Đóng vai A" : r === "B" ? "Đóng vai B" : "Tất cả các vai"}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-4">
            {turns.map((turn, tIdx) => {
              const isMyTurn = selectedRole === "ALL" || turn.role === selectedRole;

              return (
                <div
                  key={tIdx}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isMyTurn
                      ? "border-primary/30 bg-primary/5 ml-4 sm:ml-8"
                      : "border-border bg-card mr-4 sm:mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${isMyTurn ? "text-primary" : "text-muted-foreground"}`}>
                      {turn.speaker} {isMyTurn ? "(Vai của bạn)" : "(Bạn đối thoại)"}
                    </span>
                    <MandarinAudioButton text={turn.hanzi} size="sm" />
                  </div>

                  <p className="hanzi text-lg sm:text-xl font-bold text-foreground">
                    {turn.hanzi}
                  </p>

                  {showPinyin && (
                    <p className="text-xs font-medium text-primary/90 font-mono">
                      {turn.pinyin}
                    </p>
                  )}

                  {showVi && (
                    <p className="text-xs text-muted-foreground">
                      {turn.vi}
                    </p>
                  )}

                  {isMyTurn && (
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => speak(turn.hanzi)}
                        className="text-[11px] h-7 gap-1 text-primary"
                      >
                        <Volume2 className="size-3.5" />
                        Nghe mẫu
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        Hãy đọc to theo lượt thoại của bạn!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-medium">
                {turns.length} lượt thoại đã hoàn tất
              </span>
              <Button
                type="button"
                onClick={() => {
                  savePracticeAttempt(practiceSet.practice_set_id, turns.length, turns.length, practiceSet.skill).catch(() => {});
                  alert("Chúc mừng bạn đã hoàn thành bài luyện hội thoại!");
                }}
                className="gap-1.5 text-xs font-semibold"
              >
                <CheckCircle2 className="size-4" />
                Hoàn thành phiên luyện tập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SUMMARY SCREEN
  if (isFinished) {
    const isPass = isSpeaking || score >= Math.ceil(totalCount * 0.7);

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in py-8">
        <Card className="border-primary/30 bg-card shadow-sm text-center">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Award className="size-9" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                KẾT QUẢ BỘ BÀI TẬP
              </span>
              <h2 className="text-2xl font-extrabold text-foreground mt-1">
                {isPass ? "XUẤT SẮC HOÀN THÀNH!" : "HOÀN THÀNH PHIÊN LUYỆN TẬP"}
              </h2>
            </div>

            <div className="inline-flex items-baseline gap-2 py-2 px-6 rounded-2xl bg-muted/60 border border-border">
              <span className="text-4xl font-extrabold text-foreground">
                {isSpeaking ? totalCount : score}
              </span>
              <span className="text-muted-foreground text-sm font-semibold">
                / {totalCount} câu
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Bạn có thể luyện lại bộ bài tập này bất kỳ lúc nào để nâng cao tốc độ phản xạ và độ chính xác!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedChoice(null);
                  setIsAnswerChecked(false);
                  setScore(0);
                  setIsFinished(false);
                }}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="size-3.5" />
                Luyện lại bộ này
              </Button>

              <Link
                href={`/practice?skill=${practiceSet.skill}`}
                className="inline-flex min-h-9 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity gap-1.5"
              >
                <span>Các bộ bài tiếp theo</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QUESTION-BY-QUESTION INTERACTIVE RUNNER
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in pb-16">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/practice?skill=${practiceSet.skill}`}
          className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Về danh sách bài tập
        </Link>

        <span className="text-xs font-medium text-muted-foreground">
          Câu {currentIndex + 1} / {totalCount}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
        />
      </div>

      <Card className="border-border shadow-xs">
        <CardHeader className="space-y-2 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Badge className="border border-border bg-transparent text-xs capitalize font-semibold">
              {practiceSet.skill} · {practiceSet.exercise_type.replace(/_/g, " ")}
            </Badge>
            <Badge className="bg-primary/10 text-primary text-[10px] uppercase font-bold">
              {practiceSet.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-foreground leading-relaxed whitespace-pre-line">
            {currentQ?.prompt}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          {/* Audio Player if present */}
          {currentQ?.audioText && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Headphones className="size-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Bấm nghe âm thanh mẫu:
                </span>
              </div>
              <MandarinAudioButton text={currentQ.audioText} size="sm" />
            </div>
          )}

          {/* Reading passage if present */}
          {currentQ?.passage && (
            <div className="p-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-line font-serif">
              {currentQ.passage}
            </div>
          )}

          {/* Target Hanzi / Pinyin Display if present */}
          {currentQ?.hanzi && (
            <div className="text-center py-3 bg-muted/30 rounded-xl border border-border/60 space-y-1">
              <p className="hanzi text-3xl font-bold text-foreground">
                {currentQ.hanzi}
              </p>
              {currentQ.pinyin && (
                <p className="text-xs font-mono font-semibold text-primary">
                  {currentQ.pinyin}
                </p>
              )}
            </div>
          )}

          {/* Speaking Practice Mode */}
          {isSpeaking && (
            <div className="space-y-4 text-center py-4">
              <p className="text-xs text-muted-foreground">
                Lắng nghe audio mẫu rồi đọc to câu trên theo giọng chuẩn:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {currentQ?.hanzi && (
                  <MandarinAudioButton
                    text={currentQ.hanzi}
                    size="sm"
                    className="rounded-xl px-4 py-2"
                  />
                )}
                <Button
                  type="button"
                  variant={spokenDone[currentIndex] ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSpokenDone((prev) => ({ ...prev, [currentIndex]: true }));
                    handleNext();
                  }}
                  className="gap-2 text-xs"
                >
                  <CheckCircle2 className="size-4" />
                  <span>{spokenDone[currentIndex] ? "Đã luyện xong ✓" : "Xác nhận đã luyện đọc"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Multiple Choices */}
          {currentQ?.choices && currentQ.choices.length > 0 && (
            <div className="space-y-2.5">
              {currentQ.choices.map((choice, cIdx) => {
                const isSelected = selectedChoice === cIdx;
                const isCorrect = currentQ.correct_index === cIdx;
                const showCorrect = isAnswerChecked && isCorrect;
                const showWrong = isAnswerChecked && isSelected && !isCorrect;

                return (
                  <button
                    key={cIdx}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => handleSelect(cIdx)}
                    className={`flex w-full items-center gap-3.5 p-3.5 rounded-xl border text-left text-sm transition-all ${
                      showCorrect
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : showWrong
                          ? "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 font-semibold"
                          : isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-card text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        showCorrect
                          ? "bg-emerald-500 text-white"
                          : showWrong
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {["A", "B", "C", "D"][cIdx] || `${cIdx + 1}`}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{choice}</span>
                    {showCorrect && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
                    {showWrong && <XCircle className="size-4 text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Interactive Sentence Ordering */}
          {currentQ?.tokens && currentQ.tokens.length > 0 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  Thứ tự câu của bạn (bấm vào từ để bỏ chọn):
                </span>
                <div className="min-h-14 rounded-xl border-2 border-dashed border-border bg-card p-3 flex flex-wrap gap-2 items-center">
                  {orderedTokenIndices.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      Bấm vào các từ bên dưới theo thứ tự để ghép thành câu...
                    </span>
                  ) : (
                    orderedTokenIndices.map((tIdx, seq) => (
                      <button
                        key={seq}
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => {
                          setOrderedTokenIndices((prev) => prev.filter((_, i) => i !== seq));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-xs transition-transform active:scale-95"
                      >
                        {currentQ.tokens![tIdx]}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Available tokens pool */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Từ vựng có sẵn:
                  </span>
                  {!isAnswerChecked && orderedTokenIndices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOrderedTokenIndices([])}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Xóa làm lại
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentQ.tokens.map((tok, tIdx) => {
                    const isPicked = orderedTokenIndices.includes(tIdx);
                    return (
                      <button
                        key={tIdx}
                        type="button"
                        disabled={isAnswerChecked || isPicked}
                        onClick={() => setOrderedTokenIndices((prev) => [...prev, tIdx])}
                        className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                          isPicked
                            ? "border-dashed border-border/40 text-muted-foreground/30 bg-muted/20 cursor-not-allowed"
                            : "border-border bg-card text-foreground hover:bg-muted shadow-xs active:scale-95"
                        }`}
                      >
                        {tok}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isAnswerChecked && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={orderedTokenIndices.length !== currentQ.tokens.length}
                    onClick={handleCheckSentenceOrder}
                    className="text-xs font-semibold px-5"
                  >
                    Kiểm tra câu
                  </Button>
                </div>
              )}

              {isAnswerChecked && currentQ.targetSentence && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground">Câu chuẩn:</span>
                  <p className="hanzi text-base font-bold text-foreground">{currentQ.targetSentence}</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Matching Pairs */}
          {currentQ?.pairs && currentQ.pairs.length > 0 && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Bấm vào 1 mục ở cột trái, sau đó bấm mục tương ứng ở cột phải để ghép cặp:
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Left Column */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Mục cần ghép</span>
                  {currentQ.pairs.map((p, idx) => {
                    const isMatched = matchedPairIndices.includes(idx);
                    const isSelected = selectedLeftIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isMatched || isAnswerChecked}
                        onClick={() => handleSelectMatchingLeft(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all ${
                          isMatched
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default"
                            : isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {p.left}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Nghĩa tương ứng</span>
                  {currentQ.pairs.map((p, idx) => {
                    const isMatched = matchedPairIndices.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isMatched || isAnswerChecked}
                        onClick={() => handleSelectMatchingRight(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${
                          isMatched
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {p.right}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Fill-in-the-blank / Dictation text input when no choices, tokens or pairs */}
          {(!currentQ?.choices || currentQ.choices.length === 0) &&
            !currentQ?.tokens &&
            !currentQ?.pairs &&
            !isSpeaking && (
              <div className="space-y-3 py-2">
                <label className="text-xs font-medium text-muted-foreground block">
                  Nhập câu trả lời (Hán tự hoặc Pinyin):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isAnswerChecked}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                  {!isAnswerChecked && (
                    <Button
                      type="button"
                      disabled={!typedAnswer.trim()}
                      onClick={handleCheckTypedAnswer}
                      className="text-xs font-semibold"
                    >
                      Kiểm tra
                    </Button>
                  )}
                </div>
              </div>
            )}

          {/* Explanation Banner */}
          {isAnswerChecked && currentQ?.explanation_vi && (
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs leading-relaxed text-muted-foreground space-y-1">
              <span className="font-bold text-foreground block">Giải thích:</span>
              <p>{currentQ.explanation_vi}</p>
            </div>
          )}

          {/* Next Button */}
          {(!isSpeaking) && isAnswerChecked && (
            <div className="pt-3 flex justify-end">
              <Button
                type="button"
                onClick={handleNext}
                className="gap-1.5 text-xs font-semibold px-5"
              >
                <span>{currentIndex === totalCount - 1 ? "Xem kết quả" : "Câu tiếp theo"}</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
