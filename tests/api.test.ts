import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/features/auth/session", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/auth/session")>();
  return { ...actual, getLearner: vi.fn() };
});
import { getLearner, AccessError } from "@/features/auth/session";
import { GET as getMe } from "@/app/api/me/route";
import { GET as getAudio } from "@/app/api/vocabulary/[id]/audio/route";
beforeEach(() => {
  vi.mocked(getLearner).mockRejectedValue(new AccessError("unauthenticated"));
});
describe("independent protected API checks", () => {
  it("returns 401 without relying on proxy", async () => {
    const r = await getMe();
    expect(r.status).toBe(401);
    expect(r.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects unauthorized audio before data or Storage access", async () => {
    const r = await getAudio(new Request("https://example.invalid"), {
      params: Promise.resolve({ id: "unknown" }),
    });
    expect(r.status).toBe(401);
  });
  it("returns 403 for a valid but unallowed identity", async () => {
    vi.mocked(getLearner).mockRejectedValue(new AccessError("forbidden"));
    expect((await getMe()).status).toBe(403);
  });
  it("marks absent cloud configuration unavailable, never returns account data", async () => {
    vi.mocked(getLearner).mockRejectedValue(new AccessError("configuration"));
    const r = await getMe();
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "service_unavailable" });
  });
  it("does not expose raw exceptions", async () => {
    vi.mocked(getLearner).mockRejectedValue(
      new Error("private-credential-detail"),
    );
    expect(JSON.stringify(await (await getMe()).json())).not.toContain(
      "private-credential-detail",
    );
  });
  it("returns only the independently verified identity", async () => {
    vi.mocked(getLearner).mockResolvedValue({
      user: { id: "trusted", email: "a@example.invalid" },
    } as Awaited<ReturnType<typeof getLearner>>);
    expect(await (await getMe()).json()).toEqual({
      id: "trusted",
      email: "a@example.invalid",
    });
  });
});
