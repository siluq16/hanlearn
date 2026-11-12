import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
vi.mock("@/lib/env", () => ({ getPublicConfig: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
import { login, logout } from "@/features/auth/actions";
import { getPublicConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
const signInWithPassword = vi.fn();
const signOut = vi.fn();
const getUser = vi.fn();
const rpc = vi.fn();
beforeEach(() => {
  vi.mocked(getPublicConfig).mockReturnValue({
    url: "https://test.supabase.co",
    publishableKey: "sb_publishable_test",
  });
  vi.mocked(createClient).mockResolvedValue({
    auth: { signInWithPassword, signOut, getUser },
    rpc,
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  signInWithPassword.mockResolvedValue({
    data: { user: { id: "trusted", email_confirmed_at: "now" } },
    error: null,
  });
  signOut.mockResolvedValue({ error: null });
  getUser.mockResolvedValue({ data: { user: { id: "trusted" } }, error: null });
  rpc.mockResolvedValue({ data: true, error: null });
});
function form(email = "owner@example.invalid", password = "test-password") {
  const f = new FormData();
  f.set("email", email);
  f.set("password", password);
  return f;
}
describe("login action", () => {
  it("validates before contacting Auth", async () => {
    expect(await login({}, form("invalid", ""))).toHaveProperty("error");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
  it("reports missing configuration without fake login", async () => {
    vi.mocked(getPublicConfig).mockReturnValue(null);
    expect(await login({}, form())).toHaveProperty("error");
    expect(createClient).not.toHaveBeenCalled();
  });
  it("sanitizes bad-credential response", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "sensitive detail" },
    });
    const r = await login({}, form());
    expect(r.error).toBeTruthy();
    expect(r.error).not.toContain("sensitive detail");
  });
  it("clears the newly created session for a nonallowlisted identity", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await login({}, form())).toHaveProperty("error");
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("does not accept unavailable authorization RPC", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "missing migration" } });
    expect(await login({}, form())).toHaveProperty("error");
    expect(signOut).toHaveBeenCalled();
  });
  it("redirects only after Auth and DB authorization both succeed", async () => {
    await expect(login({}, form())).rejects.toThrow("redirect:/dashboard");
    expect(rpc).toHaveBeenCalledWith("get_learner_access");
  });
  it("revalidates and clears only the local session on logout", async () => {
    await expect(logout()).rejects.toThrow("redirect:/login");
    expect(getUser).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("does not pretend logout succeeded if the service failed", async () => {
    signOut.mockResolvedValue({ error: { message: "private detail" } });
    await expect(logout()).rejects.toThrow("redirect:/access?reason=logout");
  });
});
