import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  personalMappingPath,
  personalDeclaration,
  validatePublicationMapping,
  verifySyllabusSource,
  parseOwnerContentAcceptance,
  buildPersonalDevelopmentMapping,
  // @ts-expect-error Local operator ESM; one shared schema and validator.
} from "../scripts/pilot-r3-publication-validator.mjs";
const fixture = () => JSON.parse(fs.readFileSync(personalMappingPath, "utf8"));
const validate = (m: unknown, policy?: string) =>
  validatePublicationMapping(m, { policy: policy ?? null });
describe("PERSONAL_DEVELOPMENT and PUBLIC_RELEASE boundaries", () => {
  it("does not manufacture language or distribution clearance within personal policy", () => {
    for (const field of ["language", "rights"]) {
      const m = fixture();
      if (field === "language") m.independent_language_review = "VERIFIED";
      if (field === "rights")
        m.content_policy.rights_clearance.state = "VERIFIED";
      expect(validate(m).status).toBe("BLOCKED");
    }
  });
  it("accepts truthful personal metadata with separate pending language/rights decisions, never Cloud authorization", () => {
    const m = fixture(),
      r = validate(m);
    expect(r).toMatchObject({
      status: "PASS",
      policy: "PERSONAL_DEVELOPMENT",
      entities: 91,
      groups: 6,
      applyAllowed: false,
      executionSupported: false,
    });
    expect(r.targetVerification).toContain("PREFLIGHT_REQUIRED");
    expect(m.content_policy.language_verification.state).toBe("PENDING");
    expect(m.content_policy.rights_clearance.state).toBe("PENDING");
    expect(
      m.groups.every(
        (g: {
          metadata: { content_license: string; reviewed_at: string };
          rights: {
            actual_inputs_confirmed: boolean;
            unresolved_copied_entity_ids: unknown;
          };
        }) =>
          g.metadata.content_license === personalDeclaration &&
          g.metadata.reviewed_at ===
            m.content_policy.owner_acceptance.approved_at &&
          !g.rights.actual_inputs_confirmed &&
          g.rights.unresolved_copied_entity_ids === null,
      ),
    ).toBe(true);
    expect(
      m.owner_viewing_notes.records.every(
        (r: { viewed_at: string }) =>
          r.viewed_at !== m.content_policy.owner_acceptance.approved_at,
      ),
    ).toBe(true);
  });
  it("missing acceptance produces pending metadata rather than copying viewing times", () => {
    const m = buildPersonalDevelopmentMapping(null);
    expect(validate(m).status).toBe("BLOCKED");
    expect(
      m.groups.every(
        (g: { metadata: { reviewed_at: unknown; reviewed_by: unknown } }) =>
          g.metadata.reviewed_at === null && g.metadata.reviewed_by === null,
      ),
    ).toBe(true);
  });
  it.each([
    "pending",
    "scope",
    "viewing",
    "time",
    "reviewer",
    "blankLicense",
    "nullLicense",
    "fakeLicense",
  ])("blocks invalid personal approval/metadata: %s", (fault) => {
    const m = fixture();
    if (fault === "pending")
      m.content_policy.owner_acceptance.state = "PENDING";
    if (fault === "scope") m.content_policy.owner_acceptance.groups.pop();
    if (fault === "viewing")
      m.content_policy.owner_acceptance.evidence_reference =
        "docs/hanlearn-r3-owner-viewing-notes.txt";
    if (fault === "time")
      m.groups[0].metadata.reviewed_at =
        m.owner_viewing_notes.records[0].viewed_at;
    if (fault === "reviewer") m.groups[0].metadata.reviewed_by = "AI";
    if (fault === "blankLicense") m.groups[0].metadata.content_license = "";
    if (fault === "nullLicense") m.groups[0].metadata.content_license = null;
    if (fault === "fakeLicense")
      m.groups[0].metadata.content_license = "self-authored";
    expect(validate(m).status).not.toBe("PASS");
  });
  it.each([
    "target",
    "production",
    "manifest",
    "snapshot",
    "revision",
    "entity",
    "duplicate",
    "source",
    "execute",
    "activate",
    "extra",
  ])("fails closed on %s drift", (fault) => {
    const m = fixture();
    if (fault === "target")
      m.content_policy.target.project_ref = "another-project";
    if (fault === "production")
      m.content_policy.target.environment = "PRODUCTION";
    if (fault === "manifest") m.base_manifest_sha256 = "0".repeat(64);
    if (fault === "snapshot") m.base_public_snapshot_sha256 = "0".repeat(64);
    if (fault === "revision") m.base_draft_revision = 4;
    if (fault === "entity") m.groups[1].entities.pop();
    if (fault === "duplicate")
      m.groups[1].entities[0].id = m.groups[0].entities[0].id;
    if (fault === "source")
      m.groups[0].entities[0].source_uri = "urn:unverified";
    if (fault === "execute") m.apply_authorized = true;
    if (fault === "activate") m.activation_proposed = true;
    if (fault === "extra") m.groups[0].metadata.correct_index = 0;
    expect(validate(m).status).toBe("FAIL");
  });
  it.each(["PERSONAL_DEVELOPMENT", "PUBLIC_RELEASE"])(
    "known copying issues block %s",
    (policy) => {
      const m = fixture();
      m.groups[1].rights.unresolved_copied_entity_ids = [
        m.groups[1].entities[0].id,
      ];
      const r = validate(m, policy);
      expect(r.status).toBe("BLOCKED");
      expect(JSON.stringify(r.issues)).toContain(
        "known_unresolved_copying_issue",
      );
    },
  );
  it("checks cached primary edition/PDF/text and actual selected readings; records only the real machine event", () => {
    const before = Date.now(),
      v = verifySyllabusSource();
    expect(Date.parse(v.verified_at)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(v.verified_at)).toBeLessThanOrEqual(Date.now());
    expect(v).toMatchObject({
      edition: "2025-11; cover states implementation 2026-07",
      verified_headwords: 43,
      supplemental_words: 1,
      grammar_reference_records: 12,
    });
    expect(v.scope).toContain("not sense");
    expect(v.method).not.toContain("HUMAN");
  });
  it.each(["edition", "hash", "readingCount", "timestamp", "humanClaim"])(
    "rejects machine verification drift: %s",
    (fault) => {
      const m = fixture();
      if (fault === "edition")
        m.machine_syllabus_verification.edition = "HSK 2.0";
      if (fault === "hash")
        m.machine_syllabus_verification.pdf_sha256 = "0".repeat(64);
      if (fault === "readingCount")
        m.machine_syllabus_verification.verified_headwords = 44;
      if (fault === "timestamp")
        m.syllabus_verification.verified_at = "2026-01-01T00:00:00Z";
      if (fault === "humanClaim")
        m.machine_syllabus_verification.method = "OWNER_VERIFIED_ALL";
      expect(validate(m).status).not.toBe("PASS");
    },
  );
  it("cannot select public release to treat a personal declaration as public permission", () => {
    const m = fixture();
    expect(validate(m, "PUBLIC_RELEASE").status).toBe("BLOCKED");
    m.content_policy.level = "PUBLIC_RELEASE";
    m.scope = "PUBLIC_RELEASE";
    const r = validate(m);
    expect(r.status).toBe("BLOCKED");
    expect(JSON.stringify(r.issues)).toContain(
      "INDEPENDENT_LANGUAGE_REVIEW_REQUIRED",
    );
    expect(JSON.stringify(r.issues)).toContain(
      "PUBLIC_DISTRIBUTION_RIGHTS_CLEARANCE_REQUIRED",
    );
    expect(JSON.stringify(r.issues)).toContain(
      "personal_declaration_is_not_public_license",
    );
  });
  it("requires public review, clearance and per-group provenance/attribution even with complete declared public evidence", () => {
    const m = fixture();
    m.scope = "PUBLIC_RELEASE";
    m.content_policy.level = "PUBLIC_RELEASE";
    m.independent_language_review = "VERIFIED";
    m.content_policy.language_verification = {
      state: "VERIFIED",
      evidence_reference: "urn:test-only:language-evidence",
      reviewer: "Test teacher fixture",
      verified_at: "2026-01-01T00:00:00Z",
    };
    m.content_policy.rights_clearance = {
      state: "VERIFIED",
      evidence_reference: "urn:test-only:rights-evidence",
      distribution_scope: "PUBLIC_DISTRIBUTION",
    };
    for (const g of m.groups) {
      g.metadata = {
        content_license:
          "Unit test declaration only; no actual rights granted; test author credit",
        reviewed_by: "Test teacher fixture",
        reviewed_at: "2026-01-01T00:00:00Z",
      };
      g.owner_review.method = "independent_language_and_publication_review";
      g.owner_review.evidence_reference = "urn:test-only:public-review";
      g.rights = {
        basis: "third_party_permission_evidence",
        actual_inputs_confirmed: true,
        unresolved_copied_entity_ids: [],
        attribution: "test author credit",
        evidence_reference: "urn:test-only:per-group-permission",
      };
    }
    expect(validate(m)).toMatchObject({
      status: "PASS",
      applyAllowed: false,
      executionSupported: false,
      scope: "STRUCTURE_AND_DECLARATIONS_ONLY_NOT_RIGHTS_CERTIFICATION",
    });
    for (const fault of [
      "language",
      "rights",
      "attribution",
      "personalMetadata",
    ]) {
      const changed = structuredClone(m);
      if (fault === "language")
        changed.content_policy.language_verification.state = "PENDING";
      if (fault === "rights")
        changed.content_policy.rights_clearance.evidence_reference = null;
      if (fault === "attribution") changed.groups[0].rights.attribution = null;
      if (fault === "personalMetadata")
        changed.groups[0].metadata.content_license = personalDeclaration;
      expect(validate(changed).status).toBe("BLOCKED");
    }
  });
  it("reuses explicit package acceptance; viewing-only or missing decisions are not acceptance", () => {
    const m = fixture();
    const input = `TEST FIXTURE ONLY\nHọ và tên thực tế: Test owner\nNgày giờ ký (ISO 8601, có múi giờ): 2026-01-01T00:00:00Z\n**Nội dung: CHẤP NHẬN SỬ DỤNG CÁ NHÂN**\nxác nhận đã đọc và chấp thuận sử dụng bộ HSK 1 Pilot revision 3\n4 bài học, 44 từ vựng, 12 điểm ngữ pháp và 24 câu quiz\n${m.base_package_id}\n${m.base_manifest_sha256}\n${m.base_public_snapshot_sha256}\n3/2/2/2\nKhông sử dụng để kinh doanh\nkhông cấp phép import`;
    expect(parseOwnerContentAcceptance(input)).toMatchObject({
      state: "ACCEPTED",
      approved_at: "2026-01-01T00:00:00Z",
    });
    expect(() =>
      parseOwnerContentAcceptance(
        input.replace(
          "**Nội dung: CHẤP NHẬN SỬ DỤNG CÁ NHÂN**",
          "VIEWED_NOT_APPROVED",
        ),
      ),
    ).toThrow();
    expect(() =>
      parseOwnerContentAcceptance(
        input.replace(m.base_manifest_sha256, "0".repeat(64)),
      ),
    ).toThrow();
    expect(() =>
      parseOwnerContentAcceptance(
        fs.readFileSync("docs/hanlearn-r3-owner-viewing-notes.txt", "utf8"),
      ),
    ).toThrow();
  });
});
