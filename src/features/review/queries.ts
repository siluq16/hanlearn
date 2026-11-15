import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requireLearner } from "@/features/auth/session";
import { DataError, readAll } from "@/lib/data";
import { vietnamDayBounds, type ReviewView } from "./contracts";
import { sanitizeCardPrompt } from "./hint-sanitizer";
const cardSchema = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    vocabulary_id: z.uuid(),
    card_type: z.enum(["hanzi_to_vi", "vi_to_hanzi", "audio_to_hanzi"]),
    version: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER - 1),
    due_at: z.iso.datetime({ offset: true }),
    algorithm_version: z.literal("hl-sm2-v1"),
  })
  .strict();
export const REVIEW_COLUMNS =
  "id,user_id,vocabulary_id,card_type,version,due_at,algorithm_version";
export async function getReviewView(): Promise<ReviewView> {
  const { user, supabase } = await requireLearner();
  const bounds = vietnamDayBounds(new Date());
  const [raw, today] = await Promise.all([
    readAll((from, to) =>
      supabase
        .from("review_cards")
        .select(REVIEW_COLUMNS)
        .eq("user_id", user.id)
        .is("archived_at", null)
        .neq("state", "suspended")
        // PostgreSQL casts 'now' to timestamptz, not the browser/app clock.
        .lte("due_at", "now")
        .order("due_at")
        .order("id")
        .range(from, to),
    ),
    supabase
      .from("review_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("reviewed_at", bounds.start)
      .lt("reviewed_at", bounds.end),
  ]);
  if (today.error || today.count === null) throw new DataError();
  const cards = z.array(cardSchema).parse(raw);
  if (cards.some((c) => c.user_id !== user.id)) throw new DataError();
  const ids = [...new Set(cards.map((c) => c.vocabulary_id))];
  const words = (
    await Promise.all(
      Array.from({ length: Math.ceil(ids.length / 100) }, (_, i) =>
        readAll((from, to) =>
          supabase
            .from("vocabulary")
            .select(
              "id,simplified,pinyin_marked,meaning_vi,example_zh,example_pinyin,example_vi,audio_asset_id",
            )
            .in("id", ids.slice(i * 100, i * 100 + 100))
            .eq("status", "published")
            .order("id")
            .range(from, to),
        ),
      ),
    )
  ).flat();
  const readable = new Map(words.map((w) => [w.id, w]));
  const textCards = cards.filter(
    (c) => c.card_type !== "audio_to_hanzi" && readable.has(c.vocabulary_id),
  );
  const audioIds = [
    ...new Set(
      cards
        .filter((c) => c.card_type === "audio_to_hanzi")
        .map((c) => readable.get(c.vocabulary_id)?.audio_asset_id)
        .filter((id): id is string => !!id),
    ),
  ];
  const assets = audioIds.length
    ? await readAll((from, to) =>
        supabase
          .from("audio_assets")
          .select("id")
          .in("id", audioIds)
          .eq("status", "published")
          .order("id")
          .range(from, to),
      )
    : [];
  const publishedAudio = new Set(assets.map((a) => a.id));
  return {
    dueCount: textCards.length,
    reviewedToday: today.count,
    unsupportedAudio: cards.filter(
      (c) =>
        c.card_type === "audio_to_hanzi" &&
        publishedAudio.has(readable.get(c.vocabulary_id)?.audio_asset_id ?? ""),
    ).length,
    scope: createHash("sha256")
      .update(user.id + ":hl-sm2-v1")
      .digest("hex"),
    cards: textCards.slice(0, 20).map((c) => {
      const w = readable.get(c.vocabulary_id)!;
      const sanitized = sanitizeCardPrompt(w.meaning_vi);
      return {
        id: c.id,
        vocabularyId: w.id,
        version: c.version,
        direction: c.card_type as "hanzi_to_vi" | "vi_to_hanzi",
        hanzi: w.simplified,
        pinyin: w.pinyin_marked,
        meaning: w.meaning_vi,
        prompt: sanitized.prompt,
        notes: sanitized.notes,
        example: w.example_zh
          ? {
              hanzi: w.example_zh,
              pinyin: w.example_pinyin,
              meaning: w.example_vi,
            }
          : null,
      };
    }),
  };
}
