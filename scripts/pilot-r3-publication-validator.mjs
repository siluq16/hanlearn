// Operator-only, offline proposal/validation. Never reads keys, connects or applies.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  loadPilot,
  draftPlan,
  syntheticDelivery,
} from "./pilot-r3-importer.mjs";
import { auditPilot } from "./pilot-r3-preflight.mjs";
export const mappingPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v2.json";
const definitions = [
  [
    "curriculum",
    ["public.syllabus_versions", "public.courses", "public.units"],
    "AI-assisted curriculum labels; syllabus facts reference HSK edition",
  ],
  [
    "vocabulary",
    ["public.vocabulary"],
    "AI-assisted Vietnamese senses/examples; selected lexical facts/readings referenced separately",
  ],
  [
    "grammar",
    ["public.grammar_points"],
    "AI-assisted explanations/examples; HSK category comparison, not verified originality",
  ],
  [
    "lessons",
    ["public.lessons"],
    "AI-assisted original-drafting declaration: objectives, dialogue and transcripts",
  ],
  [
    "quizzes",
    ["public.lesson_quizzes"],
    "AI-assisted quiz metadata; no official exam claim",
  ],
  [
    "questions",
    ["public.quiz_questions"],
    "AI-assisted prompts/distractors; protected feedback is excluded from this public overlay",
  ],
];
const text = z
  .string()
  .trim()
  .min(1)
  .max(4000)
  .refine((s) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s));
const time = z.iso
  .datetime({ offset: true })
  .refine((s) => Date.parse(s) <= Date.now());
const entity = z
  .object({ table: text, id: z.uuid(), source_uri: text })
  .strict();
const group = z
  .object({
    id: z.enum(definitions.map((d) => d[0])),
    origin: text,
    entities: z.array(entity).min(1),
    metadata: z
      .object({
        content_license: text.max(500).nullable(),
        reviewed_by: text.max(200).nullable(),
        reviewed_at: time.nullable(),
      })
      .strict(),
    owner_review: z
      .object({
        method: z.literal(
          "owner_reviewed_personal_use_not_independent_language_review",
        ),
        actually_reviewed: z.boolean(),
        evidence_reference: text.nullable(),
      })
      .strict(),
    rights: z
      .object({
        basis: z
          .enum([
            "owner_ai_assisted_original",
            "reference_facts_only",
            "third_party_permission_evidence",
          ])
          .nullable(),
        actual_inputs_confirmed: z.boolean(),
        unresolved_copied_entity_ids: z.array(z.uuid()).nullable(),
        attribution: text.nullable(),
        evidence_reference: text.nullable(),
      })
      .strict(),
  })
  .strict();
const schema = z
  .object({
    format: z.literal("hanlearn.publication-overlay.grouped"),
    proposal_version: z.literal(2),
    base_package_id: z.literal("hanlearn-pilot-hsk1-v1"),
    base_draft_revision: z.literal(3),
    base_manifest_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    base_public_snapshot_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    scope: z.literal("OWNER_PERSONAL_USE_ONLY"),
    apply_authorized: z.literal(false),
    execution_supported: z.literal(false),
    public_release_authorized: z.literal(false),
    activation_proposed: z.literal(false),
    independent_language_review: z.literal("PENDING"),
    groups: z.array(group).length(6),
    syllabus_verification: z
      .object({
        verified_at: time.nullable(),
        evidence_reference: text.nullable(),
      })
      .strict(),
    source_classification: z.array(
      z
        .object({
          id: text,
          use: text,
          evidence: text,
          permission_asserted: z.literal(false),
        })
        .strict(),
    ),
    trace_warnings: z.array(z.object({ id: z.uuid(), reason: text }).strict()),
  })
  .strict();
