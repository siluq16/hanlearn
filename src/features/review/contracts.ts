import { z } from "zod";
export const reviewInput = z
  .object({
    cardId: z.uuid(),
    rating: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    expectedVersion: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER - 1),
    idempotencyKey: z.uuid(),
  })
  .strict();
export type ReviewInput = z.infer<typeof reviewInput>;
export const receiptSchema = z
  .object({
    status: z.literal("ok"),
    cardId: z.uuid(),
    version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    nextDueAt: z.iso.datetime({ offset: true }),
    intervalDays: z.number().int().min(0).max(36500),
    newState: z.enum(["learning", "review", "relearning"]),
    reviewedAt: z.iso.datetime({ offset: true }),
    algorithmVersion: z.literal("hl-sm2-v1"),
  })
  .strict();
export type ReviewReceipt = z.infer<typeof receiptSchema>;
export type ReviewCard = {
  id: string;
  vocabularyId: string;
  version: number;
  direction: "hanzi_to_vi" | "vi_to_hanzi";
  hanzi: string;
  pinyin: string;
  meaning: string;
  example: {
    hanzi: string;
    pinyin: string | null;
    meaning: string | null;
  } | null;
};
export type ReviewView = {
  cards: ReviewCard[];
  dueCount: number;
  reviewedToday: number;
  unsupportedAudio: number;
  scope: string;
};
export type ReviewError = {
  code: string;
  message: string;
  retryable: boolean;
  outcomeUnknown: boolean;
};
export type ReviewResult =
  | { ok: true; receipt: ReviewReceipt; view: ReviewView }
  | { ok: false; error: ReviewError };
export type RefreshResult =
  { ok: true; view: ReviewView } | { ok: false; error: ReviewError };
export function vietnamDayBounds(now: Date) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const start = new Date(`${day}T00:00:00+07:00`);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + 86400000).toISOString(),
  };
}
