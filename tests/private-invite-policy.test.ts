import fs from "node:fs";
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import {
  currentMappingPath,
  inviteDeclaration,
  validatePublicationMapping,
  // @ts-expect-error Operator-only validator.
} from "../scripts/pilot-r3-publication-validator.mjs";
import {
  deliverApprovedDevelopment,
  syntheticProtectedHandle,
  // @ts-expect-error Operator-only protected transport.
} from "../scripts/protected-local-keys.mjs";
// @ts-expect-error Offline public loader.
import { loadPilot } from "../scripts/pilot-r3-importer.mjs";
// @ts-expect-error Read-only preflight helper.
import { reviewSecurityPosture } from "../scripts/pilot-r3-preflight.mjs";
describe("private invite policy and protected execution", () => {
  const fixture = () => JSON.parse(fs.readFileSync(currentMappingPath, "utf8"));
  it("shares exact frozen catalog with invitees without claiming third-party permission or public release", () => {
    const m = fixture();
    expect(validatePublicationMapping(m)).toMatchObject({
      status: "PASS",
      entities: 91,
      policy: "PRIVATE_INVITE_ONLY",
      applyAllowed: false,
    });
    expect(
      m.groups.every(
        (g: { metadata: { content_license: string } }) =>
          g.metadata.content_license === inviteDeclaration,
      ),
    ).toBe(true);
    expect(m.invite_sharing.third_party_sharing_rights).toBe("UNVERIFIED");
    expect(m.content_policy.rights_clearance.state).toBe("PENDING");
    expect(
      validatePublicationMapping(m, { policy: "PUBLIC_RELEASE" }).status,
    ).toBe("BLOCKED");
  });
  it.each(["scope", "missingDecision", "public", "license", "target"])(
    "rejects %s scope drift",
    (fault) => {
      const m = fixture();
      if (fault === "scope") m.scope = "OWNER_PERSONAL_USE_ONLY";
      if (fault === "missingDecision") delete m.invite_sharing;
      if (fault === "public") m.public_release_authorized = true;
      if (fault === "license")
        m.groups[0].metadata.content_license = "self-authored";
      if (fault === "target")
        m.content_policy.target.project_ref = "production";
      expect(validatePublicationMapping(m).status).not.toBe("PASS");
    },
  );
  it("does not require a singleton allowlist; retains confirmation, grants and logging gates", () => {
    const p = {
      database: "postgres",
      role: "postgres",
      read_only: "on",
      allowlisted_count: 2,
      confirmed_allowlisted_count: 2,
      missing_or_unconfirmed_allowlisted_count: 0,
      authenticated_private_keys_select: false,
      anon_private_keys_select: false,
      api_schema_role_settings: [],
      logging: {
        log_statement: "none",
        log_parameter_max_length_on_error: "0",
        log_parameter_max_length: "0",
      },
      pgaudit_extension_present: false,
      pgaudit_parameter_logging: null,
    };
    expect(reviewSecurityPosture(p).status).toBe("WARNING");
    expect(
      reviewSecurityPosture({
        ...p,
        missing_or_unconfirmed_allowlisted_count: 1,
      }).status,
    ).toBe("BLOCKED");
  });
  it("denies development delivery before any private reads/network from automated runtimes", () => {
    const pkg = loadPilot();
    expect(
      deliverApprovedDevelopment(
        pkg,
        syntheticProtectedHandle(pkg),
        { password: "NOT_A_REAL_CREDENTIAL", ipv4: "127.0.0.1", invitees: [] },
        "draft_import",
      ),
    ).toMatchObject({
      status: "BLOCKED",
      code: "EXPLICIT_DEVELOPMENT_APPROVAL_REQUIRED",
    });
  });
  it("worker independently denies unapproved development mode before connection", () => {
    const r = spawnSync(
      "python",
      ["-I", "-B", "scripts/protected-key-worker.py"],
      {
        input: JSON.stringify({
          mode: "APPROVED_DEVELOPMENT_INVITE",
          project_ref: "hhgxrjqkuwdgurphopok",
          password: "NOT_A_REAL_CREDENTIAL",
        }),
        encoding: "utf8",
        timeout: 10000,
        windowsHide: true,
      },
    );
    expect(JSON.parse(r.stdout)).toMatchObject({
      status: "BLOCKED",
      code: "EXPLICIT_DEVELOPMENT_APPROVAL_REQUIRED",
    });
    expect(r.stdout + r.stderr).not.toContain("NOT_A_REAL_CREDENTIAL");
  });
  it("worker refuses CI even with a real-write-shaped flag and fake credential", () => {
    const r = spawnSync(
      "python",
      [
        "-I",
        "-B",
        "scripts/protected-key-worker.py",
        "--apply-approved-invite",
      ],
      {
        input: JSON.stringify({
          mode: "APPROVED_DEVELOPMENT_INVITE",
          project_ref: "hhgxrjqkuwdgurphopok",
          password: "NOT_A_REAL_CREDENTIAL",
        }),
        encoding: "utf8",
        timeout: 10000,
        windowsHide: true,
        env: { ...process.env, CI: "1" },
      },
    );
    expect(JSON.parse(r.stdout)).toMatchObject({
      status: "BLOCKED",
      code: "TRUSTED_DEVELOPMENT_RUNTIME_REQUIRED",
    });
  });
});
