// Trusted Windows checkout only. Local reads need no signature; no real DB mode exists.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { inspect } from "node:util";
import { pathToFileURL, fileURLToPath } from "node:url";
import {
  loadPilot,
  syntheticDelivery,
  publicDraftParts,
} from "./pilot-r3-importer.mjs";
import { validatePilot } from "./pilot-validation.mjs";
import {
  syntheticPublicationMapping,
  validatePublicationMapping,
} from "./pilot-r3-publication-validator.mjs";
const handles = new WeakMap();
const sentinel =
  "SYNTHETIC PARAMETERIZED FIXTURE 'quoted' \\ slash\nCHỈ THỬ NGHIỆM — NOT LEARNING FEEDBACK";
const realPath = ".local/pilot-hsk1/v1/private/answers.json";
const repoRoot = fileURLToPath(new URL("../", import.meta.url));
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
function restrictedPaths(paths = [realPath]) {
  const script = `$ErrorActionPreference='Stop';try{$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;foreach($p in @(${paths.map((p) => "'" + p + "'").join(",")})){$i=Get-Item -LiteralPath $p;foreach($target in @($i,$i.Directory)){foreach($r in (Get-Acl -LiteralPath $target.FullName).Access){if($r.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($sid,'S-1-5-18')){throw 'ACL'}}};if(-not (Get-Acl -LiteralPath $i.Directory.FullName).AreAccessRulesProtected){throw 'ACL'};while($i){if(($i.Attributes -band [IO.FileAttributes]::ReparsePoint)-ne 0){throw 'LINK'};if($i -is [IO.DirectoryInfo]){$i=$i.Parent}else{$i=$i.Directory}}};Write-Output 'ACL_OK'}catch{exit 2}`;
  const r = spawnSync(
    "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 15000,
      windowsHide: true,
      // PS7's inherited module path can hide PS5's built-in Get-Acl.
      env: {
        ...process.env,
        PSModulePath:
          "C:/Windows/System32/WindowsPowerShell/v1.0/Modules;" +
          (process.env.PSModulePath ?? ""),
      },
    },
  );
  return r.status === 0 && r.stdout.trim() === "ACL_OK";
}
export function trustedLocalRuntime({
  platform = process.platform,
  env = process.env,
  cwd = process.cwd(),
  entry = process.argv[1] ?? "",
  browser = typeof globalThis.window !== "undefined",
} = {}) {
  return (
    platform === "win32" &&
    !browser &&
    path.resolve(cwd).toLowerCase() === path.resolve(repoRoot).toLowerCase() &&
    ["scripts/validate-pilot.mjs", "scripts/protected-local-keys.mjs"].some(
      (p) =>
        path.resolve(repoRoot, p).toLowerCase() ===
        path.resolve(entry).toLowerCase(),
    ) &&
    ![
      "CI",
      "VITEST",
      "NEXT_RUNTIME",
      "GITHUB_ACTIONS",
      "TF_BUILD",
      "JENKINS_URL",
      "BUILD_BUILDID",
      "VERCEL",
      "NETLIFY",
    ].some((k) => env[k]) &&
    env.NODE_ENV !== "production"
  );
}
function assertPrivateGitBoundary() {
  const run = (args) =>
    spawnSync("git", args, {
      encoding: "utf8",
      windowsHide: true,
      timeout: 10000,
    });
  const root = run(["rev-parse", "--show-toplevel"]);
  const ignored = run(["check-ignore", "--quiet", "--", realPath]);
  const tracked = run(["ls-files", "--", ".local/pilot-hsk1/"]);
  if (
    root.status !== 0 ||
    path.resolve(root.stdout.trim()).toLowerCase() !==
      path.resolve(repoRoot).toLowerCase() ||
    ignored.status !== 0 ||
    tracked.status !== 0 ||
    tracked.stdout.trim()
  )
    throw Error("PRIVATE_GIT_BOUNDARY_REJECTED");
}
function assertPublicFileSet(pkg) {
  const root = "content/pilot-hsk1/v1";
  const allowed = new Set([
    "manifest.json",
    "README.md",
    "REVIEW_CHECKLIST.md",
    ...pkg.manifest.files.map((f) => f.path),
  ]);
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw Error("PUBLIC_FILE_SET_REJECTED");
      if (entry.isDirectory()) visit(full);
      else if (
        !entry.isFile() ||
        !allowed.has(path.relative(root, full).replaceAll(path.sep, "/"))
      )
        throw Error("PUBLIC_FILE_SET_REJECTED");
    }
  }
  visit(root);
}
export function readLocalRealStore(pkg) {
  // Reject automated/browser/deployed runtimes before ANY private filesystem access.
  if (!trustedLocalRuntime()) throw Error("TRUSTED_LOCAL_REQUIRED");
  assertPrivateGitBoundary();
  publicDraftParts(pkg); // Exact public hashes/contracts before private read.
  assertPublicFileSet(pkg);
  if (!restrictedPaths()) throw Error("PRIVATE_ACL_REJECTED");
  try {
    const bytes = fs.readFileSync(realPath),
      stable = fs.readFileSync(realPath);
    if (sha(bytes) !== sha(stable)) throw Error("changed"); // Private digests remain in memory.
    const store = JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, ""));
    validateStore(pkg, store);
    if (sha(bytes) !== sha(fs.readFileSync(realPath))) throw Error("changed");
    return handle(store, "real-read-only");
  } catch {
    throw Error("REAL_LOCAL_VALIDATION_REJECTED");
  }
}
// Compatibility only; old authorization records are historical and never read.
export const readApprovedRealStore = readLocalRealStore;
export function deliverLocalSynthetic(
  pkg,
  token,
  { fault = null, operation = "draft_import" } = {},
) {
  const entry = handles.get(token);
  if (!entry) return { status: "BLOCKED", code: "UNTRUSTED_HANDLE" };
  if (entry.mode !== "synthetic")
    return {
      status: "BLOCKED",
      code: "REAL_DB_DELIVERY_REQUIRES_SEPARATE_APPROVAL_AND_REVIEW",
    };
  try {
    if (!["draft_import", "promote_fixture"].includes(operation))
      throw Error("operation");
    if (
      operation === "promote_fixture" &&
      validatePublicationMapping(syntheticPublicationMapping()).status !==
        "PASS"
    )
      throw Error("metadata");
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
      public: { batches: publicDraftParts(pkg).batches },
      rows: entry.store.keys,
      fault,
      operation,
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
      !Number.isSafeInteger(r.parameterizedPublicRows ?? 0) ||
      (r.parameterizedPublicRows ?? 0) < 0 ||
      (r.parameterizedPublicRows ?? 0) > 224 ||
      !Number.isSafeInteger(r.promotedEntities ?? 0) ||
      (r.promotedEntities ?? 0) < 0 ||
      (r.promotedEntities ?? 0) > 91 ||
      (r.status === "LOCAL_PASS" &&
        (child.status !== 0 ||
          r.committedKeys !== (operation === "draft_import" ? 24 : 0) ||
          r.parameterizedKeyRows !== (operation === "draft_import" ? 24 : 0) ||
          r.parameterizedPublicRows !==
            (operation === "draft_import" ? 224 : 0) ||
          r.promotedEntities !== (operation === "promote_fixture" ? 91 : 0) ||
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
      parameterizedPublicRows: r.parameterizedPublicRows ?? 0,
      promotedEntities: r.promotedEntities ?? 0,
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
    if (
      process.argv.length !== 3 ||
      !["--validate-local", "--validate-approved-real"].includes(
        process.argv[2],
      )
    )
      throw Error("LOCAL_READ_ONLY_COMMAND_REQUIRED");
    const token = readLocalRealStore(loadPilot());
    console.log(
      JSON.stringify({
        status: "PASS",
        records: token.toJSON().records,
      }),
    );
  } catch (error) {
    const code = [
      "TRUSTED_LOCAL_REQUIRED",
      "PRIVATE_GIT_BOUNDARY_REJECTED",
      "PRIVATE_ACL_REJECTED",
      "REAL_LOCAL_VALIDATION_REJECTED",
    ].includes(error?.message)
      ? error.message
      : "LOCAL_CONTENT_OR_COMMAND_REJECTED";
    console.error(JSON.stringify({ status: "FAIL", code }));
    process.exitCode = 2;
  }
}
