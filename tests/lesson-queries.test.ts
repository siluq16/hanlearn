import { beforeEach, describe, expect, it, vi } from "vitest";
import { lessonFixture, lessonIds } from "./fixtures/lesson";
const auth = vi.hoisted(() => ({ requireLearner: vi.fn() }));
vi.mock("@/features/auth/session", () => auth);
import { getLessonBundle } from "@/features/lessons/queries";
type Call = { table: string; select?: string; filters: [string, unknown][] };
function database(
  overrides: Record<string, unknown> = {},
  failedTable?: string,
) {
  const f = lessonFixture();
  const rows: Record<string, unknown> = {
    lessons: f.lesson,
    units: f.unit,
    courses: f.course,
    syllabus_versions: f.syllabus,
    lesson_vocabulary: f.vocabularyLinks,
    lesson_grammar: f.grammarLinks,
    vocabulary: f.vocabulary,
    grammar_points: f.grammar,
    lesson_progress: f.progress,
    ...overrides,
  };
  const calls: Call[] = [];
  const from = vi.fn((table: string) => {
    const call: Call = { table, filters: [] };
    calls.push(call);
    const result = () => ({
      data: rows[table],
      error: table === failedTable ? { message: "sensitive diagnostic" } : null,
    });
    const query = {
      select: (columns: string) => {
        call.select = columns;
        return query;
      },
      eq: (name: string, value: unknown) => {
        call.filters.push([name, value]);
        return query;
      },
      in: () => query,
      order: () => query,
      range: () => query,
      maybeSingle: async () => result(),
      then: (resolve: (r: ReturnType<typeof result>) => unknown) =>
        Promise.resolve(result()).then(resolve),
    };
    return query;
  });
  return { from, calls };
}
beforeEach(() => vi.clearAllMocks());
describe("JWT-scoped lesson reads (mocked client, not real RLS proof)", () => {
  it("authenticates independently, selects exact fields and filters all ancestors", async () => {
    const db = database();
    auth.requireLearner.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    const result = await getLessonBundle(lessonIds.lesson);
    expect(result?.kind).toBe("ready");
    expect(auth.requireLearner).toHaveBeenCalledOnce();
    for (const name of ["lessons", "units", "courses", "syllabus_versions"]) {
      const call = db.calls.find((c) => c.table === name)!;
      expect(call.filters).toContainEqual(["status", "published"]);
      expect(call.filters).toContainEqual(["review_status", "approved"]);
    }
    expect(
      db.calls.find((c) => c.table === "lesson_progress")?.filters,
    ).toContainEqual(["user_id", lessonIds.user]);
    expect(db.calls.every((c) => !!c.select && !c.select.includes("*"))).toBe(
      true,
    );
    expect(
      db.calls.some(
        (c) => c.table.includes("quiz") || c.table.includes("private"),
      ),
    ).toBe(false);
  });
  it("does not query on invalid IDs or denied authorization", async () => {
    const db = database();
    auth.requireLearner.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    expect(await getLessonBundle("invalid")).toBeNull();
    expect(db.from).not.toHaveBeenCalled();
    auth.requireLearner.mockRejectedValue(new Error("denied"));
    await expect(getLessonBundle(lessonIds.lesson)).rejects.toThrow("denied");
    expect(db.from).not.toHaveBeenCalled();
  });
  it.each(["lessons", "units", "courses", "syllabus_versions"])(
    "stops before joins when %s is missing/draft",
    async (table) => {
      const db = database({ [table]: null });
      auth.requireLearner.mockResolvedValue({
        user: { id: lessonIds.user },
        supabase: db,
      });
      expect(await getLessonBundle(lessonIds.lesson)).toBeNull();
      expect(
        db.calls.some(
          (c) => c.table.startsWith("lesson_") && c.table !== "lessons",
        ),
      ).toBe(false);
      const draft = database({
        [table]: {
          ...lessonFixture()[
            (
              {
                lessons: "lesson",
                units: "unit",
                courses: "course",
                syllabus_versions: "syllabus",
              } as const
            )[table as "lessons"]
          ],
          status: "draft",
        },
      });
      auth.requireLearner.mockResolvedValue({
        user: { id: lessonIds.user },
        supabase: draft,
      });
      expect(await getLessonBundle(lessonIds.lesson)).toBeNull();
    },
  );
  it("separates service failure from missing content without raw diagnostics", async () => {
    const db = database({}, "lessons");
    auth.requireLearner.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: db,
    });
    await expect(getLessonBundle(lessonIds.lesson)).rejects.not.toThrow(
      "sensitive diagnostic",
    );
  });
  it("reads updated progress on the next request, never writes", async () => {
    const f = lessonFixture();
    const first = database();
    auth.requireLearner.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: first,
    });
    await getLessonBundle(lessonIds.lesson);
    const second = database({
      lesson_progress: { ...f.progress, completed_at: "2026-11-12T12:00:00Z" },
    });
    auth.requireLearner.mockResolvedValue({
      user: { id: lessonIds.user },
      supabase: second,
    });
    const result = await getLessonBundle(lessonIds.lesson);
    expect(result?.kind === "ready" && result.bundle.progress.completedAt).toBe(
      "2026-11-12T12:00:00Z",
    );
    // The mock exposes SELECT operations only; any accidental mutation fails this suite.
  });
});
