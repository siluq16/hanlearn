import fs from "node:fs";
import path from "node:path";

// 1. Units
console.log("=== UNITS ===");
const constants = fs.readFileSync("src/features/courses/constants.ts", "utf-8");
const unitRegex = /unit_id:\s*"([^"]+)",[\s\S]*?unit_number:\s*(\d+),[\s\S]*?title:\s*"([^"]+)"/g;
let uMatch;
while ((uMatch = unitRegex.exec(constants)) !== null) {
  console.log(`${uMatch[1]} | Unit ${uMatch[2]} | ${uMatch[3]}`);
}

// 2. Lessons
console.log("\n=== LESSONS ===");
for (let i = 1; i <= 32; i++) {
  const pad = String(i).padStart(2, "0");
  const file = `content/hsk_library/hsk1_lesson_${pad}.json`;
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    console.log(`${data.slug} | ${data.title}`);
  }
}

// 3. Practice Sets
console.log("\n=== PRACTICE SETS ===");
const bank = JSON.parse(fs.readFileSync("content/hsk_library/practice_bank.json", "utf-8"));
for (const s of bank.sets) {
  console.log(`${s.practice_set_id} | ${s.unit_id} | ${s.skill} | ${s.title}`);
}

// 4. Unit Tests
console.log("\n=== UNIT TESTS ===");
if (fs.existsSync("content/hsk_library/unit_tests")) {
  const utFiles = fs.readdirSync("content/hsk_library/unit_tests");
  for (const f of utFiles) {
    if (f.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(path.join("content/hsk_library/unit_tests", f), "utf-8"));
      console.log(`${f} | ${data.title || data.quiz_title || data.name || "no title"}`);
    }
  }
}
