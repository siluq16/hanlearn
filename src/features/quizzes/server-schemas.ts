import "server-only";
import { z } from "zod";
import { lessonText, provenanceColumns } from "@/features/lessons/schemas";
const date = z.iso.datetime({ offset: true });
export const quizRow = z
  .object({
    id: z.uuid(),
    lesson_id: z.uuid(),
    revision: z.number().int().positive(),
    title: lessonText(300),
    published_at: date,
    ...provenanceColumns,
  })
  .strict();
export const questionRow = z
  .object({
    id: z.uuid(),
    quiz_id: z.uuid(),
    sort_order: z.number().int(),
    prompt: lessonText(2000),
    choices: z.array(lessonText(1000)).min(2).max(6),
    ...provenanceColumns,
  })
  .strict();
export const attemptRow = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    quiz_id: z.uuid(),
    started_at: date,
    submitted_at: date.nullable(),
    correct_count: z.number().int().min(0).max(10).nullable(),
    question_count: z.number().int().min(5).max(10).nullable(),
    passed: z.boolean().nullable(),
  })
  .strict()
  .refine((a) =>
    a.submitted_at
      ? a.correct_count !== null &&
        a.question_count !== null &&
        a.correct_count <= a.question_count &&
        a.passed !== null
      : a.correct_count === null &&
        a.question_count === null &&
        a.passed === null,
  );
