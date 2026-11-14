import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import { ReviewPlayer } from "@/features/review/components/review-player";
import type {
  ReviewInput,
  ReviewResult,
  ReviewView,
} from "@/features/review/contracts";
const scenario =
  new URLSearchParams(location.search).get("scenario") ?? "normal";
const seed: ReviewView = {
  scope: "synthetic-only",
  dueCount: 3,
  reviewedToday: 0,
  unsupportedAudio: 0,
  cards: ["你", "好", "我"].map((hanzi, i) => ({
    id: `00000000-0000-4000-8000-00000000000${i + 1}`,
    vocabularyId: `10000000-0000-4000-8000-00000000000${i + 1}`,
    version: 0,
    direction: i === 1 ? "vi_to_hanzi" : "hanzi_to_vi",
    hanzi,
    pinyin: ["nǐ", "hǎo", "wǒ"][i],
    meaning: ["bạn", "tốt", "tôi"][i],
    example: { hanzi: "你好！", pinyin: "Nǐ hǎo!", meaning: "Xin chào!" },
  })),
};
if (scenario === "empty") {
  seed.cards = [];
  seed.dueCount = 0;
}
const db: { view: ReviewView; receipts: Record<string, ReviewResult> } =
  JSON.parse(
    sessionStorage.getItem("syntheticReviewDB") ??
      JSON.stringify({ view: seed, receipts: {} }),
  );
const calls: ReviewInput[] = [];
Object.assign(window, { reviewCalls: calls });
async function submit(input: ReviewInput): Promise<ReviewResult> {
  calls.push(structuredClone(input));
  await new Promise((r) => setTimeout(r, 200));
  if (scenario === "conflict")
    return {
      ok: false,
      error: {
        code: "CONFLICT",
        message: "Thẻ đã thay đổi. Hãy tải lại danh sách.",
        retryable: false,
        outcomeUnknown: false,
      },
    };
  const replay = db.receipts[input.idempotencyKey];
  if (replay) return structuredClone(replay);
  db.view.cards = db.view.cards.filter((c) => c.id !== input.cardId);
  db.view.dueCount = db.view.cards.length;
  db.view.reviewedToday++;
  const result: ReviewResult = {
    ok: true,
    view: structuredClone(db.view),
    receipt: {
      status: "ok",
      cardId: input.cardId,
      version: input.expectedVersion + 1,
      nextDueAt: "2026-11-15T01:00:00Z",
      intervalDays: 1,
      newState: "learning",
      reviewedAt: "2026-11-14T01:00:00Z",
      algorithmVersion: "hl-sm2-v1",
    },
  };
  db.receipts[input.idempotencyKey] = result;
  sessionStorage.setItem("syntheticReviewDB", JSON.stringify(db));
  if (scenario === "response-loss") throw Error("synthetic lost response");
  return result;
}
createRoot(document.getElementById("root")!).render(
  <main className="min-h-screen p-4 sm:p-8">
    <ReviewPlayer
      initial={db.view}
      enabled={scenario !== "blocked"}
      submit={submit}
      refresh={async () =>
        scenario === "response-loss"
          ? {
              ok: false,
              error: {
                code: "RETRY",
                message: "synthetic read failed",
                retryable: false,
                outcomeUnknown: false,
              },
            }
          : { ok: true, view: structuredClone(db.view) }
      }
    />
  </main>,
);
