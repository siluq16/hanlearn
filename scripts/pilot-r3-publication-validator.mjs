// Operator-only, offline proposal/validation. Never reads keys, connects or applies.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { z } from "zod";
import {
  loadPilot,
  draftPlan,
  syntheticDelivery,
  validateImport,
} from "./pilot-r3-importer.mjs";
import { auditPilot } from "./pilot-r3-preflight.mjs";
export const mappingPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v2.json";
export const currentMappingPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v6.json";
export const personalMappingPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v5.json";
export const ownerViewedMappingPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v4.json";
export const previousMappingPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v3.json";
export const viewingNotesPath = "docs/hanlearn-r3-owner-viewing-notes.txt";
const ownerViewingLabel =
  "Owner — personal-use content viewing; not independent language certification or publication approval";
export const personalDeclaration =
  "PERSONAL_DEVELOPMENT; AI-assisted; owner-accepted experimental content; distribution rights unverified; no public distribution or third-party license asserted.";
export const acceptancePath =
  ".local/pilot-hsk1/v1/private/owner-acceptance-r3.md";
export const inviteDeclaration =
  "PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted.";
const acceptanceReviewer =
  "Owner — experimental personal-use acceptance (identity retained in existing private record)";
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
        method: z.enum([
          "owner_reviewed_personal_use_not_independent_language_review",
          "owner_content_acceptance_for_experimental_personal_use",
          "independent_language_and_publication_review",
        ]),
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
    proposal_version: z.union([
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    invite_sharing: z
      .object({
        state: z.literal("CONFIRMED"),
        scope: z.literal("AUTHENTICATED_ALLOWLISTED_INVITEES"),
        evidence_reference: z.literal(
          "Owner request: PRIVATE_INVITE_ONLY; retain both existing allowlist memberships; shared experimental learning; no Cloud import or guard changes authorized",
        ),
        third_party_sharing_rights: z.literal("UNVERIFIED"),
        public_release_authorized: z.literal(false),
      })
      .strict()
      .optional(),
    content_policy: z
      .object({
        level: z.enum([
          "PERSONAL_DEVELOPMENT",
          "PRIVATE_INVITE_ONLY",
          "PUBLIC_RELEASE",
        ]),
        target: z
          .object({
            environment: z.literal("DEVELOPMENT"),
            project_ref: z.literal("hhgxrjqkuwdgurphopok"),
          })
          .strict(),
        owner_acceptance: z
          .object({
            state: z.enum(["ACCEPTED", "PENDING"]),
            scope: z.literal("EXPERIMENTAL_SELF_STUDY_ONLY"),
            evidence_reference: text.nullable(),
            approved_by: text.max(200).nullable(),
            approved_at: time.nullable(),
            groups: z.array(z.enum(definitions.map((d) => d[0]))).max(6),
          })
          .strict(),
        language_verification: z
          .object({
            state: z.enum(["PENDING", "VERIFIED"]),
            evidence_reference: text.nullable(),
            reviewer: text.max(200).nullable(),
            verified_at: time.nullable(),
          })
          .strict(),
        rights_clearance: z
          .object({
            state: z.enum(["PENDING", "VERIFIED"]),
            evidence_reference: text.nullable(),
            distribution_scope: z.enum(["UNVERIFIED", "PUBLIC_DISTRIBUTION"]),
          })
          .strict(),
      })
      .strict()
      .optional(),
    machine_syllabus_verification: z
      .object({
        method: z.literal(
          "CACHED_PRIMARY_SOURCE_EDITION_AND_43_HEADWORD_READINGS",
        ),
        verified_at: time,
        edition: z.literal("2025-11; cover states implementation 2026-07"),
        source_uri: text,
        pdf_sha256: z.string().regex(/^[a-f0-9]{64}$/),
        extracted_text_sha256: z.string().regex(/^[a-f0-9]{64}$/),
        verified_headwords: z.literal(43),
        supplemental_words: z.literal(1),
        grammar_reference_records: z.literal(12),
        scope: z.literal(
          "Edition and selected headword/readings only; not sense, grammar teaching, language certification or rights clearance",
        ),
      })
      .strict()
      .optional(),
    owner_viewing_notes: z
      .object({
        source: z.literal(viewingNotesPath),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        records: z
          .array(
            z
              .object({
                group: z.enum(definitions.map((d) => d[0])),
                scope_text: text,
                coverage: z.enum([
                  "FULL_GROUP_VIEWED",
                  "NOT_CONFIRMED_FULL_GROUP",
                ]),
                viewed_at: time,
                decision: z.literal("VIEWED_NOT_APPROVED"),
              })
              .strict(),
          )
          .min(1)
          .max(6),
      })
      .strict()
      .optional(),
    owner_confirmation: z
      .object({
        evidence_reference: text,
        accepted_metadata_description: text,
        direct_external_text_use: z.literal(
          "UNKNOWN_NO_SPECIFIC_COPY_IDENTIFIED",
        ),
        syllabus_check: z.literal("EXISTING_AUTOMATED_EVIDENCE_ONLY"),
        group_scope: z
          .array(
            z
              .object({
                id: z.enum(definitions.map((d) => d[0])),
                scope: z.enum([
                  "OVERVIEW_ONLY_NO_REVIEW_TIME",
                  "FULL_REVIEW_NOT_CONFIRMED",
                  "FULL_GROUP_VIEWED_NOT_APPROVED",
                ]),
              })
              .strict(),
          )
          .length(6),
      })
      .strict()
      .optional(),
    base_package_id: z.literal("hanlearn-pilot-hsk1-v1"),
    base_draft_revision: z.literal(3),
    base_manifest_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    base_public_snapshot_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    scope: z.enum([
      "OWNER_PERSONAL_USE_ONLY",
      "ALLOWLISTED_INVITEES_ONLY",
      "PUBLIC_RELEASE",
    ]),
    apply_authorized: z.literal(false),
    execution_supported: z.literal(false),
    public_release_authorized: z.literal(false),
    activation_proposed: z.literal(false),
    independent_language_review: z.enum(["PENDING", "VERIFIED"]),
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
export function parseOwnerViewingNotes(input) {
  const base = buildPublicationMapping();
  const lines = input
    .trim()
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const header = `${base.base_package_id} | r3 | manifest ${base.base_manifest_sha256} | snapshot ${base.base_public_snapshot_sha256}`;
  if (
    lines[0] !== header ||
    lines[1] !==
      "Owner viewing notes only; not publication approval or independent language certification."
  )
    throw Error("viewing_notes_binding_or_scope_rejected");
  const records = lines.slice(2).map((line) => {
    const fields = line.split("|").map((s) => s.trim());
    if (
      fields.length !== 4 ||
      !definitions.some(([id]) => id === fields[0]) ||
      !text.safeParse(fields[1]).success ||
      !time.safeParse(fields[2]).success ||
      fields[3] !== "VIEWED_NOT_APPROVED"
    )
      throw Error("viewing_notes_record_rejected");
    return {
      group: fields[0],
      scope_text: fields[1],
      coverage:
        fields[1].toLocaleLowerCase("vi").normalize("NFC") === "đã xem toàn bộ"
          ? "FULL_GROUP_VIEWED"
          : "NOT_CONFIRMED_FULL_GROUP",
      viewed_at: fields[2],
      decision: fields[3],
    };
  });
  if (
    !records.length ||
    records.length > 6 ||
    new Set(records.map((r) => r.group)).size !== records.length
  )
    throw Error("viewing_notes_duplicate_or_empty");
  return records;
}
export function buildOwnerViewedMapping() {
  const previous = JSON.parse(fs.readFileSync(previousMappingPath, "utf8"));
  if (
    previous.proposal_version !== 3 ||
    validatePublicationMapping(previous).status !== "BLOCKED"
  )
    throw Error("previous_mapping_rejected");
  const bytes = fs.readFileSync(viewingNotesPath);
  const records = parseOwnerViewingNotes(bytes.toString("utf8"));
  const mapping = structuredClone(previous);
  mapping.proposal_version = 4;
  mapping.owner_viewing_notes = {
    source: viewingNotesPath,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    records,
  };
  mapping.owner_confirmation.evidence_reference += `; ${viewingNotesPath} supersedes earlier viewing scope only`;
  mapping.owner_confirmation.accepted_metadata_description =
    previous.owner_confirmation.accepted_metadata_description.split(
      " Chỉ áp dụng",
    )[0];
  for (const scope of mapping.owner_confirmation.group_scope) {
    if (
      records.some(
        (r) => r.group === scope.id && r.coverage === "FULL_GROUP_VIEWED",
      )
    )
      scope.scope = "FULL_GROUP_VIEWED_NOT_APPROVED";
  }
  for (const r of records) {
    const g = mapping.groups.find((g) => g.id === r.group);
    // Exact full-group declaration only; overview/partial viewing never fills group review metadata.
    if (r.coverage === "FULL_GROUP_VIEWED") {
      g.metadata.reviewed_by = ownerViewingLabel;
      g.metadata.reviewed_at = r.viewed_at;
      g.owner_review.actually_reviewed = true;
      g.owner_review.evidence_reference = `${viewingNotesPath}: ${r.group}; ${r.scope_text}; VIEWED_NOT_APPROVED. Identity evidence: .local/pilot-hsk1/v1/private/owner-acceptance-r3.md. Supersedes earlier viewing scope only; not rights or publication approval.`;
    }
  }
  return mapping;
}
export function verifySyllabusSource() {
  const pkg = loadPilot();
  const result = validateImport(pkg, syntheticDelivery(pkg));
  if (
    result.sourceVerification !== "PASS" ||
    pkg.manifest.source.edition !==
      "2025-11; cover states implementation 2026-07"
  )
    throw Error("syllabus_source_verification_failed");
  return {
    method: "CACHED_PRIMARY_SOURCE_EDITION_AND_43_HEADWORD_READINGS",
    verified_at: new Date().toISOString(),
    edition: pkg.manifest.source.edition,
    source_uri: pkg.manifest.source.source_uri,
    pdf_sha256: pkg.manifest.source.pdf_sha256,
    extracted_text_sha256: pkg.manifest.source.extracted_text_sha256,
    verified_headwords: 43,
    supplemental_words: 1,
    grammar_reference_records: 12,
    scope:
      "Edition and selected headword/readings only; not sense, grammar teaching, language certification or rights clearance",
  };
}
// Pure evidence parser: accepts explicit personal acceptance, never viewing notes or a policy name alone.
export function parseOwnerContentAcceptance(input) {
  const base = buildPublicationMapping();
  const name = input.match(/Họ và tên thực tế:\s*([^\r\n]+)/)?.[1]?.trim();
  const at = input
    .match(/Ngày giờ ký \(ISO 8601, có múi giờ\):\s*([^\r\n]+)/)?.[1]
    ?.trim();
  if (
    !name ||
    /_{3,}|PENDING|TODO|TBD/.test(name) ||
    !time.safeParse(at).success ||
    !input.includes("**Nội dung: CHẤP NHẬN SỬ DỤNG CÁ NHÂN**") ||
    !input.includes(
      "xác nhận đã đọc và chấp thuận sử dụng bộ HSK 1 Pilot revision 3",
    ) ||
    !input.includes("4 bài học, 44 từ vựng, 12 điểm ngữ pháp và 24 câu quiz") ||
    !input.includes(base.base_package_id) ||
    !input.includes(base.base_manifest_sha256) ||
    !input.includes(base.base_public_snapshot_sha256) ||
    !input.includes("3/2/2/2") ||
    !input.includes("Không sử dụng để kinh doanh") ||
    !input.includes("không cấp phép import")
  )
    throw Error("owner_content_acceptance_missing_or_unbound");
  return {
    state: "ACCEPTED",
    scope: "EXPERIMENTAL_SELF_STUDY_ONLY",
    evidence_reference: acceptancePath,
    approved_by: acceptanceReviewer,
    approved_at: at,
    groups: definitions.map((d) => d[0]),
  };
}
function readOwnerContentAcceptance() {
  const entry = process.argv[1] ? path.resolve(process.argv[1]) : "";
  if (
    process.platform !== "win32" ||
    typeof globalThis.window !== "undefined" ||
    entry !== path.resolve("scripts/pilot-r3-publication-validator.mjs") ||
    [
      "CI",
      "VITEST",
      "NEXT_RUNTIME",
      "GITHUB_ACTIONS",
      "VERCEL",
      "NETLIFY",
      "TF_BUILD",
      "JENKINS_URL",
      "BUILD_BUILDID",
    ].some((k) => process.env[k]) ||
    process.env.NODE_ENV === "production"
  )
    throw Error("trusted_local_acceptance_reader_required");
  const run = (args) =>
    spawnSync("git", args, {
      encoding: "utf8",
      windowsHide: true,
      timeout: 10000,
    });
  if (
    run(["check-ignore", "--quiet", "--", acceptancePath]).status !== 0 ||
    run(["ls-files", "--error-unmatch", "--", acceptancePath]).status !== 1
  )
    throw Error("acceptance_git_boundary_rejected");
  // Only this fixed evidence file. No answer-store path or contents are opened.
  const acl = `$ErrorActionPreference='Stop';try{$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;$i=Get-Item -LiteralPath '${acceptancePath}';foreach($target in @($i,$i.Directory)){foreach($r in (Get-Acl -LiteralPath $target.FullName).Access){if($r.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($sid,'S-1-5-18')){throw 'ACL'}}};if(-not (Get-Acl -LiteralPath $i.Directory.FullName).AreAccessRulesProtected){throw 'ACL'};while($i){if(($i.Attributes -band [IO.FileAttributes]::ReparsePoint)-ne 0){throw 'LINK'};if($i -is [IO.DirectoryInfo]){$i=$i.Parent}else{$i=$i.Directory}};Write-Output 'OK'}catch{exit 2}`;
  const check = spawnSync(
    "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", acl],
    {
      encoding: "utf8",
      windowsHide: true,
      timeout: 15000,
      env: {
        ...process.env,
        PSModulePath:
          "C:/Windows/System32/WindowsPowerShell/v1.0/Modules;" +
          (process.env.PSModulePath ?? ""),
      },
    },
  );
  if (check.status !== 0 || check.stdout.trim() !== "OK")
    throw Error("acceptance_acl_rejected");
  const bytes = fs.readFileSync(acceptancePath);
  const evidence = parseOwnerContentAcceptance(bytes.toString("utf8"));
  if (!bytes.equals(fs.readFileSync(acceptancePath)))
    throw Error("acceptance_changed_during_read");
  return evidence; // No private identity, signature, file digest or original text escapes.
}
export function buildPersonalDevelopmentMapping(acceptance) {
  const base = JSON.parse(fs.readFileSync(ownerViewedMappingPath, "utf8"));
  if (validatePublicationMapping(base).status !== "BLOCKED")
    throw Error("base_v4_rejected");
  const m = structuredClone(base);
  m.proposal_version = 5;
  m.content_policy = {
    level: "PERSONAL_DEVELOPMENT",
    target: { environment: "DEVELOPMENT", project_ref: "hhgxrjqkuwdgurphopok" },
    owner_acceptance: acceptance ?? {
      state: "PENDING",
      scope: "EXPERIMENTAL_SELF_STUDY_ONLY",
      evidence_reference: null,
      approved_by: null,
      approved_at: null,
      groups: [],
    },
    language_verification: {
      state: "PENDING",
      evidence_reference: null,
      reviewer: null,
      verified_at: null,
    },
    rights_clearance: {
      state: "PENDING",
      evidence_reference: null,
      distribution_scope: "UNVERIFIED",
    },
  };
  m.machine_syllabus_verification = verifySyllabusSource();
  m.syllabus_verification = {
    verified_at: m.machine_syllabus_verification.verified_at,
    evidence_reference:
      "machine_syllabus_verification; scripts/pilot-validation.mjs; cached primary PDF/text hashes; selected headword/readings only",
  };
  for (const g of m.groups) {
    g.metadata.content_license = personalDeclaration;
    g.metadata.reviewed_by =
      acceptance?.state === "ACCEPTED" && acceptance.groups.includes(g.id)
        ? acceptance.approved_by
        : null;
    g.metadata.reviewed_at = g.metadata.reviewed_by
      ? acceptance.approved_at
      : null;
    g.owner_review.method =
      "owner_content_acceptance_for_experimental_personal_use";
    g.owner_review.evidence_reference = `${acceptancePath}: explicit experimental personal acceptance; viewing remains separate in owner_viewing_notes; no public release or Cloud write authorization`;
  }
  return m;
}
function validatePolicy(candidate, requestedPolicy, result) {
  const policy = requestedPolicy ?? candidate.content_policy?.level;
  if (
    !["PERSONAL_DEVELOPMENT", "PRIVATE_INVITE_ONLY", "PUBLIC_RELEASE"].includes(
      policy,
    ) ||
    !candidate.content_policy
  ) {
    result.issues.push({ code: "CONTENT_POLICY_REQUIRED" });
    return;
  }
  result.policy = policy;
  result.targetVerification =
    "LIVE_DEVELOPMENT_IDENTITY_ALLOWLIST_TLS_LOGGING_RLS_PREFLIGHT_REQUIRED";
  const p = candidate.content_policy;
  const language = p.language_verification,
    clearance = p.rights_clearance;
  if (
    (candidate.independent_language_review === "VERIFIED") !==
      (language.state === "VERIFIED") ||
    (language.state === "VERIFIED" &&
      (!language.evidence_reference ||
        !language.reviewer ||
        !language.verified_at ||
        /^(owner|AI|ChatGPT|PENDING|TBD|TODO)\b|_{3,}/i.test(
          language.reviewer,
        )))
  )
    result.issues.push({
      code: "LANGUAGE_VERIFICATION_DECLARATION_INCONSISTENT",
    });
  if (
    (clearance.state === "VERIFIED" &&
      (!clearance.evidence_reference ||
        clearance.distribution_scope !== "PUBLIC_DISTRIBUTION")) ||
    (clearance.state === "PENDING" &&
      clearance.distribution_scope !== "UNVERIFIED")
  )
    result.issues.push({ code: "RIGHTS_CLEARANCE_DECLARATION_INCONSISTENT" });
  if (![5, 6].includes(candidate.proposal_version) || p.level !== policy)
    result.issues.push({ code: "POLICY_SCOPE_MISMATCH" });
  const a = p.owner_acceptance;
  if (new Set(a.groups).size !== a.groups.length)
    result.issues.push({ code: "ACCEPTANCE_SCOPE_INVALID" });
  if (policy === "PERSONAL_DEVELOPMENT" || policy === "PRIVATE_INVITE_ONLY") {
    if (
      policy === "PRIVATE_INVITE_ONLY" &&
      (candidate.proposal_version !== 6 ||
        candidate.scope !== "ALLOWLISTED_INVITEES_ONLY" ||
        !candidate.invite_sharing)
    )
      result.issues.push({ code: "INVITE_SHARING_SCOPE_REQUIRED" });
    if (
      policy === "PERSONAL_DEVELOPMENT" &&
      candidate.scope !== "OWNER_PERSONAL_USE_ONLY"
    )
      result.issues.push({ code: "PERSONAL_SCOPE_REQUIRED" });
    if (
      a.state !== "ACCEPTED" ||
      !a.approved_by ||
      !a.approved_at ||
      !a.evidence_reference ||
      /VIEWED_NOT_APPROVED|viewing-notes/i.test(a.evidence_reference) ||
      a.evidence_reference !== acceptancePath
    )
      result.issues.push({
        code: "EXPLICIT_OWNER_CONTENT_ACCEPTANCE_REQUIRED",
      });
  } else {
    if (candidate.scope !== "PUBLIC_RELEASE")
      result.issues.push({ code: "PUBLIC_RELEASE_SCOPE_REQUIRED" });
    const l = p.language_verification,
      r = p.rights_clearance;
    if (
      candidate.independent_language_review !== "VERIFIED" ||
      l.state !== "VERIFIED" ||
      !l.evidence_reference ||
      /owner-acceptance|viewing-notes/i.test(l.evidence_reference) ||
      !l.reviewer ||
      !l.verified_at ||
      /^(owner|AI|ChatGPT|PENDING|TBD|TODO)\b|_{3,}/i.test(l.reviewer)
    )
      result.issues.push({ code: "INDEPENDENT_LANGUAGE_REVIEW_REQUIRED" });
    if (
      r.state !== "VERIFIED" ||
      !r.evidence_reference ||
      /owner-acceptance|owner-rights-decision-r3|viewing-notes/i.test(
        r.evidence_reference,
      ) ||
      r.distribution_scope !== "PUBLIC_DISTRIBUTION"
    )
      result.issues.push({
        code: "PUBLIC_DISTRIBUTION_RIGHTS_CLEARANCE_REQUIRED",
      });
  }
  for (const g of candidate.groups) {
    const codes = [];
    if (
      !g.metadata.content_license ||
      /^(pending|unknown|unverified)/i.test(g.metadata.content_license)
    )
      codes.push("nonempty_sql_scope_metadata_required");
    if (
      !g.metadata.reviewed_by ||
      /^(PENDING|TBD|TODO|ChatGPT|AI(?: reviewer)?)$|_{3,}/i.test(
        g.metadata.reviewed_by,
      ) ||
      !g.metadata.reviewed_at
    )
      codes.push("actual_approval_metadata_required");
    if (policy === "PERSONAL_DEVELOPMENT" || policy === "PRIVATE_INVITE_ONLY") {
      if (!a.groups.includes(g.id) || a.state !== "ACCEPTED")
        codes.push("owner_acceptance_scope_missing");
      if (
        g.metadata.reviewed_by !== a.approved_by ||
        g.metadata.reviewed_at !== a.approved_at ||
        g.owner_review.method !==
          "owner_content_acceptance_for_experimental_personal_use"
      )
        codes.push("approval_cannot_derive_from_viewing");
      if (
        g.metadata.content_license !==
        (policy === "PRIVATE_INVITE_ONLY"
          ? inviteDeclaration
          : personalDeclaration)
      )
        codes.push("truthful_personal_scope_declaration_required");
    } else {
      if (
        g.owner_review.method !==
          "independent_language_and_publication_review" ||
        !g.owner_review.actually_reviewed ||
        !g.owner_review.evidence_reference ||
        /owner-acceptance|viewing-notes/i.test(
          g.owner_review.evidence_reference,
        )
      )
        codes.push("owner_acceptance_is_not_public_review");
      if (
        /PERSONAL_DEVELOPMENT|PRIVATE_INVITE_ONLY|owner-accepted|rights unverified|no public distribution|SYNTHETIC/i.test(
          g.metadata.content_license ?? "",
        )
      )
        codes.push("personal_declaration_is_not_public_license");
      if (
        !g.rights.basis ||
        !g.rights.actual_inputs_confirmed ||
        g.rights.unresolved_copied_entity_ids === null ||
        !g.rights.attribution ||
        !g.rights.evidence_reference
      )
        codes.push("public_source_rights_attribution_required");
      if (
        g.rights.attribution &&
        !g.metadata.content_license?.includes(g.rights.attribution)
      )
        codes.push("persisted_attribution_required");
    }
    // Known copying problems block either policy. Unknown provenance is not rewritten as cleared.
    if (g.rights.unresolved_copied_entity_ids?.length)
      codes.push("known_unresolved_copying_issue");
    if (codes.length)
      result.issues.push({ group: g.id, count: g.entities.length, codes });
  }
  try {
    const actual = verifySyllabusSource(),
      recorded = candidate.machine_syllabus_verification;
    if (
      !recorded ||
      JSON.stringify({ ...recorded, verified_at: null }) !==
        JSON.stringify({ ...actual, verified_at: null }) ||
      candidate.syllabus_verification.verified_at !== recorded.verified_at ||
      !candidate.syllabus_verification.evidence_reference
    )
      result.issues.push({ code: "MACHINE_SYLLABUS_EVIDENCE_MISMATCH" });
  } catch {
    result.issues.push({ code: "MACHINE_SYLLABUS_SOURCE_CHECK_FAILED" });
  }
}
export function validatePublicationMapping(input, { policy = null } = {}) {
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
    candidate.proposal_version < 5 &&
    (candidate.scope !== "OWNER_PERSONAL_USE_ONLY" ||
      candidate.independent_language_review !== "PENDING" ||
      candidate.groups.some(
        (g) =>
          g.owner_review.method !==
          "owner_reviewed_personal_use_not_independent_language_review",
      ))
  ) {
    result.issues = [{ code: "LEGACY_POLICY_SCOPE_CHANGED" }];
    return result;
  }
  if (
    candidate.proposal_version < 5 &&
    (candidate.content_policy || candidate.machine_syllabus_verification)
  ) {
    result.issues = [{ code: "CONTENT_POLICY_VERSION_CONFLICT" }];
    return result;
  }
  if (
    candidate.proposal_version !== 4 &&
    candidate.proposal_version !== 5 &&
    candidate.proposal_version !== 6 &&
    candidate.owner_viewing_notes
  ) {
    result.issues = [{ code: "VIEWING_NOTES_VERSION_CONFLICT" }];
    return result;
  }
  if (candidate.proposal_version >= 5) {
    let viewed;
    try {
      viewed = buildOwnerViewedMapping();
    } catch {
      result.issues = [{ code: "VIEWING_NOTES_EVIDENCE_REJECTED" }];
      return result;
    }
    if (
      JSON.stringify(candidate.owner_viewing_notes) !==
        JSON.stringify(viewed.owner_viewing_notes) ||
      JSON.stringify(candidate.owner_confirmation) !==
        JSON.stringify(viewed.owner_confirmation)
    ) {
      result.issues = [{ code: "VIEWING_HISTORY_DRIFT" }];
      return result;
    }
  } else if (candidate.proposal_version === 4) {
    let viewed;
    try {
      viewed = buildOwnerViewedMapping();
    } catch {
      result.issues = [{ code: "VIEWING_NOTES_EVIDENCE_REJECTED" }];
      return result;
    }
    if (
      JSON.stringify(candidate.owner_viewing_notes) !==
        JSON.stringify(viewed.owner_viewing_notes) ||
      JSON.stringify(candidate.owner_confirmation) !==
        JSON.stringify(viewed.owner_confirmation) ||
      candidate.groups.some((g) => {
        const e = viewed.groups.find((e) => e.id === g.id);
        return (
          !e ||
          JSON.stringify(g.owner_review) !== JSON.stringify(e.owner_review) ||
          g.metadata.reviewed_by !== e.metadata.reviewed_by ||
          g.metadata.reviewed_at !== e.metadata.reviewed_at ||
          g.metadata.content_license !== e.metadata.content_license ||
          JSON.stringify(g.rights) !== JSON.stringify(e.rights)
        );
      }) ||
      JSON.stringify(candidate.syllabus_verification) !==
        JSON.stringify(viewed.syllabus_verification)
    ) {
      result.issues = [{ code: "VIEWING_NOTES_EVIDENCE_OR_SCOPE_CONFLICT" }];
      return result;
    }
  } else if (candidate.proposal_version === 3) {
    const confirmation = candidate.owner_confirmation;
    if (
      !confirmation ||
      confirmation.group_scope.some(
        (g) => g.scope === "FULL_GROUP_VIEWED_NOT_APPROVED",
      ) ||
      new Set(confirmation.group_scope.map((g) => g.id)).size !== 6 ||
      candidate.groups.some(
        (g) =>
          g.owner_review.actually_reviewed ||
          g.rights.actual_inputs_confirmed ||
          g.rights.unresolved_copied_entity_ids !== null ||
          g.metadata.content_license !== null ||
          g.metadata.reviewed_by !== null ||
          g.metadata.reviewed_at !== null,
      ) ||
      candidate.syllabus_verification.verified_at !== null
    ) {
      result.issues = [{ code: "OWNER_CONFIRMATION_SCOPE_CONFLICT" }];
      return result;
    }
  } else if (candidate.owner_confirmation) {
    result.issues = [{ code: "OWNER_CONFIRMATION_VERSION_CONFLICT" }];
    return result;
  }
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
  if (candidate.proposal_version >= 5 || policy !== null) {
    validatePolicy(candidate, policy, result);
    if (result.issues.length) result.status = "BLOCKED";
    return result;
  }
  for (const g of candidate.groups) {
    const missing = [];
    if (
      candidate.proposal_version === 4 &&
      candidate.owner_viewing_notes.records.some((r) => r.group === g.id)
    )
      missing.push("owner_publication_approval_not_given");
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
      ![
        "--write-draft",
        "--prepare-personal",
        "--check",
        "--check-public",
        "--plan",
      ].includes(process.argv[2])
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
    } else if (process.argv[2] === "--prepare-personal") {
      const m = buildPersonalDevelopmentMapping(readOwnerContentAcceptance());
      if (validatePublicationMapping(m).status !== "PASS")
        throw Error("PERSONAL_METADATA_REJECTED");
      fs.writeFileSync(personalMappingPath, JSON.stringify(m, null, 2) + "\n", {
        flag: "wx",
      });
      console.log(
        "PASS: personal metadata prepared; existing owner acceptance reused, machine syllabus check completed; no Cloud/apply/public release authorization.",
      );
    } else {
      const bytes = fs.readFileSync(currentMappingPath);
      const m = JSON.parse(bytes.toString("utf8"));
      const r = validatePublicationMapping(m, {
        policy: process.argv[2] === "--check-public" ? "PUBLIC_RELEASE" : null,
      });
      if (
        m.proposal_version >= 5 &&
        ["PERSONAL_DEVELOPMENT", "PRIVATE_INVITE_ONLY"].includes(
          m.content_policy?.level,
        )
      ) {
        try {
          if (
            JSON.stringify(readOwnerContentAcceptance()) !==
            JSON.stringify(m.content_policy.owner_acceptance)
          )
            throw Error("changed_acceptance");
        } catch {
          r.status = "BLOCKED";
          r.issues.push({
            code: "LOCAL_OWNER_ACCEPTANCE_EVIDENCE_MISSING_OR_CHANGED",
          });
        }
      }
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
