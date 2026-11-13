import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import { inspect } from "node:util";
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
  it("denies real reading without a separate actual authorization", () => {
    // No auth file is generated and no answers file is opened in this test.
    const pkg = importer.loadPilot();
    const guard = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw Error("FILE_READ_FORBIDDEN_IN_DENIAL_TEST");
    });
    try {
      expect(() => delivery.readApprovedRealStore(pkg)).toThrow(
        "REAL_READ_NOT_AUTHORIZED",
      );
      expect(guard).not.toHaveBeenCalled();
    } finally {
      guard.mockRestore();
    }
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
