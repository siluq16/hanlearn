import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
// @ts-expect-error Offline verification utilities use plain ESM.
import { auditPilot, reviewFrames } from "../scripts/pilot-r3-preflight.mjs";

const sha = (text: string) => createHash("sha256").update(text).digest("hex");
function fixture() {
  const fn = {
    schema: "public",
    name: "rls_auto_enable",
    signature: "",
    security_definer: true,
    search_path: "search_path=pg_catalog",
  };
  const metadata = {
    schema: "public",
    name: "rls_auto_enable",
    arguments: "",
    owner: "postgres",
  };
  const body = "synthetic body",
    definition = "synthetic definition";
  const history = [{ version: "202611120001", name: "catalog" }];
  const expected = {
    migrationHashes: [{ file: "202611120001_catalog.sql" }],
    sections: {
      functions: { count: 0, sha256: sha("[]") },
      policies: { count: 0, sha256: sha("[]") },
    },
  };
  const reviewed = {
    functionMetadata: metadata,
    functionBodySha256: sha(body),
    functionDefinitionSha256: sha(definition),
    eventTriggers: [],
    schemaPrivileges: [],
    roleFlags: [],
    manifestFunction: metadata,
  };
  const frames = [
    { identity: { database: "postgres", role: "postgres", read_only: "on" } },
    { history },
    { functions: [metadata], policies: [] },
    {
      functions: [{ ...metadata, body, definition }],
      event_triggers: [],
      schema_privileges: [],
      role_flags: [],
      history,
    },
    { current_active_syllabuses: 0 },
    { collisions: [] },
  ];
  return { frames, expected, reviewed, oldFunctions: [fn] };
}
function run(f: ReturnType<typeof fixture>) {
  return reviewFrames(f.frames, f.expected, f.reviewed, f.oldFunctions, []);
}
describe("pilot r3 read-only evidence review", () => {
  it("pins the authorized package, SQL closure and six migration files offline", () => {
    expect(auditPilot()).toMatchObject({
      status: "PASS",
      filesChecked: 12,
      migrationFilesChecked: 6,
      quizRevisions: [3, 2, 2, 2],
    });
  });
  it("accepts matching synthetic evidence without database access", () => {
    expect(run(fixture()).status).toBe("PASS");
  });
  it("blocks even advisory semantic duplicates until classified", () => {
    const f = fixture();
    (f.frames[5] as { collisions: unknown[] }).collisions.push({
      collision_kind: "ADVISORY",
      table_name: "courses",
    });
    expect(run(f).checks.noCollisions).toBe(false);
    expect(run(f).status).toBe("BLOCKED");
  });
  it("blocks changed migration names without repairing history", () => {
    const f = fixture();
    (
      f.frames[1] as { history: { version: string; name: string }[] }
    ).history[0].name = "unexpected";
    expect(run(f).checks.history).toBe(false);
  });
  it("blocks unknown functions instead of silently excluding them", () => {
    const f = fixture();
    (f.frames[2] as { functions: unknown[] }).functions.push({
      schema: "public",
      name: "unknown",
    });
    expect(run(f).checks.schemaSecurity).toBe(false);
  });
  it("blocks policy drift", () => {
    const f = fixture();
    (f.frames[2] as { policies: unknown[] }).policies.push({
      name: "unexpected_policy",
    });
    expect(run(f).checks.schemaSecurity).toBe(false);
  });
  it("blocks platform body changes even when function name matches", () => {
    const f = fixture();
    (f.frames[3] as { functions: { body: string }[] }).functions[0].body =
      "changed";
    expect(run(f).checks.platformSecurity).toBe(false);
  });
  it("rejects incomplete capture or writable identity", () => {
    const f = fixture();
    f.frames.pop();
    expect(() => run(f)).toThrow("Incomplete capture");
    const writable = fixture();
    (
      writable.frames[0] as { identity: { read_only: string } }
    ).identity.read_only = "off";
    expect(() => run(writable)).toThrow("Invalid capture");
  });
});
