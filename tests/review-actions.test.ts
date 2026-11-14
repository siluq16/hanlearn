import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
const mock = vi.hoisted(() => ({
  auth: vi.fn(),
  view: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/auth/session", () => ({ requireLearner: mock.auth }));
vi.mock("@/features/review/queries", () => ({ getReviewView: mock.view }));
vi.mock("next/cache", () => ({ revalidatePath: mock.revalidate }));
import { submitReview, refreshReview } from "@/features/review/actions";
import { reviewInput, vietnamDayBounds } from "@/features/review/contracts";
const card = "a0000000-0000-4000-8000-000000000001",
  key = "b0000000-0000-4000-8000-000000000001";
const input = {
  cardId: card,
  rating: 3,
  expectedVersion: 2,
  idempotencyKey: key,
};
const receipt = {
  status: "ok",
  cardId: card,
  version: 3,
  nextDueAt: "2026-11-14T04:10:00Z",
  intervalDays: 0,
  newState: "learning",
  reviewedAt: "2026-11-14T04:00:00Z",
  algorithmVersion: "hl-sm2-v1",
};
let rpc = vi.fn(),
  read = vi.fn(),
  eq = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://hhgxrjqkuwdgurphopok.supabase.co",
  );
  vi.stubEnv("HANLEARN_DEVELOPMENT_LEARNING", "1");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("CONTEXT", "");
  rpc = vi.fn().mockResolvedValue({ data: receipt, error: null });
  read = vi.fn().mockResolvedValue({
    data: { card_id: card, rating: 3, result: receipt },
    error: null,
  });
  eq = vi.fn().mockReturnThis();
  mock.auth.mockResolvedValue({
    user: { id: "test-user" },
    supabase: {
      rpc,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq,
        maybeSingle: read,
      }),
    },
  });
  mock.view.mockResolvedValue({
    cards: [],
    dueCount: 0,
    reviewedToday: 1,
    unsupportedAudio: 0,
    scope: "test-scope",
  });
});
afterEach(() => vi.unstubAllEnvs());
describe("review action boundary", () => {
  it.each(["unauthenticated", "outsider"])(
    "denies %s before RPC",
    async (reason) => {
      mock.auth.mockRejectedValue(Error(reason));
      await expect(submitReview(input)).rejects.toThrow(reason);
      expect(rpc).not.toHaveBeenCalled();
    },
  );
  it.each([
    { ...input, rating: 4 },
    { ...input, expectedVersion: -1 },
    { ...input, expectedVersion: Number.MAX_SAFE_INTEGER },
    { ...input, user_id: "other" },
    { ...input, due_at: "later" },
  ])("rejects authority/invalid input", async (data) => {
    expect((await submitReview(data)).ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it.each([
    "https://production.supabase.co",
    "https://hhgxrjqkuwdgurphopok.supabase.co.evil.invalid",
  ])("denies other target %s", async (url) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    expect(await submitReview(input)).toMatchObject({
      ok: false,
      error: { code: "DISABLED" },
    });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("denies production deployment even with opt-in", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect((await submitReview(input)).ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("submits unchanged original envelope and verifies persisted owned evidence", async () => {
    expect(await submitReview(input)).toMatchObject({ ok: true, receipt });
    expect(rpc).toHaveBeenCalledWith("submit_review", {
      p_card_id: card,
      p_rating: 3,
      p_response_ms: null,
      p_expected_version: 2,
      p_idempotency_key: key,
    });
    expect(eq).toHaveBeenCalledWith("user_id", "test-user");
    expect(eq).toHaveBeenCalledWith("idempotency_key", key);
  });
  it("does not manufacture success without event readback", async () => {
    read.mockResolvedValue({ data: null, error: null });
    expect(await submitReview(input)).toMatchObject({
      ok: false,
      error: { outcomeUnknown: true, retryable: true },
    });
  });
  it("accepts idempotent event replay without comparing a newer card state", async () => {
    await submitReview(input);
    await submitReview(input);
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
    expect(read).toHaveBeenCalledTimes(2);
  });
  it.each([
    ["PT409", "CONFLICT"],
    ["PT404", "UNAVAILABLE"],
    ["42501", "FORBIDDEN"],
    ["22023", "INVALID_INPUT"],
  ])("sanitizes %s", async (code, expected) => {
    rpc.mockResolvedValue({
      data: null,
      error: { code, message: "private-test-marker" },
    });
    const result = await submitReview(input);
    expect(result).toMatchObject({
      ok: false,
      error: { code: expected, outcomeUnknown: false },
    });
    expect(JSON.stringify(result)).not.toContain("private-test-marker");
  });
  it("preserves ambiguity after network failure", async () => {
    rpc.mockRejectedValue(Error("private-test-marker"));
    expect(await submitReview(input)).toMatchObject({
      error: { code: "RETRY", outcomeUnknown: true },
    });
  });
  it("refresh never calls a mutation", async () => {
    expect(await refreshReview()).toMatchObject({ ok: true });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("uses Vietnam day boundaries without changing due eligibility", () => {
    expect(vietnamDayBounds(new Date("2026-11-13T18:00:00Z"))).toEqual({
      start: "2026-11-13T17:00:00.000Z",
      end: "2026-11-14T17:00:00.000Z",
    });
    expect(reviewInput.safeParse(input).success).toBe(true);
  });
});
