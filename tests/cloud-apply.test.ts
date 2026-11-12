import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
// Runtime verifier is plain ESM; tests exercise its behavior without Cloud access.
// @ts-expect-error CLI utility intentionally has no app declaration file.
import { compareSchema } from "../scripts/verify-schema.mjs";

const helper = readFileSync("scripts/cloud-apply.ps1", "utf8");
const reference = JSON.parse(
  readFileSync("supabase/verification/expected_schema.json", "utf8"),
);

describe("bounded approved migration execution", () => {
  it("returns distinct remote-history rows in Windows PowerShell 5.1", () => {
    const historyFunction = helper.slice(
      helper.indexOf("function Read-MigrationHistory {"),
      helper.indexOf(
        "\ntry {",
        helper.indexOf("function Read-MigrationHistory {"),
      ),
    );
    for (const count of [0, 6]) {
      const rows = Array.from({ length: count }, (_, index) => ({
        version: `20261112000${index + 1}`,
        name: `migration_${index + 1}`,
      }));
      const command = `
        function Invoke-ReadOnlySql([string]$Sql) {
          if($Sql.Contains('present')) { return [pscustomobject]@{present=$true} }
          return '${JSON.stringify(rows)}' | ConvertFrom-Json
        }
        ${historyFunction}
        $history=@(Read-MigrationHistory)
        [pscustomobject]@{count=$history.Count;versions=@($history | ForEach-Object {$_.version})} | ConvertTo-Json -Compress
      `;
      const output = execFileSync(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", command],
        { encoding: "utf8", timeout: 15000, windowsHide: true },
      );
      expect(JSON.parse(output)).toEqual({
        count,
        versions: rows.map((row) => row.version),
      });
    }
  });
  it("pins the exact approved six files and their preflight hashes", () => {
    expect(reference.migrationHashes).toHaveLength(6);
    for (const entry of reference.migrationHashes) {
      const hash = createHash("sha256")
        .update(readFileSync(`supabase/migrations/${entry.file}`))
        .digest("hex")
        .toUpperCase();
      expect(hash).toBe(entry.sha256);
      expect(helper).toContain(`'${entry.file}'='${entry.sha256}'`);
    }
  });
  it("isolates write mode to one literal CLI push with no seed/custom role flags", () => {
    const calls = helper
      .split(/\r?\n/)
      .filter((line) => line.includes("$applied=Invoke-Captured"));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("'--skip-vault','--yes','--agent=yes'");
    expect(calls[0]).toContain("-MigrationWrite");
    expect(helper).toContain("if(-not $script:applyGate");
    expect(helper).not.toMatch(
      /'--include-seed'|'--include-roles'|'--include-all'|'repair'|'reset'/,
    );
  });
  it("rechecks history and hashes immediately before opening the apply gate", () => {
    const lastHistory = helper.indexOf("$immediate=@(Read-MigrationHistory)");
    expect(lastHistory).toBeGreaterThan(helper.indexOf("$planned=@("));
    expect(lastHistory).toBeLessThan(helper.indexOf("$script:applyGate=$true"));
    expect(helper).toContain(
      "Remote history changed immediately before apply. STOP.",
    );
  });
  it("never retries apply or repairs after failure", () => {
    const failureBlock = helper.slice(
      helper.indexOf("} catch {\n    $script:applyGate=$false"),
    );
    expect(failureBlock).toContain("Read-MigrationHistory");
    expect(failureBlock).not.toContain("'db','push'");
  });
});

describe("post-apply catalog comparison", () => {
  const rows = [{ role: "anon", insert: false, select: false }];
  const expected = {
    sections: {
      table_privileges: {
        count: 1,
        sha256: createHash("sha256")
          .update(
            JSON.stringify([{ insert: false, role: "anon", select: false }]),
          )
          .digest("hex"),
      },
    },
  };
  it("accepts equivalent object key ordering", () => {
    expect(compareSchema(expected, { table_privileges: rows }).status).toBe(
      "PASS",
    );
  });
  it("detects an unexpected effective client write grant", () => {
    expect(
      compareSchema(expected, {
        table_privileges: [{ ...rows[0], insert: true }],
      }).status,
    ).toBe("FAIL");
  });
  it("detects missing catalog entries", () => {
    expect(compareSchema(expected, { table_privileges: [] }).status).toBe(
      "FAIL",
    );
  });
});
