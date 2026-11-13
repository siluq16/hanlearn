// Local-only comparison to the captured real Development catalog; not generated types.
import fs from "node:fs";
import ts from "typescript";
const text = fs.readFileSync("src/types/database.ts", "utf8");
const source = ts.createSourceFile(
  "database.ts",
  text,
  ts.ScriptTarget.Latest,
  true,
);
const aliases = new Map(
  source.statements
    .filter(ts.isTypeAliasDeclaration)
    .map((node) => [node.name.text, node.type]),
);
const catalog = JSON.parse(
  fs
    .readFileSync(".local/cloud-security/schema.json", "utf8")
    .replace(/^\uFEFF/, ""),
);
const tables = {
  Profile: "profiles",
  Syllabus: "syllabus_versions",
  Course: "courses",
  Unit: "units",
  Lesson: "lessons",
  Progress: "lesson_progress",
  Vocabulary: "vocabulary",
  Membership: "syllabus_vocabulary",
  Card: "review_cards",
  Session: "study_sessions",
  AudioAsset: "audio_assets",
};
const checks = [];
for (const [alias, table] of Object.entries(tables)) {
  const declaration = aliases.get(alias);
  if (!declaration || !ts.isTypeLiteralNode(declaration))
    throw Error("Projection declaration missing");
  for (const field of declaration.members) {
    const name = field.name.getText(source),
      type = field.type.getText(source);
    const column = catalog.columns.find(
      (c) => c.schema === "public" && c.table === table && c.name === name,
    );
    const nullable = /\bnull\b/.test(type);
    const primitive = type.replace(/\s*\|\s*null/g, "").trim();
    const pgType = column?.type;
    const compatible =
      primitive === "number"
        ? ["smallint", "integer", "bigint", "numeric"].some((t) =>
            pgType?.startsWith(t),
          )
        : primitive === "boolean"
          ? pgType === "boolean"
          : primitive === "string"
            ? ["text", "uuid", "timestamp with time zone"].includes(pgType)
            : false;
    checks.push({
      object: table + "." + name,
      status:
        column && nullable === !column.not_null && compatible ? "PASS" : "FAIL",
    });
  }
}
for (const [name, result, args] of [
  ["mark_lesson_studied", "jsonb", ["p_lesson_id uuid"]],
  ["get_learner_access", "boolean", []],
  ["get_due_review_count", "bigint", []],
  [
    "search_vocabulary",
    "jsonb",
    [
      "p_syllabus_id uuid",
      "p_query text",
      "p_level integer",
      "p_offset integer",
      "p_limit integer",
    ],
  ],
]) {
  const f = catalog.functions.find(
    (f) => f.schema === "public" && f.name === name,
  );
  checks.push({
    object: "rpc." + name,
    status:
      f && f.result === result && f.arguments === args.join(", ")
        ? "PASS"
        : "FAIL",
  });
}
const report = {
  status: checks.every((c) => c.status === "PASS") ? "PASS" : "FAIL",
  checks,
  limits:
    "Selected 11 table Row projections + 4 RPC catalog signatures (including study) only; not CLI-generated types, full Insert/Update/Relationships, view nullability or JSON schema verification",
};
fs.mkdirSync(".local/acceptance", { recursive: true });
fs.writeFileSync(
  ".local/acceptance/type-projections.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    status: report.status,
    checks: checks.length,
    failed: checks.filter((c) => c.status !== "PASS"),
  }),
);
if (report.status !== "PASS") process.exitCode = 2;
