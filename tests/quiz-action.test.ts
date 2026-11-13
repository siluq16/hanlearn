import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeQuiz,
  submittedQuiz,
  quizFixture,
  quizId,
  attemptId,
} from "./fixtures/quiz";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  view: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/auth/session", () => ({ requireLearner: mocks.auth }));
vi.mock("@/features/quizzes/queries", () => ({ getQuizView: mocks.view }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { startQuiz, submitQuiz, refreshQuiz } from "@/features/quizzes/actions";
import {
  startInput,
  submitInput,
  localQuizTarget,
} from "@/features/quizzes/contracts";
import { questionRow } from "@/features/quizzes/server-schemas";
const key = "b0000000-0000-4000-8000-000000000001";
let rpc = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://127.0.0.1:54321");
  vi.stubEnv("HANLEARN_LOCAL_MINI_QUIZ", "1");
  rpc = vi.fn();
  mocks.auth.mockResolvedValue({ supabase: { rpc } });
  mocks.view.mockResolvedValue(activeQuiz());
});
afterEach(() => vi.unstubAllEnvs());
const start = () =>
  startQuiz({ lessonId: quizFixture().lessonId, startKey: key });
const submit = (answers = {}) =>
  submitQuiz({ lessonId: quizFixture().lessonId, attemptId, answers });
describe("quiz guarded Server Actions (mocked RPC transport)", () => {
  it.each(["unauthenticated", "outsider"])(
    "rejects %s before RPC",
    async (reason) => {
      mocks.auth.mockRejectedValue(Error(reason));
      await expect(start()).rejects.toThrow(reason);
      await expect(submit()).rejects.toThrow(reason);
      expect(rpc).not.toHaveBeenCalled();
    },
  );
  it.each([
    "https://hhgxrjqkuwdgurphopok.supabase.co",
    "https://production.invalid",
    "https://localhost",
    "http://127.0.0.1",
    "https://127.0.0.1.evil.invalid",
    "https://user:secret@127.0.0.1",
  ])("blocks Cloud/nonlocal target %s", async (url) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    expect((await start()).ok).toBe(false);
    expect((await submit()).ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
    expect(mocks.view).not.toHaveBeenCalled();
  });
  it("requires local opt-in even when invoked directly", async () => {
    vi.stubEnv("HANLEARN_LOCAL_MINI_QUIZ", "");
    expect(await start()).toMatchObject({ error: { code: "LOCAL_ONLY" } });
    expect(rpc).not.toHaveBeenCalled();
    expect(localQuizTarget("https://[::1]:54321", "1")).toBe(true);
  });
  it("rejects client identity/grade, invalid keys, choice range and extra questions", async () => {
    expect(
      startInput.safeParse({
        lessonId: quizFixture().lessonId,
        startKey: key,
        user_id: key,
      }).success,
    ).toBe(false);
    expect(
      submitInput.safeParse({
        lessonId: quizFixture().lessonId,
        attemptId,
        answers: { [key]: 1.5 },
        passed: true,
      }).success,
    ).toBe(false);
    expect(await submit({ [key]: 0 })).toMatchObject({
      error: { code: "INVALID_INPUT" },
    });
    expect(await submit({ [activeQuiz().questions[0].id]: 5 })).toMatchObject({
      error: { code: "INVALID_INPUT" },
    });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("does not start unavailable/draft lessons or quizzes", async () => {
    mocks.view.mockResolvedValue(null);
    expect(await start()).toMatchObject({ error: { code: "UNAVAILABLE" } });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("starts with exact key and reads back owned state", async () => {
    rpc.mockResolvedValue({ data: { attemptId, quizId }, error: null });
    expect(await start()).toMatchObject({
      ok: true,
      view: { attempt: { id: attemptId } },
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("start_quiz", {
      p_quiz_id: quizId,
      p_idempotency_key: key,
    });
  });
  it("accepts DB fail/pass receipts and uses fresh persisted progress", async () => {
    for (const passed of [false, true]) {
      mocks.view
        .mockResolvedValueOnce(activeQuiz())
        .mockResolvedValueOnce(submittedQuiz(passed));
      rpc.mockResolvedValue({
        data: {
          attemptId,
          correctCount: passed ? 4 : 3,
          questionCount: 5,
          scorePercent: passed ? 80 : 60,
          passed,
        },
        error: null,
      });
      const r = await submit();
      expect(r).toMatchObject({
        ok: true,
        view: { attempt: { passed }, progress: { completedAt: null } },
      });
    }
    expect(rpc).toHaveBeenCalledWith("submit_quiz", {
      p_attempt_id: attemptId,
      p_answers: {},
    });
  });
  it("does not invent success/completion from a receipt without readback", async () => {
    mocks.view.mockResolvedValueOnce(activeQuiz()).mockResolvedValueOnce(null);
    rpc.mockResolvedValue({
      data: {
        attemptId,
        correctCount: 4,
        questionCount: 5,
        scorePercent: 80,
        passed: true,
      },
      error: null,
    });
    expect(await submit()).toMatchObject({
      error: { outcomeUnknown: true, retryable: true },
    });
  });
  it.each(["PT409", "42501", "22023", "PT404"])(
    "maps SQLSTATE %s without raw errors",
    async (code) => {
      rpc.mockResolvedValue({
        data: null,
        error: { code, message: "private-test-marker" },
      });
      const r = await submit();
      expect(r.ok).toBe(false);
      expect(JSON.stringify(r)).not.toContain("private-test-marker");
    },
  );
  it("keeps network ambiguity retryable without changing the request", async () => {
    rpc.mockRejectedValue(Error("lost"));
    expect(await submit()).toMatchObject({
      error: { outcomeUnknown: true, retryable: true },
    });
    expect(await submit()).toMatchObject({ error: { outcomeUnknown: true } });
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
  });
  it("allows readback on Cloud without any mutation", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://hhgxrjqkuwdgurphopok.supabase.co",
    );
    expect(
      (await refreshQuiz({ lessonId: quizFixture().lessonId, attemptId })).ok,
    ).toBe(true);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("strict question shape rejects private fields", () => {
    expect(
      questionRow.safeParse({ ...quizFixture().questions[0], correct_index: 0 })
        .success,
    ).toBe(false);
  });
});
