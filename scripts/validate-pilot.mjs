// Read-only local validation. Reuses the same guarded reader as operator tooling.
import { loadPilot } from "./pilot-r3-importer.mjs";
import { readLocalRealStore } from "./protected-local-keys.mjs";
try {
  if (process.argv.length !== 2)
    throw Error("LOCAL_COMMAND_ARGUMENTS_REJECTED");
  const pkg = loadPilot();
  const token = readLocalRealStore(pkg);
  console.log(
    JSON.stringify({
      status: "PASS",
      lessons: pkg.lessons.length,
      vocabulary: pkg.vocabulary.length,
      grammar: pkg.grammar.length,
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
    : "LOCAL_CONTENT_OR_SOURCE_VALIDATION_FAILED";
  console.error(JSON.stringify({ status: "FAIL", code }));
  process.exitCode = 2;
}
