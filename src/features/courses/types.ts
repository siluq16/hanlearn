export type CourseStatus = "available" | "coming_soon";

export interface CourseDefinition {
  course_id: string;
  slug: string;
  name: string;
  level_name: string;
  description: string;
  curriculum_version: string;
  status: CourseStatus;
  total_units: number;
  total_lessons: number;
  total_vocabulary: number;
}

export interface UnitDefinition {
  unit_id: string;
  unit_number: number;
  course_id: string;
  title: string;
  topic: string;
  description: string;
  lesson_slugs: string[];
  unit_test_slug: string;
}

export interface CourseProgressSummary {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  total_unit_tests: number;
  passed_unit_tests: number;
  total_vocabulary: number;
  learned_vocabulary: number;
  percent: number;
  current_unit_number: number;
  next_lesson_slug?: string;
  next_lesson_title?: string;
}
