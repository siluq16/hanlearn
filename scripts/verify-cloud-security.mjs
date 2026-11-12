// Local analysis of read-only catalog/HTTP evidence; no network or credentials.
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compareSchema } from "./verify-schema.mjs";

const read = (file) =>
  JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const canonical = (v) => JSON.stringify(normalize(v));
function normalize(v) {
  return Array.isArray(v)
    ? v.map(normalize)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((key) => [key, normalize(v[key])]),
        )
      : v;
}
const hash = (value) => createHash("sha256").update(value).digest("hex");
export function reviewPlatform(actual, reviewed, preflightFunctions) {
  const f = actual.functions?.[0];
  const metadata =
    f &&
    Object.fromEntries(
      Object.entries(f).filter(([k]) => !["body", "definition"].includes(k)),
    );
  const checks = {
    existedBeforeMigration: preflightFunctions.some(
      (p) =>
        p.schema === "public" &&
        p.name === "rls_auto_enable" &&
        p.signature === "" &&
        p.security_definer === true &&
        p.search_path === "search_path=pg_catalog",
    ),
    functionMetadata:
      actual.functions?.length === 1 &&
      canonical(metadata) === canonical(reviewed.functionMetadata),
    body:
      typeof f?.body === "string" &&
      hash(f.body) === reviewed.functionBodySha256,
    definition:
      typeof f?.definition === "string" &&
      hash(f.definition) === reviewed.functionDefinitionSha256,
    eventTriggerWiring:
      canonical(actual.event_triggers) === canonical(reviewed.eventTriggers),
    schemaPrivileges:
      canonical(actual.schema_privileges) ===
      canonical(reviewed.schemaPrivileges),
    roleFlags: canonical(actual.role_flags) === canonical(reviewed.roleFlags),
  };
  return {
    status: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
    checks,
  };
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const projectRef = "hhgxrjqkuwdgurphopok";
  const expected = read("supabase/verification/expected_schema.json");
  const reviewed = read("supabase/verification/reviewed_platform.json");
  const capture = read(".local/cloud-security/capture.json");
  const baseline = read(".local/cloud-preflight/result.json");
  const actual = read(".local/cloud-security/schema.json");
  const platform = read(".local/cloud-security/platform.json");
  const http = read(".local/cloud-security/http.json");
  const identityPass =
    [capture, baseline, reviewed, http].every(
      (r) => r.projectRef === projectRef,
    ) &&
    capture.status === "CAPTURED_REVIEW_REQUIRED" &&
    capture.identity?.database === "postgres" &&
    capture.identity?.role === "postgres" &&
    capture.identity?.read_only === "on";
  const files = expected.migrationHashes;
  const names = [];
  let fileIntegrity = true;
  for (const file of files) {
    const source = fs.readFileSync(`supabase/migrations/${file.file}`);
    if (hash(source).toUpperCase() !== file.sha256) fileIntegrity = false;
    for (const match of source
      .toString()
      .matchAll(/create\s+function\s+((?:public|private)\.[a-z_]+)\s*\(/gi))
      names.push(match[1]);
  }
  const expectedHistory = files.map((f) => ({
    version: f.file.split("_")[0],
    name: f.file.replace(/^\d+_/, "").replace(/\.sql$/, ""),
  }));
  const historyPass =
    canonical(platform.history) === canonical(expectedHistory);
  const platformReview = reviewPlatform(
    platform,
    reviewed,
    baseline.snapshot.functions,
  );
  const schema = compareSchema(expected, actual, {
    applicationFunctionNames: names,
    reviewedPreexistingFunctions:
      platformReview.status === "PASS" ? [reviewed.manifestFunction] : [],
  });
  // Verify HTTP coverage independently; a partial/empty probe list cannot pass.
  const expectedChecks = [
    "platform.rls_auto_enable",
    "private.allowed_learners",
    "private.quiz_answer_keys",
    "private.is_learner",
    ...actual.relations
      .filter((r) => r.schema === "public")
      .map((r) => `public.${r.name}`),
    "rpc.get_learner_access",
    "rpc.get_due_review_count",
    "rpc.search_vocabulary",
  ].sort();
  const coverage =
    canonical(http.checks.map((r) => r.name).sort()) ===
    canonical(expectedChecks);
  const privateHttpPass =
    coverage &&
    http.checks
      .filter((c) => c.name.startsWith("private."))
      .every((c) => c.httpStatus === 406 && c.errorCode === "PGRST106");
  const anonymousPass =
    coverage &&
    http.checks
      .filter(
        (c) =>
          !c.name.startsWith("private.") && !c.name.startsWith("platform."),
      )
      .every(
        (c) => [401, 403].includes(c.httpStatus) && c.errorCode === "42501",
      );
  const checks = {
    identity: identityPass,
    migrationIntegrity:
      fileIntegrity && files.length === 6 && names.length === 30,
    history: historyPass,
    hanlearnSchema: schema.status === "PASS",
    platformFunctionAndWiring: platformReview.status === "PASS",
    privateSchemaHttp: privateHttpPass,
    anonymousHttp: anonymousPass,
    eventTriggerRpcRejected:
      coverage &&
      http.checks.some(
        (c) =>
          c.name === "platform.rls_auto_enable" &&
          c.httpStatus === 400 &&
          c.errorCode === "0A000" &&
          c.triggerRpcRejected === true,
      ),
  };
  const result = {
    projectRef,
    scope: "READ_ONLY_POST_MIGRATION",
    checkedAt: new Date().toISOString(),
    catalogCapturedAt: fs
      .statSync(".local/cloud-security/platform.json")
      .mtime.toISOString(),
    httpCheckedAt: http.checkedAt,
    status: Object.values(checks).every(Boolean) ? "PASS" : "FAIL",
    checks,
    schema,
    platformReview,
    eventTriggers: platform.event_triggers.map((e) => ({
      name: e.name,
      classification:
        e.name === "ensure_rls"
          ? "REVIEWED_RLS_SETUP"
          : "SUPABASE_INFRASTRUCTURE_METADATA",
    })),
    history: platform.history,
    authJwtIntegration: "BLOCKED_NO_APPROVED_AUTH_ACCOUNTS",
    ownerProvisioning: "NOT_RUN",
  };
  fs.writeFileSync(
    ".local/cloud-security/result.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
  if (result.status !== "PASS") process.exitCode = 2;
}
