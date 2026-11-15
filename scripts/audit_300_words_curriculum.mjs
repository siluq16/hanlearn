import fs from "node:fs";

const official300 = JSON.parse(fs.readFileSync("content/hsk_library/hsk1_exam_2025_official_300.json", "utf8"));

// Read all 32 lessons and their stages:
const wordToEarliestLesson = {};

for (let i = 1; i <= 32; i++) {
  const pad = String(i).padStart(2, "0");
  const p = `content/hsk_library/hsk1_lesson_${pad}.json`;
  if (!fs.existsSync(p)) continue;
  const l = JSON.parse(fs.readFileSync(p, "utf8"));
  const str = JSON.stringify(l);

  for (const item of official300) {
    const hz = item.hanzi;
    let inVocab = false;
    for (const st of l.stages || []) {
      for (const v of st.vocabulary || []) {
        if (v.simplified === hz) {
          inVocab = true;
          break;
        }
      }
      if (inVocab) break;
    }

    if (inVocab && !wordToEarliestLesson[hz]) {
      wordToEarliestLesson[hz] = { lesson: i, exact: true };
    } else if (!wordToEarliestLesson[hz] && str.includes(`"${hz}"`)) {
      wordToEarliestLesson[hz] = { lesson: i, exact: false };
    }
  }
}

// Special assignment for fundamental words that are taught in Module 0 / Lesson 1-4 (Unit 1):
const unit1Fundamentals = new Set([
  "你", "好", "我", "谢谢", "再见", "吗", "很", "天",
  "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
  "叫", "什么", "名字", "是", "哪", "国", "人", "不", "也"
]);

for (const w of unit1Fundamentals) {
  if (!wordToEarliestLesson[w] || wordToEarliestLesson[w].lesson > 4) {
    wordToEarliestLesson[w] = { lesson: 1, exact: true };
  }
}

// Now calculate Unit for each of the 300 words:
const finalMapping = {};
const unmapped = [];

for (const item of official300) {
  const hz = item.hanzi;
  const info = wordToEarliestLesson[hz];
  if (info) {
    const les = info.lesson;
    const unit = les <= 4 ? 1 : les <= 8 ? 2 : les <= 14 ? 3 : les <= 20 ? 4 : les <= 25 ? 5 : 6;
    finalMapping[hz] = unit;
  } else {
    // If not in lessons, check if it was in checkpoint 01-06 or practice bank
    unmapped.push(item);
    finalMapping[hz] = 6;
  }
}

console.log("Unmapped count:", unmapped.length);
if (unmapped.length > 0) {
  console.log("Unmapped words:", unmapped);
}

const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
for (const [_, u] of Object.entries(finalMapping)) {
  dist[u]++;
}
console.log("New Unit distribution of 300 words:", dist);

// Write updated mapping
const content = `// Canonical mapping of HSK 1 300 words to Curriculum Unit 1-6
// Derived directly from the 32 official lessons and syllabus hierarchy.
export const HSK1_WORD_UNIT_MAP: Record<string, number> = ${JSON.stringify(finalMapping, null, 2)};

export function getWordUnit(hanzi: string): number {
  return HSK1_WORD_UNIT_MAP[hanzi] || 6;
}
`;

fs.writeFileSync("src/features/vocabulary/unit-mapping.ts", content);
console.log("Updated src/features/vocabulary/unit-mapping.ts successfully.");
