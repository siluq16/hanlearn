import "server-only";
import { z } from "zod";
import { requireLearner } from "@/features/auth/session";
import { DataError, readAll } from "@/lib/data";
import { buildLessonBundle } from "./model";
import {
  LESSON_COLUMNS,
  UNIT_COLUMNS,
  COURSE_COLUMNS,
  SYLLABUS_COLUMNS,
  WORD_COLUMNS,
  GRAMMAR_COLUMNS,
  WORD_LINK_COLUMNS,
  GRAMMAR_LINK_COLUMNS,
  PROGRESS_COLUMNS,
} from "./columns";
import type { LessonReadResult } from "./types";

const published = (row: { status: string; review_status: string } | null) =>
  row?.status === "published" && row.review_status === "approved";

export async function getLessonBundle(id: string): Promise<LessonReadResult> {
  const { user, supabase } = await requireLearner();
  if (!z.uuid().safeParse(id).success) return null;
  const lesson = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .eq("review_status", "approved")
    .maybeSingle();
  if (lesson.error) throw new DataError();
  if (!lesson.data || !published(lesson.data)) return null;
  const unit = await supabase
    .from("units")
    .select(UNIT_COLUMNS)
    .eq("id", lesson.data.unit_id)
    .eq("status", "published")
    .eq("review_status", "approved")
    .maybeSingle();
  if (unit.error) throw new DataError();
  if (!unit.data || !published(unit.data)) return null;
  const course = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("id", unit.data.course_id)
    .eq("status", "published")
    .eq("review_status", "approved")
    .maybeSingle();
  if (course.error) throw new DataError();
  if (!course.data || !published(course.data)) return null;
  const syllabus = await supabase
    .from("syllabus_versions")
    .select(SYLLABUS_COLUMNS)
    .eq("id", course.data.syllabus_id)
    .eq("status", "published")
    .eq("review_status", "approved")
    .maybeSingle();
  if (syllabus.error) throw new DataError();
  if (!syllabus.data || !published(syllabus.data)) return null;
  const [vocabularyLinks, grammarLinks, progress] = await Promise.all([
    readAll((from, to) =>
      supabase
        .from("lesson_vocabulary")
        .select(WORD_LINK_COLUMNS)
        .eq("lesson_id", id)
        .order("sort_order")
        .order("vocabulary_id")
        .range(from, to),
    ),
    readAll((from, to) =>
      supabase
        .from("lesson_grammar")
        .select(GRAMMAR_LINK_COLUMNS)
        .eq("lesson_id", id)
        .order("sort_order")
        .order("grammar_id")
        .range(from, to),
    ),
    supabase
      .from("lesson_progress")
      .select(PROGRESS_COLUMNS)
      .eq("lesson_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (progress.error) throw new DataError();
  if (vocabularyLinks.length > 200 || grammarLinks.length > 50)
    return { kind: "invalid-content" };
  const wordIds = vocabularyLinks.map((v) => v.vocabulary_id),
    grammarIds = grammarLinks.map((g) => g.grammar_id);
  const [vocabulary, grammar] = await Promise.all([
    wordIds.length
      ? readAll((from, to) =>
          supabase
            .from("vocabulary")
            .select(WORD_COLUMNS)
            .in("id", wordIds)
            .eq("status", "published")
            .eq("review_status", "approved")
            .order("id")
            .range(from, to),
        )
      : [],
    grammarIds.length
      ? readAll((from, to) =>
          supabase
            .from("grammar_points")
            .select(GRAMMAR_COLUMNS)
            .in("id", grammarIds)
            .eq("status", "published")
            .eq("review_status", "approved")
            .order("id")
            .range(from, to),
        )
      : [],
  ]);
  return buildLessonBundle(
    {
      lesson: lesson.data,
      unit: unit.data,
      course: course.data,
      syllabus: syllabus.data,
      vocabularyLinks,
      grammarLinks,
      vocabulary,
      grammar,
      progress: progress.data,
    },
    user.id,
  );
}
