import fs from "node:fs";
import { UNIFIED_PRACTICE_SETS } from "../src/features/curriculum/unified-metadata.ts";

const bank = JSON.parse(fs.readFileSync("content/hsk_library/practice_bank.json", "utf8"));
const bankIds = new Set(bank.sets.map((s) => s.practice_set_id));
const metaIds = new Set(Object.keys(UNIFIED_PRACTICE_SETS));

console.log("Bank sets count:", bankIds.size);
console.log("Meta sets count:", metaIds.size);

const missingInMeta = [...bankIds].filter((id) => !metaIds.has(id));
console.log("In Bank but missing in Meta:", missingInMeta);

const extraInMeta = [...metaIds].filter((id) => !bankIds.has(id));
console.log("In Meta but not in Bank:", extraInMeta);
