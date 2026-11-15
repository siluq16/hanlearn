import fs from "fs";

const pb = JSON.parse(fs.readFileSync("content/hsk_library/practice_bank.json", "utf8"));

console.log("Total sets:", pb.sets.length);

const summary = {};
let totalQ = 0;
const placeholders = [];
const promptCounts = {};
const issues = [];

pb.sets.forEach((s) => {
  const count = s.questions ? s.questions.length : s.turns ? s.turns.length : 0;
  totalQ += count;
  const key = s.skill + " | " + s.exercise_type;
  summary[key] = (summary[key] || 0) + count;

  if (s.questions) {
    s.questions.forEach((q, idx) => {
      const text = JSON.stringify(q);
      if (text.includes("TODO") || text.includes("placeholder") || text.includes("undefined")) {
        placeholders.push({ setId: s.practice_set_id, qId: q.id });
      }
      const pKey = s.practice_set_id + " ::: " + q.prompt;
      promptCounts[pKey] = (promptCounts[pKey] || 0) + 1;

      // Verification of question completeness
      if (q.choices) {
        if (typeof q.correct_index !== "number" || q.correct_index < 0 || q.correct_index >= q.choices.length) {
          issues.push({ setId: s.practice_set_id, qId: q.id, issue: "Invalid correct_index in MCQ" });
        }
      }
      if (q.tokens) {
        if (!q.targetSentence) {
          issues.push({ setId: s.practice_set_id, qId: q.id, issue: "Missing targetSentence in sentence_ordering" });
        }
      }
      if (q.pairs) {
        if (q.pairs.length === 0) {
          issues.push({ setId: s.practice_set_id, qId: q.id, issue: "Empty pairs in matching" });
        }
      }
    });
  }

  if (s.turns) {
    s.turns.forEach((t, idx) => {
      if (!t.hanzi || !t.pinyin || !t.vi || !t.role) {
        issues.push({ setId: s.practice_set_id, turnIdx: idx, issue: "Incomplete turn data in dialogue" });
      }
    });
  }
});

console.log("Total items (questions + turns):", totalQ);
console.log("Breakdown by skill & type:", summary);
console.log("Placeholders found:", placeholders.length);
const dupes = Object.entries(promptCounts).filter(([k, v]) => v > 1);
console.log("Duplicate prompts within same set count:", dupes.length);
if (dupes.length > 0) {
  console.log("Sample duplicates:", dupes.slice(0, 5));
}
console.log("Other schema issues count:", issues.length);
if (issues.length > 0) {
  console.log("Issues:", issues);
}
