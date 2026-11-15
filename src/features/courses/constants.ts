import type { CourseDefinition, UnitDefinition } from "./types";
import { UNIFIED_UNITS } from "@/features/curriculum/unified-metadata";

export const AVAILABLE_COURSES: CourseDefinition[] = [
  {
    course_id: "course-hsk1",
    slug: "hsk1",
    name: "HSK 1",
    level_name: "Sơ cấp 1",
    description: "Khóa học tiếng Trung HSK 1 toàn diện gồm 32 bài học, 6 Unit, Module 0 Pinyin, 6 Unit Test và Đề thi thử HSK 1.",
    curriculum_version: "2025.1",
    status: "available",
    total_units: 6,
    total_lessons: 32,
    total_vocabulary: 300,
  },
  {
    course_id: "course-hsk2",
    slug: "hsk2",
    name: "HSK 2",
    level_name: "Sơ cấp 2",
    description: "Khóa học mở rộng 700 từ vựng và các mẫu câu giao tiếp trung cấp cơ bản.",
    curriculum_version: "2025.1",
    status: "coming_soon",
    total_units: 6,
    total_lessons: 36,
    total_vocabulary: 700,
  },
  {
    course_id: "course-hsk3",
    slug: "hsk3",
    name: "HSK 3",
    level_name: "Trung cấp 1",
    description: "Nâng cao năng lực đàm thoại hàng ngày và đọc hiểu 1.200 từ vựng.",
    curriculum_version: "2025.1",
    status: "coming_soon",
    total_units: 8,
    total_lessons: 40,
    total_vocabulary: 1200,
  },
  {
    course_id: "course-hsk4",
    slug: "hsk4",
    name: "HSK 4",
    level_name: "Trung cấp 2",
    description: "Thành thạo giao tiếp đa chủ đề và xử lý văn bản chuyên môn 2.200 từ.",
    curriculum_version: "2025.1",
    status: "coming_soon",
    total_units: 10,
    total_lessons: 45,
    total_vocabulary: 2200,
  },
  {
    course_id: "course-hsk5",
    slug: "hsk5",
    name: "HSK 5",
    level_name: "Cao cấp 1",
    description: "Đọc báo, xem phim và thuyết trình lưu loát với 4.000 từ vựng chuyên sâu.",
    curriculum_version: "2025.1",
    status: "coming_soon",
    total_units: 12,
    total_lessons: 50,
    total_vocabulary: 4000,
  },
];

export const HSK1_UNITS: UnitDefinition[] = UNIFIED_UNITS.map((u) => ({
  unit_id: u.id,
  unit_number: u.unitNumber,
  course_id: "course-hsk1",
  title: u.fullTitle,
  topic: u.topic,
  description: u.description,
  lesson_slugs: u.lessonSlugs,
  unit_test_slug: u.unitTestSlug,
}));

export function getCourseBySlug(slug: string): CourseDefinition | undefined {
  return AVAILABLE_COURSES.find((c) => c.slug === slug);
}

export function getUnitsForCourse(courseSlug: string): UnitDefinition[] {
  if (courseSlug === "hsk1") return HSK1_UNITS;
  return [];
}
