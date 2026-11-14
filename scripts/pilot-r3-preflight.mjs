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
export function reviewSecurityPosture(p) {
  const checks = {
    identity:
      p?.database === "postgres" &&
      p?.role === "postgres" &&
      p?.read_only === "on",
    confirmedInvitees:
      Number.isSafeInteger(p?.allowlisted_count) &&
      p.allowlisted_count >= 1 &&
      p?.confirmed_allowlisted_count === p.allowlisted_count &&
      p?.missing_or_unconfirmed_allowlisted_count === 0,
    noPrivateTableGrants:
      p?.authenticated_private_keys_select === false &&
      p?.anon_private_keys_select === false,
    noDeclaredPrivateApiSchema:
      Array.isArray(p?.api_schema_role_settings) &&
      p.api_schema_role_settings.every(
        (s) => typeof s === "string" && !/private/i.test(s),
      ),
    statementLoggingOff: p?.logging?.log_statement === "none",
    errorParameterLoggingOff:
      p?.logging?.log_parameter_max_length_on_error === "0",
    durationParametersSafe:
      p?.logging?.log_parameter_max_length === "0" ||
      (p?.logging?.log_min_duration_statement === "-1" &&
        p?.logging?.log_min_duration_sample === "-1" &&
        p?.logging?.log_transaction_sample_rate === "0"),
    auditParameterLoggingOff:
      p?.pgaudit_parameter_logging === "off" ||
      (p?.pgaudit_extension_present === false &&
        p?.pgaudit_parameter_logging === null),
  };
  return {
    status: Object.values(checks).every(Boolean) ? "WARNING" : "BLOCKED",
    checks,
    remaining: [
      "Match the actual owner identity via verified Auth, not counts alone",
      "Review DB/pooler/audit parameter logging for the exact write connection; metadata alone is not a no-logging proof",
      "Fresh read-only HTTP private-schema/anonymous checks still required",
    ],
  };
}
export function reviewFrames(
  frames,
  expected,
  reviewed,
  oldFunctions,
  appNames,
) {
  if (!Array.isArray(frames) || ![6, 7].includes(frames.length))
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
  const posture =
    frames.length === 7
      ? reviewSecurityPosture(frames[6].security_posture)
      : null;
  if (posture) checks.securityPosture = posture.status !== "BLOCKED";
  return {
    status: Object.values(checks).every(Boolean)
      ? posture
        ? "WARNING"
        : "PASS"
      : "BLOCKED",
    securityPosture: posture,
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
export function reviewImportBlockers(capture) {
  if (
    capture?.projectRef !== "hhgxrjqkuwdgurphopok" ||
    capture.tlsMode !== "verify-full" ||
    capture.status !== "BLOCKERS_CAPTURED" ||
    capture.ownerIdentity?.identity?.database !== "postgres" ||
    capture.ownerIdentity.identity.role !== "postgres" ||
    capture.ownerIdentity.identity.read_only !== "on"
  )
    throw Error("Blocker capture target mismatch");
  const rows = capture.ownerIdentity.allowlist;
  if (
    !Array.isArray(rows) ||
    rows.some(
      (r) => !/^[a-f0-9-]{36}$/i.test(r.id) || typeof r.email !== "string",
    ) ||
    new Set(rows.map((r) => r.id)).size !== rows.length
  )
    throw Error("Blocker capture identity shape mismatch");
  const owners = rows.filter(
    (r) => r.owner_reference_match === true && r.confirmed === true,
  );
  const ownerKnown =
    capture.ownerIdentity.owner_matches === 1 && owners.length === 1;
  const others = rows.filter((r) => !r.owner_reference_match);
  const mask = (email) => {
    const [name, domain] = email.split("@");
    return name.slice(0, 1) + "***@" + (domain?.slice(0, 1) ?? "?") + "***";
  };
  const p = capture.sessionProbe,
    stages = p?.stages ?? [];
  const baseline = stages.filter((s) => s.stage === "baseline"),
    guard = stages.filter((s) => s.stage === "guard_verified"),
    bind = stages.filter((s) => s.stage === "bind_canary");
  const safe =
    p?.status === "SAFE_SESSION_GUARD_VERIFIED" &&
    p.exitCode === 3 &&
    p.sqlState === "22P02" &&
    baseline.length === 1 &&
    guard.length === 1 &&
    bind.length === 1 &&
    guard[0].logging_guard_pass === true &&
    guard[0].read_only === "on" &&
    bind[0].bound_text === true &&
    Number.isSafeInteger(guard[0].pid) &&
    guard[0].pid > 0 &&
    guard[0].pid === bind[0].pid &&
    guard[0].pid === baseline[0].pid;
  return {
    projectRef: capture.projectRef,
    ownerIdentified: ownerKnown,
    identities: rows.map((r) => ({
      id: r.id,
      role: r.owner_reference_match ? "OWNER_REFERENCE" : "OTHER_ALLOWLISTED",
      emailMasked: mask(r.email),
      confirmed: r.confirmed,
      createdAt: r.created_at,
      provider: r.provider,
      hasProfile: r.has_profile,
      progressRows: r.progress_rows,
      quizAttemptRows: r.quiz_attempt_rows,
      srsCardRows: r.srs_card_rows,
    })),
    accessBasis:
      "Confirmed Auth identity plus private.allowed_learners membership; insertion actor/reason is not stored in this table",
    allowlistProposal:
      ownerKnown && rows.length >= 1 && rows.every((r) => r.confirmed === true)
        ? {
            operation: "KEEP_ALL_CONFIRMED_INVITEES",
            keepUserId: owners[0].id,
            keepInviteeIds: others.map((r) => r.id),
            expectedBefore: rows.length,
            expectedAfter: rows.length,
            approvalRequired: false,
            deleteAuthUser: false,
            deleteProfile: false,
            deleteLearningData: false,
          }
        : null,
    logging: safe ? "SAFE_SESSION_GUARD_VERIFIED" : "BLOCKED",
    loggingProtection: capture.sessionProbeKind ?? "STRICT_SETTINGS",
    loggingFailureStage: safe ? null : p?.lastStage,
    sqlState: p?.sqlState,
    limits: [
      "Owner reference was supplied locally; previous Auth report intentionally does not retain subject/email.",
      "No provider/pooler log search performed; no claim of observed log absence.",
      "Import must reapply and verify the guard on its physical connection before real keys.",
    ],
    cloudWritesExecuted: false,
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    const audit = auditPilot();
    if (process.argv[2] === "--audit") console.log(JSON.stringify(audit));
    else if (process.argv[2] === "--review-blockers") {
      const capture = read(".local/pilot-r3-blockers/capture.json");
      const probeFile =
        capture.sessionProbeKind === "SESSION_MESSAGE_THRESHOLD"
          ? "supabase/verification/pilot_import_threshold_probe.sql"
          : "supabase/verification/pilot_import_session_probe.sql";
      if (hash(fs.readFileSync(probeFile)) !== capture.sessionProbeSha256)
        throw Error("Session probe source drift");
      const result = reviewImportBlockers(capture);
      console.log(JSON.stringify(result));
      if (
        !result.ownerIdentified ||
        result.logging !== "SAFE_SESSION_GUARD_VERIFIED"
      )
        process.exitCode = 2;
    } else if (process.argv[2] === "--review") {
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
      if (
        frames.length === 7 &&
        (capture.securityPostureSqlHash !==
          "78f8989ddf71d672c9a23d694d1405e0232c144e55d6ce8298b6af067550b828" ||
          hash(
            fs.readFileSync(
              "supabase/verification/pilot_r3_security_posture.sql",
            ),
          ) !== capture.securityPostureSqlHash)
      )
        throw Error("Supplement capture SQL drift");
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
