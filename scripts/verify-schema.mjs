// Local comparison only: the SQL input is a READ ONLY catalog snapshot.
import fs from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import path from "node:path";
const read = (path) =>
  JSON.parse(fs.readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
const normalize = (v) =>
  Array.isArray(v)
    ? v.map(normalize)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, normalize(v[k])]),
        )
      : v;
export function compareSchema(expected, actual, classification = null) {
  const appNames = classification?.applicationFunctionNames;
  const extras =
    appNames && Array.isArray(actual.functions)
      ? actual.functions.filter(
          (f) => !appNames.includes(`${f.schema}.${f.name}`),
        )
      : [];
  const preexistingObjects = extras.map((f) => ({
    schema: f.schema,
    name: f.name,
    arguments: f.arguments,
    classification: classification.reviewedPreexistingFunctions?.some(
      (reviewed) =>
        JSON.stringify(normalize(reviewed)) === JSON.stringify(normalize(f)),
    )
      ? "REVIEWED_PREEXISTING"
      : "UNCLASSIFIED",
  }));
  const preexistingBaselineMatches =
    !classification ||
    (classification.reviewedPreexistingFunctions ?? []).every((reviewed) =>
      extras.some(
        (f) =>
          JSON.stringify(normalize(reviewed)) === JSON.stringify(normalize(f)),
      ),
    );
  const sections = Object.fromEntries(
    Object.entries(expected.sections).map(([key, value]) => {
      const rows =
        key === "functions" && appNames && Array.isArray(actual.functions)
          ? actual.functions.filter((f) =>
              appNames.includes(`${f.schema}.${f.name}`),
            )
          : actual[key];
      const sha256 = Array.isArray(rows)
        ? createHash("sha256")
            .update(JSON.stringify(normalize(rows)))
            .digest("hex")
        : null;
      return [
        key,
        {
          status:
            Array.isArray(rows) &&
            rows.length === value.count &&
            sha256 === value.sha256
              ? "PASS"
              : "FAIL",
          expectedCount: value.count,
          actualCount: rows?.length ?? null,
        },
      ];
    }),
  );
  const result = {
    status:
      Object.values(sections).every((v) => v.status === "PASS") &&
      preexistingBaselineMatches &&
      preexistingObjects.every(
        (v) => v.classification === "REVIEWED_PREEXISTING",
      )
        ? "PASS"
        : "FAIL",
    sections,
    ...(classification
      ? { preexistingObjects, preexistingBaselineMatches }
      : {}),
  };
  return result;
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const result = compareSchema(
    read("supabase/verification/expected_schema.json"),
    read(".local/cloud-apply/schema.json"),
  );
  fs.writeFileSync(
    ".local/cloud-apply/schema-verification.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
  if (result.status !== "PASS") process.exitCode = 2;
}
