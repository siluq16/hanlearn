import { beforeEach, expect, it, vi } from "vitest";
import { quizFixture, attemptId, quizId } from "./fixtures/quiz";
import { lessonIds } from "./fixtures/lesson";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), lesson: vi.fn() }));
vi.mock("@/features/auth/session", () => ({ requireLearner: mocks.auth }));
vi.mock("@/features/lessons/queries", () => ({
  getLessonBundle: mocks.lesson,
}));
import { getQuizView, ATTEMPT_COLUMNS } from "@/features/quizzes/queries";
const pub = {
  status: "published",
  review_status: "approved",
  source_uri: "urn:test",
  content_license: "synthetic-test-only",
  reviewed_by: "Synthetic",
  reviewed_at: "2026-11-13T01:00:00Z",
};
type Row = Record<string, unknown>;
let rows: Record<string, Row[]>;
let calls: { table: string; columns?: string; filters: [string, unknown][] }[];
beforeEach(() => {
  vi.clearAllMocks();
  calls = [];
  rows = {
    lesson_quizzes: [
      {
        ...pub,
        id: quizId,
        lesson_id: lessonIds.lesson,
        title: "Synthetic",
        revision: 1,
        published_at: pub.reviewed_at,
      },
    ],
    quiz_questions: quizFixture().questions.map((q, i) => ({
      ...pub,
      id: q.id,
      quiz_id: quizId,
      sort_order: i,
      prompt: q.prompt,
      choices: q.choices,
    })),
    quiz_attempts: [
      {
        id: attemptId,
        user_id: lessonIds.user,
        quiz_id: quizId,
        started_at: pub.reviewed_at,
        submitted_at: null,
        correct_count: null,
        question_count: null,
        passed: null,
      },
    ],
    quiz_responses: [],
  };
  const from = (table: string) => {
    const call = {
      table,
      filters: [] as [string, unknown][],
      columns: undefined as string | undefined,
    };
    calls.push(call);
    const data = () =>
      rows[table].filter((r) => call.filters.every(([k, v]) => r[k] === v));
    const chain = {
      select: (columns: string) => {
        call.columns = columns;
        return chain;
      },
      eq: (k: string, v: unknown) => {
        call.filters.push([k, v]);
        return chain;
      },
      order: () => chain,
      limit: () => chain,
      maybeSingle: async () => ({ data: data()[0] ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: data(), error: null }).then(resolve),
    };
    return chain;
  };
  mocks.auth.mockResolvedValue({
    user: { id: lessonIds.user },
    supabase: { from },
  });
  mocks.lesson.mockResolvedValue({
    kind: "ready",
    bundle: {
      lesson: { title: "Synthetic" },
      progress: { studiedAt: null, completedAt: null },
    },
  });
});
it("projects public questions without keys and no presubmit response read", async () => {
  const v = await getQuizView(lessonIds.lesson, attemptId);
  expect(v?.questions).toHaveLength(5);
  expect(v?.responses).toEqual([]);
  expect(JSON.stringify(v)).not.toMatch(
    /user_id|correct_index|explanation_vi|submission_payload|start_key/,
  );
  expect(calls.some((c) => c.table === "quiz_responses")).toBe(false);
  expect(ATTEMPT_COLUMNS).not.toMatch(/start_key|fingerprint|payload|result/);
});
it("returns no quiz for unavailable lesson before querying questions", async () => {
  mocks.lesson.mockResolvedValue(null);
  expect(await getQuizView(lessonIds.lesson)).toBeNull();
  expect(calls).toEqual([]);
});
it("checks both attempt owner and quiz and hides a foreign attempt", async () => {
  rows.quiz_attempts[0].user_id = lessonIds.other;
  expect(await getQuizView(lessonIds.lesson, attemptId)).toBeNull();
  const attempt = calls.find((c) => c.table === "quiz_attempts")!;
  expect(attempt.filters).toContainEqual(["user_id", lessonIds.user]);
  expect(attempt.filters).toContainEqual(["quiz_id", quizId]);
});
it("reads only selected answer/is_correct after persisted submission", async () => {
  Object.assign(rows.quiz_attempts[0], {
    submitted_at: pub.reviewed_at,
    correct_count: 4,
    question_count: 5,
    passed: true,
  });
  rows.quiz_responses = quizFixture().questions.map((q, i) => ({
    attempt_id: attemptId,
    user_id: lessonIds.user,
    question_id: q.id,
    answer_index: i < 4 ? 0 : null,
    is_correct: i < 4,
  })); // mock SELECT projection below
  // from mock returns full rows: strip query-only identity fields as PostgREST SELECT does.
  const auth = await mocks.auth();
  const original = auth.supabase.from;
  auth.supabase.from = (table: string) => {
    const chain = original(table);
    if (table === "quiz_responses") {
      const then = chain.then;
      chain.then = (resolve: (v: unknown) => unknown) =>
        then((r: { data: Row[]; error: null }) =>
          resolve({
            ...r,
            data: r.data.map(({ question_id, answer_index, is_correct }) => ({
              question_id,
              answer_index,
              is_correct,
            })),
          }),
        );
    }
    return chain;
  };
  const v = await getQuizView(lessonIds.lesson, attemptId);
  expect(v?.attempt?.passed).toBe(true);
  expect(v?.responses).toHaveLength(5);
  expect(JSON.stringify(v)).not.toMatch(/correct_index|explanation_vi/);
});
it("rejects unexpected/private question fields instead of forwarding them", async () => {
  rows.quiz_questions[0].correct_index = 0;
  await expect(getQuizView(lessonIds.lesson)).rejects.toThrow();
});
it("rejects duplicate questions and malformed choices", async () => {
  rows.quiz_questions[1].id = rows.quiz_questions[0].id;
  await expect(getQuizView(lessonIds.lesson)).rejects.toThrow();
});
it("separates retry storage scope by actual server learner", async () => {
  const a = await getQuizView(lessonIds.lesson);
  const session = await mocks.auth();
  session.user.id = lessonIds.other;
  const b = await getQuizView(lessonIds.lesson);
  expect(b?.recoveryScope).not.toBe(a?.recoveryScope);
  expect(b?.history).toEqual([]);
});
