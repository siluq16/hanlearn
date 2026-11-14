import { z } from "zod";
import { localStudyTarget } from "@/features/lessons/study-contract";
import type { StudyProgress } from "@/features/lessons/study-contract";
export const responseRow = z
  .object({
    question_id: z.uuid(),
    answer_index: z.number().int().min(0).max(5).nullable(),
    is_correct: z.boolean(),
  })
  .strict();
export const lessonIdSchema = z.union([
  z.uuid(),
  z.string().regex(/^[a-zA-Z0-9_-]{3,64}$/),
]);

export const readInput = z
  .object({ lessonId: lessonIdSchema, attemptId: z.uuid().optional() })
  .strict();
export const startInput = z
  .object({ lessonId: lessonIdSchema, startKey: z.uuid() })
  .strict();
export const answersSchema = z
  .record(z.uuid(), z.number().int().min(0).max(5))
  .refine((a) => Object.keys(a).length <= 10);
export const submitInput = z
  .object({ lessonId: lessonIdSchema, attemptId: z.uuid(), answers: answersSchema })
  .strict();
export const startReceipt = z
  .object({ attemptId: z.uuid(), quizId: z.uuid() })
  .strict();
export const submitReceipt = z
  .object({
    attemptId: z.uuid(),
    correctCount: z.number().int().min(0).max(10),
    questionCount: z.number().int().min(5).max(10),
    scorePercent: z.number().min(0).max(100),
    passed: z.boolean(),
  })
  .strict();
export type Question = { id: string; prompt: string; choices: string[] };
export type Attempt = {
  id: string;
  startedAt: string;
  submittedAt: string | null;
  correctCount: number | null;
  questionCount: number | null;
  passed: boolean | null;
};
export type QuizView = {
  lessonId: string;
  lessonTitle: string;
  quiz: { id: string; title: string; revision: number };
  questions: Question[];
  attempt: Attempt | null;
  history: Attempt[];
  responses: z.infer<typeof responseRow>[];
  progress: StudyProgress;
  recoveryScope: string;
};
export type QuizResult =
  | { ok: true; view: QuizView }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        retryable: boolean;
        outcomeUnknown: boolean;
      };
    };
export const localQuizTarget = localStudyTarget;
export function validAnswers(
  answers: Record<string, number>,
  questions: Question[],
) {
  return Object.entries(answers).every(([id, index]) =>
    questions.some((q) => q.id === id && index < q.choices.length),
  );
}
export const recoverySchema = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("start"),
      lessonId: z.uuid(),
      startKey: z.uuid(),
    })
    .strict(),
  z.object({ operation: z.literal("submit"), ...submitInput.shape }).strict(),
]);
export type Recovery = z.infer<typeof recoverySchema>;
