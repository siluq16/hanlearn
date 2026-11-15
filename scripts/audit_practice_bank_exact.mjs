import fs from "node:fs";

const bank = JSON.parse(fs.readFileSync("content/hsk_library/practice_bank.json", "utf8"));
console.log("Total sets in practice_bank.json:", bank.sets.length);

const skills = {};
bank.sets.forEach((s) => {
  skills[s.skill] = (skills[s.skill] || 0) + 1;
});
console.log("Skill counts:", JSON.stringify(skills, null, 2));

console.log("\nAll 56 sets in practice_bank.json:");
bank.sets.forEach((s, idx) => {
  console.log(`${String(idx + 1).padStart(2, " ")}. ID: ${s.practice_set_id} | Skill: ${s.skill.padEnd(10, " ")} | Type: ${s.exercise_type.padEnd(20, " ")} | Unit: ${s.unit_id} | Title: "${s.title}"`);
});
