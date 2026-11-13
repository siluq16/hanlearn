import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error Local backup utility uses plain ESM.
import { hasAesEncryptedHeader } from "../scripts/private-backup-header.mjs";

const prefix = [0x17, 0x06, 0, 1, 0x09, 16, 0, 0x07, 0x0b, 1, 0, 1];
const aes = [0x24, 0x06, 0xf1, 0x07, 0x01, 1, 0];
describe("private backup encrypted-header gate", () => {
  it("leaves encrypted-read passwords undefined so 7-Zip prompts instead of trying an empty password", () => {
    const script = readFileSync("scripts/private-pilot-backup.ps1", "utf8");
    const reads = script
      .split(/\r?\n/)
      .filter((line) => /^\s*& \$sevenZip [tx] /.test(line));
    expect(reads).toHaveLength(2);
    expect(reads.every((line) => !/(?:^|\s)-p(?:\s|$)/.test(line))).toBe(true);
    expect(script).toContain("-t7z -mhe=on -p");
  });
  it("recognizes the AES coder only inside the encoded header stream descriptor", () => {
    expect(hasAesEncryptedHeader(Buffer.from([...prefix, ...aes]))).toBe(true);
  });
  it("rejects a plaintext header even if it contains the AES method bytes", () => {
    expect(hasAesEncryptedHeader(Buffer.from([1, ...prefix, ...aes]))).toBe(
      false,
    );
  });
  it("rejects a compressed header without an AES coder", () => {
    expect(
      hasAesEncryptedHeader(Buffer.from([...prefix, 0x21, 0x21, 1, 0])),
    ).toBe(false);
  });
  it("rejects truncated encrypted headers instead of reporting verified", () => {
    expect(() =>
      hasAesEncryptedHeader(Buffer.from([...prefix, 0x24, 0x06])),
    ).toThrow();
  });
  it("rejects unsupported external folder metadata", () => {
    const header = [...prefix, ...aes];
    header[10] = 1;
    expect(hasAesEncryptedHeader(Buffer.from(header))).toBe(false);
  });
  it("bounds-checks coder properties", () => {
    expect(() =>
      hasAesEncryptedHeader(
        Buffer.from([...prefix, 0x24, 0x06, 0xf1, 0x07, 0x01, 127]),
      ),
    ).toThrow("bounds");
  });
});
