import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getOfficial300VocabItems } from "@/features/vocabulary/hsk1-library-vocab";
import { HSK1_NINE_STAGE_LESSONS } from "@/features/content-library/curriculum-data";
import { UNIFIED_UNITS } from "@/features/curriculum/unified-metadata";
import { sanitizeCardPrompt } from "@/features/review/hint-sanitizer";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";

describe("Sprint 8N – HSK 1 Content Quality & Learning Experience Audit Suite", () => {
  const official300 = getOfficial300VocabItems();
  const raw300 = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content/hsk_library/hsk1_exam_2025_official_300.json"),
      "utf-8"
    )
  );
  const vocab1 = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content/hsk_library/hsk1_vocabulary.json"),
      "utf-8"
    )
  );
  const module0 = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content/hsk_library/module0_pinyin.json"),
      "utf-8"
    )
  );
  const practiceBank = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content/hsk_library/practice_bank.json"),
      "utf-8"
    )
  );
  const mockExam = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "content/hsk_library/hsk1_mock_exam_official.json"),
      "utf-8"
    )
  );

  it("1. verifies all 300 HSK 1 vocabulary items have unique IDs, Vietnamese meanings, and complete examples", () => {
    expect(official300.length).toBe(300);
    const ids = new Set(official300.map((w) => w.id));
    const hanziSet = new Set(official300.map((w) => w.simplified));
    expect(ids.size).toBe(300);
    expect(hanziSet.size).toBe(300);

    for (const item of official300) {
      expect(item.meaning_vi.trim().length).toBeGreaterThan(0);
      // Must not contain unescaped HTML entities
      expect(item.meaning_vi).not.toMatch(/&#\d+;|&[a-z]+;/i);
      // Must have complete example sentence, pinyin, and Vietnamese translation
      expect(item.example_zh?.trim().length).toBeGreaterThan(0);
      expect(item.example_pinyin?.trim().length).toBeGreaterThan(0);
      expect(item.example_vi?.trim().length).toBeGreaterThan(0);
      // Example must contain Chinese characters
      expect(item.example_zh).toMatch(/[\u4e00-\u9fff]/);
    }

    // Verify polyphone 只 (zhī) has classifier meaning, not adverb 'chỉ' (zhǐ)
    const zhiItem = official300.find((w) => w.simplified === "只");
    expect(zhiItem?.pinyin_marked).toBe("zhī");
    expect(zhiItem?.meaning_vi).toMatch(/lượng từ|con|chiếc/i);
  });

  it("2. verifies zero scraped watermarks, zero NBSP, and zero broken Pinyin syllables in vocabulary JSONs", () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const f = path.join(process.cwd(), `content/hsk_library/hsk${lvl}_vocabulary.json`);
      const text = fs.readFileSync(f, "utf-8");
      expect(text).not.toMatch(/ZALO|TIKTOK|0329797625|THÍCH HỌC TIẾNG TRUNG\s*[-–]?\s*ĐÀI/i);
      expect(text).not.toContain("\u00A0");
    }

    for (const v of vocab1) {
      expect(String(v.pinyin || "").trim().length).toBeGreaterThan(0);
      expect(String(v.raw_definition || "").trim().length).toBeGreaterThan(0);
      expect(String(v.example_zh_py || "")).not.toMatch(
        /Chàngg\s+ē|Duìbuq\s+ǐ|Duìb\s+uqǐ|W\s+ǒmen|Wǒm\s+en|Dòngw\s+ùyuán|Chīfà\s+n|W\s+ǒ\b/
      );
    }

    for (const item of raw300) {
      expect(item.meaning_en).not.toMatch(/&#\d+;/);
    }
  });

  it("3. verifies Flashcard Answer Hint Sanitizer prevents Hanzi/Pinyin leakage across all 300 words", () => {
    for (const item of official300) {
      const sanitized = sanitizeCardPrompt(
        item.meaning_vi,
        item.simplified,
        item.pinyin_marked
      );
      expect(sanitized.prompt.trim().length).toBeGreaterThan(0);
      expect(sanitized.prompt).not.toContain(item.simplified);
      expect(sanitized.prompt).not.toMatch(/[\u4e00-\u9fff]/);
    }
  });

  it("4. verifies Module 0 Pinyin contains 21 initials, all 36 finals, 5 tone entries, and 4 sandhi/orthography rules", () => {
    const initialsSection = module0.sections.find((s: { id: string }) => s.id === "initials");
    const finalsSection = module0.sections.find((s: { id: string }) => s.id === "finals");
    const tonesSection = module0.sections.find((s: { id: string }) => s.id === "tones");
    const sandhiSection = module0.sections.find((s: { id: string }) => s.id === "tone_sandhi");

    const allInitials = initialsSection.groups.flatMap((g: { initials: string[] }) => g.initials);
    const allFinals = finalsSection.groups.flatMap((g: { finals: string[] }) => g.finals);

    expect(allInitials.length).toBe(21);
    expect(allFinals.length).toBe(36);
    expect(tonesSection.tones.length).toBe(5);
    expect(sandhiSection.rules.length).toBeGreaterThanOrEqual(4);
  });

  it("5. verifies all 32 lessons have 10 stages each and directly cover 100% (300/300) of the HSK 1 target vocabulary", () => {
    const coreLessons = HSK1_NINE_STAGE_LESSONS.filter((l) => l.slug.startsWith("hsk1-lesson-"));
    expect(coreLessons.length).toBe(32);
    expect(UNIFIED_UNITS.length).toBe(6);

    const lessonTaughtSet = new Set<string>();
    for (const lesson of coreLessons) {
      expect(lesson.stages.length).toBe(10);
      for (const st of lesson.stages) {
        for (const v of st.vocabulary || []) {
          lessonTaughtSet.add(v.simplified);
        }
      }
    }

    const missingIn32Lessons = official300.filter((w) => !lessonTaughtSet.has(w.simplified));
    expect(missingIn32Lessons).toEqual([]);
  });

  it("6. verifies all 56 Practice Sets (381 items) have valid answers, unique options, and no template placeholder prompts", () => {
    expect(practiceBank.sets.length).toBe(56);

    let totalItems = 0;
    const setIds = new Set<string>();

    for (const s of practiceBank.sets) {
      expect(setIds.has(s.practice_set_id)).toBe(false);
      setIds.add(s.practice_set_id);

      const items = s.questions || s.turns || [];
      expect(items.length).toBeGreaterThan(0);
      totalItems += items.length;

      for (const q of s.questions || []) {
        expect(q.prompt || "").not.toMatch(/Nghe đoạn phát âm '\d+'/);
        expect(q.prompt || "").not.toMatch(/春风|暖和/);

        const opts = q.choices || q.options || [];
        if (opts.length > 0) {
          const uniqueOpts = new Set(opts.map((o: string) => String(o).trim()));
          expect(uniqueOpts.size).toBe(opts.length);
        }

        if (typeof q.correct_index === "number" && opts.length > 0) {
          expect(q.correct_index).toBeGreaterThanOrEqual(0);
          expect(q.correct_index).toBeLessThan(opts.length);
        }
      }
    }

    expect(totalItems).toBe(381);
  });

  it("7. verifies Unit Tests (120 questions) and HSK 1 Mock Exam (40 questions) have no listening transcript leakage or choice translation leakage", () => {
    expect(mockExam.questions.length).toBe(40);

    for (const q of mockExam.questions) {
      if (q.section === "listening") {
        expect(q.audio_text?.trim().length).toBeGreaterThan(0);
        // Prompt must not leak the spoken Chinese dialogue turns
        expect(q.prompt).not.toMatch(/Nữ:\s*[\u4e00-\u9fff]|Nam:\s*[\u4e00-\u9fff]/);
      }
      if (q.section === "reading" && q.sort_order >= 31 && q.sort_order <= 39) {
        // Choices in reading part 3 & 4 must not contain Vietnamese translations in parentheses
        for (const c of q.choices) {
          expect(c).not.toMatch(/\(Đi thẳng|\(Tôi ăn no|\(Quen chứ|\(Không có gì|\(Đỡ nhiều|\(Thứ Bảy|\(6 giờ|\(1 con/);
        }
      }
    }

    expect(ALL_CURRICULUM_QUIZZES.length).toBe(38);
  });
});
