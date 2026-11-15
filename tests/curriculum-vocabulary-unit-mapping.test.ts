import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { HSK1_WORD_UNIT_MAP, getWordUnit } from "@/features/vocabulary/unit-mapping";
import { UNIFIED_UNITS } from "@/features/curriculum/unified-metadata";

describe("HSK 1 300 Words Unit Mapping Consistency", () => {
  const officialPath = path.join(
    process.cwd(),
    "content/hsk_library/hsk1_exam_2025_official_300.json"
  );
  const raw = fs.readFileSync(officialPath, "utf-8");
  const official300 = JSON.parse(raw) as Array<{
    hanzi: string;
    pinyin: string;
    meaning_en?: string;
  }>;

  it("contains exactly 300 words in the official library", () => {
    expect(official300.length).toBe(300);
  });

  it("maps 100% of the 300 words to valid Unit numbers (1 through 6)", () => {
    for (const item of official300) {
      const u = getWordUnit(item.hanzi);
      expect(u).toBeGreaterThanOrEqual(1);
      expect(u).toBeLessThanOrEqual(6);
      expect(HSK1_WORD_UNIT_MAP[item.hanzi]).toBe(u);
    }
  });

  it("verifies fundamental Unit 1 vocabulary from Module 0 / Lessons 1-4 are mapped to Unit 1", () => {
    const unit1Words = [
      "你", "好", "我", "谢谢", "再见", "吗", "很", "天",
      "一", "二", "三", "四", "五", "六", "七"
    ];

    for (const w of unit1Words) {
      expect(getWordUnit(w)).toBe(1);
    }
  });

  it("verifies correctness of Unit assignment derived directly from earliest lesson introduction in 32 lessons", () => {
    // Collect earliest lesson where word appears as target vocabulary
    const targetVocabEarliestLesson: Record<string, number> = {};
    for (let i = 1; i <= 32; i++) {
      const pad = String(i).padStart(2, "0");
      const lessonPath = path.join(process.cwd(), `content/hsk_library/hsk1_lesson_${pad}.json`);
      if (!fs.existsSync(lessonPath)) continue;
      const lessonData = JSON.parse(fs.readFileSync(lessonPath, "utf-8"));
      for (const st of lessonData.stages || []) {
        for (const v of st.vocabulary || []) {
          if (!targetVocabEarliestLesson[v.simplified]) {
            targetVocabEarliestLesson[v.simplified] = i;
          }
        }
      }
    }

    function getExpectedUnit(les: number): number {
      if (les <= 4) return 1; // Unit 1: Bài 1-4
      if (les <= 8) return 2; // Unit 2: Bài 5-8
      if (les <= 14) return 3; // Unit 3: Bài 9-14
      if (les <= 20) return 4; // Unit 4: Bài 15-20
      if (les <= 25) return 5; // Unit 5: Bài 21-25
      return 6; // Unit 6: Bài 26-32
    }

    for (const item of official300) {
      const hz = item.hanzi;
      const earliestLesson = targetVocabEarliestLesson[hz];
      const expectedUnit = earliestLesson ? getExpectedUnit(earliestLesson) : 1;
      expect(getWordUnit(hz)).toBe(expectedUnit);
    }
  });

  it("verifies unified unit definitions match the 32-lesson partition", () => {
    expect(UNIFIED_UNITS.length).toBe(6);
    expect(UNIFIED_UNITS[0].lessonSlugs).toEqual([
      "hsk1-lesson-01", "hsk1-lesson-02", "hsk1-lesson-03", "hsk1-lesson-04"
    ]);
    expect(UNIFIED_UNITS[1].lessonSlugs).toEqual([
      "hsk1-lesson-05", "hsk1-lesson-06", "hsk1-lesson-07", "hsk1-lesson-08"
    ]);
    expect(UNIFIED_UNITS[2].lessonSlugs).toEqual([
      "hsk1-lesson-09", "hsk1-lesson-10", "hsk1-lesson-11", "hsk1-lesson-12", "hsk1-lesson-13", "hsk1-lesson-14"
    ]);
    expect(UNIFIED_UNITS[3].lessonSlugs).toEqual([
      "hsk1-lesson-15", "hsk1-lesson-16", "hsk1-lesson-17", "hsk1-lesson-18", "hsk1-lesson-19", "hsk1-lesson-20"
    ]);
    expect(UNIFIED_UNITS[4].lessonSlugs).toEqual([
      "hsk1-lesson-21", "hsk1-lesson-22", "hsk1-lesson-23", "hsk1-lesson-24", "hsk1-lesson-25"
    ]);
    expect(UNIFIED_UNITS[5].lessonSlugs).toEqual([
      "hsk1-lesson-26", "hsk1-lesson-27", "hsk1-lesson-28", "hsk1-lesson-29", "hsk1-lesson-30", "hsk1-lesson-31", "hsk1-lesson-32"
    ]);
  });
});
