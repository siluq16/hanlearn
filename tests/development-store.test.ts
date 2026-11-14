import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { expect, it } from "vitest";

it.skipIf(process.platform !== "win32")(
  "encrypts a synthetic session using DPAPI and restores exact Unicode bytes",
  () => {
    const file = ".local/development-store-fixture/test-account.dpapi";
    const payload = { message: "synthetic-only 测试 tiếng Việt" };
    const call = (operation: string) =>
      spawnSync(
        "powershell",
        [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          "scripts/development-store.ps1",
          "-Operation",
          operation,
          "-Fixture",
        ],
        {
          input: operation === "Write" ? JSON.stringify(payload) : undefined,
          encoding: "utf8",
          windowsHide: true,
          timeout: 20000,
          env: { ...process.env, HANLEARN_INTERNAL_SESSION_PIPE: "1" },
        },
      );
    try {
      const saved = call("Write");
      expect(saved.status, saved.stderr).toBe(0);
      expect(JSON.parse(saved.stdout)).toEqual({ status: "SAVED" });
      expect(fs.readFileSync(file).includes(Buffer.from(payload.message))).toBe(
        false,
      );
      const restored = call("Read");
      expect(restored.status).toBe(0);
      expect(JSON.parse(restored.stdout)).toEqual(payload);
      const denied = spawnSync(
        "powershell",
        [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          "scripts/development-store.ps1",
          "-Operation",
          "Read",
          "-Fixture",
        ],
        {
          encoding: "utf8",
          windowsHide: true,
          timeout: 20000,
          env: { ...process.env, HANLEARN_INTERNAL_SESSION_PIPE: "0" },
        },
      );
      expect(denied.status).not.toBe(0);
      expect(denied.stdout).not.toContain(payload.message);
    } finally {
      // Only the named synthetic fixture, never the actual test-session store.
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  },
  45000,
);
