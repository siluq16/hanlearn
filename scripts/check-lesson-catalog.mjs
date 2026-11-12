// No network/SQL: compare exact lesson SELECT fields to the real captured Cloud catalog.
import fs from "node:fs";
import ts from "typescript";
import { createHash } from "node:crypto";
const read = (file) =>
  JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
try {
  const capture = read(".local/cloud-security/capture.json"),
    catalog = read(".local/cloud-security/schema.json"),
    expected = read("supabase/verification/expected_schema.json");
  if (
    capture.projectRef !== "hhgxrjqkuwdgurphopok" ||
    capture.identity?.read_only !== "on"
  )
    throw Error();
  const hashesPass =
    expected.migrationHashes.length === 6 &&
    expected.migrationHashes.every(
      (m) =>
        createHash("sha256")
          .update(fs.readFileSync("supabase/migrations/" + m.file))
          .digest("hex")
          .toUpperCase() === m.sha256,
    );
  const groups = {
    LESSON_COLUMNS: "lessons",
    UNIT_COLUMNS: "units",
    COURSE_COLUMNS: "courses",
    SYLLABUS_COLUMNS: "syllabus_versions",
    WORD_COLUMNS: "vocabulary",
    GRAMMAR_COLUMNS: "grammar_points",
    WORD_LINK_COLUMNS: "lesson_vocabulary",
    GRAMMAR_LINK_COLUMNS: "lesson_grammar",
    PROGRESS_COLUMNS: "lesson_progress",
  };
  const source = ts.createSourceFile(
    "columns.ts",
    fs.readFileSync("src/features/lessons/columns.ts", "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const checks = [];
  let groupCount = 0;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      const table = groups[decl.name.getText(source)];
      if (!table) continue;
      groupCount++;
      const value = ts.isAsExpression(decl.initializer)
        ? decl.initializer.expression
        : decl.initializer;
      if (!ts.isStringLiteral(value)) throw Error();
      for (const field of value.text.split(","))
        checks.push({
          table,
          field,
          status: catalog.columns.some(
            (c) =>
              c.schema === "public" && c.table === table && c.name === field,
          )
            ? "PASS"
            : "FAIL",
        });
    }
  }
  const report = {
    projectRef: capture.projectRef,
    status:
      hashesPass && groupCount === 9 && checks.every((c) => c.status === "PASS")
        ? "PASS"
        : "FAIL",
    catalogCapturedAt: fs
      .statSync(".local/cloud-security/schema.json")
      .mtime.toISOString(),
    migrationHashesUnchanged: hashesPass,
    checks,
    limits:
      "Existing real READ ONLY catalog snapshot; no new live SQL, generated types or populated lesson validation",
  };
  fs.mkdirSync(".local/sprint2-1", { recursive: true });
  fs.writeFileSync(
    ".local/sprint2-1/catalog.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      status: report.status,
      checkedColumns: checks.length,
      groups: groupCount,
      migrationHashesUnchanged: hashesPass,
    }),
  );
  if (report.status !== "PASS") process.exitCode = 2;
} catch {
  console.error(
    "BLOCKED: trusted real Development catalog snapshot unavailable; no Cloud command attempted.",
  );
  process.exitCode = 2;
}
