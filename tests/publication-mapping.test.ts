import { describe, it, expect } from "vitest";
import fs from "node:fs";
// @ts-expect-error Offline preflight review utility.
import { reviewSecurityPosture } from "../scripts/pilot-r3-preflight.mjs";
import {
  buildPublicationMapping,
  validatePublicationMapping,
  syntheticPublicationMapping,
  mappingPath,
  // @ts-expect-error Operator-only ESM module.
} from "../scripts/pilot-r3-publication-validator.mjs";
describe("grouped promotion mapping validation, no execution", () => {
  it("binds exact 91 IDs in six groups with no fabricated metadata", () => {
    const m = buildPublicationMapping();
    expect(
      m.groups.map((g: { entities: unknown[] }) => g.entities.length),
    ).toEqual([3, 44, 12, 4, 4, 24]);
    expect(
      new Set(
        m.groups.flatMap((g: { entities: { id: string }[] }) =>
          g.entities.map((e) => e.id),
        ),
      ).size,
    ).toBe(91);
    expect(JSON.parse(fs.readFileSync(mappingPath, "utf8"))).toEqual(m);
    expect(validatePublicationMapping(m)).toMatchObject({
      status: "BLOCKED",
      entities: 91,
      applyAllowed: false,
      executionSupported: false,
    });
    expect(
      m.groups.every(
        (g: {
          metadata: {
            reviewed_by: unknown;
            reviewed_at: unknown;
            content_license: unknown;
          };
        }) => Object.values(g.metadata).every((v) => v === null),
      ),
    ).toBe(true);
  });
  it("accepts only formal metadata completeness, never grants execution or certifies rights", () => {
    expect(
      validatePublicationMapping(syntheticPublicationMapping()),
    ).toMatchObject({
      status: "PASS",
      applyAllowed: false,
      executionSupported: false,
    });
  });
  it.each(["hash", "id", "source", "extra", "group", "execution"])(
    "rejects %s drift",
    (fault) => {
      const m = syntheticPublicationMapping();
      if (fault === "hash") m.base_manifest_sha256 = "0".repeat(64);
      if (fault === "id")
        m.groups[1].entities[0].id = m.groups[0].entities[0].id;
      if (fault === "source")
        m.groups[1].entities[0].source_uri = "urn:unrelated";
      if (fault === "extra") m.groups[0].metadata.correct_index = 0;
      if (fault === "group") m.groups[1].id = m.groups[0].id;
      if (fault === "execution") m.apply_authorized = true;
      expect(validatePublicationMapping(m).status).toBe("FAIL");
    },
  );
  it.each(["license", "review", "rights", "copies", "syllabus"])(
    "blocks missing %s evidence without inventing it",
    (fault) => {
      const m = syntheticPublicationMapping();
      if (fault === "license")
        m.groups[1].metadata.content_license = "pending-rights-review";
      if (fault === "review")
        m.groups[1].owner_review.actually_reviewed = false;
      if (fault === "rights")
        m.groups[1].rights.actual_inputs_confirmed = false;
      if (fault === "copies")
        m.groups[1].rights.unresolved_copied_entity_ids = [
          m.groups[1].entities[0].id,
        ];
      if (fault === "syllabus") m.syllabus_verification.verified_at = null;
      expect(validatePublicationMapping(m).status).toBe("BLOCKED");
    },
  );
  it("rejects future/invalid timestamps, publication and activation flags", () => {
    for (const update of [
      (m: Record<string, unknown>) => (m.activation_proposed = true),
      (m: Record<string, unknown>) => (m.public_release_authorized = true),
    ]) {
      const m = syntheticPublicationMapping();
      update(m);
      expect(validatePublicationMapping(m).status).toBe("FAIL");
    }
    const m = syntheticPublicationMapping();
    m.groups[0].metadata.reviewed_at = "2999-01-01T00:00:00Z";
    expect(validatePublicationMapping(m).status).toBe("FAIL");
  });
  it("rejects placeholder reviewer and metadata beyond the real reader limits", () => {
    const m = syntheticPublicationMapping();
    m.groups[0].metadata.reviewed_by = "PENDING";
    expect(validatePublicationMapping(m).status).toBe("BLOCKED");
    m.groups[0].metadata.reviewed_by = "x".repeat(201);
    expect(validatePublicationMapping(m).status).toBe("FAIL");
    m.groups[0].metadata.reviewed_by = "SYNTHETIC";
    m.groups[0].metadata.content_license = "x".repeat(501);
    expect(validatePublicationMapping(m).status).toBe("FAIL");
  });
  it("requires credit text to survive into existing persisted metadata", () => {
    const m = syntheticPublicationMapping();
    m.groups[1].metadata.content_license = "Owner personal permission";
    expect(validatePublicationMapping(m).status).toBe("BLOCKED");
  });
  it("prepares a pinned read-only preflight supplement, without running Cloud", () => {
    const sql = fs.readFileSync(
      "supabase/verification/pilot_r3_security_posture.sql",
      "utf8",
    );
    const helper = fs.readFileSync("scripts/pilot-r3-preflight.ps1", "utf8");
    expect(sql).toContain("BEGIN READ ONLY");
    expect(sql).toContain("ROLLBACK;");
    expect(sql).not.toMatch(
      /\b(?:INSERT|UPDATE|DELETE|UPSERT|TRUNCATE|CREATE|ALTER|DROP|COPY|CALL)\b/i,
    );
    expect(helper).toContain("[switch]$SecurityPosture");
    expect(helper).toContain("verify-full");
    expect(helper).toContain("ON_ERROR_STOP=1");
  });
  it("does not turn one allowlist count into owner/logging/HTTP acceptance", () => {
    const p = {
      database: "postgres",
      role: "postgres",
      read_only: "on",
      allowlisted_count: 1,
      confirmed_allowlisted_count: 1,
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
        logging: { ...p.logging, log_statement: "all" },
      }).status,
    ).toBe("BLOCKED");
    expect(reviewSecurityPosture({ ...p, allowlisted_count: 2 }).status).toBe(
      "BLOCKED",
    );
    expect(
      reviewSecurityPosture({ ...p, authenticated_private_keys_select: true })
        .status,
    ).toBe("BLOCKED");
    expect(
      reviewSecurityPosture({
        ...p,
        api_schema_role_settings: ["pgrst.db_schemas=public,private"],
      }).status,
    ).toBe("BLOCKED");
  });
});
