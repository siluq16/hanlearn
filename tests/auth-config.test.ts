import { describe, expect, it } from "vitest";
// @ts-expect-error Local verification utility is plain ESM.
import { classifyAuthSettings } from "../scripts/check-auth-config.mjs";
describe("private Auth configuration acceptance", () => {
  it("accepts email login with public signup and anonymous sign-in disabled", () => {
    expect(
      classifyAuthSettings({
        disable_signup: true,
        external: { email: true, anonymous_users: false },
      }).status,
    ).toBe("PASS");
  });
  it("rejects public signup or anonymous sign-in even if owner login works", () => {
    expect(
      classifyAuthSettings({
        disable_signup: false,
        external: { email: true, anonymous_users: false },
      }).status,
    ).toBe("FAIL");
    expect(
      classifyAuthSettings({
        disable_signup: true,
        external: { email: true, anonymous_users: true },
      }).status,
    ).toBe("FAIL");
  });
  it("does not interpret absent provider flags as securely disabled", () => {
    expect(
      classifyAuthSettings({ disable_signup: true, external: { email: true } })
        .status,
    ).toBe("BLOCKED");
  });
});
