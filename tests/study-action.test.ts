import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  bundle: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/auth/session", () => ({ requireLearner: mocks.auth }));
vi.mock("@/features/lessons/queries", () => ({
  getLessonBundle: mocks.bundle,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { confirmLessonStudy } from "@/features/lessons/actions";
import { localStudyTarget } from "@/features/lessons/study-contract";
import { lessonIds } from "./fixtures/lesson";
const studied = "2026-11-13T01:00:00Z",
  completed = "2026-11-13T01:01:00Z";
function database() {
  const read = vi.fn().mockResolvedValue({
    data: {
      user_id: lessonIds.user,
      lesson_id: lessonIds.lesson,
      studied_at: studied,
      completed_at: null,
    },
    error: null,
  });
  const eq = vi.fn().mockReturnThis(),
    select = vi.fn().mockReturnThis();
  const query = { select, eq, maybeSingle: read };
  const from = vi.fn().mockReturnValue(query);
  const rpc = vi
    .fn()
    .mockResolvedValue({ data: { completed: false }, error: null });
  return { from, rpc, read, eq, select };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://127.0.0.1:54321");
  vi.stubEnv("HANLEARN_LOCAL_STUDY_CONFIRMATION", "1");
  vi.stubEnv("HANLEARN_DEVELOPMENT_LEARNING", "0");
  vi.stubEnv("VERCEL_ENV", "");
  mocks.bundle.mockResolvedValue({ kind: "ready" });
});
afterEach(() => vi.unstubAllEnvs());
describe("explicit study Server Action (mocked transport)", () => {
  it("allows the authorized Development RPC and uses database readback", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://hhgxrjqkuwdgurphopok.supabase.co",
    );
    vi.stubEnv("HANLEARN_DEVELOPMENT_LEARNING", "1");
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({
      ok: true,
      progress: { studiedAt: studied, completedAt: null },
    });
    expect(db.rpc).toHaveBeenCalledWith("mark_lesson_studied", {
      p_lesson_id: lessonIds.lesson,
    });
    vi.stubEnv("VERCEL_ENV", "production");
    db.rpc.mockClear();
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({ ok: false });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it.each(["unauthenticated", "outsider"])(
    "rechecks %s and never mutates on denial",
    async (reason) => {
      const db = database();
      mocks.auth.mockRejectedValue(new Error(reason));
      await expect(
        confirmLessonStudy({ lessonId: lessonIds.lesson }),
      ).rejects.toThrow(reason);
      expect(db.rpc).not.toHaveBeenCalled();
      expect(mocks.bundle).not.toHaveBeenCalled();
    },
  );
  it.each([
    "https://hhgxrjqkuwdgurphopok.supabase.co",
    "https://production.example.com",
    "https://127.0.0.1.evil.invalid",
    "https://user:secret@127.0.0.1",
    "https://localhost",
    "http://127.0.0.1",
  ])("blocks non-approved target %s even with opt-in", async (url) => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({ ok: false, error: { code: "LOCAL_ONLY" } });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it("requires an explicit local opt-in and accepts only literal TLS loopback targets", () => {
    expect(localStudyTarget("https://127.0.0.1:54321", "1")).toBe(true);
    expect(localStudyTarget("https://[::1]:54321", "1")).toBe(true);
    expect(localStudyTarget("https://127.0.0.1", undefined)).toBe(false);
  });
  it("also denies direct Server Action calls when the local flag is absent", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    vi.stubEnv("HANLEARN_LOCAL_STUDY_CONFIRMATION", "");
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({ ok: false, error: { code: "LOCAL_ONLY" } });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it.each([
    { lessonId: "bad" },
    { lessonId: lessonIds.lesson, user_id: lessonIds.other },
    { lessonId: lessonIds.lesson, studied_at: studied },
    { lessonId: lessonIds.lesson, completed_at: completed },
  ])("rejects invalid or authority-bearing input", async (input) => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    expect(await confirmLessonStudy(input)).toMatchObject({
      ok: false,
      error: { code: "INVALID_INPUT" },
    });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it.each([null, { kind: "invalid-content" }])(
    "rejects missing/draft/unreadable or invalid content before RPC",
    async (value) => {
      const db = database();
      mocks.auth.mockResolvedValue({
        user: { id: lessonIds.user },
        supabase: db,
      });
      mocks.bundle.mockResolvedValue(value);
      expect(
        await confirmLessonStudy({ lessonId: lessonIds.lesson }),
      ).toMatchObject({ ok: false, error: { code: "UNAVAILABLE" } });
      expect(db.rpc).not.toHaveBeenCalled();
    },
  );
  it("sends only lesson UUID, then rereads exact owned progress; ignores receipt completion", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    db.rpc.mockResolvedValue({ data: { completed: true }, error: null });
    expect(await confirmLessonStudy({ lessonId: lessonIds.lesson })).toEqual({
      ok: true,
      progress: { studiedAt: studied, completedAt: null },
    });
    expect(db.rpc).toHaveBeenCalledWith("mark_lesson_studied", {
      p_lesson_id: lessonIds.lesson,
    });
    expect(db.select).toHaveBeenCalledWith(
      "user_id,lesson_id,studied_at,completed_at",
    );
    expect(db.eq).toHaveBeenCalledWith("user_id", lessonIds.user);
    expect(db.eq).toHaveBeenCalledWith("lesson_id", lessonIds.lesson);
    expect(mocks.revalidate.mock.calls.map((c) => c[0])).toEqual([
      `/lessons/${lessonIds.lesson}`,
      "/roadmap",
      "/dashboard",
    ]);
  });
  it("shows completion only from a valid database readback", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    db.read.mockResolvedValue({
      data: {
        user_id: lessonIds.user,
        lesson_id: lessonIds.lesson,
        studied_at: studied,
        completed_at: completed,
      },
      error: null,
    });
    expect(await confirmLessonStudy({ lessonId: lessonIds.lesson })).toEqual({
      ok: true,
      progress: { studiedAt: studied, completedAt: completed },
    });
  });
  it.each([
    null,
    {
      user_id: lessonIds.other,
      lesson_id: lessonIds.lesson,
      studied_at: studied,
      completed_at: null,
    },
    {
      user_id: lessonIds.user,
      lesson_id: lessonIds.lesson,
      studied_at: null,
      completed_at: completed,
    },
  ])("never leaks or accepts invalid/foreign progress", async (row) => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    db.read.mockResolvedValue({ data: row, error: null });
    const result = await confirmLessonStudy({ lessonId: lessonIds.lesson });
    expect(result).toMatchObject({
      ok: false,
      error: { code: "READBACK", outcomeUnknown: true },
    });
    expect(JSON.stringify(result)).not.toContain(lessonIds.other);
  });
  it("recovers by repeating the same idempotent RPC after an unknown outcome/readback failure", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    db.rpc.mockRejectedValueOnce(new Error("private SQL/token diagnostic"));
    const result = await confirmLessonStudy({ lessonId: lessonIds.lesson });
    expect(result).toMatchObject({
      ok: false,
      error: { retryable: true, outcomeUnknown: true },
    });
    expect(JSON.stringify(result)).not.toContain("diagnostic");
    expect(await confirmLessonStudy({ lessonId: lessonIds.lesson })).toEqual({
      ok: true,
      progress: { studiedAt: studied, completedAt: null },
    });
    expect(db.rpc.mock.calls[0]).toEqual(db.rpc.mock.calls[1]);
    db.read.mockResolvedValueOnce({ data: null, error: { message: "secret" } });
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({
      ok: false,
      error: { code: "READBACK", outcomeUnknown: true },
    });
  });
  it("does not claim a write occurred when the pre-mutation read fails", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    mocks.bundle.mockRejectedValueOnce(new Error("private query failure"));
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({
      ok: false,
      error: { retryable: true, outcomeUnknown: false },
    });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it("treats a malformed receipt as an unknown outcome instead of fabricating progress", async () => {
    const db = database();
    mocks.auth.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    db.rpc.mockResolvedValue({
      data: { completed: true, studied_at: "client-like-extra" },
      error: null,
    });
    expect(
      await confirmLessonStudy({ lessonId: lessonIds.lesson }),
    ).toMatchObject({
      ok: false,
      error: { code: "READBACK", outcomeUnknown: true },
    });
    expect(db.read).not.toHaveBeenCalled();
  });
  it.each(["PT404", "42501", "22023", "XX000"])(
    "sanitizes backend error %s",
    async (code) => {
      const db = database();
      mocks.auth.mockResolvedValue({
        user: { id: lessonIds.user },
        supabase: db,
      });
      db.rpc.mockResolvedValue({
        data: null,
        error: { code, message: "secret SQL" },
      });
      const result = await confirmLessonStudy({ lessonId: lessonIds.lesson });
      expect(result.ok).toBe(false);
      expect(JSON.stringify(result)).not.toContain("secret SQL");
      expect(db.read).not.toHaveBeenCalled();
    },
  );
});
