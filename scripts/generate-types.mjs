import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { developmentConfig, projectRef } from "./development.mjs";
developmentConfig();
const ref = projectRef;
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
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, DO_NOT_TRACK: "1" },
    },
  );
} catch (error) {
  const diagnostic = String(error.stderr ?? "") + String(error.stdout ?? "");
  const reason = /403|forbidden|insufficient.*privilege/i.test(diagnostic)
    ? "CLI endpoint denied schema-generation access"
    : /401|access token|not logged in|unauthorized/i.test(diagnostic)
      ? "CLI authenticated profile unavailable or insufficient"
      : /docker|container/i.test(diagnostic)
        ? "Generation path requires a container; not used in this project"
        : /not implemented|not supported|unsupported/i.test(diagnostic)
          ? "Pinned CLI does not support this generation path"
          : "CLI generation unavailable; raw diagnostics suppressed";
  mkdirSync(".local/acceptance", { recursive: true });
  writeFileSync(
    ".local/acceptance/type-generation.json",
    JSON.stringify(
      {
        projectRef: ref,
        status: "BLOCKED",
        reason,
        processCode: [
          "ENOENT",
          "EPERM",
          "EACCES",
          "EINVAL",
          "ENOBUFS",
          "ETIMEDOUT",
        ].includes(error.code)
          ? error.code
          : null,
        exitStatus: Number.isInteger(error.status) ? error.status : null,
      },
      null,
      2,
    ),
  );
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
