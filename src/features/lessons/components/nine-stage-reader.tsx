"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
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
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton } from "@/components/mandarin-audio";
import { ExerciseEngine } from "@/features/exercises/components/exercise-engine";
import { saveStageProgress, type StageProgressData } from "@/features/lessons/actions";
import type { NineStageLessonData } from "@/features/content-library/curriculum-data";

interface NineStageReaderProps {
  lesson: NineStageLessonData;
  initialProgress?: StageProgressData | null;
  userId?: string;
}

export const LESSON_SKILL_GROUPS = [
  { id: "warmup", label: "Khởi động", stageIndices: [0], description: "Khởi động phát âm & từ mở đầu" },
  { id: "vocab", label: "Từ vựng", stageIndices: [1, 2], description: "Học từ mới & bài tập nhận diện" },
  { id: "grammar_dialogue", label: "Ngữ pháp & Hội thoại", stageIndices: [3, 4, 5], description: "Cấu trúc ngữ pháp & hội thoại tình huống" },
  { id: "listen_speak", label: "Nghe & Nói", stageIndices: [6], description: "Luyện thính lực & nhại âm chuẩn giọng" },
  { id: "reading_quiz", label: "Đọc & Quiz", stageIndices: [7, 8], description: "Đọc hiểu văn bản & mini quiz đánh giá" },
  { id: "review", label: "Ôn tập", stageIndices: [9], description: "Đưa từ vựng vào chu kỳ nhớ ngắt quãng SRS" },
];

interface ScopedLessonProgress {
  version: 1;
  userId: string;
  lessonId: string;
  confirmedStages: number[];
  pendingStages: number[];
}

function getScopedStorageKey(userId: string | undefined, lessonKey: string): string {
  return userId
    ? `hanlearn_prog_v1_${userId}_${lessonKey}`
    : `hanlearn_prog_v1_guest_${lessonKey}`;
}

function loadScopedProgress(
  key: string,
  userId: string | undefined,
  lessonKey: string
): { confirmed: number[]; pending: number[] } {
  if (typeof window === "undefined") return { confirmed: [], pending: [] };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { confirmed: [], pending: [] };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.version === 1) {
      if (parsed.userId === (userId || "guest") && parsed.lessonId === lessonKey) {
        return {
          confirmed: Array.isArray(parsed.confirmedStages) ? parsed.confirmedStages : [],
          pending: Array.isArray(parsed.pendingStages) ? parsed.pendingStages : [],
        };
      }
      return { confirmed: [], pending: [] };
    }
    // Backward compatibility for raw array stored under exact user key
    if (Array.isArray(parsed) && userId) {
      return { confirmed: parsed, pending: [] };
    }
  } catch { }
  return { confirmed: [], pending: [] };
}

