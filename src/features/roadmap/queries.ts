import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { getActiveSyllabus } from "@/features/settings/queries";
import { readAll } from "@/lib/data";

type StaticCatalog = {
  courses: Array<{ id: string; syllabus_id: string; hsk_level: number; title: string; sort_order: number; status: string }>;
  units: Array<{ id: string; course_id: string; title: string; sort_order: number; status: string }>;
  lessons: Array<{ id: string; unit_id: string; title: string; objective_vi: string | null; estimated_minutes: number; sort_order: number; status: string }>;
  timestamp: number;
};

let catalogCache: StaticCatalog | null = null;
const CATALOG_TTL = 10 * 60 * 1000; // 10 minutes

export const getCurriculum = cache(async () => {
  const { user, supabase } = await requireLearner();
  const now = Date.now();
  const isCatalogFresh = catalogCache && (now - catalogCache.timestamp < CATALOG_TTL);

  const [syllabus, catalogData, progress] = await Promise.all([
    getActiveSyllabus(),
    isCatalogFresh
      ? Promise.resolve(catalogCache!)
      : Promise.all([
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
        ]).then(([courses, units, lessons]) => {
          const fresh = { courses, units, lessons, timestamp: Date.now() };
          catalogCache = fresh;
          return fresh;
        }),
    readAll((f, t) =>
      supabase
        .from("lesson_progress")
        .select("user_id,lesson_id,studied_at,completed_at")
        .eq("user_id", user.id)
        .order("lesson_id")
        .range(f, t),
    ),
  ]);

  const allCourses = catalogData.courses;
  const allUnits = catalogData.units;
  const allLessons = catalogData.lessons;

  const courses = allCourses.filter((c) => c.syllabus_id === syllabus?.id);
  const courseIds = new Set(courses.map((c) => c.id));
  const units = allUnits.filter((u) => courseIds.has(u.course_id));
  const unitIds = new Set(units.map((u) => u.id));
  const lessons = allLessons.filter((l) => unitIds.has(l.unit_id));
  return { syllabus, courses, units, lessons, progress };
});
