import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { HSK1_WORD_UNIT_MAP, getWordUnit } from "@/features/vocabulary/unit-mapping";

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

  it("verifies fundamental Unit 1 vocabulary are mapped to Unit 1", () => {
    const unit1Words = [
      "你", "好", "我", "谢谢", "再见", "吗", "很", "天",
      "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
      "叫", "什么", "名字", "是", "哪", "国", "人", "不", "也",
    ];

    for (const w of unit1Words) {
      expect(getWordUnit(w)).toBe(1);
    }
  });

  it("verifies balanced unit distribution across the 6 Units", () => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const item of official300) {
      const u = getWordUnit(item.hanzi);
      dist[u] = (dist[u] || 0) + 1;
    }

    // Every unit must have a non-trivial, appropriate number of words
    expect(dist[1]).toBeGreaterThanOrEqual(40);
    expect(dist[2]).toBeGreaterThanOrEqual(20);
    expect(dist[3]).toBeGreaterThanOrEqual(40);
    expect(dist[4]).toBeGreaterThanOrEqual(40);
    expect(dist[5]).toBeGreaterThanOrEqual(30);
    expect(dist[6]).toBeGreaterThanOrEqual(30);

    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    expect(total).toBe(300);
  });
});
