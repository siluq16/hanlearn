import { describe, expect, it } from "vitest";
import fs from "node:fs";
// @ts-expect-error Offline ESM utility.
import * as proposal from "../scripts/pilot-r3-publication-plan.mjs";
describe("personal publication proposal safety", () => {
  it("covers every frozen entity without granting publication", () => {
    const p = proposal.buildPublicationProposal();
    expect(p.entities).toHaveLength(91);
    expect(new Set(p.entities.map((e: { id: string }) => e.id)).size).toBe(91);
    expect(p.apply_authorized).toBe(false);
    expect(p.execution_supported).toBe(false);
    expect(p.public_release_authorized).toBe(false);
  });
  it("never invents reviewer/time/license or a live allowlist claim", () => {
    const p = proposal.buildPublicationProposal();
    for (const e of p.entities) {
      expect(e.proposed_metadata.content_license).toBeNull();
      expect(e.proposed_metadata.reviewed_by).toBeNull();
      expect(e.proposed_metadata.reviewed_at).toBeNull();
      expect(e.current).toEqual({ status: "draft", review_status: "pending" });
    }
    expect(p.effective_allowlist_requirement.live_verified).toBe(false);
    expect(JSON.stringify(p)).not.toContain("correct_index");
  });
  it("prepares an inactive read-only authorization with no signature or DB scope", () => {
    const a = proposal.realReadAuthorizationTemplate();
    expect(a.approved).toBe(false);
    expect(a.template_only).toBe(true);
    expect(a.ownerName).toBe("");
    expect(a.signedAt).toBeNull();
    expect(a.confirmation).toBe("");
    expect(a.action).toBe("READ_VALIDATE_REAL_KEYS_LOCAL_NO_DB");
    expect(a.scope.databaseConnections).toBe(false);
    expect(a.scope.cloudAccess).toBe(false);
  });
  it("keeps the versioned artifact reproducible and 159 review decisions pending", () => {
    expect(JSON.parse(fs.readFileSync(proposal.proposalPath, "utf8"))).toEqual(
      proposal.buildPublicationProposal(),
    );
    const rows = JSON.parse(
      fs.readFileSync(
        "docs/human-review/pilot-hsk1-r3/REVIEW_REGISTER.template.json",
        "utf8",
      ),
    );
    expect(rows).toHaveLength(159);
    expect(
      rows.every(
        (r: { review_status: string; reviewer: string; reviewed_at: string }) =>
          r.review_status === "PENDING" && !r.reviewer && !r.reviewed_at,
      ),
    ).toBe(true);
  });
});
