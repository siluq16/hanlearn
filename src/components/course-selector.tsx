"use client";

import { useState } from "react";
import { ChevronDown, Check, Sparkles, AlertCircle, BookOpen } from "lucide-react";
import { AVAILABLE_COURSES } from "@/features/courses/constants";
import type { CourseDefinition } from "@/features/courses/types";

function persistSelectedCourse(slug: string) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("hl_selected_course", slug);
      document.cookie = `hl_selected_course=${slug}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch {}
}

export function CourseSelector() {
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hl_selected_course");
        if (saved && AVAILABLE_COURSES.some((c) => c.slug === saved)) {
          return saved;
        }
      } catch {}
    }
    return "hsk1";
  });
  const [isOpen, setIsOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<CourseDefinition | null>(null);

  const currentCourse = AVAILABLE_COURSES.find((c) => c.slug === selectedSlug) || AVAILABLE_COURSES[0];

  const handleSelect = (course: CourseDefinition) => {
    if (course.status === "coming_soon") {
      setIsOpen(false);
      setComingSoonModal(course);
      return;
    }
    setSelectedSlug(course.slug);
    persistSelectedCourse(course.slug);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-10 items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted/80 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Chọn khóa học tiếng Trung"
        >
          <span className="grid size-5 place-items-center rounded-md bg-primary/10 text-primary">
            <BookOpen className="size-3.5" />
          </span>
          <span className="font-bold tracking-tight text-primary sm:text-xs">
            {currentCourse.name}
          </span>
          <span className="hidden text-muted-foreground sm:inline">· {currentCourse.level_name}</span>
          <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              role="listbox"
              className="absolute left-0 sm:left-auto sm:right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl animate-in fade-in-50 zoom-in-95"
            >
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                Chọn khóa học tiếng Trung
              </div>
              <div className="mt-1 space-y-1">
                {AVAILABLE_COURSES.map((course) => {
                  const isSelected = course.slug === selectedSlug;
                  const isAvailable = course.status === "available";

                  return (
                    <button
                      key={course.course_id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(course)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {course.name.replace("HSK ", "")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{course.name} · {course.level_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {course.total_vocabulary} từ vựng
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang học
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Sắp ra mắt
                          </span>
                        )}
                        {isSelected && <Check className="size-4 text-primary ml-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Coming Soon Polite Dialog */}
      {comingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Khóa học {comingSoonModal.name} đang được biên soạn
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tiêu chuẩn Khung năng lực tiếng Hán 2025
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Giáo trình {comingSoonModal.name} ({comingSoonModal.level_name}) với quy mô {comingSoonModal.total_vocabulary} từ vựng đang được đội ngũ sư phạm HanLearn hiệu đính, gắn audio đối thoại và xây dựng ngân hàng bài tập tương tác.
            </p>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                Hiện tại bạn hãy tiếp tục lộ trình 32 bài học và thi thử chuẩn của <strong>HSK 1</strong> để xây nền móng vững chắc nhất!
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setComingSoonModal(null)}
                className="px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Đã hiểu, quay lại học HSK 1
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
