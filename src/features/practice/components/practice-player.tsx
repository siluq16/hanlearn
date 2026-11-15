"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Headphones,
  Award,
  Eye,
  EyeOff,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton } from "@/components/mandarin-audio";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { savePracticeAttempt } from "../actions";
import {
  resolvePracticePresentationMode,
  type PracticeSet,
  type PracticeQuestion,
  type DialogueTurn,
  type PracticePresentationMode,
} from "../types";
import { QuestionNavigator, type QuestionStatus } from "./question-navigator";

interface PracticePlayerProps {
  practiceSet: PracticeSet;
}

export function PracticePlayer({ practiceSet }: PracticePlayerProps) {
  const mode: PracticePresentationMode = useMemo(
    () => resolvePracticePresentationMode(practiceSet),
    [practiceSet]
  );

  const isDialogue = mode === "dialogue_roleplay";
  const isSpeaking = practiceSet.skill === "speaking";

  const questions: PracticeQuestion[] = practiceSet.questions || [];
  const turns: DialogueTurn[] = practiceSet.turns || [];
  const totalCount = isDialogue ? turns.length : questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({
    0: "active",
  });
  const [userAnswers, setUserAnswers] = useState<Record<number, string | number | number[]>>({});
  const [isAnswerCheckedMap, setIsAnswerCheckedMap] = useState<Record<number, boolean>>({});
  const [scoreMap, setScoreMap] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Audio / Speech
  const { setPreferredRate } = useMandarinSpeech();
  const [audioSpeed, setAudioSpeed] = useState<0.55 | 1.0>(1.0);

  // Global display toggles
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(false);

  // Mobile passage drawer for Reading Mode
  const [isMobilePassageOpen, setIsMobilePassageOpen] = useState(false);

  // Interactive Matching Pairs Selection State
  const [selectedLeftIdx, setSelectedLeftIdx] = useState<number | null>(null);
  const [mismatchPair, setMismatchPair] = useState<{ leftIdx: number; rightIdx: number } | null>(null);

  // Dialogue roleplay state
  const [selectedRole, setSelectedRole] = useState<"A" | "B" | "ALL">("A");

  const currentQ = questions[currentIndex];
  const isCurrentChecked = !!isAnswerCheckedMap[currentIndex];
  const currentSelectedChoice = typeof userAnswers[currentIndex] === "number" ? (userAnswers[currentIndex] as number) : null;

  // Question-specific derived answer values
  const orderedTokenIndices: number[] = Array.isArray(userAnswers[currentIndex])
    ? (userAnswers[currentIndex] as number[])
    : [];
  const matchedPairIndices: number[] = Array.isArray(userAnswers[currentIndex])
    ? (userAnswers[currentIndex] as number[])
    : [];
  const typedAnswer: string = typeof userAnswers[currentIndex] === "string"
    ? (userAnswers[currentIndex] as string)
    : "";

  // Shuffled right column for matching pairs
  const shuffledRightIndices = useMemo(() => {
    if (!currentQ?.pairs || currentQ.pairs.length <= 1) {
      return (currentQ?.pairs || []).map((_, i) => i);
    }
    const len = currentQ.pairs.length;
    return Array.from({ length: len }, (_, i) => (i + 1) % len);
  }, [currentQ]);

  // Shared stimulus resolution (passage or audio)
  const sharedPassage = useMemo(() => {
    if (practiceSet.stimulus?.content) {
      return {
        title: practiceSet.stimulus.title || practiceSet.title,
        text: practiceSet.stimulus.content,
        paragraphs: practiceSet.stimulus.paragraphs,
        pinyin: practiceSet.stimulus.pinyin,
        translationVi: practiceSet.stimulus.translationVi,
      };
    }
    // Fallback: Check if questions share the same passage
    const firstPassageQ = questions.find((q) => q.passage);
    if (firstPassageQ?.passage) {
      return {
        title: practiceSet.title,
        text: firstPassageQ.passage,
        paragraphs: firstPassageQ.passage.split("\n\n"),
        pinyin: firstPassageQ.pinyin,
        translationVi: firstPassageQ.meaning_vi,
      };
    }
    return null;
  }, [practiceSet, questions]);

  const sharedAudioText = useMemo(() => {
    return (
      practiceSet.stimulus?.audioText ||
      (mode === "listening_comprehension" ? questions[0]?.audioText : null)
    );
  }, [practiceSet, questions, mode]);

  const cleanForComparison = (str?: string) =>
    (str || "").toLowerCase().replace(/[\s\.\,\!\?，。！？'’\-]/g, "");

  // Multiple Choice Selection (allows changing selection before checking)
  const handleSelectChoice = (cIdx: number) => {
    if (isCurrentChecked) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: cIdx }));
  };

  // Multiple Choice Check (explicit "Kiểm tra" button)
  const handleCheckChoice = () => {
    if (currentSelectedChoice === null || isCurrentChecked) return;
    setIsAnswerCheckedMap((prev) => ({ ...prev, [currentIndex]: true }));

    const isCorrect = currentQ && currentQ.correct_index === currentSelectedChoice;
    setScoreMap((prev) => ({ ...prev, [currentIndex]: !!isCorrect }));
    setQuestionStatuses((prev) => ({ ...prev, [currentIndex]: "completed" }));
  };

  // Sentence Ordering Check
  const handleCheckSentenceOrder = () => {
    if (!currentQ?.tokens || isCurrentChecked) return;
    setIsAnswerCheckedMap((prev) => ({ ...prev, [currentIndex]: true }));
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: orderedTokenIndices }));

    const userSentence = orderedTokenIndices.map((i) => currentQ.tokens![i]).join("");
    const isCorrect = cleanForComparison(userSentence) === cleanForComparison(currentQ.targetSentence);
    setScoreMap((prev) => ({ ...prev, [currentIndex]: isCorrect }));
    setQuestionStatuses((prev) => ({ ...prev, [currentIndex]: "completed" }));
  };

  // Matching Selection
  const handleSelectMatchingLeft = (leftIdx: number) => {
    if (isCurrentChecked || matchedPairIndices.includes(leftIdx)) return;
    if (selectedLeftIdx === leftIdx) {
      setSelectedLeftIdx(null);
      return;
    }
    setSelectedLeftIdx(leftIdx);
    setMismatchPair(null);
  };

  const handleSelectMatchingRight = (rightIdx: number) => {
    if (isCurrentChecked || selectedLeftIdx === null) return;
    if (selectedLeftIdx === rightIdx) {
      const nextMatched = [...matchedPairIndices, selectedLeftIdx];
      setSelectedLeftIdx(null);
      setMismatchPair(null);
      setUserAnswers((prev) => ({ ...prev, [currentIndex]: nextMatched }));
    } else {
      setMismatchPair({ leftIdx: selectedLeftIdx, rightIdx });
      setTimeout(() => {
        setMismatchPair(null);
        setSelectedLeftIdx(null);
      }, 600);
    }
  };

  // Matching Check (explicit "Kiểm tra" button)
  const handleCheckMatching = () => {
    if (!currentQ?.pairs || isCurrentChecked) return;
    if (matchedPairIndices.length !== currentQ.pairs.length) return;
    setIsAnswerCheckedMap((prev) => ({ ...prev, [currentIndex]: true }));
    setScoreMap((prev) => ({ ...prev, [currentIndex]: true }));
    setQuestionStatuses((prev) => ({ ...prev, [currentIndex]: "completed" }));
  };

  // Typed Answer Check
  const handleCheckTypedAnswer = () => {
    if (!typedAnswer.trim() || isCurrentChecked) return;
    setIsAnswerCheckedMap((prev) => ({ ...prev, [currentIndex]: true }));
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: typedAnswer }));

    const cleanUser = cleanForComparison(typedAnswer);
    const cleanTarget = cleanForComparison(currentQ.targetText || currentQ.hanzi || currentQ.pinyin);
    const isCorrect =
      cleanUser === cleanTarget ||
      Boolean(
        currentQ.acceptedAnswers &&
        Array.isArray(currentQ.acceptedAnswers) &&
        currentQ.acceptedAnswers.some(
          (alt: string) => cleanUser === cleanForComparison(alt)
        )
      );

    setScoreMap((prev) => ({ ...prev, [currentIndex]: isCorrect }));
    setQuestionStatuses((prev) => ({ ...prev, [currentIndex]: "completed" }));
  };

  // Check if current question has an answer supplied
  const hasCurrentAnswer = useMemo(() => {
    if (currentQ?.choices && currentQ.choices.length > 0) {
      return currentSelectedChoice !== null;
    }
    if (currentQ?.tokens && currentQ.tokens.length > 0) {
      return orderedTokenIndices.length === currentQ.tokens.length && orderedTokenIndices.length > 0;
    }
    if (currentQ?.pairs && currentQ.pairs.length > 0) {
      return matchedPairIndices.length === currentQ.pairs.length && matchedPairIndices.length > 0;
    }
    if (!currentQ?.choices && !currentQ?.tokens && !currentQ?.pairs) {
      return typedAnswer.trim().length > 0;
    }
    return false;
  }, [currentQ, currentSelectedChoice, orderedTokenIndices, matchedPairIndices, typedAnswer]);

  // Unified Check Handler for current question
  const handleCheckCurrent = () => {
    if (isCurrentChecked || !hasCurrentAnswer) return;
    if (currentQ?.choices && currentQ.choices.length > 0) {
      handleCheckChoice();
    } else if (currentQ?.tokens && currentQ.tokens.length > 0) {
      handleCheckSentenceOrder();
    } else if (currentQ?.pairs && currentQ.pairs.length > 0) {
      handleCheckMatching();
    } else {
      handleCheckTypedAnswer();
    }
  };

  // Navigation: Jump to Question
  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < totalCount) {
      setSelectedLeftIdx(null);
      setMismatchPair(null);
      setCurrentIndex(index);
      setQuestionStatuses((prev) => ({
        ...prev,
        [index]: prev[index] === "completed" ? "completed" : "active",
      }));
    }
  };

  // Navigation: Skip Question
  const handleSkipQuestion = () => {
    if (!isCurrentChecked) {
      setQuestionStatuses((prev) => ({ ...prev, [currentIndex]: "skipped" }));
    }
    if (currentIndex < totalCount - 1) {
      handleJumpToQuestion(currentIndex + 1);
    }
  };

  // Navigation: Next or Finish
  const handleNextOrFinish = () => {
    if (currentIndex < totalCount - 1) {
      handleJumpToQuestion(currentIndex + 1);
    } else {
      // Calculate final score
      const totalCorrect = Object.values(scoreMap).filter(Boolean).length;
      const finalScore = isDialogue || isSpeaking ? totalCount : totalCorrect;
      setIsFinished(true);
      savePracticeAttempt(practiceSet.practice_set_id, finalScore, totalCount, practiceSet.skill).catch(
        () => { }
      );
    }
  };

  // Total correct score computed
  const totalCorrect = Object.values(scoreMap).filter(Boolean).length;
  const completedCount = Object.values(questionStatuses).filter((s) => s === "completed").length;
  const isPass = totalCorrect >= Math.ceil(totalCount * 0.75);

  // 1. DIALOGUE SCRIPTED ROLEPLAY PRESENTATION (Mode 5)
  if (isDialogue) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/practice?skill=dialogue&unit=${practiceSet.unit_id}`}
            prefetch={false}
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

        <Card className="border-border shadow-xs">
          <CardHeader className="space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary font-medium text-xs">
                Luyện Hội thoại Đóng vai kịch bản
              </Badge>
              <Badge className="text-xs uppercase bg-muted text-muted-foreground font-bold">
                {practiceSet.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedRole === r
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
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${isMyTurn
                    ? "border-primary/40 bg-primary/5 ml-4 sm:ml-8 ring-1 ring-primary/20"
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
                </div>
              );
            })}

            <div className="pt-4 flex justify-end border-t border-border">
              <Button
                type="button"
                onClick={() => {
                  savePracticeAttempt(practiceSet.practice_set_id, totalCount, totalCount, "dialogue").catch(() => { });
                  setIsFinished(true);
                }}
                className="gap-2 text-xs font-semibold px-6"
              >
                <span>Hoàn thành phiên luyện tập</span>
                <CheckCircle2 className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. PRACTICE SUMMARY VIEW UPON COMPLETION
  if (isFinished) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center animate-in zoom-in-95 pb-16">
        <Card className="border-border shadow-md">
          <CardContent className="p-8 space-y-6">
            <div className="mx-auto size-16 rounded-full bg-primary/10 grid place-items-center text-primary shadow-xs">
              <Award className="size-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                KẾT QUẢ BỘ BÀI TẬP
              </span>
              <h2 className="text-2xl font-extrabold text-foreground mt-1">
                {isPass ? "XUẤT SẮC HOÀN THÀNH!" : "HOÀN THÀNH PHIÊN LUYỆN TẬP"}
              </h2>
            </div>

            <div className="inline-flex items-baseline gap-2 py-2 px-6 rounded-2xl bg-muted/60 border border-border">
              <span className="text-4xl font-extrabold text-foreground">
                {isSpeaking || isDialogue ? totalCount : totalCorrect}
              </span>
              <span className="text-muted-foreground text-sm font-semibold">
                / {totalCount} câu
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn có thể luyện lại bộ bài tập này bất kỳ lúc nào để nâng cao tốc độ phản xạ và độ chính xác!
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentIndex(0);
                  setUserAnswers({});
                  setIsAnswerCheckedMap({});
                  setScoreMap({});
                  setQuestionStatuses({ 0: "active" });
                  setIsFinished(false);
                }}
                className="w-full gap-2 text-xs font-semibold"
              >
                <RotateCcw className="size-4" />
                Luyện lại bộ này
              </Button>

              <Button asChild className="w-full gap-2 text-xs font-semibold">
                <Link
                  href={`/practice?skill=${practiceSet.skill}&unit=${practiceSet.unit_id}`}
                  prefetch={true}
                >
                  <span>Các bộ bài tiếp theo</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. ADAPTIVE EXERCISE RENDERER (Single Question, Matching, Reading Hybrid, Shared Audio)
  const isReadingMode = mode === "reading_comprehension" && !!sharedPassage;
  const isMatchingMode = mode === "matching_board";

  return (
    <div className={`space-y-6 pb-20 ${isReadingMode ? "max-w-6xl mx-auto" : "max-w-2xl mx-auto"}`}>
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/practice?skill=${practiceSet.skill}&unit=${practiceSet.unit_id}`}
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Về danh sách bài tập
        </Link>

        <div className="flex items-center gap-3">
          {/* Audio Speed Selector if audio present */}
          {(currentQ?.audioText || sharedAudioText) && (
            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setAudioSpeed(1.0);
                  setPreferredRate(1.0);
                }}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${audioSpeed === 1.0 ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
              >
                1.0x
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudioSpeed(0.55);
                  setPreferredRate(0.55);
                }}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${audioSpeed === 0.55 ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
              >
                0.55x (Chậm)
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <Badge className="border border-border bg-card text-foreground font-semibold">
              Đang xem: {currentIndex + 1}/{totalCount}
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold">
              Đã làm: {completedCount}/{totalCount}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar: Real completion progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
          <span>Tiến độ hoàn thành</span>
          <span className="font-semibold text-foreground">
            {completedCount} / {totalCount} câu ({Math.round((completedCount / totalCount) * 100)}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Stepper / Navigator */}
      <QuestionNavigator
        totalCount={totalCount}
        currentIndex={currentIndex}
        questionStatuses={questionStatuses}
        onSelectQuestion={handleJumpToQuestion}
        allowJump={true}
      />

      {/* LISTENING MODE: Persistent Shared Audio Player (does not unmount or restart on question jump) */}
      {mode === "listening_comprehension" && sharedAudioText && (
        <Card className="border-primary/30 bg-primary/5 shadow-2xs">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                <Headphones className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  {practiceSet.stimulus?.title || "Đoạn nghe dùng chung"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Nghe kỹ đoạn âm thanh ({audioSpeed}x) để trả lời các câu hỏi liên quan bên dưới
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MandarinAudioButton text={sharedAudioText} size="sm" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* READING MODE: Hybrid Desktop Layout & Mobile Drawer Toggle */}
      {isReadingMode && sharedPassage && (
        <div className="lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMobilePassageOpen(true)}
            className="w-full gap-2 text-xs font-semibold bg-card border-primary/30 text-primary shadow-2xs"
          >
            <BookOpen className="size-4" />
            <span>Xem đoạn văn bài đọc</span>
            <Maximize2 className="size-3.5 ml-auto" />
          </Button>

          {/* Full-Screen Reading Sheet / Modal */}
          {isMobilePassageOpen && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in">
              {/* Sheet Header */}
              <div className="p-3.5 sm:p-4 border-b border-border bg-card flex items-center justify-between gap-2 shadow-xs shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <BookOpen className="size-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {sharedPassage.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <MandarinAudioButton text={sharedPassage.text} size="sm" />
                  {sharedPassage.translationVi && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVi(!showVi)}
                      className="text-[11px] h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {showVi ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      <span>{showVi ? "Ẩn Dịch" : "Hiện Dịch"}</span>
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMobilePassageOpen(false)}
                    className="size-8 grid place-items-center rounded-xl bg-muted text-muted-foreground hover:text-foreground"
                    title="Đóng bài đọc"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Sheet Scrollable Reading Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="hanzi text-lg sm:text-xl font-serif font-medium leading-loose text-foreground whitespace-pre-line bg-card/60 p-5 rounded-2xl border border-border shadow-xs">
                  {sharedPassage.text}
                </div>

                {showVi && sharedPassage.translationVi && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold block mb-1 text-foreground">Dịch nghĩa tham khảo:</span>
                    {sharedPassage.translationVi}
                  </div>
                )}
              </div>

              {/* Sheet Footer */}
              <div className="p-3.5 border-t border-border bg-card pb-[max(0.875rem,env(safe-area-inset-bottom))] shrink-0">
                <Button
                  type="button"
                  onClick={() => setIsMobilePassageOpen(false)}
                  className="w-full min-h-11 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  Đóng và làm câu hỏi
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAIN EXERCISE CONTAINER: Grid on Reading Desktop, Single Card on Others */}
      <div className={isReadingMode ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "space-y-6"}>
        {/* LEFT COLUMN FOR READING HYBRID MODE (Desktop Split-Pane) */}
        {isReadingMode && sharedPassage && (
          <div className="hidden lg:block lg:col-span-5 sticky top-20">
            <Card className="border-border shadow-xs max-h-[75vh] overflow-y-auto">
              <CardHeader className="pb-3 border-b border-border space-y-1">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary text-[10px] font-bold">
                    Bài đọc hiểu HSK 1
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {sharedPassage.translationVi && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVi(!showVi)}
                        className="text-[11px] h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {showVi ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        <span>{showVi ? "Ẩn Dịch" : "Hiện Dịch"}</span>
                      </Button>
                    )}
                    <MandarinAudioButton text={sharedPassage.text} size="sm" />
                  </div>
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  {sharedPassage.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="hanzi text-base leading-relaxed text-foreground font-serif whitespace-pre-line">
                  {sharedPassage.text}
                </div>
                {showVi && sharedPassage.translationVi && (
                  <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
                    <span className="font-semibold block mb-1 text-foreground">Dịch nghĩa tham khảo:</span>
                    {sharedPassage.translationVi}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RIGHT/MAIN COLUMN FOR QUESTION EXECUTION */}
        <div className={isReadingMode ? "lg:col-span-7 space-y-6" : "space-y-6"}>
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
              {/* Shared Audio or Single Audio */}
              {(currentQ?.audioText || sharedAudioText) && (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Headphones className="size-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">
                      Bấm nghe âm thanh ({audioSpeed}x):
                    </span>
                  </div>
                  <MandarinAudioButton
                    text={currentQ?.audioText || sharedAudioText!}
                    size="sm"
                  />
                </div>
              )}

              {/* Single question inline passage (if not hybrid reading) */}
              {!isReadingMode && currentQ?.passage && (
                <div className="p-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-line font-serif">
                  {currentQ.passage}
                </div>
              )}

              {/* Hanzi / Pinyin Display: ONLY for Speaking exercises or when explicitly needed */}
              {isSpeaking && currentQ?.hanzi && (
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

              {/* MODE 2: MATCHING BOARD */}
              {isMatchingMode && currentQ?.pairs && currentQ.pairs.length > 0 && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Bấm vào 1 mục ở cột trái, sau đó bấm mục tương ứng ở cột phải:</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span>
                        Đã ghép: {matchedPairIndices.length}/{currentQ.pairs.length}
                      </span>
                      {!isCurrentChecked && matchedPairIndices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserAnswers((prev) => ({ ...prev, [currentIndex]: [] }));
                            setSelectedLeftIdx(null);
                            setMismatchPair(null);
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
                        >
                          Xóa làm lại
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Left Column */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-muted-foreground block mb-1">
                        Mục cần ghép
                      </span>
                      {currentQ.pairs.map((p, idx) => {
                        const isMatched = matchedPairIndices.includes(idx);
                        const isSelected = selectedLeftIdx === idx;
                        const isMismatched = mismatchPair?.leftIdx === idx;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isMatched || isCurrentChecked}
                            onClick={() => handleSelectMatchingLeft(idx)}
                            className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${isMatched
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 opacity-60 cursor-not-allowed"
                              : isMismatched
                                ? "border-rose-500 ring-2 ring-rose-500 bg-rose-500/15 text-rose-600 animate-shake"
                                : isSelected
                                  ? "border-primary ring-2 ring-primary bg-primary/10 text-primary shadow-xs"
                                  : "border-border bg-card text-foreground hover:bg-muted/70 shadow-2xs"
                              }`}
                          >
                            <span className="truncate block">{p.left}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-muted-foreground block mb-1">
                        Nghĩa tương ứng
                      </span>
                      {shuffledRightIndices.map((origIdx) => {
                        const p = currentQ.pairs![origIdx];
                        const isMatched = matchedPairIndices.includes(origIdx);
                        const isMismatched = mismatchPair?.rightIdx === origIdx;

                        return (
                          <button
                            key={origIdx}
                            type="button"
                            disabled={isMatched || selectedLeftIdx === null || isCurrentChecked}
                            onClick={() => handleSelectMatchingRight(origIdx)}
                            className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${isMatched
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 opacity-60 cursor-not-allowed"
                              : isMismatched
                                ? "border-rose-500 ring-2 ring-rose-500 bg-rose-500/15 text-rose-600 animate-shake"
                                : selectedLeftIdx !== null
                                  ? "border-primary/40 bg-card text-foreground hover:bg-primary/5 hover:border-primary cursor-pointer shadow-2xs"
                                  : "border-border bg-card text-foreground cursor-default opacity-80"
                              }`}
                          >
                            <span className="truncate block">{p.right}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 1: MULTIPLE CHOICE */}
              {currentQ?.choices && currentQ.choices.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2.5">
                    {currentQ.choices.map((choice, cIdx) => {
                      const isSelected = currentSelectedChoice === cIdx;
                      const isCorrect = currentQ.correct_index === cIdx;
                      const showCorrect = isCurrentChecked && isCorrect;
                      const showWrong = isCurrentChecked && isSelected && !isCorrect;

                      return (
                        <button
                          key={cIdx}
                          type="button"
                          disabled={isCurrentChecked}
                          onClick={() => handleSelectChoice(cIdx)}
                          className={`flex w-full items-center gap-3.5 p-3.5 rounded-xl border text-left text-sm transition-all ${showCorrect
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : showWrong
                              ? "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 font-semibold"
                              : isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20 shadow-xs"
                                : "border-border bg-card text-foreground hover:bg-muted/70 shadow-2xs"
                            }`}
                        >
                          <span
                            className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${showCorrect
                              ? "bg-emerald-500 text-white"
                              : showWrong
                                ? "bg-red-500 text-white"
                                : isSelected
                                  ? "bg-primary text-white"
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
                </div>
              )}

              {/* MODE 1: SENTENCE ORDERING */}
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
                            disabled={isCurrentChecked}
                            onClick={() => {
                              setUserAnswers((prev) => ({
                                ...prev,
                                [currentIndex]: orderedTokenIndices.filter((_, i) => i !== seq),
                              }));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-xs transition-transform active:scale-95"
                          >
                            {currentQ.tokens![tIdx]}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Available Tokens Pool */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Từ vựng có sẵn:
                      </span>
                      {!isCurrentChecked && orderedTokenIndices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserAnswers((prev) => ({
                              ...prev,
                              [currentIndex]: [],
                            }));
                          }}
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
                            disabled={isCurrentChecked || isPicked}
                            onClick={() => {
                              setUserAnswers((prev) => ({
                                ...prev,
                                [currentIndex]: [...orderedTokenIndices, tIdx],
                              }));
                            }}
                            className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${isPicked
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

                  {isCurrentChecked && currentQ.targetSentence && (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                      <span className="font-semibold text-muted-foreground">Câu chuẩn:</span>
                      <p className="hanzi text-base font-bold text-foreground">{currentQ.targetSentence}</p>
                      {currentQ.explanation_vi && (
                        <p className="text-xs text-muted-foreground pt-1">{currentQ.explanation_vi}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MODE 1: FILL BLANK / DICTATION */}
              {!currentQ?.choices && !currentQ?.tokens && !currentQ?.pairs && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Nhập chữ Hán hoặc Pinyin tương ứng:
                    </span>
                    <input
                      type="text"
                      disabled={isCurrentChecked}
                      value={typedAnswer}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserAnswers((prev) => ({
                          ...prev,
                          [currentIndex]: val,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isCurrentChecked) {
                          handleCheckTypedAnswer();
                        }
                      }}
                      placeholder="Ví dụ: 你好 hoặc ni hao"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary shadow-xs"
                    />
                  </div>

                  {isCurrentChecked && (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                      <span className="font-semibold text-muted-foreground">Đáp án chuẩn:</span>
                      <p className="hanzi text-base font-bold text-foreground">
                        {currentQ?.targetText || currentQ?.hanzi || currentQ?.pinyin}
                      </p>
                      {currentQ?.meaning_vi && (
                        <p className="text-xs text-muted-foreground">Ý nghĩa: {currentQ.meaning_vi}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation after answered */}
              {isCurrentChecked && currentQ?.explanation_vi && !currentQ.tokens && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground">Giải thích:</span>
                  <p className="text-muted-foreground">{currentQ.explanation_vi}</p>
                </div>
              )}
            </CardContent>

            {/* QUESTION FOOTER CONTROLS (Back / Skip / Next) */}
            <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => handleJumpToQuestion(currentIndex - 1)}
                className="gap-1.5 text-xs font-semibold"
              >
                <ChevronLeft className="size-4" />
                <span>Câu trước</span>
              </Button>

              <div className="flex items-center gap-2">
                {!isCurrentChecked && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipQuestion}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <span>Bỏ qua</span>
                    <SkipForward className="size-3.5" />
                  </Button>
                )}

                {!isCurrentChecked ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={!hasCurrentAnswer}
                    onClick={handleCheckCurrent}
                    className="gap-1.5 text-xs font-semibold px-5 min-w-[100px]"
                  >
                    <span>Kiểm tra</span>
                    <CheckCircle2 className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextOrFinish}
                    className="gap-1.5 text-xs font-semibold px-5 min-w-[120px]"
                  >
                    <span>
                      {currentIndex === totalCount - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                    </span>
                    <ChevronRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