function persistScopedProgress(
  key: string,
  userId: string | undefined,
  lessonKey: string,
  confirmed: number[],
  pending: number[]
) {
  if (typeof window === "undefined") return;
  try {
    const data: ScopedLessonProgress = {
      version: 1,
      userId: userId || "guest",
      lessonId: lessonKey,
      confirmedStages: confirmed,
      pendingStages: pending,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch { }
}

export function NineStageReader({ lesson, initialProgress, userId }: NineStageReaderProps) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  const lessonKey = lesson.slug || lesson.id;
  const storageKey = getScopedStorageKey(userId, lessonKey);

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
    const { confirmed: localConfirmed, pending: localPending } = loadScopedProgress(
      storageKey,
      userId,
      lessonKey
    );
    // Monotonic Non-Decreasing Union: Server + Local Confirmed + Local Pending
    // Guarantees that progress NEVER regresses even if local has fewer stages than server!
    return Array.from(new Set([...serverStages, ...localConfirmed, ...localPending])).sort(
      (a, b) => a - b
    );
  });

  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);

  const saveProgressWithStatus = useCallback(
    async (targetCompleted: number[], current: number, newlyAddedStage?: number) => {
      setSyncStatus("saving");
      setSyncError(null);

      // Read current storage state to track pending
      const { confirmed, pending } = loadScopedProgress(storageKey, userId, lessonKey);
      const updatedPending =
        newlyAddedStage !== undefined
          ? Array.from(new Set([...pending, newlyAddedStage]))
          : pending;

      persistScopedProgress(storageKey, userId, lessonKey, confirmed, updatedPending);

      try {
        const res = await saveStageProgress({
          lessonId: lesson.slug || lesson.id,
          completedStages: targetCompleted,
          currentStage: current,
        });

        if (res.ok && res.progress) {
          const ackCompleted = res.progress.completedStages;
          // Remove acknowledged stages from pending
          const remainingPending = updatedPending.filter((p) => !ackCompleted.includes(p));
          persistScopedProgress(storageKey, userId, lessonKey, ackCompleted, remainingPending);

          setSyncStatus("saved");
          setTimeout(() => {
            setSyncStatus((s) => (s === "saved" ? "idle" : s));
          }, 2500);
        } else {
          setSyncStatus("error");
          setSyncError(res.error || "Chưa đồng bộ máy chủ");
        }
      } catch {
        setSyncStatus("error");
        setSyncError("Lỗi kết nối máy chủ");
      }
    },
    [lesson.slug, lesson.id, storageKey, userId, lessonKey]
  );

  // Client mount sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const serverCount = initialProgress?.completedStages?.length ?? 0;
      const { pending } = loadScopedProgress(storageKey, userId, lessonKey);
      if (pending.length > 0 || completedStages.length > serverCount) {
        saveStageProgress({
          lessonId: lesson.slug || lesson.id,
          completedStages,
          currentStage: currentStageIndex,
        })
          .then((res) => {
            if (res.ok && res.progress) {
              persistScopedProgress(storageKey, userId, lessonKey, res.progress.completedStages, []);
              setSyncStatus("saved");
              setTimeout(() => {
                setSyncStatus((s) => (s === "saved" ? "idle" : s));
              }, 2500);
            } else {
              setSyncStatus("error");
              setSyncError(res.error || "Chưa đồng bộ máy chủ");
            }
          })
          .catch(() => {
            setSyncStatus("error");
            setSyncError("Lỗi kết nối máy chủ");
          });
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markStageComplete(idx: number) {
    setCompletedStages((prev) => {
      if (prev.includes(idx)) {
        saveProgressWithStatus(prev, currentStageIndex);
        return prev;
      }
      const next = Array.from(new Set([...prev, idx])).sort((a, b) => a - b);
      saveProgressWithStatus(next, currentStageIndex, idx);
      return next;
    });
  }

  function handleSelectStage(idx: number) {
    setCurrentStageIndex(idx);
    saveProgressWithStatus(completedStages, idx);
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

  const isCurrentStageCompleted = completedStages.includes(currentStageIndex);

  // Active skill group computed from current stage index
  const activeGroup =
    LESSON_SKILL_GROUPS.find((g) => g.stageIndices.includes(currentStageIndex)) ||
    LESSON_SKILL_GROUPS[0];

  // Extract unit number for recommendations
  const unitNum = lesson.unit_id ? lesson.unit_id.replace(/[^0-9]/g, "").slice(-1) || "1" : "1";

  return (
    <div className="space-y-6">
      {/* Lesson Header Banner */}
      <Card className="border-primary/20 bg-primary/5 shadow-2xs">
        <CardContent className="p-5 sm:p-6 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge className="border border-primary/40 bg-primary/10 text-primary font-medium">
              HSK {lesson.hsk_level} · 10 Chặng Học tập
            </Badge>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5" />
              {lesson.estimated_minutes} phút học
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {lesson.objective_vi}
          </p>
        </CardContent>
      </Card>

      {/* 4.3 Single Consolidated Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium">Tiến độ bài học</span>
            {syncStatus === "saving" && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Loader2 className="size-2.5 animate-spin" />
                Đang lưu...
              </span>
            )}
            {syncStatus === "saved" && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="size-2.5" />
                Đã lưu
              </span>
            )}
            {syncStatus === "error" && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200">
                <span>{syncError || "Chưa lưu"}</span>
                <button
                  type="button"
                  className="underline font-bold hover:text-amber-800"
                  onClick={() => void saveProgressWithStatus(completedStages, currentStageIndex)}
                >
                  Thử lại
                </button>
              </span>
            )}
          </div>
          <span className="font-bold text-foreground">
            {completedStages.length} / {stages.length} chặng hoàn thành ({Math.round((completedStages.length / stages.length) * 100)}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(completedStages.length / stages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 4. TẦNG 1: SÁU NHÓM KỸ NĂNG (Primary Layer) */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border">
          {LESSON_SKILL_GROUPS.map((group) => {
            const isGroupActive = group.stageIndices.includes(currentStageIndex);
            const groupDoneCount = group.stageIndices.filter((idx) => completedStages.includes(idx)).length;
            const isGroupAllDone = groupDoneCount === group.stageIndices.length;
            const isGroupInProgress = groupDoneCount > 0 && !isGroupAllDone;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  if (!isGroupActive) {
                    handleSelectStage(group.stageIndices[0]);
                  }
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs transition-all relative ${isGroupActive
                  ? "bg-card text-foreground shadow-xs font-bold border border-primary/50 ring-2 ring-primary/30"
                  : isGroupAllDone
                    ? "text-emerald-700 dark:text-emerald-300 hover:bg-card/60 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
              >
                <div className="flex items-center gap-1.5 w-full justify-center">
                  {isGroupAllDone ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : null}
                  <span className="truncate">{group.label}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                  <span>
                    {isGroupAllDone ? "Đã xong" : isGroupInProgress ? "Đang học" : "Chưa học"}
                  </span>
                  <span>·</span>
                  <span>{groupDoneCount}/{group.stageIndices.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. TẦNG 2: CÁC CHẶNG THUỘC NHÓM ĐƯỢC CHỌN (Sub-stages Layer Only - No redundant 10 dots) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                {activeGroup.label}
              </Badge>
              <span className="text-muted-foreground hidden sm:inline">
                {activeGroup.description}
              </span>
            </div>
            <span className="text-muted-foreground text-[11px] font-medium">
              Chặng {currentStageIndex + 1} / {stages.length}
            </span>
          </div>

          {/* Sub-stages buttons of selected group */}
          <div className="flex flex-wrap gap-2">
            {activeGroup.stageIndices.map((idx) => {
              const st = stages[idx];
              if (!st) return null;
              const isActive = idx === currentStageIndex;
              const isDone = completedStages.includes(idx);

              return (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() => handleSelectStage(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : isDone
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  <span className="shrink-0">{isDone ? "✓" : (stageIcons[idx] || (idx + 1))}</span>
                  <span>Chặng {idx + 1}: {st.title_vi.split("&")[0].split("(")[0].trim()}</span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-primary-foreground animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Stage Content Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="space-y-1 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-muted text-muted-foreground font-semibold">
                Chặng {currentStageIndex + 1} / {stages.length}
              </Badge>
              {isCurrentStageCompleted ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1 font-semibold">
                  <CheckCircle2 className="size-3" />
                  Đã hoàn thành
                </Badge>
              ) : (
                <Badge className="border border-primary/30 bg-primary/5 text-primary text-[10px] gap-1 font-semibold">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  Đang xem
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPinyin((v) => !v)}
                className="text-xs h-8 px-2.5"
              >
                {showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation((v) => !v)}
                className="text-xs h-8 px-2.5"
              >
                {showTranslation ? "Ẩn Dịch" : "Hiện Dịch"}
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
          {/* CHẶNG 1: Khởi động (Warmup) */}
          {currentStage.stage === "0_warmup" && currentStage.warmup_words && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium">
                Nghe và lặp lại các âm thanh/từ vựng nền tảng của bài học:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentStage.warmup_words.map((w, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-2 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <p className="hanzi text-2xl font-bold text-foreground">{w.hanzi}</p>
                      {showPinyin && (
                        <p className="text-xs font-mono font-medium text-primary">{w.pinyin}</p>
                      )}
                      {showTranslation && (
                        <p className="text-xs text-muted-foreground mt-0.5">{w.vi}</p>
                      )}
                    </div>
                    <MandarinAudioButton text={w.hanzi} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHẶNG 2: Học từ vựng (Vocab Learn) */}
          {currentStage.stage === "1_vocab_learn" && currentStage.vocabulary && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStage.vocabulary.map((w, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="hanzi text-2xl font-bold text-foreground">{w.simplified}</p>
                      {showPinyin && (
                        <p className="text-xs font-mono font-medium text-primary">{w.pinyin}</p>
                      )}
                      {showTranslation && (
                        <p className="text-xs text-muted-foreground">{w.meaning_vi}</p>
                      )}
                    </div>
                    <MandarinAudioButton text={w.simplified} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHẶNG 4: Học ngữ pháp (Grammar Focus) */}
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
                        className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <p className="hanzi text-base font-bold text-foreground">{ex.hanzi}</p>
                          {showPinyin && (
                            <p className="text-xs font-mono text-primary">{ex.pinyin}</p>
                          )}
                          {showTranslation && (
                            <p className="text-xs text-muted-foreground">{ex.translationVi}</p>
                          )}
                        </div>
                        <MandarinAudioButton text={ex.hanzi} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHẶNG 6: Hội thoại đối đáp (Dialogue) */}
          {currentStage.stage === "5_dialogue_interactive" && currentStage.dialogue && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{currentStage.dialogue.titleVi}</h3>
                  <p className="text-xs text-muted-foreground">Luyện nghe và đọc theo từng lượt đối thoại</p>
                </div>
                <MandarinAudioButton
                  text={currentStage.dialogue.turns.map((t) => t.hanzi).join("。")}
                  size="sm"
                />
              </div>

              <div className="space-y-3">
                {currentStage.dialogue.turns.map((t, tIdx) => (
                  <div
                    key={tIdx}
                    className={`p-4 rounded-2xl border transition-all space-y-1.5 ${t.speaker.toLowerCase().includes("a")
                      ? "border-primary/30 bg-primary/5 mr-6 sm:mr-12"
                      : "border-border bg-card ml-6 sm:ml-12"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{t.speaker}</span>
                      <MandarinAudioButton text={t.hanzi} size="sm" />
                    </div>
                    <p className="hanzi text-lg font-bold text-foreground">{t.hanzi}</p>
                    {showPinyin && (
                      <p className="text-xs font-mono text-primary/90">{t.pinyin}</p>
                    )}
                    {showTranslation && (
                      <p className="text-xs text-muted-foreground">{t.translationVi || t.vi}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHẶNG 8: Đọc hiểu văn bản (Reading Passage) */}
          {currentStage.stage === "7_reading_comprehension" && currentStage.passage && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">{currentStage.passage.title}</h3>
                  <MandarinAudioButton text={currentStage.passage.text} size="sm" />
                </div>
                <p className="hanzi text-lg sm:text-xl font-bold leading-relaxed text-foreground whitespace-pre-line">
                  {currentStage.passage.text}
                </p>
                {showTranslation && currentStage.passage.translationVi && (
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border leading-relaxed">
                    {currentStage.passage.translationVi}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CÁC CHẶNG TƯƠNG TÁC (Chặng 3, 5, 7, 8) */}
          {currentStage.exercises && currentStage.exercises.length > 0 && (
            <div className="space-y-4 pt-2">
              <ExerciseEngine
                exercises={currentStage.exercises}
                onComplete={() => markStageComplete(currentStageIndex)}
              />
            </div>
          )}

          {/* CHẶNG 9: Mini Quiz */}
          {currentStage.stage === "8_mini_quiz" && (
            <div className="text-center p-8 space-y-4 rounded-2xl border border-border bg-card shadow-xs">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Award className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Mini Quiz Đánh giá Cuối bài</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Kiểm tra nhanh mức độ tiếp thu toàn bộ kiến thức của bài học qua bài thi ngắn tự động chấm điểm.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={currentStage.quizUrl || `/lessons/${lesson.id}/quiz`}
                  className="inline-flex min-h-11 items-center px-6 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  Làm Mini Quiz ngay
                </Link>
              </div>
            </div>
          )}

          {/* CHẶNG 10: Ôn tập ngắt quãng (SRS Review) */}
          {currentStage.stage === "9_srs_review" && (
            <div className="text-center p-8 space-y-4 rounded-2xl border border-border bg-card shadow-xs">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Brain className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Ôn tập ngắt quãng SRS</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Các từ vựng trong bài đã được đưa vào chu kỳ nhớ ngắt quãng SRS. Thuật toán sẽ nhắc bạn ôn lại đúng thời điểm để ghi nhớ dài hạn.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={currentStage.reviewUrl || "/review"}
                  className="inline-flex min-h-11 items-center px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Mở trang ôn tập SRS
                </Link>
              </div>

              {/* Lesson Completion Recommendations */}
              <div className="mt-8 pt-6 border-t border-border space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>Bước tiếp theo được đề xuất:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/practice?unit=${unitNum}`}
                    className="p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 flex items-center justify-between gap-2 group transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        Luyện tập Unit {unitNum}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Củng cố từ vựng & ngữ pháp tại Practice Center
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>

                  <Link
                    href={`/exam/unit/u-hsk1-0${unitNum}`}
                    className="p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 flex items-center justify-between gap-2 group transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        Làm Unit Test {unitNum}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Đánh giá 4 kỹ năng với cơ chế chấm điểm server
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* 5. FOOTER NAVIGATION (Sticky / Bottom Bar) */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentStageIndex === 0}
            onClick={() => handleSelectStage(Math.max(0, currentStageIndex - 1))}
            className="gap-1.5 text-xs font-semibold"
          >
            <ChevronLeft className="size-4" />
            <span>Chặng trước</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Chặng {currentStageIndex + 1} / {stages.length}
            </span>
            {isCurrentStageCompleted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Đã học
              </span>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              markStageComplete(currentStageIndex);
              if (currentStageIndex < stages.length - 1) {
                handleSelectStage(currentStageIndex + 1);
              }
            }}
            className="gap-1.5 text-xs font-semibold px-4"
          >
            <span>
              {currentStageIndex === stages.length - 1
                ? "Hoàn thành bài học ✓"
                : isCurrentStageCompleted
                  ? "Chặng tiếp theo"
                  : "Hoàn thành & Tiếp tục"}
            </span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
