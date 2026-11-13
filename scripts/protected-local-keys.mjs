// Node/operator only. Real reads require a separate owner authorization; no real DB mode exists.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { inspect } from "node:util";
import { pathToFileURL } from "node:url";
import {
  loadPilot,
  syntheticDelivery,
  publicDraftParts,
} from "./pilot-r3-importer.mjs";
import { validatePilot } from "./pilot-validation.mjs";
import { auditPilot } from "./pilot-r3-preflight.mjs";
const handles = new WeakMap();
const sentinel =
  "SYNTHETIC PARAMETERIZED FIXTURE 'quoted' \\ slash\nCHỈ THỬ NGHIỆM — NOT LEARNING FEEDBACK";
const approvalPath =
  ".local/pilot-hsk1/v1/authorizations/real-key-read-r3.json";
const realPath = ".local/pilot-hsk1/v1/private/answers.json";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const sha = (b) => createHash("sha256").update(b).digest("hex");
function handle(store, mode) {
  const safe = () => ({
    kind: "protected-local-key-handle",
    records: store.keys.length,
    mode,
  });
  const token = Object.freeze({ toJSON: safe, [inspect.custom]: safe });
  handles.set(token, { store, mode });
  return token;
}
function validateStore(pkg, store) {
  publicDraftParts(pkg); // Full public hash/source/relationship audit; no private reads.
  const source = {
    pdfSha: sha(fs.readFileSync(".local/pilot-hsk1/official-syllabus.pdf")),
    textSha: sha(fs.readFileSync(".local/pilot-hsk1/source-pages.json")),
    pages: read(".local/pilot-hsk1/source-pages.json"),
  };
  const r = validatePilot(pkg, { privateKeys: store, source });
  if (r.status !== "PASS" || r.privateValidation !== "PASS")
    throw Error("PROTECTED_BINDING_OR_CARDINALITY_REJECTED");
}
export function syntheticProtectedHandle(pkg, { fault = null } = {}) {
  if (
    ![null, "missing_key", "duplicate_id", "binding_mismatch"].includes(fault)
  )
    throw Error("UNKNOWN_SYNTHETIC_FAULT");
  const store = syntheticDelivery(pkg);
  store.keys.forEach((k) => (k.explanation_vi = sentinel));
  if (fault === "missing_key") store.keys.pop();
  if (fault === "duplicate_id")
    store.keys[1].question_id = store.keys[0].question_id;
  if (fault === "binding_mismatch")
    store.quiz_bindings[0].public_sha256 = "0".repeat(64);
  return handle(store, "synthetic");
}
function restrictedPaths(paths = [realPath, approvalPath]) {
  const script = `$ErrorActionPreference='Stop';try{$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;foreach($p in @(${paths.map((p) => "'" + p + "'").join(",")})){$i=Get-Item -LiteralPath $p;foreach($target in @($i,$i.Directory)){foreach($r in (Get-Acl -LiteralPath $target.FullName).Access){if($r.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($sid,'S-1-5-18')){throw 'ACL'}}};if(-not (Get-Acl -LiteralPath $i.Directory.FullName).AreAccessRulesProtected){throw 'ACL'};while($i){if(($i.Attributes -band [IO.FileAttributes]::ReparsePoint)-ne 0){throw 'LINK'};if($i -is [IO.DirectoryInfo]){$i=$i.Parent}else{$i=$i.Directory}}};Write-Output 'ACL_OK'}catch{exit 2}`;
  const r = spawnSync(
    "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    { cwd: process.cwd(), encoding: "utf8", timeout: 15000, windowsHide: true },
  );
  return r.status === 0 && r.stdout.trim() === "ACL_OK";
}
export function readApprovedRealStore(pkg) {
  // Authorization is checked before opening/stat-ing the actual answers file.
  if (
    process.platform !== "win32" ||
    !process.stdin.isTTY ||
    !process.stdout.isTTY ||
    process.env.VITEST ||
    process.env.CI ||
    typeof globalThis.window !== "undefined" ||
    process.env.NEXT_RUNTIME ||
    !fs.existsSync(approvalPath) ||
    !restrictedPaths([approvalPath])
  )
    throw Error("REAL_READ_NOT_AUTHORIZED");
  let decision;
  try {
    decision = read(approvalPath);
  } catch {
    throw Error("REAL_READ_NOT_AUTHORIZED");
  }
  const audit = auditPilot();
  if (
    decision.approved !== true ||
    decision.action !== "READ_VALIDATE_REAL_KEYS_LOCAL_NO_DB" ||
    decision.packageRevision !== 3 ||
    decision.manifestHash !== audit.manifestHash ||
    decision.snapshotHash !== audit.snapshotHash ||
    typeof decision.ownerName !== "string" ||
    decision.ownerName.trim().length < 2 ||
    /PENDING|_{3,}/i.test(decision.ownerName) ||
    typeof decision.confirmation !== "string" ||
    decision.confirmation.trim().length < 10 ||
    /PENDING|_{3,}|tự điền/i.test(decision.confirmation) ||
    !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(
      decision.signedAt ?? "",
    ) ||
    !Number.isFinite(Date.parse(decision.signedAt)) ||
    Date.parse(decision.signedAt) > Date.now() ||
    !restrictedPaths()
  )
    throw Error("REAL_READ_NOT_AUTHORIZED");
  try {
    const bytes = fs.readFileSync(realPath),
      stable = fs.readFileSync(realPath);
    if (sha(bytes) !== sha(stable)) throw Error("changed"); // Private digests remain in memory.
    const store = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, ""));
    validateStore(pkg, store);
    return handle(store, "real-read-only");
  } catch {
    throw Error("REAL_LOCAL_VALIDATION_REJECTED");
  }
}
export function deliverLocalSynthetic(pkg, token, { fault = null } = {}) {
  const entry = handles.get(token);
  if (!entry) return { status: "BLOCKED", code: "UNTRUSTED_HANDLE" };
  if (entry.mode !== "synthetic")
    return {
      status: "BLOCKED",
      code: "REAL_DB_DELIVERY_REQUIRES_SEPARATE_APPROVAL_AND_REVIEW",
    };
  try {
    validateStore(pkg, entry.store);
    const database = process.env.HANLEARN_IMPORT_DATABASE,
      nonce = process.env.HANLEARN_IMPORT_NONCE;
    if (
      process.env.HANLEARN_IMPORT_LOCAL_ONLY !== "SYNTHETIC_DISPOSABLE" ||
      !/^hanlearn_import_r3_[a-f0-9]{32}$/.test(database ?? "") ||
      !/^[a-f0-9]{32}$/.test(nonce ?? "")
    )
      throw Error("target");
    const input = JSON.stringify({
      mode: "SYNTHETIC_DISPOSABLE",
      database,
      nonce,
      public: publicDraftParts(pkg),
      rows: entry.store.keys,
      fault,
    });
    const env = Object.fromEntries(
      Object.entries(process.env).filter(
        ([k]) => !/^PG|^SUPABASE_|^PYTHON|^DEBUG$|^NODE_DEBUG$/.test(k),
      ),
    );
    const child = spawnSync(
      "python",
      ["-I", "-B", path.resolve("scripts/protected-key-worker.py")],
      {
        input,
        encoding: "utf8",
        env,
        timeout: 60000,
        maxBuffer: 65536,
        windowsHide: true,
      },
    );
    // Never echo child.stderr or a malformed child response. Keys travel only in the stdin pipe.
    const r = JSON.parse(child.stdout);
    if (
      !["LOCAL_PASS", "BLOCKED"].includes(r.status) ||
      !Number.isSafeInteger(r.committedKeys) ||
      r.committedKeys < 0 ||
      r.committedKeys > 24 ||
      ![r.parameterizedKeyRows ?? 0, r.matchedSyntheticText ?? 0].every(
        (n) => Number.isSafeInteger(n) && n >= 0 && n <= 24,
      ) ||
      (r.status === "LOCAL_PASS" &&
        (child.status !== 0 ||
          r.committedKeys !== 24 ||
          r.parameterizedKeyRows !== 24 ||
          r.matchedSyntheticText !== 24)) ||
      (r.code && !/^[A-Z0-9_]{1,80}$/.test(r.code))
    )
      throw Error("response");
    return {
      status: r.status,
      code: r.code ?? null,
      committedKeys: r.committedKeys,
      parameterizedKeyRows: r.parameterizedKeyRows ?? 0,
      matchedSyntheticText: r.matchedSyntheticText ?? 0,
    };
  } catch {
    return {
      status: "BLOCKED",
      code: "LOCAL_PROTECTED_INPUT_OR_RUNTIME_REJECTED",
      committedKeys: 0,
    };
  }
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (process.argv[2] !== "--validate-approved-real")
      throw Error("READ_ONLY_APPROVED_VALIDATION_ONLY");
    const token = readApprovedRealStore(loadPilot());
    console.log(
      JSON.stringify({
        status: "LOCAL_REAL_READ_VALIDATED_NO_DB",
        handle: token,
      }),
    );
  } catch {
    console.error(
      "BLOCKED: separate owner real-read authorization or local validation required. No values displayed.",
    );
    process.exitCode = 2;
  }
}
