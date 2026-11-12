import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { getActiveSyllabus } from "@/features/settings/queries";
import { readAll } from "@/lib/data";
export const getCurriculum = cache(async () => {
  const { user, supabase } = await requireLearner();
  const syllabus = await getActiveSyllabus();
  const [allCourses, allUnits, allLessons, progress] = await Promise.all([
    readAll((f, t) =>
      supabase
        .from("courses")
        .select("id,syllabus_id,hsk_level,title,sort_order,status")
        .order("id")
        .range(f, t),
    ),
    readAll((f, t) =>
      supabase
        .from("units")
        .select("id,course_id,title,sort_order,status")
        .order("id")
        .range(f, t),
    ),
    readAll((f, t) =>
      supabase
        .from("lessons")
        .select(
          "id,unit_id,title,objective_vi,estimated_minutes,sort_order,status",
        )
        .order("id")
        .range(f, t),
    ),
    readAll((f, t) =>
      supabase
        .from("lesson_progress")
        .select("user_id,lesson_id,studied_at,completed_at")
        .eq("user_id", user.id)
        .order("lesson_id")
        .range(f, t),
    ),
  ]);
  const courses = allCourses.filter((c) => c.syllabus_id === syllabus?.id);
  const courseIds = new Set(courses.map((c) => c.id));
  const units = allUnits.filter((u) => courseIds.has(u.course_id));
  const unitIds = new Set(units.map((u) => u.id));
  const lessons = allLessons.filter((l) => unitIds.has(l.unit_id));
  return { syllabus, courses, units, lessons, progress };
});
