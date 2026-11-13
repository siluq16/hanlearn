import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
)
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);
const bannedFile =
  /(^|\/)(\.env($|\.(?!example$))|credentials[^/]*\.json$)|\.(pem|p12|pfx|key)$/;
const secretPatterns = [
  /sb_secret_[A-Za-z0-9_-]{24,}/,
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}/,
];
for (const file of files) {
  assert(
    !bannedFile.test(file),
    `Sensitive filename tracked/unignored: ${file}`,
  );
  const text = readFileSync(file, "utf8");
  if (file.startsWith("content/pilot-hsk1/") && file.endsWith(".json")) {
    const forbidden =
      /^(correct_index|correctIndex|correctAnswer|correct_answer|answerKey|answer_key|answer_keys|is_correct|isCorrect|solution|solutions|submission_payload|submission_fingerprint)$/;
    const hasPrivateKey = (value) =>
      value &&
      typeof value === "object" &&
      Object.entries(value).some(
        ([key, child]) => forbidden.test(key) || hasPrivateKey(child),
      );
    assert(
      !hasPrivateKey(JSON.parse(text)),
      `Private quiz key field in public pilot file ${file}; values suppressed`,
    );
  }
  for (const pattern of secretPatterns)
    assert(
      !pattern.test(text),
      `Possible credential detected in ${file}; value suppressed`,
    );
}
for (const path of [
  ".env.local",
  ".local/pgdata/PG_VERSION",
  "node_modules/next/package.json",
  ".next/BUILD_ID",
]) {
  const ignored = execFileSync("git", ["check-ignore", path], {
    encoding: "utf8",
  }).trim();
  assert(ignored, `${path} is not ignored`);
}
const sourceFiles = files.filter(
  (f) => f.startsWith("src/") && /\.[tj]sx?$/.test(f),
);
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  assert(
    !/\.rpc\(["']mark_lesson_studied["']/.test(source) ||
      file === "src/features/lessons/actions.ts",
    `Study mutation outside the guarded Server Action: ${file}`,
  );
  assert(
    !/\.from\(["']lesson_progress["']\)\.(insert|update|upsert|delete)/.test(
      source,
    ),
    `Forbidden direct lesson progress mutation: ${file}`,
  );
  assert(
    !/content\/pilot-hsk1/.test(source),
    `Offline draft pilot imported into app source: ${file}`,
  );
  assert(
    !/tests\/fixtures|lessonFixture|lesson-ui-harness/.test(source),
    `Test fixture/harness reference in app source: ${file}`,
  );
  assert(
    !/SUPABASE_(SERVICE_ROLE|SECRET|DB_PASSWORD)/.test(source),
    `Forbidden runtime secret reference: ${file}`,
  );
  assert(
    !/\.from\(["'](review_cards|review_events)["']\)\.(insert|update|delete|upsert)/.test(
      source,
    ),
    `Forbidden direct SRS write: ${file}`,
  );
  assert(
    !/\.from\(["']quiz_answer_keys["']\)/.test(source),
    `Answer table in app: ${file}`,
  );
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(`${dir}/${entry.name}`)
      : [`${dir}/${entry.name}`],
  );
}
if (existsSync(".next/static"))
  for (const file of walk(".next/static").filter((f) => f.endsWith(".js"))) {
    const text = readFileSync(file, "utf8");
    assert(
      !/urn:hanlearn:pilot-hsk1:v1|hanlearn-pilot-hsk1-v1/.test(text),
      `Draft pilot bundled in production client ${file}`,
    );
    assert(
      !/lessonFixture|private-test-marker|SYNTHETIC LOCAL TEST/.test(text),
      `Synthetic lesson fixture found in browser bundle ${file}`,
    );
    for (const pattern of secretPatterns)
      assert(
        !pattern.test(text),
        `Possible credential in browser bundle ${file}; value suppressed`,
      );
  }
console.log(
  `PASS static credential/grant-boundary scan (${files.length} source files; browser bundle checked when present). This is supplementary, not real RLS/JWT verification.`,
);
