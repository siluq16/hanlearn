// Proposal generation only: no private answers, authorization activation, database or Cloud mode.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { auditPilot } from "./pilot-r3-preflight.mjs";
import {
  loadPilot,
  draftPlan,
  syntheticDelivery,
} from "./pilot-r3-importer.mjs";
export const proposalPath =
  "content/proposals/pilot-hsk1-r3/publication-overlay.v1.json";
export const authorizationTemplatePath =
  ".local/pilot-hsk1/v1/authorizations/real-key-read-r3.template.json";
export function buildPublicationProposal() {
  const audit = auditPilot(),
    pkg = loadPilot(),
    plan = draftPlan(pkg, syntheticDelivery(pkg));
  const entities = plan.batches.flatMap(([table, rows]) =>
    rows
      .filter((row) => row.id)
      .map((row) => ({
        table,
        id: row.id,
        current: { status: row.status, review_status: row.review_status },
        required_for_readability: {
          status: "published",
          review_status: "approved",
        },
        proposed_metadata: {
          source_uri: row.source_uri,
          content_license: null,
          reviewed_by: null,
          reviewed_at: null,
          ...(table === "public.syllabus_versions"
            ? { verified_at: null }
            : {}),
        },
        evidence_reference: null,
      })),
  );
  if (
    entities.length !== 91 ||
    new Set(entities.map((e) => e.id)).size !== 91 ||
    entities.some(
      (e) =>
        e.current.status !== "draft" || e.current.review_status !== "pending",
    )
  )
    throw Error("unexpected_frozen_entities");
  return {
    format: "hanlearn.publication-overlay.proposal",
    proposal_version: 1,
    base_package_id: pkg.manifest.package_id,
    base_draft_revision: 3,
    base_manifest_sha256: audit.manifestHash,
    base_public_snapshot_sha256: audit.snapshotHash,
    proposal_status: "PROPOSED_BLOCKED",
    apply_authorized: false,
    public_release_authorized: false,
    execution_supported: false,
    owner_review_method:
      "AI_assisted_owner_accepted_private_use_not_independent_language_review",
    effective_allowlist_requirement: {
      confirmed_learner_count: 1,
      live_verified: false,
      owner_identity_reference: null,
    },
    private_evidence: {
      rights_decision_reference: null,
      owner_review_scope_reference: null,
      real_key_review_reference: null,
    },
    unresolved_gates: [
      "bind_verified_rights_record_to_overlay",
      "rights_clearance_for_actual_use",
      "honest_review_and_license_metadata",
      "publication_mapping_approval",
      "effective_allowlist_live_check",
      "separate_real_key_authorization",
      "exact_cloud_transaction_approval",
    ],
    quiz_published_at_strategy:
      "DATABASE_TRIGGER_ONLY_AFTER_REVIEWED_QUESTIONS_AND_KEYS",
    activation_proposed: false,
    entities,
  };
}
export function realReadAuthorizationTemplate() {
  // Historical format only. Local read validation no longer consumes this record.
  const audit = auditPilot();
  return {
    template_only: true,
    approved: false,
    action: "READ_VALIDATE_REAL_KEYS_LOCAL_NO_DB",
    packageRevision: 3,
    manifestHash: audit.manifestHash,
    snapshotHash: audit.snapshotHash,
    ownerName: "",
    signedAt: null,
    confirmation: "",
    scope: {
      sourcePath: ".local/pilot-hsk1/v1/private/answers.json",
      outputs: "STATUS_AND_COUNTS_ONLY",
      privateDigestOutput: false,
      databaseConnections: false,
      databaseWrites: false,
      cloudAccess: false,
      answerModification: false,
    },
    note: "Inactive template only; owner must separately authorize actual reading. Do not rename/activate as part of this task.",
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (process.argv[2] !== "--write-proposal") throw Error("proposal_only");
    const proposal = buildPublicationProposal();
    fs.mkdirSync(path.dirname(proposalPath), { recursive: true });
    fs.writeFileSync(proposalPath, JSON.stringify(proposal, null, 2) + "\n");
    console.log(
      "PASS: 91-entity blocked publication proposal; no source revision, approval or DB change.",
    );
  } catch {
    console.error("BLOCKED: public proposal validation failed.");
    process.exitCode = 2;
  }
}
