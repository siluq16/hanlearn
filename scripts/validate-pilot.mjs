// Local files only: no network, .env, database client, migration or import operation.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { validatePilot } from "./pilot-validation.mjs";
const root = "content/pilot-hsk1/v1",
  privatePath = ".local/pilot-hsk1/v1/private/answers.json";
const read = (p) =>
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
const hash = (p) =>
  createHash("sha256").update(fs.readFileSync(p)).digest("hex");
try {
  const manifest = read(root + "/manifest.json");
  if (
    !Array.isArray(manifest.lessons) ||
    manifest.lessons.length !== 4 ||
    manifest.lessons.some(
      (l, i) =>
        l.file !== `lessons/lesson-0${i + 1}.json` ||
        l.quiz_file !== `quizzes/lesson-0${i + 1}.json`,
    )
  )
    throw Error("Unexpected public paths");
  const expectedFiles = [
    "vocabulary.json",
    "grammar.json",
    "rights-manifest.json",
    ...manifest.lessons.flatMap((l) => [l.file, l.quiz_file]),
  ].sort();
  const actualFiles = manifest.files.map((x) => x.path).sort();
  if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles))
    throw Error("Unexpected file set");
  function filesUnder(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (entry.isSymbolicLink()) throw Error("Symlink not allowed");
      const file = path.join(dir, entry.name);
      return entry.isDirectory()
        ? filesUnder(file)
        : [path.relative(root, file).replaceAll(path.sep, "/")];
    });
  }
  const allowed = [
    "manifest.json",
    "README.md",
    "REVIEW_CHECKLIST.md",
    ...expectedFiles,
  ];
  if (filesUnder(root).some((file) => !allowed.includes(file)))
    throw Error("Unexpected public asset");
  const pkg = {
    manifest,
    vocabulary: read(root + "/vocabulary.json"),
    grammar: read(root + "/grammar.json"),
    lessons: manifest.lessons.map((l) => read(path.join(root, l.file))),
    quizzes: manifest.lessons.map((l) => read(path.join(root, l.quiz_file))),
    rights: read(root + "/rights-manifest.json"),
  };
  const sourceFiles = [
    ".local/pilot-hsk1/official-syllabus.pdf",
    ".local/pilot-hsk1/source-pages.json",
  ];
  const source = sourceFiles.every(fs.existsSync)
    ? {
        pdfSha: hash(sourceFiles[0]),
        textSha: hash(sourceFiles[1]),
        pages: read(sourceFiles[1]),
      }
    : null;
  const result = validatePilot(pkg, {
    privateKeys: fs.existsSync(privatePath) ? read(privatePath) : null,
    source,
  });
  if (
    JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles) ||
    manifest.files.some(
      (f) =>
        path.resolve(root, f.path) !==
          path.resolve(root) + path.sep + f.path.replaceAll("/", path.sep) ||
        hash(path.join(root, f.path)) !== f.sha256,
    )
  ) {
    result.status = "FAIL";
    result.issues.push({ code: "public_file_hash_or_set_mismatch" });
  }
  const ignored = execFileSync("git", ["check-ignore", privatePath], {
    encoding: "utf8",
  }).trim();
  const tracked = execFileSync("git", ["ls-files", "--", ".local/pilot-hsk1"], {
    encoding: "utf8",
  }).trim();
  result.privateStoreGitIgnored = !!ignored && !tracked;
  if (!result.privateStoreGitIgnored) {
    result.status = "FAIL";
    result.issues.push({ code: "private_store_not_ignored" });
  }
  result.scope = "OFFLINE_AUTHORING_VALIDATION";
  result.checkedAt = new Date().toISOString();
  fs.mkdirSync(".local/pilot-hsk1", { recursive: true });
  fs.writeFileSync(
    ".local/pilot-hsk1/validation-result.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
  if (
    result.status !== "PASS" ||
    result.privateValidation !== "PASS" ||
    result.sourceVerification !== "PASS"
  )
    process.exitCode = 2;
} catch {
  console.error(
    "BLOCKED: offline pilot validation could not finish. Raw data/private keys suppressed; check local paths and schema.",
  );
  process.exitCode = 2;
}
