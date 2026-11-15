"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HSK1_UNITS } from "@/features/courses/constants";
import { HSK1_NINE_STAGE_LESSONS } from "@/features/content-library/curriculum-data";

interface LessonNavHeaderProps {
  currentSlug: string;
  lessonTitle: string;
  unitId?: string;
  completedStagesCount?: number;
  totalStages?: number;
}

export function LessonNavHeader({
  currentSlug,
  lessonTitle,
  unitId,
  completedStagesCount: _completedStagesCount = 0,
  totalStages: _totalStages = 10,
}: LessonNavHeaderProps) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click or ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSwitcherOpen(false);
      }
    }

    if (isSwitcherOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSwitcherOpen]);

  // Extract all 32 regular lessons
  const regularLessons = HSK1_NINE_STAGE_LESSONS.filter((l) =>
    l.slug.startsWith("hsk1-lesson-")
  );

  const currentIndex = regularLessons.findIndex((l) => l.slug === currentSlug);
  const currentLessonNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalLessons = regularLessons.length;

  const prevLesson = currentIndex > 0 ? regularLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < totalLessons - 1
      ? regularLessons[currentIndex + 1]
      : null;

  // Find current unit definition
  const currentUnitDef = HSK1_UNITS.find(
    (u) => u.unit_id === unitId || u.lesson_slugs.includes(currentSlug)
  ) || HSK1_UNITS[0];

  const shortLessonTitle = lessonTitle.split(":")[0]?.trim() || `Bài ${currentLessonNumber}`;

  return (
    <div className="space-y-3">
      {/* 3.1 Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-muted-foreground flex-wrap font-medium"
        >
          <Link
            href="/roadmap"
            className="hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            Lộ trình
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
          <Link
            href="/roadmap"
            className="hover:text-foreground transition-colors hover:underline underline-offset-4"
          >
            HSK 1
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
          <Link
            href={`/roadmap#${currentUnitDef.unit_id}`}
            className="hover:text-foreground transition-colors hover:underline underline-offset-4 truncate max-w-[140px] sm:max-w-none"
          >
            Unit {currentUnitDef.unit_number}
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
          <span className="text-foreground font-semibold truncate max-w-[180px] sm:max-w-xs">
            {shortLessonTitle}
          </span>
        </nav>

        {/* 3.3 Previous / Next Lesson controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            asChild={!!prevLesson}
            disabled={!prevLesson}
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 gap-1 rounded-lg"
            title={prevLesson ? `Bài trước: ${prevLesson.title}` : "Đây là bài đầu tiên"}
          >
            {prevLesson ? (
              <Link href={`/lessons/stage/${prevLesson.slug}`}>
                <ChevronLeft className="size-3.5" />
                <span className="hidden sm:inline">Bài trước</span>
              </Link>
            ) : (
              <span>
                <ChevronLeft className="size-3.5" />
                <span className="hidden sm:inline">Bài trước</span>
              </span>
            )}
          </Button>

          {/* 3.2 Lesson Switcher Popover trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-2xs"
              aria-expanded={isSwitcherOpen}
              aria-haspopup="true"
            >
              <span>
                Bài {currentLessonNumber}/{totalLessons}
              </span>
              <ChevronDown
                className={`size-3 text-muted-foreground transition-transform duration-200 ${
                  isSwitcherOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu organized by Unit */}
            {isSwitcherOpen && (
              <div
                className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-3 max-h-[80vh] overflow-y-auto"
                role="menu"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      Danh sách bài học HSK 1 ({totalLessons} bài)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSwitcherOpen(false)}
                    className="size-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {HSK1_UNITS.map((unit) => {
                    const unitLessons = regularLessons.filter((l) =>
                      unit.lesson_slugs.includes(l.slug)
                    );
                    if (unitLessons.length === 0) return null;

                    const isUnitCurrent = unit.lesson_slugs.includes(currentSlug);

                    return (
                      <div
                        key={unit.unit_id}
                        className={`rounded-xl border p-2.5 space-y-1.5 transition-colors ${
                          isUnitCurrent
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/60 bg-card/60"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                          <span className="truncate">{unit.title}</span>
                          <span className="shrink-0 text-[10px]">
                            {unitLessons.length} bài
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {unitLessons.map((les) => {
                            const isCurrent = les.slug === currentSlug;
                            const lesNumber = regularLessons.findIndex((r) => r.slug === les.slug) + 1;

                            return (
                              <Link
                                key={les.slug}
                                href={`/lessons/stage/${les.slug}`}
                                onClick={() => setIsSwitcherOpen(false)}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                    : "bg-muted/50 hover:bg-muted text-foreground"
                                }`}
                              >
                                <span className="truncate pr-1">
                                  Bài {lesNumber}: {les.title.split(":")[1]?.trim() || les.title}
                                </span>
                                {isCurrent && (
                                  <Badge className="bg-primary-foreground text-primary text-[9px] px-1 py-0 font-bold shrink-0">
                                    Đang học
                                  </Badge>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            asChild={!!nextLesson}
            disabled={!nextLesson}
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 gap-1 rounded-lg"
            title={nextLesson ? `Bài tiếp theo: ${nextLesson.title}` : "Đây là bài cuối cùng"}
          >
            {nextLesson ? (
              <Link href={`/lessons/stage/${nextLesson.slug}`}>
                <span className="hidden sm:inline">Bài tiếp</span>
                <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <span>
                <span className="hidden sm:inline">Bài tiếp</span>
                <ChevronRight className="size-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
