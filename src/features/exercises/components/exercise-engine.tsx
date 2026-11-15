"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Award,
  Mic,
  MicOff,
  Eye,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { useMandarinRecognition } from "@/hooks/use-mandarin-recognition";
import type { LibraryExercise, ExerciseOption } from "@/features/content-library/types";

function normalizeEngineExercise(raw: LibraryExercise | (Record<string, unknown> & { id?: string })): LibraryExercise {
  if (!raw) return raw as unknown as LibraryExercise;
  const ex = { ...raw } as Record<string, unknown> & Partial<LibraryExercise>;
  const rawKind = (ex.kind || ex.type || "vocab-mcq") as string;
  let standardKind = rawKind;
  if (rawKind === "vocab_mcq" || rawKind === "pinyin_mcq") standardKind = "vocab-mcq";
  else if (rawKind === "grammar-mcq" || rawKind === "fill_in_blank") standardKind = "grammar-choice";
  else if (rawKind === "sentence_scramble" || rawKind === "sentence_ordering") standardKind = "sentence-order";
  else if (rawKind === "listening_hidden_transcript" || rawKind === "listening-mcq") standardKind = "listening_cloze";
  else if (rawKind === "speaking_shadowing") standardKind = "sentence_shadowing";
  else if (rawKind === "true-false") standardKind = "reading_true_false";
  else if (rawKind === "matching") standardKind = "matching_pairs";

  ex.kind = standardKind as LibraryExercise["kind"];
  if (!ex.id) ex.id = `ex-${Math.random().toString(36).slice(2, 9)}`;
  if (!ex.promptVi && ex.prompt) ex.promptVi = ex.prompt as string;

  if (ex.options && Array.isArray(ex.options) && typeof ex.options[0] === "string") {
    const correctVal = ex.correct_answer ?? ex.options[0];
    ex.options = ex.options.map((optStr: unknown, idx: number) => ({
      id: `opt-${idx + 1}`,
      label: String(optStr),
      isCorrect: String(optStr).trim() === String(correctVal).trim(),
      explanationVi: ex.explanation as string | undefined,
    }));
  }

  if (ex.kind === "matching_pairs" && !ex.matchingPairs && ex.pairs && Array.isArray(ex.pairs)) {
    ex.matchingPairs = ex.pairs.map((p: unknown, idx: number) => {
      const pairObj = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
      return {
        leftId: `l-${idx + 1}`,
        leftLabel: String(pairObj.left || pairObj.leftLabel || ""),
        rightId: `r-${idx + 1}`,
        rightLabel: String(pairObj.right || pairObj.rightLabel || ""),
      };
    });
  }

  if (ex.kind === "sentence-order" && !ex.orderTokens) {
    if (Array.isArray(ex.tokens)) {
      ex.orderTokens = ex.tokens.map((tok: string, idx: number) => ({
        id: `tok-${idx + 1}`,
        text: tok,
        correctIndex: idx,
      }));
    }
  }

  return ex as LibraryExercise;
}

interface ExerciseEngineProps {
  exercises: LibraryExercise[];
  title?: string;
  onComplete?: (result: { total: number; correct: number }) => void;
}

