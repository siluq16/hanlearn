import { beforeEach, describe, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@/features/auth/session", () => ({ requireLearner: mocks.auth }));
import { getReviewView } from "@/features/review/queries";
const uid = "a0000000-0000-4000-8000-000000000001",
  word = "b0000000-0000-4000-8000-000000000001",
  id = "c0000000-0000-4000-8000-000000000001";
function database(cards: unknown[], words: unknown[]) {
  const filters: unknown[][] = [];
  const from = vi.fn((table: string) => {
    const q: Record<string, unknown> = {};
    for (const method of [
      "select",
      "eq",
      "is",
      "neq",
      "lte",
      "gte",
      "lt",
      "order",
      "in",
    ]) {
      q[method] = vi.fn((...args: unknown[]) => {
        filters.push([table, method, ...args]);
        return q;
      });
    }
    q.range = vi.fn(async () => ({
      data:
        table === "review_cards" ? cards : table === "vocabulary" ? words : [],
      error: null,
    }));
    q.then = (resolve: (data: unknown) => unknown) =>
      Promise.resolve(resolve({ count: 2, error: null }));
    return q;
  });
  return { from, filters };
}
beforeEach(() => vi.clearAllMocks());
describe("SRS queue reads", () => {
  it("uses PostgreSQL now and owned active cards; excludes unavailable vocabulary", async () => {
    const c = {
      id,
      user_id: uid,
      vocabulary_id: word,
      card_type: "hanzi_to_vi",
      version: 0,
      due_at: "2026-11-14T00:00:00Z",
      algorithm_version: "hl-sm2-v1",
    };
    const db = database(
      [
        c,
        {
          ...c,
          id: "c0000000-0000-4000-8000-000000000002",
          vocabulary_id: "b0000000-0000-4000-8000-000000000002",
        },
      ],
      [
        {
          id: word,
          simplified: "字",
          pinyin_marked: "zì",
          meaning_vi: "chữ",
          example_zh: null,
          example_pinyin: null,
          example_vi: null,
          audio_asset_id: null,
        },
      ],
    );
    mocks.auth.mockResolvedValue({ user: { id: uid }, supabase: db });
    const result = await getReviewView();
    expect(result.dueCount).toBe(1);
    expect(result.cards).toHaveLength(1);
    expect(result.reviewedToday).toBe(2);
    expect(db.filters).toContainEqual(["review_cards", "lte", "due_at", "now"]);
    expect(db.filters).toContainEqual(["review_cards", "eq", "user_id", uid]);
    expect(db.filters).toContainEqual([
      "review_cards",
      "is",
      "archived_at",
      null,
    ]);
    expect(result.cards[0]).not.toHaveProperty("user_id");
  });
  it("has a truthful empty queue", async () => {
    const db = database([], []);
    mocks.auth.mockResolvedValue({ user: { id: uid }, supabase: db });
    expect(await getReviewView()).toMatchObject({ cards: [], dueCount: 0 });
  });
  it("rejects cross-user rows even if the transport mock bypasses RLS", async () => {
    const db = database(
      [
        {
          id,
          user_id: word,
          vocabulary_id: word,
          card_type: "hanzi_to_vi",
          version: 0,
          due_at: "2026-11-14T00:00:00Z",
          algorithm_version: "hl-sm2-v1",
        },
      ],
      [],
    );
    mocks.auth.mockResolvedValue({ user: { id: uid }, supabase: db });
    await expect(getReviewView()).rejects.toThrow();
  });
});
