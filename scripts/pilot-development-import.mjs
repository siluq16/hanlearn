// Local operator only. Default preview never opens keys, credentials or a DB connection.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { loadPilot, publicDraftParts } from "./pilot-r3-importer.mjs";
import {
  currentMappingPath,
  validatePublicationMapping,
} from "./pilot-r3-publication-validator.mjs";
import {
  readLocalRealStore,
  deliverApprovedDevelopment,
  trustedLocalRuntime,
} from "./protected-local-keys.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const candidateOverlaySha =
  "031477fb641a88a3aee421fb19926a6a1cc4c299054b4a4553b4c454fe3f3cc7";
const read = (p) =>
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
export function prepareInviteImport() {
  if (
    path.resolve(process.cwd()).toLowerCase() !==
    path.resolve(root).toLowerCase()
  )
    throw Error("checkout");
  const line = fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .find((s) => /^\s*NEXT_PUBLIC_SUPABASE_URL\s*=/.test(s));
  const u = new URL(
    line
      ?.split("=")
      .slice(1)
      .join("=")
      .trim()
      .replace(/^["']|["']$/g, ""),
  );
  if (
    u.origin !== "https://hhgxrjqkuwdgurphopok.supabase.co" ||
    u.username ||
    u.password ||
    u.search ||
    u.hash ||
    u.pathname !== "/"
  )
    throw Error("target");
  const pkg = loadPilot(),
    overlay = read(currentMappingPath);
  const overlaySha = createHash("sha256")
    .update(fs.readFileSync(currentMappingPath))
    .digest("hex");
  if (overlaySha !== candidateOverlaySha) throw Error("overlay_changed");
  if (
    validatePublicationMapping(overlay).status !== "PASS" ||
    overlay.content_policy.level !== "PRIVATE_INVITE_ONLY"
  )
    throw Error("policy");
  const capture = read(".local/pilot-r3-blockers/capture.json");
  if (
    capture.projectRef !== "hhgxrjqkuwdgurphopok" ||
    capture.tlsMode !== "verify-full" ||
    capture.ownerIdentified !== true ||
    capture.sessionProbe?.status !== "SAFE_SESSION_GUARD_VERIFIED"
  )
    throw Error("preflight");
  const invitees = capture.ownerIdentity.allowlist;
  if (
    !Array.isArray(invitees) ||
    !invitees.length ||
    invitees.some((r) => !r.confirmed) ||
    new Set(invitees.map((r) => r.id)).size !== invitees.length
  )
    throw Error("invitees");
  const parts = publicDraftParts(pkg);
  return {
    pkg,
    overlaySha,
    invitees: invitees.map((r) => r.id).sort(),
    summary: {
      status: "PREPARED_NOT_EXECUTED",
      overlaySha256: overlaySha,
      policy: "PRIVATE_INVITE_ONLY",
      projectRef: "hhgxrjqkuwdgurphopok",
      publicRows: parts.batches.reduce((n, [, r]) => n + r.length, 0),
      protectedKeys: 24,
      promotionEntities: 91,
      allowlistedCount: invitees.length,
      allowlistChanges: 0,
      activation: false,
      cloudGuardsChanged: false,
      transactions: [
        "224 draft public rows + 24 bound real keys; rollback on failure",
        "separate promotion of 91 scoped entities; quizzes last",
      ],
      executionApprovalRequired: true,
      liveChecksRepeatedBeforeWrite: true,
    },
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  let draftCommitted = false,
    attempted = false,
    phase = "LOCAL_PLAN";
  try {
    const command = process.argv[2] ?? "--preview";
    if (
      process.argv.length > 3 ||
      !["--preview", "--apply-approved-invite"].includes(command)
    )
      throw Error("command");
    const prepared = prepareInviteImport();
    if (command === "--preview") console.log(JSON.stringify(prepared.summary));
    else {
      phase = "TRUSTED_RUNTIME";
      if (!trustedLocalRuntime()) throw Error("runtime");
      phase = "PUBLICATION_EVIDENCE";
      const verification = spawnSync(
        process.execPath,
        [
          "--experimental-strip-types",
          "scripts/pilot-r3-publication-validator.mjs",
          "--check",
        ],
        { encoding: "utf8", windowsHide: true, timeout: 30000 },
      );
      if (
        verification.status !== 0 ||
        JSON.parse(verification.stdout).status !== "PASS"
      )
        throw Error("evidence");
      let input = "";
      phase = "CREDENTIAL_INPUT";
      process.stdin.setEncoding("utf8");
      for await (const chunk of process.stdin) {
        input += chunk;
        if (input.length > 65536) throw Error("input_limit");
      }
      phase = "CREDENTIAL_JSON";
      const credential = JSON.parse(input.replace(/^\uFEFF/, ""));
      phase = "CREDENTIAL_FIELDS";
      if (
        typeof credential.password !== "string" ||
        !credential.password ||
        typeof credential.ipv4 !== "string"
      )
        throw Error("credential");
      phase = "LOCAL_PRIVATE_VALIDATION";
      const handle = readLocalRealStore(prepared.pkg);
      for (const operation of ["draft_import", "promote_approved"]) {
        phase = operation;
        attempted = true;
        const r = deliverApprovedDevelopment(
          prepared.pkg,
          handle,
          {
            ...credential,
            invitees: prepared.invitees,
            overlaySha: prepared.overlaySha,
          },
          operation,
        );
        if (r.status !== "DEVELOPMENT_COMMITTED") {
          console.log(
            JSON.stringify({
              status: r.status,
              code: r.code,
              draftCommitted,
              stage: operation,
              automaticRetry: false,
            }),
          );
          process.exitCode = 2;
          break;
        }
        if (operation === "draft_import") draftCommitted = true;
        console.log(JSON.stringify({ stage: operation, ...r }));
      }
      credential.password = null;
      input = "";
    }
  } catch {
    console.log(
      JSON.stringify({
        status: attempted ? "STOP_VERIFY_OUTCOME" : "BLOCKED_BEFORE_WRITE",
        draftCommitted,
        code: "INVITE_IMPORT_GUARD_OR_TRANSPORT_FAILED",
        stage: phase,
        automaticRetry: false,
      }),
    );
    process.exitCode = 2;
  }
}