export function ExerciseEngine({
  exercises,
  onComplete,
}: ExerciseEngineProps) {
  const safeExercises = useMemo(
    () => (exercises || []).map(normalizeEngineExercise),
    [exercises]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // For sentence ordering
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);

  // For matching pairs
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [mismatchPair, setMismatchPair] = useState<{ leftId: string; rightId: string } | null>(null);

  // For listening dictation / text input
  const [textInput, setTextInput] = useState("");

  // Audio speech hook
  const { speak, preferredRate } = useMandarinSpeech();

  // Speech recognition hook
  const {
    isListening,
    transcript: spokenTranscript,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
  } = useMandarinRecognition();

  const currentExercise = safeExercises[currentIndex];

  // Deterministically shuffle right pairs for interactive matching
  const shuffledRightPairs = useMemo(() => {
    if (!currentExercise?.matchingPairs) return [];
    const list = [...currentExercise.matchingPairs];
    if (list.length <= 1) return list;
    // Permute by shifting elements by 1 so right column isn't identical in order to left column
    return [...list.slice(1), list[0]];
  }, [currentExercise]);
  const progressPercent = safeExercises.length
    ? Math.round((currentIndex / safeExercises.length) * 100)
    : 0;

  if (!safeExercises.length) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Không có bài tập nào để hiển thị.</p>
      </Card>
    );
  }

  // --- SUMMARY SCREEN ---
  if (isCompleted) {
    const total = safeExercises.length;
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
              setSelectedLeftId(null);
              setMatchedPairs([]);
              setTextInput("");
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
    const sortedTokens = [...currentExercise.orderTokens].sort((a, b) => a.correctIndex - b.correctIndex);
    const selectedText = selectedTokenIds
      .map((id) => currentExercise.orderTokens?.find((t) => t.id === id)?.text || "")
      .join("")
      .replace(/[\s\.\,\!\?，。！？'’\-]/g, "");
    const expectedText = sortedTokens
      .map((t) => t.text)
      .join("")
      .replace(/[\s\.\,\!\?，。！？'’\-]/g, "");

    const isMatch = selectedText.length > 0 && selectedText === expectedText;

    setIsCorrect(isMatch);
    if (isMatch) setScore((prev) => prev + 1);
  }

  // Handle matching pairs click
  function handleSelectLeft(leftId: string) {
    if (isAnswered || matchedPairs.includes(leftId)) return;
    if (selectedLeftId === leftId) {
      setSelectedLeftId(null);
      return;
    }
    setSelectedLeftId(leftId);
    setMismatchPair(null);
  }

  function handleSelectRight(rightId: string) {
    if (isAnswered || !selectedLeftId) return;
    const pair = currentExercise.matchingPairs?.find(
      (p) => p.leftId === selectedLeftId && p.rightId === rightId
    );
    if (pair) {
      const newMatched = [...matchedPairs, selectedLeftId];
      setMatchedPairs(newMatched);
      setSelectedLeftId(null);
      setMismatchPair(null);
      if (newMatched.length === (currentExercise.matchingPairs?.length || 0)) {
        setIsAnswered(true);
        setIsCorrect(true);
        setScore((prev) => prev + 1);
      }
    } else {
      setMismatchPair({ leftId: selectedLeftId, rightId });
      setTimeout(() => {
        setMismatchPair(null);
        setSelectedLeftId(null);
      }, 600);
    }
  }

  // Handle dictation check (accepts Hanzi, Accented Pinyin, or Plain Pinyin)
  function handleCheckDictation() {
    if (isAnswered || !textInput.trim()) return;
    setIsAnswered(true);
    const cleanInput = textInput.trim().toLowerCase().replace(/[\s\.\,\!\?，。！？'’\-]/g, "");
    const cleanExpected = (currentExercise.expectedAnswer || currentExercise.targetContent?.hanzi || "")
      .trim()
      .toLowerCase()
      .replace(/[\s\.\,\!\?，。！？'’\-]/g, "");
    const cleanPinyin = (currentExercise.targetContent?.pinyin || "")
      .trim()
      .toLowerCase()
      .replace(/[\s\.\,\!\?，。！？'’\-]/g, "");

    const stripTones = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\.\,\!\?，。！？'’\-]/g, "").toLowerCase();

    const isMatch =
      cleanInput === cleanExpected ||
      cleanInput === cleanPinyin ||
      (cleanPinyin.length > 0 && stripTones(cleanInput) === stripTones(cleanPinyin));

    setIsCorrect(isMatch);
    if (isMatch) setScore((prev) => prev + 1);
  }

  // Handle true/false choice
  function handleTrueFalse(choice: boolean) {
    if (isAnswered || !currentExercise.trueFalseStatement) return;
    setIsAnswered(true);
    const isMatch = choice === currentExercise.trueFalseStatement.isTrue;
    setIsCorrect(isMatch);
    if (isMatch) setScore((prev) => prev + 1);
  }

  // Handle sentence shadowing self-evaluation
  function handleShadowingComplete(success: boolean) {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(success);
    if (success) setScore((prev) => prev + 1);
  }

  function handleNext() {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedTokenIds([]);
    setSelectedLeftId(null);
    setMatchedPairs([]);
    setTextInput("");

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      onComplete?.({ total: exercises.length, correct: score + (isCorrect ? 0 : 0) });
    }
  }

  const isListeningType =
    currentExercise.kind === "listening_cloze" ||
    currentExercise.kind === "listening_dictation" ||
    currentExercise.kind === "listen-fill";

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
                : currentExercise.kind === "grammar-choice" || currentExercise.kind === "grammar_fill_blank" || currentExercise.kind === "fill-blank"
                  ? "Ngữ pháp"
                  : currentExercise.kind === "matching" || currentExercise.kind === "matching_pairs"
                    ? "Ghép cặp từ - nghĩa"
                    : currentExercise.kind === "listening_cloze" || currentExercise.kind === "listen-fill"
                      ? "Nghe điền từ"
                      : currentExercise.kind === "listening_dictation"
                        ? "Nghe chính tả"
                        : currentExercise.kind === "dialogue_roleplay" || currentExercise.kind === "dialogue-response"
                          ? "Hội thoại"
                          : currentExercise.kind === "reading_true_false"
                            ? "Đọc hiểu Đúng/Sai"
                            : currentExercise.kind === "sentence_shadowing"
                              ? "Luyện nhại âm (Shadowing)"
                              : currentExercise.kind === "reading-mcq"
                                ? "Đọc hiểu trắc nghiệm"
                                : "Luyện tập"}
          </span>
        </div>
        <Progress value={progressPercent} label={`Tiến độ câu ${currentIndex + 1}`} />
        <CardTitle className="text-base font-semibold text-foreground pt-1">
          {currentExercise.promptVi}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Listening Exercises: AUDIO PLAYER (Transcript HIDDEN before answering) */}
        {isListeningType && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Bài nghe tương tác
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                onClick={() =>
                  speak(
                    currentExercise.targetContent?.audioText ||
                      currentExercise.targetContent?.hanzi ||
                      currentExercise.expectedAnswer ||
                      "",
                    preferredRate
                  )
                }
                className="gap-2"
              >
                <Volume2 className="size-4" />
                Nghe câu nói
              </Button>
            </div>
            {/* Secret transcript: ONLY revealed after answered! */}
            {!isAnswered ? (
              <p className="text-xs text-muted-foreground italic flex items-center justify-center gap-1">
                <Eye className="size-3.5" />
                Văn bản phát âm đang được ẩn để kiểm tra thính lực của bạn.
              </p>
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-card border border-border text-left">
                <p className="text-xs font-medium text-muted-foreground">Văn bản gốc:</p>
                <p className="hanzi text-lg font-bold text-foreground">
                  {currentExercise.targetContent?.hanzi || currentExercise.expectedAnswer}
                </p>
                {currentExercise.targetContent?.pinyin && (
                  <p className="text-xs text-primary">{currentExercise.targetContent.pinyin}</p>
                )}
                {currentExercise.targetContent?.translationVi && (
                  <p className="text-xs text-muted-foreground">{currentExercise.targetContent.translationVi}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Reading Passage (For reading_true_false or reading-mcq) */}
        {currentExercise.readingPassage && (
          <div className="rounded-2xl border border-border bg-muted/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <BookOpen className="size-4" />
              <span>Đoạn văn đọc hiểu: {currentExercise.readingPassage.title}</span>
            </div>
            <p className="hanzi text-base leading-relaxed text-foreground whitespace-pre-wrap">
              {currentExercise.readingPassage.text}
            </p>
            {isAnswered && currentExercise.readingPassage.translationVi && (
              <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                Dịch: {currentExercise.readingPassage.translationVi}
              </p>
            )}
          </div>
        )}

        {/* 3. Non-listening Target Content (Hanzi, Pinyin, Audio) */}
        {!isListeningType && currentExercise.targetContent?.hanzi && currentExercise.kind !== "sentence_shadowing" && (
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

        {/* 4. Sentence Ordering Mode */}
        {currentExercise.kind === "sentence-order" && currentExercise.orderTokens && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Thứ tự câu của bạn:</span>
                {!isAnswered && selectedTokenIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTokenIds([])}
                    className="text-primary hover:underline"
                  >
                    Xóa làm lại
                  </button>
                )}
              </div>
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
            </div>

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
                  disabled={selectedTokenIds.length !== currentExercise.orderTokens.length}
                >
                  Kiểm tra câu
                </Button>
              </div>
            )}

            {isAnswered && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                <span className="font-semibold text-muted-foreground">Đáp án đúng:</span>
                <p className="hanzi text-base font-bold text-foreground">
                  {[...currentExercise.orderTokens]
                    .sort((a, b) => a.correctIndex - b.correctIndex)
                    .map((t) => t.text)
                    .join("")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. Matching Pairs Mode */}
        {(currentExercise.kind === "matching" || currentExercise.kind === "matching_pairs") &&
          currentExercise.matchingPairs && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Bấm vào 1 mục ở cột trái, sau đó bấm vào mục tương ứng ở cột phải để ghép cặp.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Hán tự</span>
                  {currentExercise.matchingPairs.map((pair) => {
                    const isMatched = matchedPairs.includes(pair.leftId);
                    const isSelected = selectedLeftId === pair.leftId;
                    const isMismatch = mismatchPair?.leftId === pair.leftId;
                    return (
                      <button
                        key={pair.leftId}
                        type="button"
                        disabled={isMatched || isAnswered}
                        onClick={() => handleSelectLeft(pair.leftId)}
                        className={`w-full text-left p-3 rounded-xl border text-base font-bold transition-all ${
                          isMatched
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 cursor-default"
                            : isMismatch
                              ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500"
                              : isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        {pair.leftLabel}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Pinyin & Nghĩa</span>
                  {shuffledRightPairs.map((pair) => {
                    const isMatched = matchedPairs.some(
                      (lId) => currentExercise.matchingPairs?.find((p) => p.leftId === lId)?.rightId === pair.rightId
                    );
                    const isMismatch = mismatchPair?.rightId === pair.rightId;
                    return (
                      <button
                        key={pair.rightId}
                        type="button"
                        disabled={isMatched || isAnswered}
                        onClick={() => handleSelectRight(pair.rightId)}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${
                          isMatched
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 cursor-default"
                            : isMismatch
                              ? "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500"
                              : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        {pair.rightLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        {/* 6. Listening Dictation Mode (Text Input) */}
        {currentExercise.kind === "listening_dictation" && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground block">
              Nhập Hán tự hoặc Pinyin bạn nghe được:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={isAnswered}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ví dụ: 你好 hoặc nǐ hǎo..."
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {!isAnswered && (
                <Button type="button" onClick={handleCheckDictation} disabled={!textInput.trim()}>
                  Kiểm tra
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 7. Reading True / False Mode */}
        {currentExercise.kind === "reading_true_false" && currentExercise.trueFalseStatement && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-xs font-medium text-muted-foreground mb-1">Nhận định cần đánh giá:</p>
              <p className="hanzi text-lg font-bold text-foreground">
                {currentExercise.trueFalseStatement.statement}
              </p>
            </div>
            {!isAnswered && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTrueFalse(true)}
                  className="py-6 text-base font-semibold hover:border-emerald-500 hover:text-emerald-600"
                >
                  ✓ Đúng (对 - duì)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTrueFalse(false)}
                  className="py-6 text-base font-semibold hover:border-rose-500 hover:text-rose-600"
                >
                  ✕ Sai (错 - cuò)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 8. Sentence Shadowing Mode (Microphone + Manual Fallback) */}
        {currentExercise.kind === "sentence_shadowing" && currentExercise.targetContent && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
              <h3 className="hanzi font-serif text-3xl font-bold text-foreground">
                {currentExercise.targetContent.hanzi}
              </h3>
              {currentExercise.targetContent.pinyin && (
                <p className="text-primary font-medium text-base">
                  {currentExercise.targetContent.pinyin}
                </p>
              )}
              {currentExercise.targetContent.translationVi && (
                <p className="text-xs text-muted-foreground">{currentExercise.targetContent.translationVi}</p>
              )}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => speak(currentExercise.targetContent?.hanzi || "", preferredRate)}
                >
                  <Volume2 className="size-4 mr-2" />
                  Nghe câu mẫu
                </Button>
              </div>
            </div>

            {/* Speaking Controls with Recognition & Manual Fallback */}
            {!isAnswered && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {isSpeechSupported ? (
                    <Button
                      type="button"
                      variant={isListening ? "destructive" : "default"}
                      onClick={isListening ? stopListening : () => void startListening()}
                      className="gap-2"
                    >
                      {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                      {isListening ? "Đang lắng nghe... Bấm dừng" : "Bật micro luyện nói"}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Trình duyệt chưa bật nhận dạng giọng nói tự động.
                    </span>
                  )}
                </div>

                {isListening && spokenTranscript && (
                  <p className="text-center text-sm text-primary font-medium">
                    Nhận diện: &ldquo;{spokenTranscript}&rdquo;
                  </p>
                )}

                {/* Manual Fallback Option (Always available!) */}
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-center space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Hoặc tự đánh giá độ trôi chảy (Chế độ luyện thủ công):
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleShadowingComplete(true)}
                      className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      ✓ Tôi đã luyện đọc
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleShadowingComplete(false)}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      ✕ Cần luyện tập thêm
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80">
                    Tự đánh giá ghi nhận nỗ lực luyện tập của bạn (không đại diện cho kiểm định phát âm chính thức).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. Standard Options Grid (Vocab MCQ, Grammar Choice, Dialogue, Reading MCQ, Fill Blank) */}
        {currentExercise.options &&
          currentExercise.options.length > 0 &&
          currentExercise.kind !== "sentence-order" &&
          currentExercise.kind !== "matching" &&
          currentExercise.kind !== "matching_pairs" &&
          currentExercise.kind !== "listening_dictation" &&
          currentExercise.kind !== "reading_true_false" &&
          currentExercise.kind !== "sentence_shadowing" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {currentExercise.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = "border-border bg-card hover:bg-muted text-foreground";

                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                  } else if (isSelected) {
                    btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                  } else {
                    btnStyle = "opacity-40 border-border bg-muted/30";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm font-medium transition-all ${btnStyle}`}
                  >
                    <span>{opt.label}</span>
                    {isAnswered && opt.isCorrect && (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 ml-2" />
                    )}
                    {isAnswered && isSelected && !opt.isCorrect && (
                      <XCircle className="size-4 shrink-0 text-rose-500 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        {/* Answer Feedback Banner */}
        {isAnswered && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <XCircle className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            )}
            <div className="space-y-1 text-sm">
              <p className="font-semibold">
                {isCorrect ? "Chính xác! Làm rất tốt." : "Chưa chính xác!"}
              </p>
              {currentExercise.options?.find((o) => o.id === selectedOptionId)?.explanationVi && (
                <p className="text-xs opacity-90">
                  {currentExercise.options.find((o) => o.id === selectedOptionId)?.explanationVi}
                </p>
              )}
              {currentExercise.trueFalseStatement?.explanationVi && (
                <p className="text-xs opacity-90">{currentExercise.trueFalseStatement.explanationVi}</p>
              )}
            </div>
          </div>
        )}

        {/* Next / Continue Button */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={handleNext} className="gap-2">
              <span>{currentIndex + 1 < exercises.length ? "Câu tiếp theo" : "Xem kết quả"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
