"use client";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { LessonContent } from "../schemas";

// Position is a reading aid only, never completion/progress evidence.
export function SectionNavigation({
  sections,
}: {
  sections: LessonContent["sections"];
}) {
  const [activeId, setActiveId] = useState("");
  const nav = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const current = sections.some((s) => s.id === activeId)
    ? activeId
    : sections[0]?.id;
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const threshold = (nav.current?.offsetHeight ?? 100) + 40;
      let selected = sections[0]?.id ?? "";
      for (const section of sections) {
        const target = document.getElementById(`section-${section.id}`);
        if (target && target.getBoundingClientRect().top <= threshold)
          selected = section.id;
      }
      setActiveId(selected);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [sections]);
  useEffect(() => {
    const scroller = rail.current;
    const link = scroller?.querySelector<HTMLElement>(
      '[aria-current="location"]',
    );
    if (!scroller || !link) return;
    const parent = scroller.getBoundingClientRect(),
      child = link.getBoundingClientRect();
    // Scroll the rail only; scrollIntoView here would unexpectedly move the page.
    if (child.left < parent.left || child.right > parent.right)
      scroller.scrollLeft += child.left - parent.left - 4;
  }, [current]);
  function keyboard(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % sections.length
        : event.key === "ArrowLeft"
          ? (index + sections.length - 1) % sections.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? sections.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    rail.current
      ?.querySelectorAll<HTMLAnchorElement>("a")
      [next]?.focus({ preventScroll: true });
    const focused =
      rail.current?.querySelectorAll<HTMLAnchorElement>("a")[next];
    if (focused && rail.current) {
      rail.current.scrollLeft +=
        focused.getBoundingClientRect().left -
        rail.current.getBoundingClientRect().left -
        4;
    }
  }
  if (!sections.length) return null;
  return (
    <nav
      ref={nav}
      aria-label="Các phần của bài học"
      className="sticky top-0 z-10 min-w-0 rounded-xl border border-border bg-background p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Nội dung bài</span>
        <span>
          Phần {sections.findIndex((s) => s.id === current) + 1} /{" "}
          {sections.length} · Vuốt hoặc dùng ← →
        </span>
      </div>
      <div
        ref={rail}
        className="flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2 pt-1"
      >
        {sections.map((s, index) => (
          <a
            key={s.id}
            href={`#section-${s.id}`}
            title={s.title}
            aria-current={current === s.id ? "location" : undefined}
            onKeyDown={(event) => keyboard(event, index)}
            onClick={() => {
              setActiveId(s.id);
              document
                .getElementById(`section-${s.id}`)
                ?.focus({ preventScroll: true });
            }}
            className={`inline-flex min-h-11 max-w-72 shrink-0 items-center gap-2 rounded-full border px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${current === s.id ? "border-primary bg-primary font-semibold text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"}`}
          >
            <span aria-hidden="true" className="text-xs opacity-75">
              {index + 1}
            </span>
            <span className="truncate">{s.title}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
