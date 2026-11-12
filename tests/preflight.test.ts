import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/verification/cloud_preflight.sql", "utf8");
const helper = readFileSync("scripts/cloud-preflight.ps1", "utf8");

describe("cloud preflight safety boundaries", () => {
  it("keeps the reviewed catalog inspection in one prepared-query statement", () => {
    expect(sql.match(/;/g)).toHaveLength(1);
    expect(sql.replace(/^--.*$/gm, "").trim()).toMatch(
      /^with expected_relations/i,
    );
    for (const field of [
      "identity",
      "prerequisites",
      "schemas",
      "extensions",
      "public_tables",
      "functions",
      "grants",
      "review_event_constraints",
      "relation_conflicts",
      "function_conflicts",
    ]) {
      expect(sql).toContain(`'${field}'`);
    }
    expect(sql).not.toMatch(
      /\b(?:insert\s+into|update\s+public|delete\s+from|drop\s+|create\s+table|alter\s+table)\b/i,
    );
  });
  it("hard-gates the approved Development ref and Session Pooler", () => {
    expect(helper).toContain("$ProjectRef -cne $approvedRef");
    expect(helper).toContain("$PoolerHost -cne $approvedHost");
    expect(helper).toContain("hhgxrjqkuwdgurphopok");
    expect(helper).toContain("aws-1-ap-southeast-2.pooler.supabase.com");
    expect(helper).toContain("'PGHOSTADDR'");
    expect(helper).toContain("'verify-full'");
  });
  it("wraps psql in database-enforced READ ONLY and stops on errors", () => {
    expect(helper).toContain(
      "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;",
    );
    expect(helper).toContain("ON_ERROR_STOP=1");
    expect(helper).toContain("ROLLBACK;");
    expect(helper).toContain("default_transaction_read_only=on");
    expect(helper).toContain("$process.ExitCode -ne 0");
  });
  it("only permits the fixed dry-run push call after preflight", () => {
    const calls = helper
      .split(/\r?\n/)
      .filter((line) => line.includes("'db','push'"));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("'--dry-run','--skip-vault'");
    expect(helper.indexOf("$report['preflight']='PASS'")).toBeLessThan(
      helper.indexOf("'db','push'"),
    );
    expect(helper).not.toMatch(/'--yes'|'repair'|'reset'/);
  });
  it("uses secure input and child environment, not credential argv or files", () => {
    expect(helper).toContain("-AsSecureString");
    expect(helper).toContain("EnvironmentVariables['PGPASSWORD']");
    expect(helper).toContain("ZeroFreeBSTR");
    expect(helper).toContain("EnvironmentVariables.Remove('PGPASSWORD')");
    expect(helper).not.toContain("'--password'");
    const target = helper
      .split(/\r?\n/)
      .find((line) => line.trimStart().startsWith("$target="));
    expect(target).not.toContain("DatabasePassword");
    expect(target).toContain("$ProjectRef+'@'");
  });
});
