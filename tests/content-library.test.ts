import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { findNineStageLesson, HSK1_NINE_STAGE_LESSONS } from "@/features/content-library/curriculum-data";

const libraryDir = path.resolve(process.cwd(), "content/hsk_library");

describe("Content Library Architecture & Curriculum Validation (HSK 1–5)", () => {
  it("loads and validates HSK 1-5 vocabulary files with exact counts", () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const filePath = path.join(libraryDir, `hsk${lvl}_vocabulary.json`);
      expect(fs.existsSync(filePath)).toBe(true);

      const items: Array<Record<string, unknown>> = JSON.parse(
        fs.readFileSync(filePath, "utf8"),
      );
      expect(items.length).toBeGreaterThan(450);

      const first = items[0];
      expect(first).toHaveProperty("simplified");
      expect(first).toHaveProperty("pinyin");
      expect(first).toHaveProperty("hsk_level", lvl);
      expect(first).toHaveProperty("status");
    }
  });

  it("verifies HSK 1 has exactly 500 items and includes the 4 previously skipped words", () => {
    const hsk1Path = path.join(libraryDir, "hsk1_vocabulary.json");
    const hsk1: Array<Record<string, unknown>> = JSON.parse(
      fs.readFileSync(hsk1Path, "utf8"),
    );
    expect(hsk1.length).toBe(500);

    const stts = new Set(hsk1.map((w) => w.stt));
    expect(stts.has(94)).toBe(true); // 多 (duō)
    expect(stts.has(109)).toBe(true); // 分 (fēn)
    expect(stts.has(216)).toBe(true); // 零 (líng)
    expect(stts.has(389)).toBe(true); // 下 (xià)

    const w94 = hsk1.find((w) => w.stt === 94);
    expect(w94?.simplified).toBe("多");
    const w109 = hsk1.find((w) => w.stt === 109);
    expect(w109?.simplified).toBe("分");
    const w216 = hsk1.find((w) => w.stt === 216);
    expect(w216?.simplified).toBe("零");
    const w389 = hsk1.find((w) => w.stt === 389);
    expect(w389?.simplified).toBe("下");
  });

  it("reconciles HSK 1 with strict mathematical set partition (|A ∩ B| + |A \\ B| = 300)", () => {
    const officialPath = path.join(libraryDir, "hsk1_exam_2025_official_300.json");
    expect(fs.existsSync(officialPath)).toBe(true);
    const official300: Array<{ hanzi: string; in_hsk1_500: boolean }> = JSON.parse(
      fs.readFileSync(officialPath, "utf8"),
    );
    expect(official300.length).toBe(300);

    // Uniqueness assertion: exactly 300 distinct hanzi
    const uniqueHanzi300 = new Set(official300.map((w) => w.hanzi));
    expect(uniqueHanzi300.size).toBe(300);

    const hsk1Path = path.join(libraryDir, "hsk1_vocabulary.json");
    const hsk1: Array<{ simplified: string; is_hsk_2025_core: boolean; hsk_2025_no: number | null }> = JSON.parse(
      fs.readFileSync(hsk1Path, "utf8"),
    );
    expect(hsk1.length).toBe(500);

    const uniqueHanzi500 = new Set(hsk1.map((w) => w.simplified));
    expect(uniqueHanzi500.size).toBe(496); // 500 entries minus 4 polyphones (地, 干, 还, 有)

    // Mathematical set partition
    const intersection = [...uniqueHanzi300].filter((h) => uniqueHanzi500.has(h));
    const onlyIn300 = [...uniqueHanzi300].filter((h) => !uniqueHanzi500.has(h));
    expect(intersection.length).toBe(262);
    expect(onlyIn300.length).toBe(38);
    // Strict mathematical identity: |A ∩ B| + |A \ B| = |A|
    expect(intersection.length + onlyIn300.length).toBe(300);

    // Catalog entry counts in 500 standard:
    const coreEntries2025 = hsk1.filter((w) => w.is_hsk_2025_core === true);
    const extendedEntries2021 = hsk1.filter((w) => w.is_hsk_2025_core === false);
    expect(coreEntries2025.length).toBe(264);
    expect(extendedEntries2021.length).toBe(236);
    expect(coreEntries2025.length + extendedEntries2021.length).toBe(500);

    // Verify word at end of alphabet like '做' (STT 499) is correctly identified as core 2025 (No. 299)
    const zuo = hsk1.find((w) => w.simplified === "做");
    expect(zuo?.is_hsk_2025_core).toBe(true);
    expect(zuo?.hsk_2025_no).toBe(299);

    // Verify reconciliation report exists with exact 38 supplemental words and correct math
    const reportPath = path.join(libraryDir, "hsk_mapping_reconciliation.json");
    expect(fs.existsSync(reportPath)).toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    expect(report.dataset_300_total).toBe(300);
    expect(report.mathematical_set_partition.intersection_A_and_B).toBe(262);
    expect(report.mathematical_set_partition.difference_A_minus_B_only_in_2025).toBe(38);
    expect(report.entry_level_counts_in_500.entries_matching_2025).toBe(264);
    expect(report.entry_level_counts_in_500.entries_not_in_2025).toBe(236);
  });

  it("preserves 43 out of 44 pilot words in the HSK 1 vocabulary list", () => {
    const pilotPath = path.resolve(
      process.cwd(),
      "content/pilot-hsk1/v1/vocabulary.json",
    );
    const pilot: { simplified: string }[] = JSON.parse(
      fs.readFileSync(pilotPath, "utf8"),
    );

    const hsk1Path = path.join(libraryDir, "hsk1_vocabulary.json");
    const hsk1: { simplified: string }[] = JSON.parse(
      fs.readFileSync(hsk1Path, "utf8"),
    );

    const hsk1Set = new Set(hsk1.map((w) => w.simplified));
    const matched = pilot.filter((w) => hsk1Set.has(w.simplified));

    // 43 HSK words match; 1 is supplemental ("越南")
    expect(matched.length).toBe(43);
    const supplemental = pilot.find((w) => !hsk1Set.has(w.simplified));
    expect(supplemental?.simplified).toBe("越南");
  });

  it("loads dialogues.json and enforces draft restricted server-only policy", () => {
    const filePath = path.join(libraryDir, "dialogues.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const dialogues: Array<Record<string, unknown>> = JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    );
    expect(dialogues.length).toBe(100);

    const first = dialogues[0];
    const lessonNum = first.lesson_number ?? first.lessonNumber;
    const titleSimp = first.title_simplified ?? first.titleSimplified;
    expect(lessonNum).toBe(1);
    expect(titleSimp).toBe("自我介绍");

    // Must be marked DRAFT_RESTRICTED and SERVER_DRAFT_ONLY
    expect(first.quality_status).toBe("DRAFT_RESTRICTED");
    expect(first.client_bundling).toBe("SERVER_DRAFT_ONLY");
    expect(first.verification_status).toBe("UNVERIFIED_AUTOMATED");
  });

  it("validates Module 0 Pinyin Foundation structure", () => {
    const filePath = path.join(libraryDir, "module0_pinyin.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const module0 = JSON.parse(fs.readFileSync(filePath, "utf8"));
    expect(module0.id).toBe("module-0-pinyin-foundation");
    expect(module0.sections.length).toBe(4);

    const initialsSec = module0.sections.find(
      (s: { id: string }) => s.id === "initials",
    );
    expect(initialsSec).toBeDefined();

    const finalsSec = module0.sections.find(
      (s: { id: string }) => s.id === "finals",
    );
    expect(finalsSec).toBeDefined();

    const tonesSec = module0.sections.find(
      (s: { id: string }) => s.id === "tones",
    );
    expect(tonesSec.tones.length).toBe(5); // 4 tones + neutral
  });

  it("validates 9-stage complete curriculum for all 28 lessons and checkpoints", () => {
    expect(HSK1_NINE_STAGE_LESSONS.length).toBe(28);

    const l1 = findNineStageLesson("hsk1-lesson-01");
    const l5 = findNineStageLesson("hsk1-lesson-05");
    const l6 = findNineStageLesson("hsk1-lesson-06");
    const l7 = findNineStageLesson("hsk1-lesson-07");
    const l8 = findNineStageLesson("hsk1-lesson-08");
    const l9 = findNineStageLesson("hsk1-lesson-09");
    const l10 = findNineStageLesson("hsk1-lesson-10");
    const l26 = findNineStageLesson("hsk1-lesson-26");
    const cp5 = findNineStageLesson("hsk1-checkpoint-05");

    expect(l1).toBeDefined();
    expect(l5).toBeDefined();
    expect(l6).toBeDefined();
    expect(l7).toBeDefined();
    expect(l8).toBeDefined();
    expect(l9).toBeDefined();
    expect(l10).toBeDefined();
    expect(l26).toBeDefined();
    expect(cp5).toBeDefined();

    for (const lesson of HSK1_NINE_STAGE_LESSONS) {
      expect(lesson.stages.length).toBe(10); // 0_warmup to 9_srs_review
      const stageNames = lesson.stages.map((s) => s.stage);
      expect(stageNames).toContain("0_warmup");
      expect(stageNames).toContain("1_vocab_learn");
      expect(stageNames).toContain("2_vocab_practice");
      expect(stageNames).toContain("3_grammar_learn");
      expect(stageNames).toContain("4_grammar_practice");
      expect(stageNames).toContain("5_dialogue_interactive");
      expect(stageNames).toContain("6_listening_speaking");
      expect(stageNames).toContain("7_reading_comprehension");
      expect(stageNames).toContain("8_mini_quiz");
      expect(stageNames).toContain("9_srs_review");
    }
  });
});
