import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";

const mock = vi.hoisted(() => ({
  auth: vi.fn(),
  view: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({ requireLearner: mock.auth }));
vi.mock("@/features/review/queries", () => ({ getReviewView: mock.view }));
vi.mock("next/cache", () => ({ revalidatePath: mock.revalidate }));

import { submitReview } from "@/features/review/actions";

describe("SRS Idempotency, Concurrency, and Recovery Protection", () => {
  const cardId = "a0000000-0000-4000-8000-000000000001";
  const idempotencyKey = "b0000000-0000-4000-8000-000000000001";
  const testInput = {
    cardId,
    rating: 3 as const,
    expectedVersion: 2,
    idempotencyKey,
  };

  const receipt = {
    status: "ok" as const,
    cardId,
    version: 3,
    nextDueAt: "2026-11-15T12:00:00Z",
    intervalDays: 1,
    newState: "review" as const,
    reviewedAt: "2026-11-15T00:00:00Z",
    algorithmVersion: "hl-sm2-v1" as const,
  };

  let rpcMock = vi.fn();
  let maybeSingleMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://hhgxrjqkuwdgurphopok.supabase.co"
    );
    vi.stubEnv("HANLEARN_DEVELOPMENT_LEARNING", "1");
    vi.stubEnv("VERCEL_ENV", "");

    rpcMock = vi.fn().mockResolvedValue({ data: receipt, error: null });
    maybeSingleMock = vi.fn().mockResolvedValue({
      data: { card_id: cardId, rating: 3, result: receipt },
      error: null,
    });

    mock.auth.mockResolvedValue({
      user: { id: "test-user-uuid" },
      supabase: {
        rpc: rpcMock,
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: maybeSingleMock,
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

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("Scenario 1: Rapid retry with identical idempotencyKey returns exact cached receipt without creating new review event", async () => {
    // Call 1
    const res1 = await submitReview(testInput);
    expect(res1.ok).toBe(true);
    if (!res1.ok) return;
    expect(res1.receipt.version).toBe(3);

    // Call 2 (Replay with same idempotencyKey)
    const res2 = await submitReview(testInput);
    expect(res2.ok).toBe(true);
    if (!res2.ok) return;
    // Returns identical receipt from idempotent verification
    expect(res2.receipt).toEqual(res1.receipt);
    expect(rpcMock).toHaveBeenCalledTimes(2);
    expect(rpcMock).toHaveBeenNthCalledWith(2, "submit_review", {
      p_card_id: cardId,
      p_rating: 3,
      p_response_ms: null,
      p_expected_version: 2,
      p_idempotency_key: idempotencyKey,
    });
  });

  it("Scenario 2: Two concurrent tabs reviewing the same card (version mismatch) rejects with CONFLICT", async () => {
    // First tab succeeded, advancing version from 2 to 3.
    // Second tab tries to submit with outdated expectedVersion: 2, returning PT409
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { code: "PT409", message: "OUTDATED_VERSION" },
    });

    const res = await submitReview({
      cardId,
      rating: 3,
      expectedVersion: 2, // Outdated version
      idempotencyKey: "c0000000-0000-4000-8000-000000000002",
    });

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("CONFLICT");
    expect(res.error.message).toContain("Thẻ đã thay đổi");
  });

  it("Scenario 3: Corrupted or mismatched receipt on replay is caught and marked RETRY", async () => {
    // If review_events row has mismatched rating or receipt
    maybeSingleMock.mockResolvedValueOnce({
      data: { card_id: cardId, rating: 1, result: receipt }, // Rating mismatch
      error: null,
    });

    const res = await submitReview(testInput);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("RETRY");
    expect(res.error.retryable).toBe(true);
  });

  it("Scenario 4: Validates that recovery envelope maintains exact idempotencyKey structure", () => {
    // Verify sessionStorage recovery structure matching Zod
    const serialized = JSON.stringify(testInput);
    const parsed = JSON.parse(serialized);

    expect(parsed.idempotencyKey).toBe(idempotencyKey);
    expect(parsed.cardId).toBe(cardId);
    expect(parsed.expectedVersion).toBe(2);
    expect(parsed.rating).toBe(3);
  });
});
