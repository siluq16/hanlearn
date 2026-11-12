import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/auth/session", () => ({ requireLearner: vi.fn() }));
import { requireLearner } from "@/features/auth/session";
import { saveSettings } from "@/features/settings/actions";
const insert = vi.fn();
const update = vi.fn();
const single = vi.fn();
const maybeSingle = vi.fn();
const builder = {
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle,
  insert,
  update,
  single,
};
beforeEach(() => {
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  insert.mockReturnValue(builder);
  update.mockReturnValue(builder);
  single.mockResolvedValue({ data: { id: "trusted" }, error: null });
  maybeSingle.mockResolvedValue({ data: null, error: null });
  vi.mocked(requireLearner).mockResolvedValue({
    user: { id: "trusted" },
    supabase: { from: () => builder },
  } as unknown as Awaited<ReturnType<typeof requireLearner>>);
});
function form() {
  const f = new FormData();
  Object.entries({
    display_name: "Learner",
    baseline_hsk_level: "0",
    target_hsk_level: "5",
    preferred_syllabus_id: "",
    id: "victim",
    timezone: "UTC",
    daily_goal_minutes: "999",
  }).forEach(([k, v]) => f.set(k, v));
  return f;
}
describe("profile mutation authorization", () => {
  it("uses trusted user ID and only writable columns", async () => {
    expect(await saveSettings({}, form())).toEqual({ success: true });
    expect(requireLearner).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledWith({
      id: "trusted",
      display_name: "Learner",
      baseline_hsk_level: 0,
      target_hsk_level: 5,
      preferred_syllabus_id: null,
    });
  });
  it("updates only the server-owned profile", async () => {
    maybeSingle.mockResolvedValue({ data: { id: "trusted" }, error: null });
    await saveSettings({}, form());
    expect(update).toHaveBeenCalledWith({
      display_name: "Learner",
      baseline_hsk_level: 0,
      target_hsk_level: 5,
      preferred_syllabus_id: null,
    });
    expect(builder.eq).toHaveBeenCalledWith("id", "trusted");
    expect(insert).not.toHaveBeenCalled();
  });
  it("does not mutate on invalid input", async () => {
    const f = form();
    f.set("target_hsk_level", "50");
    expect(await saveSettings({}, f)).toHaveProperty("error");
    expect(insert).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it("does not bypass RLS on errors", async () => {
    single.mockResolvedValue({
      data: null,
      error: { message: "internal DB detail" },
    });
    const result = await saveSettings({}, form());
    expect(result.error).toBeTruthy();
    expect(result.error).not.toContain("internal DB detail");
  });
});
