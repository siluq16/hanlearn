import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
assert.equal(
  process.env.HANLEARN_CLOUD_READ_TESTS,
  "approved",
  "BLOCKED: Development read access must be explicitly approved",
);
const ref = process.env.HANLEARN_APPROVED_DEV_PROJECT_REF;
assert(
  /^[a-z0-9]{20}$/.test(ref ?? ""),
  "Set the exact approved Development project ref locally",
);
// No passwords/tokens in args; CLI manages its own authenticated profile.
let result;
try {
  result = execFileSync(
    process.execPath,
    [
      "node_modules/supabase/dist/supabase.js",
      "gen",
      "types",
      "--schema",
      "public",
      `--remote=${ref}`,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch {
  console.error(
    "Type generation failed. Inspect the Development CLI configuration locally; response details suppressed.",
  );
  process.exit(1);
}
mkdirSync(".local", { recursive: true });
writeFileSync(".local/database.cloud.generated.ts", result);
console.log(
  "Generated .local/database.cloud.generated.ts. Review before reconciling the curated public projections; app types were not overwritten.",
);
