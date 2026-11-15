"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  X,
  Search,
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

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => ({
    [currentUnitDef.unit_id]: true,
  }));

  const toggleUnit = (uid: string) => {
    setExpandedUnits((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HSK1_UNITS.map((unit) => {
      const unitLessons = regularLessons.filter((l) => unit.lesson_slugs.includes(l.slug));
      if (!q) {
        return { unit, lessons: unitLessons, matchesSearch: false };
      }
      const matched = unitLessons.filter((l) => {
        const num = regularLessons.findIndex((r) => r.slug === l.slug) + 1;
        return (
          l.title.toLowerCase().includes(q) ||
          l.slug.toLowerCase().includes(q) ||
          `bài ${num}`.includes(q) ||
          `bai ${num}`.includes(q) ||
          unit.title.toLowerCase().includes(q)
        );
      });
      return { unit, lessons: matched, matchesSearch: true };
    }).filter((group) => group.lessons.length > 0);
  }, [searchQuery, regularLessons]);

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

            {/* Dropdown Menu organized by Unit with Search & Accordion */}
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

                {/* Search Bar */}
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên bài, số bài hoặc Unit..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-[10px] font-semibold"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* Units List */}
                <div className="space-y-2">
                  {filteredUnits.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      Không tìm thấy bài học nào phù hợp với &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredUnits.map(({ unit, lessons }) => {
                      const isUnitCurrent = unit.lesson_slugs.includes(currentSlug);
                      const isExpanded = !!searchQuery || !!expandedUnits[unit.unit_id];

                      return (
                        <div
                          key={unit.unit_id}
                          className={`rounded-xl border transition-colors ${
                            isUnitCurrent
                              ? "border-primary/40 bg-primary/5"
                              : "border-border/60 bg-card/60"
                          }`}
                        >
                          {/* Unit Accordion Header */}
                          <button
                            type="button"
                            onClick={() => toggleUnit(unit.unit_id)}
                            className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <ChevronRight
                                className={`size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                              <span className="truncate">{unit.title}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                              {isUnitCurrent && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1 py-0 font-bold">
                                  Unit hiện tại
                                </Badge>
                              )}
                              <span className="text-muted-foreground">{lessons.length} bài</span>
                            </div>
                          </button>

                          {/* Unit Lessons Grid (when expanded) */}
                          {isExpanded && (
                            <div className="p-2 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {lessons.map((les) => {
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
                          )}
                        </div>
                      );
                    })
                  )}
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
