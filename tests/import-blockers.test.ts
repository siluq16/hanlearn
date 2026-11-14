import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { createHash } from "node:crypto";
// @ts-expect-error Offline read-only capture reviewer.
import { reviewImportBlockers } from "../scripts/pilot-r3-preflight.mjs";
const fixture = () => ({
  projectRef: "hhgxrjqkuwdgurphopok",
  tlsMode: "verify-full",
  status: "BLOCKERS_CAPTURED",
  ownerIdentity: {
    identity: { database: "postgres", role: "postgres", read_only: "on" },
    owner_matches: 1,
    allowlist: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        email: "owner@example.invalid",
        confirmed: true,
        owner_reference_match: true,
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        email: "other@example.invalid",
        confirmed: true,
        owner_reference_match: false,
      },
    ],
  },
  sessionProbe: {
    status: "SAFE_SESSION_GUARD_VERIFIED",
    exitCode: 3,
    sqlState: "22P02",
    stages: [
      { stage: "baseline", pid: 10 },
      {
        stage: "guard_verified",
        pid: 10,
        logging_guard_pass: true,
        read_only: "on",
      },
      { stage: "bind_canary", pid: 10, bound_text: true },
    ],
  },
});
describe("read-only allowlist and import-session diagnosis", () => {
  it("keeps both invited memberships without touching Auth/profile/learning data", () => {
    const r = reviewImportBlockers(fixture());
    expect(r.ownerIdentified).toBe(true);
    expect(r.allowlistProposal).toMatchObject({
      operation: "KEEP_ALL_CONFIRMED_INVITEES",
      keepInviteeIds: ["22222222-2222-4222-8222-222222222222"],
      keepUserId: "11111111-1111-4111-8111-111111111111",
      approvalRequired: false,
      deleteAuthUser: false,
      deleteProfile: false,
      deleteLearningData: false,
    });
    expect(JSON.stringify(r)).not.toContain("owner@example.invalid");
    expect(r.logging).toBe("SAFE_SESSION_GUARD_VERIFIED");
    expect(r.cloudWritesExecuted).toBe(false);
  });
  it.each([
    "owner",
    "permission",
    "unexpectedError",
    "backend",
    "missingBackend",
    "unverified",
  ])("fails closed for %s", (fault) => {
    const c = fixture();
    if (fault === "owner") c.ownerIdentity.owner_matches = 0;
    if (fault === "permission") {
      c.sessionProbe.status = "BLOCKED";
      c.sessionProbe.sqlState = "42501";
    }
    if (fault === "unexpectedError") c.sessionProbe.sqlState = "XX000";
    if (fault === "backend") c.sessionProbe.stages[2].pid = 11;
    if (fault === "missingBackend")
      c.sessionProbe.stages.forEach((s) => Reflect.deleteProperty(s, "pid"));
    if (fault === "unverified")
      c.sessionProbe.stages[1].logging_guard_pass = false;
    const r = reviewImportBlockers(c);
    if (fault === "owner") {
      expect(r.ownerIdentified).toBe(false);
      expect(r.allowlistProposal).toBeNull();
    } else expect(r.logging).toBe("BLOCKED");
  });
  it("pins a READ ONLY synthetic parameter/error probe with transaction-local settings only", () => {
    const sql = fs.readFileSync(
        "supabase/verification/pilot_import_session_probe.sql",
        "utf8",
      ),
      helper = fs.readFileSync("scripts/pilot-r3-preflight.ps1", "utf8");
    expect(helper).toContain(createHash("sha256").update(sql).digest("hex"));
    expect(sql).toContain("BEGIN READ ONLY");
    expect(sql).not.toMatch(
      /\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|COPY|CALL|DO)\b/i,
    );
    expect(sql).toContain(
      "\\bind 'HANLEARN_SYNTHETIC_CANARY_NOT_A_KEY_20261114'",
    );
    for (const setting of [
      "log_min_messages='panic'",
      "auto_explain.log_min_duration=-1",
      "log_parameter_max_length=0",
      "log_parameter_max_length_on_error=0",
    ])
      expect(sql).toContain("SET LOCAL " + setting);
    expect(sql.indexOf("guard_verified")).toBeLessThan(sql.indexOf("\\bind"));
    expect(helper).toContain("'22P02'");
    expect(helper).toContain("-AsSecureString");
  });
  it("provides a pinned session-only message-threshold alternative without hiding permission denials", () => {
    const sql = fs.readFileSync(
      "supabase/verification/pilot_import_threshold_probe.sql",
      "utf8",
    );
    const helper = fs.readFileSync("scripts/pilot-r3-preflight.ps1", "utf8");
    expect(helper).toContain(createHash("sha256").update(sql).digest("hex"));
    expect(helper).toContain("$probe.SqlState -ceq '42501'");
    expect(helper).toContain("strictAttempt=$strictAttempt");
    expect(sql).toContain("SET LOCAL log_min_messages='panic'");
    expect(sql).toContain("pg_sleep(10.1)");
    expect(sql).toContain("current_setting('log_min_messages')='panic'");
    expect(sql).not.toMatch(
      /\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|COPY|CALL|DO)\b/i,
    );
    const c = fixture();
    const result = reviewImportBlockers({
      ...c,
      sessionProbeKind: "SESSION_MESSAGE_THRESHOLD",
    });
    expect(result.loggingProtection).toBe("SESSION_MESSAGE_THRESHOLD");
  });
});
