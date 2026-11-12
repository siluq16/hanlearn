import { z } from "zod";

// Plain, escaped text only. Markup and control characters are not content syntax.
export const lessonText = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .refine(
      (s) =>
        s.trim().length > 0 &&
        !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s),
      "Nội dung phải là văn bản thuần hợp lệ.",
    );
export const exampleSchema = z
  .object({
    hanzi: lessonText(1000),
    pinyin: lessonText(1000).optional(),
    translationVi: lessonText(2000).optional(),
  })
  .strict();
const exampleBlock = exampleSchema
  .extend({ type: z.literal("example") })
  .strict();
const paragraphBlock = z
  .object({
    type: z.literal("paragraph"),
    text: lessonText(4000),
    lang: z.enum(["vi", "zh-Hans"]).default("vi"),
  })
  .strict();
const base = {
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
  title: lessonText(160),
};
const ids = (max: number) =>
  z
    .array(z.uuid())
    .min(1)
    .max(max)
    .refine((v) => new Set(v).size === v.length, "Tham chiếu trùng lặp.");
export const lessonSectionSchema = z.discriminatedUnion("type", [
  z
    .object({
      ...base,
      type: z.literal("text"),
      blocks: z
        .array(z.discriminatedUnion("type", [paragraphBlock, exampleBlock]))
        .min(1)
        .max(100),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("vocabulary_refs"),
      vocabularyIds: ids(50),
    })
    .strict(),
  z
    .object({ ...base, type: z.literal("grammar_refs"), grammarIds: ids(20) })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("listening"),
      audioAssetId: z.uuid().nullable(),
      transcript: z.array(exampleBlock).max(20),
    })
    .strict(),
]);
export const lessonContentSchema = z
  .object({
    version: z.literal(1),
    sections: z.array(lessonSectionSchema).max(30),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (new Set(v.sections.map((s) => s.id)).size !== v.sections.length)
      ctx.addIssue({ code: "custom", message: "Section ID phải duy nhất." });
    const blocks = v.sections.flatMap((s) =>
      s.type === "text" ? s.blocks : s.type === "listening" ? s.transcript : [],
    );
    if (blocks.length > 100 || JSON.stringify(v).length > 100000)
      ctx.addIssue({ code: "custom", message: "Nội dung vượt giới hạn." });
  });
export type LessonContent = z.infer<typeof lessonContentSchema>;
export type LessonSection = LessonContent["sections"][number];

export const provenanceColumns = {
  source_uri: lessonText(2048),
  content_license: lessonText(500),
  reviewed_by: lessonText(200),
  reviewed_at: z.iso.datetime({ offset: true }),
  status: z.literal("published"),
  review_status: z.literal("approved"),
};
const named = { id: z.uuid(), title: lessonText(300), ...provenanceColumns };
export const lessonRowSchema = z
  .object({
    ...named,
    unit_id: z.uuid(),
    objective_vi: lessonText(4000).nullable(),
    estimated_minutes: z.number().int().positive(),
    content: z.unknown(),
  })
  .strict();
export const unitRowSchema = z
  .object({ ...named, course_id: z.uuid() })
  .strict();
export const courseRowSchema = z
  .object({
    ...named,
    syllabus_id: z.uuid(),
    hsk_level: z.number().int().min(1).max(9),
  })
  .strict();
export const syllabusRowSchema = z
  .object({
    id: z.uuid(),
    code: lessonText(100),
    display_name: lessonText(300),
    verified_at: z.iso.datetime({ offset: true }),
    ...provenanceColumns,
  })
  .strict();
export const vocabularyRowSchema = z
  .object({
    id: z.uuid(),
    simplified: lessonText(1000),
    traditional: lessonText(1000).nullable(),
    pinyin_marked: lessonText(1000),
    meaning_vi: lessonText(4000),
    example_zh: lessonText(1000).nullable(),
    example_pinyin: lessonText(1000).nullable(),
    example_vi: lessonText(2000).nullable(),
    ...provenanceColumns,
  })
  .strict();
export const grammarRowSchema = z
  .object({
    ...named,
    pattern: lessonText(1000),
    explanation_vi: lessonText(8000),
    examples: z.array(exampleSchema).max(20),
  })
  .strict();
export const vocabularyLinkSchema = z
  .object({
    lesson_id: z.uuid(),
    vocabulary_id: z.uuid(),
    sort_order: z.number().int(),
  })
  .strict();
export const grammarLinkSchema = z
  .object({
    lesson_id: z.uuid(),
    grammar_id: z.uuid(),
    sort_order: z.number().int(),
  })
  .strict();
export const progressRowSchema = z
  .object({
    user_id: z.uuid(),
    lesson_id: z.uuid(),
    studied_at: z.iso.datetime({ offset: true }).nullable(),
    completed_at: z.iso.datetime({ offset: true }).nullable(),
  })
  .strict();
