import { describe, it, expect } from "vitest";
import { buildRoadmap, nextLesson } from "@/features/roadmap/model";
import type { Course, Unit, Lesson, Progress } from "@/types/database";
const courses: Course[] = [
  {
    id: "c",
    syllabus_id: "s",
    hsk_level: 1,
    title: "Fixture course",
    sort_order: 0,
    status: "published",
  },
];
const units: Unit[] = [
  {
    id: "u",
    course_id: "c",
    title: "Fixture unit",
    sort_order: 1,
    status: "published",
  },
];
const lessons: Lesson[] = [
  {
    id: "second",
    unit_id: "u",
    title: "Second fixture",
    objective_vi: null,
    estimated_minutes: 30,
    sort_order: 2,
    status: "published",
  },
  {
    id: "first",
    unit_id: "u",
    title: "First fixture",
    objective_vi: null,
    estimated_minutes: 30,
    sort_order: 1,
    status: "published",
  },
];
const progress: Progress[] = [
  {
    user_id: "a",
    lesson_id: "first",
    studied_at: "2026-01-01",
    completed_at: "2026-01-01",
  },
  {
    user_id: "a",
    lesson_id: "hidden",
    studied_at: "2026-01-01",
    completed_at: "2026-01-01",
  },
];
describe("roadmap contracts", () => {
  it("keeps five roadmap levels without inventing content or percentages", () => {
    const result = buildRoadmap([], [], [], []);
    expect(result).toHaveLength(5);
    expect(result.every((r) => r.total === 0 && r.percent === null)).toBe(true);
  });
  it("excludes hidden/historical lessons from current denominator", () => {
    const result = buildRoadmap(courses, units, lessons, progress)[0];
    expect(result.total).toBe(2);
    expect(result.completed).toBe(1);
    expect(result.percent).toBe(50);
  });
  it("selects first incomplete lesson in authored order", () =>
    expect(nextLesson(courses, units, lessons, [])?.id).toBe("first"));
  it("advances only on persisted completion", () =>
    expect(nextLesson(courses, units, lessons, progress)?.id).toBe("second"));
  it("stops when curriculum is completed", () =>
    expect(
      nextLesson(
        courses,
        units,
        lessons,
        lessons.map((l) => ({
          user_id: "a",
          lesson_id: l.id,
          studied_at: "now",
          completed_at: "now",
        })),
      ),
    ).toBeNull());
  it("respects target level", () =>
    expect(
      nextLesson([{ ...courses[0], hsk_level: 6 }], units, lessons, [], 5),
    ).toBeNull());
});
