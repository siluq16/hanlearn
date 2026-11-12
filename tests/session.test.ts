import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("@/lib/env", () => ({ getPublicConfig: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
import { getPublicConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getLearner, requireLearner } from "@/features/auth/session";
const getUser = vi.fn();
const rpc = vi.fn();
beforeEach(() => {
  vi.mocked(getPublicConfig).mockReturnValue({
    url: "https://test.supabase.co",
    publishableKey: "sb_publishable_test",
  });
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser },
    rpc,
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  getUser.mockResolvedValue({
    data: { user: { id: "trusted-user", email_confirmed_at: "now" } },
    error: null,
  });
  rpc.mockResolvedValue({ data: true, error: null });
});
describe("server authentication and authorization", () => {
  it("fails closed without config", async () => {
    vi.mocked(getPublicConfig).mockReturnValue(null);
    await expect(getLearner()).rejects.toMatchObject({
      reason: "configuration",
    });
    expect(createClient).not.toHaveBeenCalled();
  });
  it("rejects unsigned/missing sessions before touching data", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getLearner()).rejects.toMatchObject({
      reason: "unauthenticated",
    });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("requires currently confirmed email", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "a", email_confirmed_at: null } },
      error: null,
    });
    await expect(getLearner()).rejects.toMatchObject({ reason: "forbidden" });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects a verified user outside DB allowlist", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    await expect(getLearner()).rejects.toMatchObject({ reason: "forbidden" });
  });
  it("fails closed when migration/RPC is unavailable", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "PGRST202" } });
    await expect(getLearner()).rejects.toMatchObject({ reason: "unavailable" });
  });
  it("uses server-confirmed user and DB access predicate", async () => {
    const { user } = await getLearner();
    expect(user.id).toBe("trusted-user");
    expect(getUser).toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith("get_learner_access");
  });
  it("redirects anonymous to login independently of proxy", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(requireLearner()).rejects.toThrow("redirect:/login");
  });
  it("redirects config absence to setup", async () => {
    vi.mocked(getPublicConfig).mockReturnValue(null);
    await expect(requireLearner()).rejects.toThrow("redirect:/setup");
  });
  it("does not silently treat Auth outages as valid sessions", async () => {
    getUser.mockRejectedValue(new Error("network"));
    await expect(getLearner()).rejects.toMatchObject({ reason: "unavailable" });
  });
});
