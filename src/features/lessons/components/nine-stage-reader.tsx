"use client";

import { useState, useEffect } from "react";
import {
  Volume2,
  BookOpen,
  MessageSquare,
  Headphones,
  FileCheck2,
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton } from "@/components/mandarin-audio";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { ExerciseEngine } from "@/features/exercises/components/exercise-engine";
import { saveStageProgress, type StageProgressData } from "@/features/lessons/actions";
import type { NineStageLessonData } from "@/features/content-library/curriculum-data";

interface NineStageReaderProps {
  lesson: NineStageLessonData;
  initialProgress?: StageProgressData | null;
  userId?: string;
}

export function NineStageReader({ lesson, initialProgress, userId }: NineStageReaderProps) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const { speak, preferredRate } = useMandarinSpeech();

  const lessonKey = lesson.slug || lesson.id;
  const storageKey = userId
    ? `hanlearn_9stage_${userId}_${lessonKey}`
    : `hanlearn_9stage_${lessonKey}`;

  const [currentStageIndex, setCurrentStageIndex] = useState<number>(() => {
    if (initialProgress && typeof initialProgress.currentStage === "number") {
      return initialProgress.currentStage;
    }
    return 0;
  });

  const [completedStages, setCompletedStages] = useState<number[]>(() => {
    const serverStages =
      initialProgress &&
      Array.isArray(initialProgress.completedStages) &&
      initialProgress.completedStages.length > 0
        ? initialProgress.completedStages
        : [];

    if (typeof window === "undefined") return serverStages;
    try {
      const saved = localStorage.getItem(storageKey);
      const legacy = localStorage.getItem(`hanlearn_9stage_${lessonKey}`);
      const rawSaved = saved ? JSON.parse(saved) : [];
      const rawLegacy = legacy ? JSON.parse(legacy) : [];
      const localList: number[] = [
        ...(Array.isArray(rawSaved) ? rawSaved : []),
        ...(Array.isArray(rawLegacy) ? rawLegacy : []),
      ];
      return Array.from(new Set([...serverStages, ...localList])).sort((a, b) => a - b);
    } catch {}
    return serverStages;
  });

  // Client mount sync: If local storage contained offline stages missing on server, sync to server
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const serverCount = initialProgress?.completedStages?.length ?? 0;
      if (completedStages.length > serverCount) {
        saveStageProgress({
          lessonId: lesson.slug || lesson.id,
          completedStages,
          currentStage: currentStageIndex,
        }).catch(() => {});
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markStageComplete(idx: number) {
    setCompletedStages((prev) => {
      if (prev.includes(idx)) return prev;
      const next = [...prev, idx];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      // Persist stage progress to Supabase
      saveStageProgress({
        lessonId: lesson.slug || lesson.id,
        completedStages: next,
        currentStage: currentStageIndex,
      }).catch(() => {});
      return next;
    });
  }

  function handleSelectStage(idx: number) {
    setCurrentStageIndex(idx);
    saveStageProgress({
      lessonId: lesson.slug || lesson.id,
      completedStages,
      currentStage: idx,
    }).catch(() => {});
  }

  const stages = lesson.stages;
  const currentStage = stages[currentStageIndex];

  const stageIcons = [
    <Sparkles key="0" className="size-4" />,
    <BookOpen key="1" className="size-4" />,
    <FileCheck2 key="2" className="size-4" />,
    <BookOpen key="3" className="size-4" />,
    <FileCheck2 key="4" className="size-4" />,
    <MessageSquare key="5" className="size-4" />,
    <Headphones key="6" className="size-4" />,
    <FileCheck2 key="7" className="size-4" />,
    <Award key="8" className="size-4" />,
    <Brain key="9" className="size-4" />,
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 sm:p-6 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge className="border border-primary bg-primary/10 text-primary font-medium">
              HSK {lesson.hsk_level} · 9 Giai đoạn Tương tác
            </Badge>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {lesson.estimated_minutes} phút
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {lesson.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lesson.objective_vi}
          </p>
        </CardContent>
      </Card>

      {/* Stage Stepper Navigation (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {stages.map((st, idx) => {
          const isActive = idx === currentStageIndex;
          const isDone = completedStages.includes(idx);
          return (
            <button
              key={st.stage}
              type="button"
              onClick={() => {
                markStageComplete(currentStageIndex);
                handleSelectStage(idx);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : isDone
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span>{isDone ? "✓" : (stageIcons[idx] || (idx + 1))}</span>
              <span>GĐ {idx}: {st.title_vi.split("&")[0].split("(")[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Current Stage Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="space-y-1 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Badge className="text-xs bg-muted text-muted-foreground">
              Giai đoạn {currentStageIndex + 1} / {stages.length}
            </Badge>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPinyin((v) => !v)}
                className="text-xs h-8"
              >
                {showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation((v) => !v)}
                className="text-xs h-8"
              >
                {showTranslation ? "Ẩn nghĩa" : "Hiện nghĩa"}
              </Button>
            </div>
          </div>
          <CardTitle className="text-lg font-bold text-foreground pt-1">
            {currentStage.title_vi}
          </CardTitle>
          {currentStage.instruction && (
            <CardDescription className="text-xs leading-relaxed">
              {currentStage.instruction}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* GIAI ĐOẠN 0: Khởi động (Warmup) */}
          {currentStage.stage === "0_warmup" && currentStage.warmup_words && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bấm vào biểu tượng loa để nghe phát âm mẫu, sau đó đọc to lại để làm nóng phát âm:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentStage.warmup_words.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card text-center space-y-1.5 shadow-xs"
                  >
                    <p className="hanzi text-3xl font-bold text-foreground">{w.hanzi}</p>
                    {showPinyin && <p className="text-sm font-semibold text-primary">{w.pinyin}</p>}
                    {showTranslation && <p className="text-xs text-muted-foreground">{w.vi}</p>}
                    <div className="pt-1 flex justify-center">
                      <MandarinAudioButton text={w.hanzi} size="sm" variant="outline" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 1: Học từ vựng (Vocab Learn) */}
          {currentStage.stage === "1_vocab_learn" && currentStage.vocabulary && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {currentStage.vocabulary.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <p className="hanzi text-2xl font-bold text-foreground">{w.simplified}</p>
                      {showPinyin && <p className="text-sm font-medium text-primary">{w.pinyin}</p>}
                      {showTranslation && (
                        <p className="text-xs text-muted-foreground">{w.meaning_vi}</p>
                      )}
                    </div>
                    <MandarinAudioButton text={w.simplified} size="sm" variant="ghost" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 2, 4, 6: Bài tập tương tác (Exercise Engine) */}
          {currentStage.exercises && currentStage.exercises.length > 0 && (
            <div className="space-y-4">
              <ExerciseEngine exercises={currentStage.exercises} />
            </div>
          )}

          {/* GIAI ĐOẠN 3: Học ngữ pháp (Grammar Focus) */}
          {currentStage.stage === "3_grammar_learn" && currentStage.grammar_points && (
            <div className="space-y-5">
              {currentStage.grammar_points.map((gp) => (
                <div
                  key={gp.id}
                  className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs"
                >
                  <h3 className="text-base font-bold text-foreground">{gp.titleVi}</h3>
                  <div className="px-3 py-2 rounded-xl bg-muted font-mono text-sm text-primary font-semibold">
                    {gp.pattern}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {gp.explanationVi}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground">Ví dụ minh họa:</p>
                    {gp.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-3 rounded-xl bg-secondary/30 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <p className="hanzi text-base font-semibold text-foreground">{ex.hanzi}</p>
                          {showPinyin && <p className="text-xs text-primary">{ex.pinyin}</p>}
                          {showTranslation && (
                            <p className="text-xs text-muted-foreground">{ex.translationVi}</p>
                          )}
                        </div>
                        <MandarinAudioButton text={ex.hanzi} size="sm" variant="ghost" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GIAI ĐOẠN 5: Hội thoại đối đáp (Dialogue) */}
          {currentStage.stage === "5_dialogue_interactive" && currentStage.dialogue && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {currentStage.dialogue.titleVi}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    speak(
                      currentStage.dialogue?.turns.map((t) => t.hanzi).join("。") || "",
                      preferredRate
                    )
                  }
                  className="text-xs gap-1.5"
                >
                  <Volume2 className="size-3.5" />
                  Nghe toàn bộ đoạn thoại
                </Button>
              </div>

              <div className="space-y-3">
                {currentStage.dialogue.turns.map((turn, tIdx) => (
                  <div
                    key={tIdx}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                      turn.speaker.startsWith("A")
                        ? "bg-primary/5 border-primary/20"
                        : "bg-secondary/40 border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-primary block">
                        {turn.speaker}
                      </span>
                      <p className="hanzi text-lg font-bold text-foreground">{turn.hanzi}</p>
                      {showPinyin && <p className="text-xs text-primary">{turn.pinyin}</p>}
                      {showTranslation && (
                        <p className="text-xs text-muted-foreground">{turn.translationVi}</p>
                      )}
                    </div>
                    <MandarinAudioButton text={turn.hanzi} size="sm" variant="ghost" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 7: Đọc hiểu đoạn văn (Reading) */}
          {currentStage.stage === "7_reading_comprehension" && currentStage.passage && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-primary">
                    {currentStage.passage.title}
                  </h3>
                  <MandarinAudioButton
                    text={currentStage.passage.text}
                    size="sm"
                    variant="outline"
                  />
                </div>
                <p className="hanzi text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                  {currentStage.passage.text}
                </p>
                {showTranslation && currentStage.passage.translationVi && (
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Dịch: {currentStage.passage.translationVi}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 8: Mini Quiz (Assessment) */}
          {currentStage.stage === "8_mini_quiz" && (
            <div className="text-center p-8 space-y-4 rounded-2xl border border-primary/20 bg-primary/5">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Award className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Đánh giá cuối bài học</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Kiểm tra khả năng ghi nhớ từ vựng và vận dụng ngữ pháp thông qua Mini Quiz có chấm điểm máy chủ.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href={currentStage.quizUrl || `/lessons/${lesson.id}/quiz`}
                  className="inline-flex min-h-11 items-center px-6 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-sm"
                >
                  Bắt đầu làm Mini Quiz
                </a>
              </div>
            </div>
          )}

          {/* GIAI ĐOẠN 9: Ôn tập ngắt quãng (SRS Review) */}
          {currentStage.stage === "9_srs_review" && (
            <div className="text-center p-8 space-y-4 rounded-2xl border border-border bg-card">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Brain className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Ôn tập ngắt quãng SRS</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Các từ vựng trong bài đã được đưa vào kho thẻ ghi nhớ SRS. Thuật toán sẽ nhắc bạn ôn lại đúng thời điểm để ghi nhớ vĩnh viễn.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href={currentStage.reviewUrl || "/review"}
                  className="inline-flex min-h-11 items-center px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Mở trang ôn tập SRS
                </a>
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation buttons */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentStageIndex === 0}
            onClick={() => handleSelectStage(Math.max(0, currentStageIndex - 1))}
            className="gap-1.5"
          >
            <ChevronLeft className="size-4" />
            Giai đoạn trước
          </Button>

          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            Giai đoạn {currentStageIndex + 1} / {stages.length}
          </span>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              markStageComplete(currentStageIndex);
              if (currentStageIndex < stages.length - 1) {
                handleSelectStage(currentStageIndex + 1);
              }
            }}
            className="gap-1.5"
          >
            <span>{currentStageIndex === stages.length - 1 ? "Hoàn thành bài học ✓" : "Giai đoạn tiếp theo"}</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
