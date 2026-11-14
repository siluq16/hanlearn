import { describe, expect, it } from "vitest";
import { learningTarget, DEVELOPMENT_PROJECT_REF } from "@/lib/learning-target";
const development = `https://${DEVELOPMENT_PROJECT_REF}.supabase.co`;
describe("Development learning target", () => {
  it("permits the pinned project only with its server opt-in", () => {
    expect(learningTarget(development, undefined, "1")).toBe(true);
    expect(learningTarget(development, "1", undefined)).toBe(false);
    expect(learningTarget(development, "1", "0")).toBe(false);
    expect(learningTarget(development, "1", "1", "production")).toBe(false);
  });
  it.each([
    undefined,
    "http://hhgxrjqkuwdgurphopok.supabase.co",
    "https://production.supabase.co",
    `${development}.evil.invalid`,
    `${development}/rest/v1`,
    `${development}?x=1`,
    `${development}#x`,
    "https://user:secret@hhgxrjqkuwdgurphopok.supabase.co",
    `${development}:8443`,
  ])("rejects a non-approved target %s", (url) => {
    expect(learningTarget(url, "1", "1")).toBe(false);
  });
  it("retains isolated fixture opt-ins without treating NODE_ENV as the DB target", () => {
    expect(learningTarget("https://127.0.0.1:54321", "1")).toBe(true);
    expect(learningTarget("https://[::1]:54321", "1")).toBe(true);
    expect(learningTarget("https://127.0.0.1", undefined, "1")).toBe(false);
    expect(learningTarget(development, undefined, "1", "preview")).toBe(true);
  });
});
