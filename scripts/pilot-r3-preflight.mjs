// Offline audit/review only. Never connects, loads credentials or private answers.
import fs from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { compareSchema } from "./verify-schema.mjs";
import { reviewPlatform } from "./verify-cloud-security.mjs";
const read = (p) =>
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
const hash = (v) => createHash("sha256").update(v).digest("hex");
const pinnedSql = {
  "supabase/verification/pilot_r3_readonly_preflight.sql":
    "e952c38ab4392221b5f7cdaf1df5e44141536f3f4e2dcad162bab63a89fad908",
  "supabase/verification/cloud_schema_manifest.sql":
    "a19aa25a74c75a4e5846713c6a4400ac9cb812b5a72e2c5d5bd05791835d5c23",
  "supabase/verification/cloud_platform_security.sql":
    "f123a5632ae35a959db4e1c0897d45973593feec04c2abc332f0f002e7352fbc",
};
export function auditPilot() {
  const root = "content/pilot-hsk1/v1/";
  const manifest = read(root + "manifest.json");
  const snapshot = read("docs/human-review/pilot-hsk1-r3/SOURCE_SNAPSHOT.json");
  const files = snapshot.files.map((f) => ({
    path: f.path,
    sha256: hash(fs.readFileSync(root + f.path)),
  }));
  const quizRevisions = manifest.lessons.map(
    (l) => read(root + l.quiz_file).quiz.revision,
  );
  if (
    manifest.draft_revision !== 3 ||
    manifest.import_authorized ||
    manifest.publish_authorized ||
    snapshot.manifest_sha256 !==
      "dee2d01f275db3c213d654f35b938374699062c28d471ba9fe7a412920fd531b" ||
    snapshot.package_snapshot_sha256 !==
      "2cb3e0d7a667dd6faba633c4df1e87e6dbaee539e19d0cb394e9dcc769c91deb" ||
    JSON.stringify(files) !== JSON.stringify(snapshot.files) ||
    hash(JSON.stringify(files)) !== snapshot.package_snapshot_sha256 ||
    JSON.stringify(quizRevisions) !== "[3,2,2,2]"
  )
    throw Error("Package freeze mismatch");
  for (const [p, expected] of Object.entries(pinnedSql))
    if (hash(fs.readFileSync(p)) !== expected)
      throw Error("Audited SQL changed; stop for review");
  const migrations = read(
    "supabase/verification/expected_schema.json",
  ).migrationHashes;
  if (
    migrations.length !== 6 ||
    migrations.some(
      (m) =>
        hash(fs.readFileSync("supabase/migrations/" + m.file)).toUpperCase() !==
        m.sha256,
    )
  )
    throw Error("Migration hash drift");
  return {
    status: "PASS",
    projectRef: "hhgxrjqkuwdgurphopok",
    manifestHash: snapshot.manifest_sha256,
    snapshotHash: snapshot.package_snapshot_sha256,
    quizRevisions,
    filesChecked: files.length,
    sqlHashes: pinnedSql,
    migrationFilesChecked: 6,
    collisionProbes: 315,
    uuidProbes: 91,
  };
}
export function reviewFrames(
  frames,
  expected,
  reviewed,
  oldFunctions,
  appNames,
) {
  if (!Array.isArray(frames) || frames.length !== 6)
    throw Error("Incomplete capture frames");
  const [identity, history, schema, platform, active, collisions] = frames;
  if (
    identity.identity?.database !== "postgres" ||
    identity.identity?.role !== "postgres" ||
    identity.identity?.read_only !== "on" ||
    !Array.isArray(history.history) ||
    !Array.isArray(collisions.collisions) ||
    !Number.isSafeInteger(active.current_active_syllabuses) ||
    active.current_active_syllabuses < 0
  )
    throw Error("Invalid capture identity/format");
  const expectedHistory = expected.migrationHashes.map((m) => ({
    version: m.file.split("_")[0],
    name: m.file.replace(/^\d+_/, "").replace(/\.sql$/, ""),
  }));
  const historyMatches = (rows) =>
    JSON.stringify(rows.map((r) => [r.version, r.name])) ===
    JSON.stringify(expectedHistory.map((r) => [r.version, r.name]));
  const platformReview = reviewPlatform(platform, reviewed, oldFunctions);
  const structural = compareSchema(expected, schema, {
    applicationFunctionNames: appNames,
    reviewedPreexistingFunctions:
      platformReview.status === "PASS" ? [reviewed.manifestFunction] : [],
  });
  const checks = {
    identity: true,
    history:
      historyMatches(history.history) && historyMatches(platform.history ?? []),
    schemaSecurity: structural.status === "PASS",
    platformSecurity: platformReview.status === "PASS",
    noCollisions: collisions.collisions.length === 0,
  };
  return {
    status: Object.values(checks).every(Boolean) ? "PASS" : "BLOCKED",
    checks,
    history: history.history,
    schema: structural,
    platformReview,
    collisions: collisions.collisions,
    collisionCount: collisions.collisions.length,
    activeSyllabuses: active.current_active_syllabuses,
    limits: [
      "No HTTP/Auth/JWT testing",
      "No DML/import transaction testing",
      "Rights/backup gates remain; no write authorization",
    ],
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    const audit = auditPilot();
    if (process.argv[2] === "--audit") console.log(JSON.stringify(audit));
    else if (process.argv[2] === "--review") {
      const dir = ".local/pilot-r3-preflight/";
      const capture = read(dir + "capture.json");
      if (
        capture.status !== "CAPTURED_REVIEW_REQUIRED" ||
        capture.projectRef !== audit.projectRef ||
        capture.tlsMode !== "verify-full" ||
        capture.audit?.manifestHash !== audit.manifestHash ||
        capture.audit?.snapshotHash !== audit.snapshotHash ||
        JSON.stringify(capture.audit?.sqlHashes) !==
          JSON.stringify(audit.sqlHashes) ||
        JSON.stringify(capture.audit?.quizRevisions) !==
          JSON.stringify(audit.quizRevisions)
      )
        throw Error("No successful current capture");
      const frames = fs
        .readFileSync(dir + "result.txt", "utf8")
        .replace(/^\uFEFF/, "")
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      if (hash(fs.readFileSync(dir + "result.txt")) !== capture.resultSha256)
        throw Error("Capture bytes changed");
      const expected = read("supabase/verification/expected_schema.json");
      const names = expected.migrationHashes.flatMap((m) =>
        [
          ...fs
            .readFileSync("supabase/migrations/" + m.file, "utf8")
            .matchAll(
              /create\s+function\s+((?:public|private)\.[a-z_]+)\s*\(/gi,
            ),
        ].map((x) => x[1]),
      );
      const result = {
        projectRef: audit.projectRef,
        checkedAt: new Date().toISOString(),
        capturedAt: capture.checkedAt,
        audit,
        ...reviewFrames(
          frames,
          expected,
          read("supabase/verification/reviewed_platform.json"),
          read(".local/cloud-preflight/result.json").snapshot.functions,
          names,
        ),
      };
      fs.writeFileSync(
        dir + "review.json",
        JSON.stringify(result, null, 2) + "\n",
      );
      console.log(JSON.stringify(result));
      if (result.status !== "PASS") process.exitCode = 2;
    } else
      throw Error(
        "Choose --audit or --review; no network operations supported",
      );
  } catch {
    console.error(
      "BLOCKED: local audit/capture review failed; raw data suppressed. No database fix attempted.",
    );
    process.exitCode = 2;
  }
}
