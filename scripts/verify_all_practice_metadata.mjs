import fs from "node:fs";
import { UNIFIED_PRACTICE_SETS } from "../src/features/curriculum/unified-metadata.ts";

const bank = JSON.parse(fs.readFileSync("content/hsk_library/practice_bank.json", "utf8"));

console.log("=== VERIFY ALL 56 PRACTICE SETS ===");
let hasError = false;

for (const s of bank.sets) {
  const m = UNIFIED_PRACTICE_SETS[s.practice_set_id];
  if (!m) {
    console.error(`[FAIL] MISSING in UNIFIED_PRACTICE_SETS: ${s.practice_set_id}`);
    hasError = true;
    continue;
  }
  if (m.skill !== s.skill) {
    console.error(`[FAIL] SKILL MISMATCH for ${s.practice_set_id}: metadata=${m.skill}, bank=${s.skill}`);
    hasError = true;
  }
  if (m.unitId !== s.unit_id) {
    console.error(`[FAIL] UNIT MISMATCH for ${s.practice_set_id}: metadata=${m.unitId}, bank=${s.unit_id}`);
    hasError = true;
  }
  console.log(`[OK] ${s.practice_set_id.padEnd(12, " ")} | skill: ${s.skill.padEnd(10, " ")} | type: ${s.exercise_type.padEnd(22, " ")} | short: "${m.shortTitle}" | bankTitle: "${s.title}"`);
}

if (!hasError) {
  console.log("\n>>> ALL 56 SETS ARE 100% SYNCHRONIZED AND PRESENT! <<<");
} else {
  console.error("\n>>> SOME SETS HAVE MISMATCHES! <<<");
  process.exit(1);
}
