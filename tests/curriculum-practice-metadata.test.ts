import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  UNIFIED_PRACTICE_SETS,
  UNIFIED_UNITS,
  getPracticeSetMeta,
} from "@/features/curriculum/unified-metadata";

describe("Practice Bank & Unified Metadata Consistency", () => {
  const bankPath = path.join(process.cwd(), "content/hsk_library/practice_bank.json");
  const raw = fs.readFileSync(bankPath, "utf-8");
  const bank = JSON.parse(raw);
  const sets = bank.sets as Array<{
    practice_set_id: string;
    unit_id: string;
    skill: string;
    title: string;
    exercise_type: string;
    difficulty: string;
    question_count: number;
  }>;

  it("contains exactly 56 practice sets in practice_bank.json", () => {
    expect(sets.length).toBe(56);
  });

  it("contains exactly 56 practice sets in UNIFIED_PRACTICE_SETS", () => {
    expect(Object.keys(UNIFIED_PRACTICE_SETS).length).toBe(56);
  });

  it("has exact skill breakdown: 12 vocab, 10 grammar, 10 listening, 8 speaking, 8 reading, 8 dialogue", () => {
    const counts: Record<string, number> = {};
    for (const s of sets) {
      counts[s.skill] = (counts[s.skill] || 0) + 1;
    }
    expect(counts).toEqual({
      vocabulary: 12,
      grammar: 10,
      listening: 10,
      speaking: 8,
      reading: 8,
      dialogue: 8,
    });

    const metaCounts: Record<string, number> = {};
    for (const m of Object.values(UNIFIED_PRACTICE_SETS)) {
      metaCounts[m.skill] = (metaCounts[m.skill] || 0) + 1;
    }
    expect(metaCounts).toEqual({
      vocabulary: 12,
      grammar: 10,
      listening: 10,
      speaking: 8,
      reading: 8,
      dialogue: 8,
    });
  });

  it("ensures 100% bidirectional ID match between bank and unified-metadata", () => {
    const bankIds = new Set(sets.map((s) => s.practice_set_id));
    const metaIds = new Set(Object.keys(UNIFIED_PRACTICE_SETS));

    for (const id of bankIds) {
      expect(metaIds.has(id)).toBe(true);
    }
    for (const id of metaIds) {
      expect(bankIds.has(id)).toBe(true);
    }
  });

  it("matches skill and unit_id for every single set", () => {
    const validUnitIds = new Set(UNIFIED_UNITS.map((u) => u.id));

    for (const s of sets) {
      const meta = UNIFIED_PRACTICE_SETS[s.practice_set_id];
      expect(meta).toBeDefined();
      expect(meta.skill).toBe(s.skill);
      expect(meta.unitId).toBe(s.unit_id);
      expect(validUnitIds.has(meta.unitId)).toBe(true);
    }
  });

  it("specifically verifies ps-read-01 and ps-vocab-02 accuracy", () => {
    const read01 = sets.find((s) => s.practice_set_id === "ps-read-01");
    expect(read01).toBeDefined();
    expect(read01?.skill).toBe("reading");
    expect(read01?.exercise_type).toBe("passage_qa");
    const metaRead01 = getPracticeSetMeta("ps-read-01");
    expect(metaRead01.skill).toBe("reading");
    expect(metaRead01.shortTitle).toContain("Đoạn văn tự giới thiệu");

    const vocab02 = sets.find((s) => s.practice_set_id === "ps-vocab-02");
    expect(vocab02).toBeDefined();
    expect(vocab02?.skill).toBe("vocabulary");
    expect(vocab02?.exercise_type).toBe("pinyin_selection");
    const metaVocab02 = getPracticeSetMeta("ps-vocab-02");
    expect(metaVocab02.skill).toBe("vocabulary");
    expect(metaVocab02.shortTitle).toContain("Pinyin");
  });
});
