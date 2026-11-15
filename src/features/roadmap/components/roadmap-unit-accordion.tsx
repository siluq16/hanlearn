"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Award,
  ArrowRight,
  Dumbbell,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UnitDefinition } from "@/features/courses/types";
import type { LearnerProgressOverview } from "@/features/courses/queries";

export interface LessonSummaryInfo {
  slug: string;
  title: string;
  objective_vi: string;
  estimated_minutes: number;
}

interface RoadmapUnitAccordionProps {
  units: UnitDefinition[];
  prog: LearnerProgressOverview;
  lessonSummaries: Record<string, LessonSummaryInfo>;
}

export function RoadmapUnitAccordion({
  units,
  prog,
  lessonSummaries,
}: RoadmapUnitAccordionProps) {
  // Determine initially expanded unit (the first in_progress unit, or unit 1)
  const defaultExpandedId =
    units.find((u) => prog.unitProgress[u.unit_id]?.status === "in_progress")?.unit_id ||
    units[0]?.unit_id;

  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    [defaultExpandedId]: true,
  });

  function toggleUnit(unitId: string) {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  }

  return (
    <div className="space-y-4">
      {units.map((unit) => {
        const uProg = prog.unitProgress[unit.unit_id];
        const isCompleted = uProg?.status === "completed";
        const isInProgress = uProg?.status === "in_progress";
        const isExpanded = !!expandedUnits[unit.unit_id];

        // Find the first uncompleted lesson in this unit for "Tiếp tục học" CTA
        const nextLessonInUnit =
          unit.lesson_slugs.find((s: string) => !prog.lessonProgress[s]?.isCompleted) ||
          unit.lesson_slugs[0];

        return (
          <Card
            key={unit.unit_id}
            className={`border transition-all duration-200 overflow-hidden ${
              isExpanded
                ? "border-primary/40 shadow-sm ring-1 ring-primary/10"
                : "border-border hover:border-border/80 shadow-xs"
            }`}
          >
            {/* Collapsed Header / Accordion Trigger */}
            <div
              onClick={() => toggleUnit(unit.unit_id)}
              className="p-4 sm:p-5 cursor-pointer select-none bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Unit Icon + Title + Topic */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl text-base font-bold shadow-xs ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isInProgress
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {unit.unit_number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        {unit.title}
                      </h3>
                      <Badge
                        className={`text-[10px] font-semibold ${
                          isCompleted
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : isInProgress
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted
                          ? "Đã hoàn thành"
                          : isInProgress
                            ? "Đang học"
                            : "Chưa bắt đầu"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {unit.topic}
                    </p>

                    {/* Progress & Test Status row (Visible always) */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <BookOpen className="size-3.5 text-primary" />
                        {uProg?.completedLessons || 0} / {unit.lesson_slugs.length} bài xong
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Award className="size-3.5 text-amber-500" />
                        {uProg?.isUnitTestPassed ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Unit Test: Đạt 80% ✓
                          </span>
                        ) : uProg?.unitTestBestScore !== null && uProg?.unitTestBestScore !== undefined ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            Unit Test: {uProg.unitTestBestScore}/20 (Chưa đạt)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Unit Test: Chưa làm
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions & Expand/Collapse Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/lessons/stage/${nextLessonInUnit}`}
                      className="inline-flex min-h-9 items-center gap-1.5 px-3 rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                    >
                      <PlayCircle className="size-3.5" />
                      <span>{isCompleted ? "Ôn tập Unit" : "Tiếp tục học"}</span>
                    </Link>

                    <Link
                      href={`/practice?unit=${unit.unit_number}`}
                      className="inline-flex min-h-9 items-center gap-1.5 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <Dumbbell className="size-3.5 text-primary" />
                      <span className="hidden sm:inline">Luyện tập Unit</span>
                      <span className="sm:hidden">Luyện</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    aria-label={isExpanded ? "Thu gọn Unit" : "Mở rộng Unit"}
                    className="grid size-9 place-items-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <ChevronDown
                      className={`size-5 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
              <CardContent className="p-4 sm:p-6 pt-2 border-t border-border/60 bg-muted/15 space-y-5 animate-in fade-in-50 duration-200">
                {/* 1. Lessons in this Unit */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Danh sách bài học ({uProg?.completedLessons || 0} / {unit.lesson_slugs.length} hoàn thành)
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {unit.lesson_slugs.map((lSlug: string, idx: number) => {
                      const lesson = lessonSummaries[lSlug];
                      const lProg = prog.lessonProgress[lSlug];
                      const isDone = lProg?.isCompleted;

                      return (
                        <div
                          key={lSlug}
                          id={`lesson-${lSlug}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold text-muted-foreground mt-0.5">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            {isDone ? (
                              <CheckCircle2 className="size-5 shrink-0 text-emerald-500 mt-0.5" />
                            ) : (
                              <BookOpen className="size-5 shrink-0 text-primary mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <span className="block text-sm font-bold text-foreground">
                                {lesson?.title || lSlug}
                              </span>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {lesson?.objective_vi || "Học từ vựng, ngữ pháp, bài tập tương tác, hội thoại và mini quiz."}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock3 className="size-3" />
                                  {lesson?.estimated_minutes || 25} phút
                                </span>
                                <span className="text-muted-foreground text-[10px]">•</span>
                                <span
                                  className={`text-[11px] font-medium ${
                                    isDone
                                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                      : lProg?.completedStagesCount
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {isDone
                                    ? "Đã hoàn thành 9 giai đoạn"
                                    : lProg?.completedStagesCount
                                      ? `Đang học · Xong ${lProg.completedStagesCount}/10 chặng`
                                      : "Chưa học"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex justify-end">
                            <Link
                              href={`/lessons/stage/${lSlug}`}
                              className="inline-flex min-h-8 items-center gap-1 px-3 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-semibold transition-colors"
                            >
                              <span>{isDone ? "Xem lại" : "Vào học"}</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Unit Test Milestone Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-primary/25 bg-primary/5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-xs">
                        <Award className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-foreground">
                            Bài Kiểm tra Đánh giá Unit {unit.unit_number}
                          </h4>
                          {uProg?.isUnitTestPassed ? (
                            <Badge className="bg-emerald-500 text-white font-semibold text-[10px]">
                              Đạt 80% ✓
                            </Badge>
                          ) : (
                            <Badge className="border border-border bg-card text-[10px] font-semibold text-muted-foreground">
                              Mastery 80%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Thời gian: 20 phút · Quy mô: 20 câu hỏi tổng hợp 4 kỹ năng (Nghe, Từ vựng, Ngữ pháp, Đọc hiểu)
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/exam/unit/${unit.unit_number}`}
                      className="inline-flex min-h-10 items-center px-4 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity gap-1.5 shrink-0 shadow-xs"
                    >
                      <span>
                        {uProg?.isUnitTestPassed
                          ? `Thi lại Unit Test ${unit.unit_number}`
                          : `Bắt đầu Unit Test ${unit.unit_number}`}
                      </span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 3. Quick Practice Center Link for this Unit */}
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                  <span>Củng cố kiến thức trước bài thi:</span>
                  <Link
                    href={`/practice?unit=${unit.unit_number}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <Dumbbell className="size-3.5" />
                    <span>Luyện tập các bộ bài Unit {unit.unit_number}</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