export function buildPublicationMapping() {
  const pkg = loadPilot(),
    audit = auditPilot(),
    plan = draftPlan(pkg, syntheticDelivery(pkg));
  return {
    format: "hanlearn.publication-overlay.grouped",
    proposal_version: 2,
    base_package_id: pkg.manifest.package_id,
    base_draft_revision: 3,
    base_manifest_sha256: audit.manifestHash,
    base_public_snapshot_sha256: audit.snapshotHash,
    scope: "OWNER_PERSONAL_USE_ONLY",
    apply_authorized: false,
    execution_supported: false,
    public_release_authorized: false,
    activation_proposed: false,
    independent_language_review: "PENDING",
    groups: definitions.map(([id, tables, origin]) => ({
      id,
      origin,
      entities: plan.batches
        .filter(([t]) => tables.includes(t))
        .flatMap(([table, rows]) =>
          rows.map((r) => ({ table, id: r.id, source_uri: r.source_uri })),
        ),
      metadata: { content_license: null, reviewed_by: null, reviewed_at: null },
      owner_review: {
        method: "owner_reviewed_personal_use_not_independent_language_review",
        actually_reviewed: false,
        evidence_reference:
          ".local/pilot-hsk1/v1/private/owner-acceptance-r3.md (existing record; group review mapping not yet confirmed)",
      },
      rights: {
        basis: null,
        actual_inputs_confirmed: false,
        unresolved_copied_entity_ids: null,
        attribution: null,
        evidence_reference:
          ".local/pilot-hsk1/v1/rights/owner-rights-decision-r3.md (existing personal-use declaration; permission mapping not yet confirmed)",
      },
    })),
    syllabus_verification: { verified_at: null, evidence_reference: null },
    source_classification: [
      {
        id: "AI-assisted-drafting",
        use: "Vietnamese teaching text, examples, dialogue, questions and protected explanations declared newly drafted; not an originality or license guarantee",
        evidence:
          "content/pilot-hsk1/v1/rights-manifest.json; existing owner rights decision and acceptance (private)",
        permission_asserted: false,
      },
      {
        id: "HSK-2025-11",
        use: "43 headword/readings and 12 grammar-category evidence records; membership does not verify senses or redistribution rights",
        evidence:
          "content/pilot-hsk1/v1/manifest.json; cached primary syllabus evidence",
        permission_asserted: false,
      },
      {
        id: "GBT-16159-2012",
        use: "Pinyin orthography reference; no full-text/pages in learning payload; source-use attribution still to specify",
        evidence:
          "docs/PILOT_R3_RIGHTS_AUDIT.md RA-07; owner rights decision C",
        permission_asserted: false,
      },
      {
        id: "pinyin-info-review-citations",
        use: "Mentioned in AI review only; direct copying/dependency not established. Do not label all content third-party-derived on citation alone",
        evidence:
          "docs/PILOT_R3_RIGHTS_AUDIT.md RA-09; owner rights decision D",
        permission_asserted: false,
      },
      {
        id: "other-third-party-inputs",
        use: "Owner reports no recalled commercial app/book/exam-bank input. Any actually copied website/dictionary/paid material must be scoped to affected IDs and cleared or excluded",
        evidence:
          "existing owner rights decision E; self-declaration, not independent corpus comparison",
        permission_asserted: false,
      },
    ],
    trace_warnings: [
      {
        id: "fa09d24a-1c47-51aa-91fa-143b3877e98a",
        reason:
          "Grammar 很 explanation traces to remediation history, not an exact whole-string match in earlier author scripts; this is a trace gap, not evidence of copying",
      },
    ],
  };
}
export function validatePublicationMapping(input) {
  const parsed = schema.safeParse(input);
  const result = {
    status: "FAIL",
    entities: 0,
    groups: 0,
    issues: [],
    applyAllowed: false,
    executionSupported: false,
    scope: "STRUCTURE_AND_DECLARATIONS_ONLY_NOT_RIGHTS_CERTIFICATION",
  };
  if (!parsed.success) {
    result.issues = [{ code: "OVERLAY_SCHEMA_REJECTED" }];
    return result;
  }
  const candidate = parsed.data,
    expected = buildPublicationMapping();
  if (
    candidate.base_manifest_sha256 !== expected.base_manifest_sha256 ||
    candidate.base_public_snapshot_sha256 !==
      expected.base_public_snapshot_sha256 ||
    JSON.stringify(candidate.source_classification) !==
      JSON.stringify(expected.source_classification) ||
    JSON.stringify(candidate.trace_warnings) !==
      JSON.stringify(expected.trace_warnings)
  ) {
    result.issues = [{ code: "BASE_HASH_OR_CLASSIFICATION_DRIFT" }];
    return result;
  }
  if (new Set(candidate.groups.map((g) => g.id)).size !== 6) {
    result.issues = [{ code: "GROUP_SET_MISMATCH" }];
    return result;
  }
  for (const g of candidate.groups) {
    const e = expected.groups.find((x) => x.id === g.id);
    if (
      g.origin !== e.origin ||
      JSON.stringify(g.entities) !== JSON.stringify(e.entities) ||
      g.rights.unresolved_copied_entity_ids?.some(
        (id) => !g.entities.some((e) => e.id === id),
      )
    ) {
      result.issues = [
        { code: "ENTITY_OR_SOURCE_SCOPE_MISMATCH", group: g.id },
      ];
      return result;
    }
  }
  result.groups = 6;
  result.entities = 91;
  result.status = "PASS";
  for (const g of candidate.groups) {
    const missing = [];
    if (
      !g.metadata.content_license ||
      /^(pending.*|unknown|unverified|AI_REVIEWED_OWNER_ACCEPTED_PRIVATE_USE)$/i.test(
        g.metadata.content_license,
      )
    )
      missing.push("actual_permission_statement");
    if (
      !g.metadata.reviewed_by ||
      /^(PENDING|TBD|TODO|ChatGPT|AI reviewer)$|_{3,}/i.test(
        g.metadata.reviewed_by,
      ) ||
      !g.metadata.reviewed_at ||
      !g.owner_review.actually_reviewed ||
      !g.owner_review.evidence_reference
    )
      missing.push("actual_owner_review_scope_metadata");
    if (
      !g.rights.basis ||
      !g.rights.actual_inputs_confirmed ||
      g.rights.unresolved_copied_entity_ids === null ||
      !g.rights.attribution ||
      !g.rights.evidence_reference
    )
      missing.push("actual_source_use_rights_attribution");
    if (g.rights.unresolved_copied_entity_ids?.length)
      missing.push("unresolved_copied_material");
    if (
      g.rights.attribution &&
      g.metadata.content_license &&
      !g.metadata.content_license.includes(g.rights.attribution)
    )
      missing.push("attribution_missing_from_persisted_license_text");
    if (missing.length)
      result.issues.push({
        group: g.id,
        count: g.entities.length,
        codes: missing,
        affectedIds: g.rights.unresolved_copied_entity_ids?.length
          ? g.rights.unresolved_copied_entity_ids
          : g.entities.map((e) => e.id),
      });
  }
  if (
    !candidate.syllabus_verification.verified_at ||
    !candidate.syllabus_verification.evidence_reference
  )
    result.issues.push({
      code: "ACTUAL_SYLLABUS_VERIFICATION_REQUIRED",
      affectedIds: expected.groups[0].entities
        .filter((e) => e.table === "public.syllabus_versions")
        .map((e) => e.id),
    });
  if (result.issues.length) result.status = "BLOCKED";
  return result;
}
export function syntheticPublicationMapping() {
  const mapping = buildPublicationMapping();
  for (const g of mapping.groups) {
    g.metadata = {
      content_license:
        "SYNTHETIC FIXTURE - NOT A RIGHTS GRANT; SYNTHETIC FIXTURE ONLY",
      reviewed_by: "SYNTHETIC FIXTURE REVIEWER",
      reviewed_at: "2026-01-01T00:00:00Z",
    };
    g.owner_review.actually_reviewed = true;
    g.owner_review.evidence_reference = "urn:hanlearn:synthetic:review";
    g.rights = {
      basis: "owner_ai_assisted_original",
      actual_inputs_confirmed: true,
      unresolved_copied_entity_ids: [],
      attribution: "SYNTHETIC FIXTURE ONLY",
      evidence_reference: "urn:hanlearn:synthetic:rights",
    };
  }
  mapping.syllabus_verification = {
    verified_at: "2026-01-01T00:00:00Z",
    evidence_reference: "urn:hanlearn:synthetic:syllabus",
  };
  return mapping;
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (
      process.argv.length !== 3 ||
      !["--write-draft", "--check", "--plan"].includes(process.argv[2])
    )
      throw Error("COMMAND");
    if (process.argv[2] === "--write-draft") {
      if (fs.existsSync(mappingPath)) throw Error("EXISTS");
      fs.writeFileSync(
        mappingPath,
        JSON.stringify(buildPublicationMapping(), null, 2) + "\n",
        { flag: "wx" },
      );
      console.log(
        "PASS: grouped publication draft prepared; execution disabled.",
      );
    } else {
      const bytes = fs.readFileSync(mappingPath);
      const r = validatePublicationMapping(JSON.parse(bytes.toString("utf8")));
      console.log(
        JSON.stringify({
          ...r,
          publicOverlaySha256: createHash("sha256").update(bytes).digest("hex"),
          issues: r.issues.map((issue) =>
            Object.fromEntries(
              Object.entries(issue).filter(([key]) => key !== "affectedIds"),
            ),
          ),
        }),
      );
      if (
        r.status === "FAIL" ||
        (r.status === "BLOCKED" && process.argv[2] !== "--plan")
      )
        process.exitCode = 2;
    }
  } catch {
    console.error(
      "FAIL: local publication mapping rejected; values suppressed.",
    );
    process.exitCode = 2;
  }
}
