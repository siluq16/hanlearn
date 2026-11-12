import { describe, it, expect } from "vitest";
import { parsePublicConfig } from "@/lib/env";
import { loginSchema } from "@/features/auth/schemas";
import { settingsSchema } from "@/features/settings/schemas";
import { vocabularyFiltersSchema } from "@/features/vocabulary/schemas";
describe("public configuration", () => {
  it("is optional until cloud is configured", () =>
    expect(parsePublicConfig({})).toBeNull());
  it("accepts HTTPS and a publishable key", () =>
    expect(
      parsePublicConfig({
        url: "https://test.supabase.co",
        publishableKey: "sb_publishable_test",
      }),
    ).not.toBeNull());
  it.each([
    "sb_secret_test",
    "service_role",
    "eyJhbGciOiJIUzI1NiJ9.token.signature",
  ])("rejects secret/legacy keys: %s", (publishableKey) =>
    expect(
      parsePublicConfig({ url: "https://test.supabase.co", publishableKey }),
    ).toBeNull(),
  );
  it.each([
    "http://test.supabase.co",
    "https://password@test.supabase.co",
    "https://test.supabase.co/path",
    "https://test.supabase.co?key=secret",
  ])("rejects unsafe URL %s", (url) =>
    expect(
      parsePublicConfig({ url, publishableKey: "sb_publishable_test" }),
    ).toBeNull(),
  );
});
describe("input boundaries", () => {
  it("rejects missing password and malformed email", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(
      false,
    );
  });
  it("permits an existing password without inventing signup rules", () =>
    expect(
      loginSchema.safeParse({
        email: "owner@example.invalid",
        password: "short",
      }).success,
    ).toBe(true));
  it("bounds vocabulary search/page/level", () => {
    expect(
      vocabularyFiltersSchema.safeParse({ q: "x".repeat(101) }).success,
    ).toBe(false);
    expect(vocabularyFiltersSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(vocabularyFiltersSchema.safeParse({ level: 10 }).success).toBe(
      false,
    );
  });
  it("preserves literal search characters as data", () =>
    expect(
      vocabularyFiltersSchema.parse({ q: "%,()'", page: "2", level: "1" }),
    ).toEqual({ q: "%,()'", page: 2, level: 1 }));
  it("strips untrusted settings fields", () => {
    const result = settingsSchema.parse({
      display_name: "Learner",
      baseline_hsk_level: 0,
      target_hsk_level: 5,
      preferred_syllabus_id: "",
      id: "other-user",
      daily_goal_minutes: 999,
    });
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("daily_goal_minutes");
  });
  it("allows baseline zero but not target zero", () => {
    expect(
      settingsSchema.safeParse({
        display_name: "",
        baseline_hsk_level: 0,
        target_hsk_level: 0,
        preferred_syllabus_id: "",
      }).success,
    ).toBe(false);
  });
});
