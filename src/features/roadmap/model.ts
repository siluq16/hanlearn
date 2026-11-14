import type { Course, Unit, Lesson, Progress } from "@/types/database";
export function buildRoadmap(
  courses: Course[],
  units: Unit[],
  lessons: Lesson[],
  progress: Progress[],
) {
  const studied = new Set(
    progress.filter((p) => p.studied_at).map((p) => p.lesson_id),
  );
  const completed = new Set(
    progress.filter((p) => p.completed_at).map((p) => p.lesson_id),
  );
  return Array.from({ length: 5 }, (_, i) => {
    const level = i + 1;
    const levelCourses = courses
      .filter((c) => c.hsk_level === level)
      .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
    const courseIds = new Set(levelCourses.map((c) => c.id));
    const levelUnits = units
      .filter((u) => courseIds.has(u.course_id))
      .sort(
        (a, b) =>
          levelCourses.findIndex((c) => c.id === a.course_id) -
            levelCourses.findIndex((c) => c.id === b.course_id) ||
          a.sort_order - b.sort_order,
      );
    const unitIds = new Set(levelUnits.map((u) => u.id));
    const levelLessons = lessons.filter((l) => unitIds.has(l.unit_id));
    const done = levelLessons.filter((l) => completed.has(l.id)).length;
    return {
      level,
      courses: levelCourses,
      units: levelUnits.map((u) => ({
        ...u,
        lessons: levelLessons
          .filter((l) => l.unit_id === u.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => ({
            ...l,
            studied: studied.has(l.id),
            completed: completed.has(l.id),
          })),
      })),
      total: levelLessons.length,
      studied: levelLessons.filter((l) => studied.has(l.id)).length,
      completed: done,
      percent: levelLessons.length ? (done / levelLessons.length) * 100 : null,
    };
  });
}
export function nextLesson(
  courses: Course[],
  units: Unit[],
  lessons: Lesson[],
  progress: Progress[],
  target = 5,
) {
  const completed = new Set(
    progress.filter((p) => p.completed_at).map((p) => p.lesson_id),
  );
  const eligibleCourses = courses
    .filter((c) => c.hsk_level <= target)
    .sort(
      (a, b) =>
        a.hsk_level - b.hsk_level ||
        a.sort_order - b.sort_order ||
        a.id.localeCompare(b.id),
    );
  for (const course of eligibleCourses) {
    const orderedUnits = units
      .filter((u) => u.course_id === course.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    for (const unit of orderedUnits) {
      const lesson = lessons
        .filter((l) => l.unit_id === unit.id && !completed.has(l.id))
        .sort((a, b) => a.sort_order - b.sort_order)[0];
      if (lesson)
        return {
          ...lesson,
          course_title: course.title,
          hsk_level: course.hsk_level,
        };
    }
  }
  return null;
}
