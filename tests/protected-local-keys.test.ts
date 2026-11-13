import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import { inspect } from "node:util";
import path from "node:path";
// @ts-expect-error Local ESM utility.
import * as delivery from "../scripts/protected-local-keys.mjs";
// @ts-expect-error Local ESM utility.
import * as importer from "../scripts/pilot-r3-importer.mjs";
describe("protected local delivery", () => {
  it("redacts handles in JSON and console inspection", () => {
    const handle = delivery.syntheticProtectedHandle(importer.loadPilot());
    expect(JSON.stringify(handle)).not.toContain("correct_index");
    expect(inspect(handle)).not.toContain("explanation_vi");
    expect(inspect(handle)).not.toContain("quoted");
  });
  it("rejects forged handles", () => {
    expect(
      delivery.deliverLocalSynthetic(importer.loadPilot(), {}),
    ).toMatchObject({ status: "BLOCKED", code: "UNTRUSTED_HANDLE" });
  });
  it.each(["missing_key", "duplicate_id", "binding_mismatch"])(
    "rejects %s before a DB connection",
    (fault) => {
      const pkg = importer.loadPilot();
      expect(
        delivery.deliverLocalSynthetic(
          pkg,
          delivery.syntheticProtectedHandle(pkg, { fault }),
        ).status,
      ).toBe("BLOCKED");
    },
  );
  it("blocks changed public package bytes", () => {
    const pkg = importer.loadPilot(),
      handle = delivery.syntheticProtectedHandle(pkg);
    pkg.lessons[0].title = "Changed draft";
    expect(delivery.deliverLocalSynthetic(pkg, handle).status).toBe("BLOCKED");
  });
  it("denies private reading in Vitest before any file I/O", () => {
    const pkg = importer.loadPilot();
    const guard = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw Error("FILE_READ_FORBIDDEN_IN_DENIAL_TEST");
    });
    try {
      expect(() => delivery.readApprovedRealStore(pkg)).toThrow(
        "TRUSTED_LOCAL_REQUIRED",
      );
      expect(guard).not.toHaveBeenCalled();
    } finally {
      guard.mockRestore();
    }
  });
  it("permits a trusted local command without signatures, TTY or approval flags", () => {
    expect(
      delivery.trustedLocalRuntime({
        platform: "win32",
        env: {},
        cwd: process.cwd(),
        entry: path.resolve("scripts/validate-pilot.mjs"),
        browser: false,
      }),
    ).toBe(true);
  });
  it.each([
    "CI",
    "VITEST",
    "NEXT_RUNTIME",
    "GITHUB_ACTIONS",
    "TF_BUILD",
    "JENKINS_URL",
    "BUILD_BUILDID",
    "VERCEL",
    "NETLIFY",
  ])("rejects %s runtimes", (flag) => {
    expect(
      delivery.trustedLocalRuntime({
        platform: "win32",
        env: { [flag]: "1" },
        cwd: process.cwd(),
        entry: path.resolve("scripts/validate-pilot.mjs"),
        browser: false,
      }),
    ).toBe(false);
  });
  it("rejects production, browser, non-Windows and another working directory", () => {
    const local = {
      platform: "win32",
      env: {},
      cwd: process.cwd(),
      entry: path.resolve("scripts/validate-pilot.mjs"),
      browser: false,
    };
    for (const override of [
      { env: { NODE_ENV: "production" } },
      { browser: true },
      { platform: "linux" },
      { cwd: "D:/untrusted-checkout" },
      { entry: path.resolve("node_modules/next/dist/bin/next") },
    ])
      expect(delivery.trustedLocalRuntime({ ...local, ...override })).toBe(
        false,
      );
  });
  it("has no target fallback when local fixture opt-in is missing", () => {
    const before = process.env.HANLEARN_IMPORT_LOCAL_ONLY;
    delete process.env.HANLEARN_IMPORT_LOCAL_ONLY;
    try {
      const pkg = importer.loadPilot();
      expect(
        delivery.deliverLocalSynthetic(
          pkg,
          delivery.syntheticProtectedHandle(pkg),
        ).status,
      ).toBe("BLOCKED");
    } finally {
      if (before === undefined) delete process.env.HANLEARN_IMPORT_LOCAL_ONLY;
      else process.env.HANLEARN_IMPORT_LOCAL_ONLY = before;
    }
  });
});
