import { z } from "zod";
import {
  courseRowSchema,
  grammarLinkSchema,
  grammarRowSchema,
  lessonContentSchema,
  lessonRowSchema,
  progressRowSchema,
  syllabusRowSchema,
  unitRowSchema,
  vocabularyLinkSchema,
  vocabularyRowSchema,
} from "./schemas";
import type { LessonBundle, LessonReadResult, Provenance } from "./types";

export type LessonReadRows = {
  lesson: unknown;
  unit: unknown;
  course: unknown;
  syllabus: unknown;
  vocabularyLinks: unknown;
  grammarLinks: unknown;
  vocabulary: unknown;
  grammar: unknown;
  progress: unknown;
};
const provenance = (row: {
  source_uri: string;
  content_license: string;
  reviewed_by: string;
  reviewed_at: string;
}): Provenance => ({
  sourceUri: row.source_uri,
  license: row.content_license,
  reviewedBy: row.reviewed_by,
  reviewedAt: row.reviewed_at,
});

// Pure boundary: no raw rows/JSON, identity or error diagnostics enter client props.
export function buildLessonBundle(
  rows: LessonReadRows,
  userId: string,
): LessonReadResult {
  const lesson = lessonRowSchema.safeParse(rows.lesson),
    unit = unitRowSchema.safeParse(rows.unit),
    course = courseRowSchema.safeParse(rows.course),
    syllabus = syllabusRowSchema.safeParse(rows.syllabus);
  if (!lesson.success || !unit.success || !course.success || !syllabus.success)
    return null;
  const l = lesson.data,
    u = unit.data,
    c = course.data,
    s = syllabus.data;
  if (l.unit_id !== u.id || u.course_id !== c.id || c.syllabus_id !== s.id)
    return null;
  const invalid = { kind: "invalid-content" } as const;
  try {
    if ((JSON.stringify(l.content)?.length ?? 0) > 100000) return invalid;
  } catch {
    return invalid;
  }
  const content = lessonContentSchema.safeParse(l.content);
  const vl = z
      .array(vocabularyLinkSchema)
      .max(200)
      .safeParse(rows.vocabularyLinks),
    gl = z.array(grammarLinkSchema).max(50).safeParse(rows.grammarLinks);
  const words = z
      .array(vocabularyRowSchema)
      .max(200)
      .safeParse(rows.vocabulary),
    grammar = z.array(grammarRowSchema).max(50).safeParse(rows.grammar);
  const progress = progressRowSchema.nullable().safeParse(rows.progress);
  if (
    !content.success ||
    !vl.success ||
    !gl.success ||
    !words.success ||
    !grammar.success ||
    !progress.success
  )
    return invalid;
  if (
    vl.data.some((v) => v.lesson_id !== l.id) ||
    gl.data.some((g) => g.lesson_id !== l.id)
  )
    return invalid;
  const wordIds = new Set(vl.data.map((v) => v.vocabulary_id)),
    grammarIds = new Set(gl.data.map((g) => g.grammar_id));
  if (
    wordIds.size !== vl.data.length ||
    grammarIds.size !== gl.data.length ||
    words.data.length !== wordIds.size ||
    grammar.data.length !== grammarIds.size ||
    new Set(words.data.map((w) => w.id)).size !== words.data.length ||
    new Set(grammar.data.map((g) => g.id)).size !== grammar.data.length ||
    words.data.some((w) => !wordIds.has(w.id)) ||
    grammar.data.some((g) => !grammarIds.has(g.id))
  )
    return invalid;
  for (const section of content.data.sections) {
    if (
      section.type === "vocabulary_refs" &&
      section.vocabularyIds.some((id) => !wordIds.has(id))
    )
      return invalid;
    if (
      section.type === "grammar_refs" &&
      section.grammarIds.some((id) => !grammarIds.has(id))
    )
      return invalid;
  }
  const p = progress.data;
  if (
    p &&
    (p.user_id !== userId ||
      p.lesson_id !== l.id ||
      (p.completed_at !== null && p.studied_at === null))
  )
    return invalid;
  const byOrder = <T extends { sort_order: number }>(
    a: T,
    b: T,
    aId: string,
    bId: string,
  ) => a.sort_order - b.sort_order || aId.localeCompare(bId);
  const vocabulary = [...vl.data]
    .sort((a, b) => byOrder(a, b, a.vocabulary_id, b.vocabulary_id))
    .map((link) => {
      const w = words.data.find((v) => v.id === link.vocabulary_id)!;
      return {
        id: w.id,
        hanzi: w.simplified,
        traditional: w.traditional,
        pinyin: w.pinyin_marked,
        meaningVi: w.meaning_vi,
        example: w.example_zh
          ? {
              hanzi: w.example_zh,
              ...(w.example_pinyin ? { pinyin: w.example_pinyin } : {}),
              ...(w.example_vi ? { translationVi: w.example_vi } : {}),
            }
          : null,
        provenance: provenance(w),
        audio: { status: "unavailable", reason: "storage_unverified" } as const,
      };
    });
  const grammarItems = [...gl.data]
    .sort((a, b) => byOrder(a, b, a.grammar_id, b.grammar_id))
    .map((link) => {
      const g = grammar.data.find((v) => v.id === link.grammar_id)!;
      return {
        id: g.id,
        title: g.title,
        pattern: g.pattern,
        explanationVi: g.explanation_vi,
        examples: g.examples,
        provenance: provenance(g),
      };
    });
  const bundle: LessonBundle = {
    lesson: {
      id: l.id,
      title: l.title,
      objectiveVi: l.objective_vi,
      estimatedMinutes: l.estimated_minutes,
      provenance: provenance(l),
    },
    unit: { id: u.id, title: u.title, provenance: provenance(u) },
    course: {
      id: c.id,
      title: c.title,
      hskLevel: c.hsk_level,
      provenance: provenance(c),
    },
    syllabus: {
      id: s.id,
      code: s.code,
      title: s.display_name,
      provenance: provenance(s),
    },
    content: content.data,
    vocabulary,
    grammar: grammarItems,
    progress: {
      studiedAt: p?.studied_at ?? null,
      completedAt: p?.completed_at ?? null,
    },
  };
  return { kind: "ready", bundle };
}
