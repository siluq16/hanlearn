import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type {
  LibraryVocabulary,
  LibraryDialogue,
  LibraryExercise,
  LessonContentMapping,
} from "@/features/content-library/types";

const libraryDir = path.resolve(process.cwd(), "content/hsk_library");

describe("Content Library Architecture (HSK 1–5)", () => {
  it("loads and validates HSK 1-5 vocabulary files", () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const filePath = path.join(libraryDir, `hsk${lvl}_vocabulary.json`);
      expect(fs.existsSync(filePath)).toBe(true);

      const items: LibraryVocabulary[] = JSON.parse(
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

  it("preserves 43 out of 44 pilot words in the HSK 1 3.0 vocabulary list", () => {
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

  it("loads dialogues.json with 100 lessons and validated turns", () => {
    const filePath = path.join(libraryDir, "dialogues.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const dialogues: LibraryDialogue[] = JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    );
    expect(dialogues.length).toBe(100);

    const first = dialogues[0] as unknown as Record<string, unknown>;
    const lessonNum = first.lesson_number ?? first.lessonNumber;
    const titleSimp = first.title_simplified ?? first.titleSimplified;
    expect(lessonNum).toBe(1);
    expect(titleSimp).toBe("自我介绍");
    const turns = first.turns as Array<Record<string, unknown>>;
    expect(turns.length).toBeGreaterThan(3);

    // Each turn must have speaker, simplified hanzi, and pinyin
    expect(turns[0].speaker).toBe("王");
    const turnSimp = turns[0].hanzi_simplified ?? turns[0].hanzi;
    expect(turnSimp).toContain("您好");
    expect(turns[0].pinyin).toBeDefined();
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

  it("validates the 9-stage HSK 1 Lesson 1 curriculum map", () => {
    const filePath = path.join(libraryDir, "hsk1_lesson_01.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const lesson = JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    ) as { id: string; hsk_level?: number; hskLevel?: number; stages: Array<{ stage: string }> };
    expect(lesson.id).toBe("lesson-hsk1-01");
    const hskLvl = lesson.hsk_level ?? lesson.hskLevel;
    expect(hskLvl).toBe(1);
    expect(lesson.stages.length).toBe(10); // 0_warmup to 9_srs_review

    const stageNames = lesson.stages.map((s: { stage: string }) => s.stage);
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
  });
});
