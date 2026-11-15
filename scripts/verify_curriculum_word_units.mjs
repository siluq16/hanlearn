import fs from "node:fs";

const official300 = JSON.parse(fs.readFileSync("content/hsk_library/hsk1_exam_2025_official_300.json", "utf8"));

// Track:
// 1. Where does the word appear as formal target vocabulary in stage.vocabulary?
// 2. Where does the word appear anywhere in lesson content (dialogue, grammar, reading)?
const formalVocabMap = {};
const allAppearances = {};

for (let i = 1; i <= 32; i++) {
  const pad = String(i).padStart(2, "0");
  const p = `content/hsk_library/hsk1_lesson_${pad}.json`;
  if (!fs.existsSync(p)) continue;
  const l = JSON.parse(fs.readFileSync(p, "utf8"));

  // Check formal vocabulary
  for (const st of l.stages || []) {
    for (const v of st.vocabulary || []) {
      const hz = v.simplified;
      if (!formalVocabMap[hz]) {
        formalVocabMap[hz] = i;
      }
    }
  }

  // Check appearance anywhere in json
  const str = JSON.stringify(l);
  for (const item of official300) {
    const hz = item.hanzi;
    if (str.includes(hz)) {
      if (!allAppearances[hz]) {
        allAppearances[hz] = [];
      }
      allAppearances[hz].push(i);
    }
  }
}

function getUnitForLesson(lessonNum) {
  if (lessonNum <= 4) return 1;
  if (lessonNum <= 8) return 2;
  if (lessonNum <= 14) return 3;
  if (lessonNum <= 20) return 4;
  if (lessonNum <= 25) return 5;
  return 6;
}

console.log("=== FORMAL VOCABULARY AUDIT ===");
const wordsWithFormal = Object.keys(formalVocabMap).length;
console.log(`Total words with formal stage.vocabulary entry: ${wordsWithFormal}`);

// Read and parse unit-mapping.ts
const mappingFile = fs.readFileSync("src/features/vocabulary/unit-mapping.ts", "utf8");
const jsonMatch = mappingFile.match(/HSK1_WORD_UNIT_MAP:\s*Record<string,\s*number>\s*=\s*(\{[\s\S]*?\});/);
if (!jsonMatch) {
  throw new Error("Could not parse HSK1_WORD_UNIT_MAP from unit-mapping.ts");
}
const HSK1_WORD_UNIT_MAP = JSON.parse(jsonMatch[1]);

let matchFormal = 0;
let matchFirstAppearance = 0;
let conflicts = [];

for (const item of official300) {
  const hz = item.hanzi;
  const formalLes = formalVocabMap[hz];
  const firstLes = allAppearances[hz] ? allAppearances[hz][0] : null;
  const currentUnit = HSK1_WORD_UNIT_MAP[hz];

  const formalUnit = formalLes ? getUnitForLesson(formalLes) : null;
  const firstUnit = firstLes ? getUnitForLesson(firstLes) : null;

  if (formalUnit && formalUnit !== currentUnit) {
    conflicts.push({
      hanzi: hz,
      pinyin: item.pinyin,
      currentUnit,
      formalUnit,
      formalLesson: formalLes,
      firstAppearanceUnit: firstUnit,
      firstAppearanceLesson: firstLes,
      allAppearances: allAppearances[hz]
    });
  }
}

console.log(`Current unit matches formal unit for all except ${conflicts.length} words.`);
if (conflicts.length > 0) {
  console.log("Conflicts:", JSON.stringify(conflicts, null, 2));
}
