import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";
import {
  QUESTION_REVISION_REGISTRY,
  CURRENT_ASSESSMENT_KEY_REVISION,
  getQuestionRevisionEntry,
  getV1CorrectIndex,
  getV2CorrectIndex,
  translateV2AnswersToV1,
} from "@/features/quizzes/quiz-revisions";
import {
  getOfficial300VocabItems,
  findOfficial300VocabItem,
  PILOT_V1_VOCAB_ID_BY_HANZI,
} from "@/features/vocabulary/hsk1-library-vocab";
import { getUnitTestDefinition } from "@/features/exam/unit-test-actions";

describe("Sprint 8O – Assessment Integrity (428 Questions) & Vocabulary Catalog Synchronization (300 + 44 Pilot)", () => {
  const unitTests = [1, 2, 3, 4, 5, 6].map((n) =>
    JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), `content/hsk_library/unit_tests/hsk1_unit_test_0${n}.json`),
        "utf-8"
      )
    )
  );

  it("1. audits all 428 questions (308 Mini Quiz + 120 Unit Test) and verifies exact 25% [107, 107, 107, 107] Revision 2 balance", () => {
    expect(CURRENT_ASSESSMENT_KEY_REVISION).toBe(2);
    expect(ALL_CURRICULUM_QUIZZES.length).toBe(38);
    expect(unitTests.length).toBe(6);

    const mqDist = [0, 0, 0, 0];
    let mqCount = 0;

    for (const qz of ALL_CURRICULUM_QUIZZES) {
      const perQuizDist = [0, 0, 0, 0];
      const seq: number[] = [];
      for (const q of qz.questions) {
        mqCount++;
        const idx = qz.answerKeys[q.id].correct_index;
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(q.choices.length);
        mqDist[idx]++;
        perQuizDist[idx]++;
        seq.push(idx);
      }
      // Every 8-question quiz has exact [2, 2, 2, 2]
      if (qz.questions.length === 8) {
        expect(perQuizDist).toEqual([2, 2, 2, 2]);
      }
      // No 3 consecutive identical answers in any quiz
      for (let i = 2; i < seq.length; i++) {
        expect(seq[i] === seq[i - 1] && seq[i] === seq[i - 2]).toBe(false);
      }
    }

    expect(mqCount).toBe(308);
    expect(mqDist).toEqual([77, 77, 77, 77]);

    const utDist = [0, 0, 0, 0];
    let utCount = 0;
    for (const ut of unitTests) {
      const perUtDist = [0, 0, 0, 0];
      const seq: number[] = [];
      for (const q of ut.questions) {
        utCount++;
        utDist[q.correct_index]++;
        perUtDist[q.correct_index]++;
        seq.push(q.correct_index);
      }
      expect(perUtDist).toEqual([5, 5, 5, 5]);
      for (let i = 2; i < seq.length; i++) {
        expect(seq[i] === seq[i - 1] && seq[i] === seq[i - 2]).toBe(false);
      }
    }

    expect(utCount).toBe(120);
    expect(utDist).toEqual([30, 30, 30, 30]);

    const combinedDist = mqDist.map((c, i) => c + utDist[i]);
    expect(combinedDist).toEqual([107, 107, 107, 107]);
  });

  it("2. verifies semantic invariance across all 428 questions: correct answer text and distractors are 100% preserved after permutation", () => {
    const entries = Object.values(QUESTION_REVISION_REGISTRY);
    expect(entries.length).toBe(428);

    for (const entry of entries) {
      // Correct choice text in v1 equals correct choice text in v2
      const v1CorrectText = entry.v1Choices[entry.v1CorrectIndex];
      const v2CorrectText = entry.v2Choices[entry.v2CorrectIndex];
      expect(v2CorrectText).toBe(v1CorrectText);

      // Set of choices is identical and has no duplicates
      expect([...entry.v2Choices].sort()).toEqual([...entry.v1Choices].sort());
      expect(new Set(entry.v2Choices).size).toBe(entry.v2Choices.length);

      // Bijection check on v2ToV1Map
      expect(entry.v2ToV1Map.length).toBe(entry.v2Choices.length);
      expect(entry.v2ToV1Map[entry.v2CorrectIndex]).toBe(entry.v1CorrectIndex);
      for (let v2Idx = 0; v2Idx < entry.v2Choices.length; v2Idx++) {
        const v1Idx = entry.v2ToV1Map[v2Idx];
        expect(entry.v2Choices[v2Idx]).toBe(entry.v1Choices[v1Idx]);
      }
    }

    // Verify the 6 two-choice True/False Unit Test questions are normalized to ["Đúng", "Sai"] with correct_index = 1
    const twoChoiceIds = [
      ["hsk1-unit-test-01", "ut1-q18"],
      ["hsk1-unit-test-02", "ut2-q19"],
      ["hsk1-unit-test-03", "ut3-q20"],
      ["hsk1-unit-test-04", "ut4-q19"],
      ["hsk1-unit-test-05", "ut5-q18"],
      ["hsk1-unit-test-06", "ut6-q19"],
    ];
    for (const [slug, qId] of twoChoiceIds) {
      const entry = getQuestionRevisionEntry(slug, qId);
      expect(entry).toBeDefined();
      expect(entry?.v1Choices).toEqual(["Sai", "Đúng"]);
      expect(entry?.v1CorrectIndex).toBe(0);
      expect(entry?.v2Choices).toEqual(["Đúng", "Sai"]);
      expect(entry?.v2CorrectIndex).toBe(1);
    }
  });

  it("3. verifies client/server grading parity and v2->v1 translation compatibility for pre-cutover and post-cutover databases", () => {
    for (const qz of ALL_CURRICULUM_QUIZZES) {
      const allCorrectV2: Record<string, number> = {};
      for (const q of qz.questions) {
        allCorrectV2[q.id] = qz.answerKeys[q.id].correct_index;
      }

      const translatedToV1 = translateV2AnswersToV1(qz.slug, allCorrectV2);
      for (const q of qz.questions) {
        expect(translatedToV1[q.id]).toBe(getV1CorrectIndex(qz.slug, q.id));
        expect(allCorrectV2[q.id]).toBe(getV2CorrectIndex(qz.slug, q.id));
      }
    }

    for (const ut of unitTests) {
      const allCorrectV2: Record<string, number> = {};
      for (const q of ut.questions) {
        allCorrectV2[q.id] = q.correct_index;
      }
      const translatedToV1 = translateV2AnswersToV1(ut.slug, allCorrectV2);
      for (const q of ut.questions) {
        expect(translatedToV1[q.id]).toBe(getV1CorrectIndex(ut.slug, q.id));
      }
    }
  });

  it("4. verifies Migration 0011 SQL matches all 1,284 (quiz_slug, question_id) Revision 2 and Revision 1 answer keys and preserves 2-arg RPC signature", () => {
    const mig011 = fs.readFileSync(
      path.join(process.cwd(), "supabase/migrations/202611200011_sprint8o_assessment_permutation.sql"),
      "utf-8"
    );

    expect(mig011).toContain("add column if not exists key_revision integer not null default 1");
    expect(mig011).toContain("alter column key_revision set default 2");
    expect(mig011).toContain("add column if not exists correct_index_v1 integer");
    expect(mig011).toContain("create or replace function private.submit_curriculum_quiz_attempt(\n  p_attempt_id uuid,\n  p_answers jsonb\n)");
    expect(mig011).toContain("create or replace function public.submit_curriculum_quiz_attempt(\n  p_attempt_id uuid,\n  p_answers jsonb\n)");

    for (const entry of Object.values(QUESTION_REVISION_REGISTRY)) {
      for (const slug of [entry.lessonId, entry.quizSlug, entry.quizId]) {
        expect(mig011).toContain(
          `('${slug}', '${entry.questionId}', ${entry.v2CorrectIndex}, ${entry.v1CorrectIndex}, 2)`
        );
      }
    }
  });

  it("5. verifies getUnitTestDefinition strips correct_index and explanation_vi from client payloads (no answer-key leakage)", async () => {
    for (let u = 1; u <= 6; u++) {
      const def = await getUnitTestDefinition(u);
      expect(def.questions.length).toBe(20);
      for (const q of def.questions) {
        expect(q.correct_index).toBeUndefined();
        expect(q.explanation_vi).toBeUndefined();
        expect(q.choices.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("6. verifies 300 Canonical Vocabulary items preserve all 43 Pilot v1 UUIDs as effective IDs and resolve by Pilot UUID, MD5 UUID, and Hanzi", () => {
    const all300 = getOfficial300VocabItems();
    expect(all300.length).toBe(300);

    const effectiveIds = new Set<string>();
    const sourceIds = new Set<string>();
    let pilotMatchedCount = 0;

    for (const item of all300) {
      expect(effectiveIds.has(item.id)).toBe(false);
      effectiveIds.add(item.id);

      expect(sourceIds.has(item.canonical_source_id)).toBe(false);
      sourceIds.add(item.canonical_source_id);

      if (item.pilot_v1_id) {
        pilotMatchedCount++;
        expect(item.id).toBe(item.pilot_v1_id);
        expect(item.pilot_v1_id).toBe(PILOT_V1_VOCAB_ID_BY_HANZI[item.simplified]);
      } else {
        expect(item.id).toBe(item.canonical_source_id);
      }

      // Cross-lookup by effective ID, canonical MD5 source ID, and simplified Hanzi must return the exact same item
      expect(findOfficial300VocabItem(item.id)).toBe(item);
      expect(findOfficial300VocabItem(item.canonical_source_id)).toBe(item);
      expect(findOfficial300VocabItem(item.simplified)).toBe(item);
    }

    expect(pilotMatchedCount).toBe(43);
    expect(Object.keys(PILOT_V1_VOCAB_ID_BY_HANZI).length).toBe(43);

    // Check polyphone 只 (zhī) and tone-sandhi 不 (bù)
    const zhi = findOfficial300VocabItem("只");
    expect(zhi?.pinyin_marked).toBe("zhī");
    expect(zhi?.meaning_vi).toBe(
      "con, chiếc (lượng từ cho động vật); phân biệt với phó từ zhǐ (chỉ)"
    );

    const bu = findOfficial300VocabItem("不");
    expect(bu?.id).toBe("df6876e3-e013-584d-b584-64c5d6f29048");
    expect(bu?.meaning_vi).toBe(
      "Không (phó từ phủ định); đọc biến điệu là bú trước thanh 4"
    );
  });

  it("7. verifies Migration 0012 SQL preserves all 43 Pilot UUIDs in place, upserts 257 new words, and contains zero DELETE/TRUNCATE statements", () => {
    const mig012 = fs.readFileSync(
      path.join(process.cwd(), "supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql"),
      "utf-8"
    );

    expect(mig012).not.toMatch(/\bDELETE\s+FROM\b|\bTRUNCATE\b/i);
    expect(mig012).toContain("create or replace function private.sync_hsk1_canonical_vocabulary_catalog");
    expect(mig012).toContain("revoke all on function private.sync_hsk1_canonical_vocabulary_catalog(uuid) from public, anon, authenticated;");

    for (const item of getOfficial300VocabItems()) {
      expect(mig012).toContain(`'${item.id}'::uuid`);
    }
  });
});
