"use client";

import { CheckCircle2, CircleDot, SkipForward } from "lucide-react";

export type QuestionStatus = "unanswered" | "active" | "completed" | "skipped";

interface QuestionNavigatorProps {
  totalCount: number;
  currentIndex: number;
  questionStatuses: Record<number, QuestionStatus>;
  onSelectQuestion: (index: number) => void;
  allowJump?: boolean;
}

export function QuestionNavigator({
  totalCount,
  currentIndex,
  questionStatuses,
  onSelectQuestion,
  allowJump = true,
}: QuestionNavigatorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
        <span className="font-semibold text-foreground">Danh sách câu hỏi</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            Đã làm
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500 inline-block" />
            Bỏ qua
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary inline-block" />
            Đang xem
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {Array.from({ length: totalCount }, (_, idx) => {
          const isActive = idx === currentIndex;
          const status = questionStatuses[idx] || (isActive ? "active" : "unanswered");

          let statusClass = "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80";
          if (isActive) {
            statusClass = "bg-primary text-primary-foreground font-bold border-primary ring-2 ring-primary/30 shadow-xs";
          } else if (status === "completed") {
            statusClass = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold";
          } else if (status === "skipped") {
            statusClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 font-semibold";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={!allowJump}
              onClick={() => onSelectQuestion(idx)}
              title={`Câu ${idx + 1}: ${
                status === "completed" ? "Đã trả lời" : status === "skipped" ? "Đã bỏ qua" : "Chưa làm"
              }`}
              className={`size-8 shrink-0 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all relative ${statusClass}`}
            >
              <span>{idx + 1}</span>
              {status === "completed" && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-500 ring-1 ring-background" />
              )}
              {status === "skipped" && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 ring-1 ring-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
