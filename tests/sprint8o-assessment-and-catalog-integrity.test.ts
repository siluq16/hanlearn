import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  ALL_CURRICULUM_QUIZZES,
  findCurriculumQuiz,
} from "@/features/quizzes/curriculum-quizzes";
import {
  QUESTION_REVISION_REGISTRY,
  CURRENT_ASSESSMENT_KEY_REVISION,
  clearPinnedAttemptRevisionsInMemory,
  getConfiguredAssessmentRevision,
  getQuestionRevisionEntry,
  getV1CorrectIndex,
  getV2CorrectIndex,
  resolveAttemptKeyRevision,
  translateV1AnswersToV2,
  translateV2AnswersToV1,
} from "@/features/quizzes/quiz-revisions";
import {
  getOfficial300VocabItems,
  findOfficial300VocabItem,
  PILOT_V1_VOCAB_ID_BY_HANZI,
} from "@/features/vocabulary/hsk1-library-vocab";

type SimAttemptRow = {
  id: string;
  user_id: string;
  quiz_id: string;
  lesson_id: string;
  started_at: string;
  submitted_at: string | null;
  correct_count: number | null;
  question_count: number | null;
  passed: boolean | null;
  answers: Record<string, number> | null;
  key_revision?: number;
};

/**
 * In-memory PostgreSQL + Supabase simulator that faithfully models:
 * - Old DB (pre-Migration 0011): lacks `key_revision` column on `curriculum_quiz_attempts` (selecting/inserting `key_revision` returns 42703 error) and grades via V1 keys only.
 * - New DB (post-Migration 0011): has `key_revision` column with DEFAULT 1 (omitting `key_revision` on insert stamps `key_revision = 1`), stores both `correct_index` (V2) and `correct_index_v1` (V1), and grades `key_revision = 1` against V1 and `key_revision = 2` against V2.
 */
function createSimulatedAssessmentEnv(initialDbMode: "old_db" | "new_db") {
  let dbMode = initialDbMode;
  const userId = "e0000000-0000-4000-8000-000000000001";
  const attemptsTable = new Map<string, SimAttemptRow>();
  let userMetadata: Record<string, unknown> = {};

  function resolveQuizQuestions(slugOrId: string) {
    const entries = Object.values(QUESTION_REVISION_REGISTRY).filter(
      (e) => e.quizSlug === slugOrId || e.lessonId === slugOrId || e.quizId === slugOrId
    );
    return entries;
  }

  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: userId, user_metadata: userMetadata } },
        error: null,
      }),
      updateUser: async ({ data }: { data: Record<string, unknown> }) => {
        userMetadata = { ...userMetadata, ...data };
        return { data: { user: { id: userId, user_metadata: userMetadata } }, error: null };
      },
    },
    from: (table: string) => {
      if (table !== "curriculum_quiz_attempts") {
        throw new Error(`Unexpected table ${table}`);
      }
      return {
        insert: async (payload: Record<string, unknown>) => {
          if (dbMode === "old_db" && "key_revision" in payload) {
            return {
              data: null,
              error: {
                code: "42703",
                message: 'column "key_revision" of relation "curriculum_quiz_attempts" does not exist',
              },
            };
          }
          const id = String(payload.id);
          const row: SimAttemptRow = {
            id,
            user_id: userId,
            quiz_id: String(payload.quiz_id),
            lesson_id: String(payload.lesson_id),
            started_at: String(payload.started_at || new Date().toISOString()),
            submitted_at: (payload.submitted_at as string | null) ?? null,
            correct_count: (payload.correct_count as number | null) ?? null,
            question_count: Number(payload.question_count ?? 0),
            passed: (payload.passed as boolean | null) ?? null,
            answers: (payload.answers as Record<string, number> | null) ?? null,
            ...(dbMode === "new_db"
              ? {
                  // Trigger private.curriculum_quiz_attempts_stamp(): coalesce(new.key_revision, 1)
                  key_revision:
                    typeof payload.key_revision === "number" ? payload.key_revision : 1,
                }
              : {}),
          };
          attemptsTable.set(id, row);
          return { data: row, error: null };
        },
        update: (patch: Record<string, unknown>) => ({
          eq: (col1: string, val1: string) => ({
            eq: async (col2: string, val2: string) => {
              const row = attemptsTable.get(val1);
              if (!row || (col2 === "user_id" && row.user_id !== val2)) {
                return { data: null, error: { code: "PT404", message: "Not found" } };
              }
              Object.assign(row, patch);
              return { data: row, error: null };
            },
          }),
        }),
        select: (cols: string) => {
          const requestsKeyRevision = cols.includes("key_revision");
          const filters: Array<[string, string]> = [];
          const builder = {
            eq: (col: string, val: string) => {
              filters.push([col, val]);
              return builder;
            },
            order: async () => {
              if (dbMode === "old_db" && requestsKeyRevision) {
                return {
                  data: null,
                  error: {
                    code: "42703",
                    message: 'column "key_revision" does not exist',
                  },
                };
              }
              const rows = [...attemptsTable.values()]
                .filter((r) =>
                  filters.every(([c, v]) => (r as unknown as Record<string, unknown>)[c] === v)
                )
                .map((r) => {
                  if (dbMode === "old_db") {
                    const copy = { ...r };
                    delete copy.key_revision;
                    return copy;
                  }
                  return { ...r };
                });
              return { data: rows, error: null };
            },
            maybeSingle: async () => {
              if (dbMode === "old_db" && requestsKeyRevision) {
                return {
                  data: null,
                  error: {
                    code: "42703",
                    message: 'column "key_revision" does not exist',
                  },
                };
              }
              const found = [...attemptsTable.values()].find((r) =>
                filters.every(([c, v]) => (r as unknown as Record<string, unknown>)[c] === v)
              );
              if (!found) return { data: null, error: null };
              if (dbMode === "old_db") {
                const copy = { ...found };
                delete copy.key_revision;
                return { data: copy, error: null };
              }
              return { data: { ...found }, error: null };
            },
          };
          return builder;
        },
      };
    },
    rpc: async (fnName: string, args: { p_attempt_id: string; p_answers: Record<string, number> }) => {
      if (fnName !== "submit_curriculum_quiz_attempt") {
        throw new Error(`Unexpected RPC ${fnName}`);
      }
      const row = attemptsTable.get(args.p_attempt_id);
      if (!row || row.user_id !== userId) {
        return { data: null, error: { code: "PT404", message: "ATTEMPT_NOT_FOUND" } };
      }
      if (row.submitted_at) {
        return { data: null, error: { code: "PT409", message: "ALREADY_SUBMITTED" } };
      }
      const questions = resolveQuizQuestions(row.lesson_id).length
        ? resolveQuizQuestions(row.lesson_id)
        : resolveQuizQuestions(row.quiz_id);
      if (!questions.length) {
        return { data: null, error: { code: "PT404", message: "QUIZ_KEYS_NOT_FOUND" } };
      }

      // Old DB grades strictly against V1 keys.
      // New DB grades against V1 if coalesce(row.key_revision, 1) === 1, else V2.
      const effectiveRev = dbMode === "old_db" ? 1 : (row.key_revision ?? 1);
      let correct = 0;
      for (const q of questions) {
        const expected = effectiveRev === 1 ? q.v1CorrectIndex : q.v2CorrectIndex;
        if (args.p_answers[q.questionId] === expected) {
          correct++;
        }
      }
      const total = questions.length;
      const passed = correct * 100 >= total * 80;
      row.submitted_at = new Date().toISOString();
      row.correct_count = correct;
      row.question_count = total;
      row.passed = passed;
      row.answers = { ...args.p_answers };
      if (dbMode === "new_db") {
        row.key_revision = effectiveRev;
      }
      return { data: { ...row }, error: null };
    },
  };

  return {
    userId,
    supabase,
    attemptsTable,
    getUser: () => ({ id: userId, user_metadata: userMetadata }),
    upgradeDbToMigration0011: () => {
      dbMode = "new_db";
      // Migration 0011: ADD COLUMN key_revision integer not null default 1
      for (const row of attemptsTable.values()) {
        if (row.key_revision === undefined) {
          row.key_revision = 1;
        }
      }
    },
    simulateOldAppStartAttempt: async (lessonIdOrSlug: string) => {
      const qz = findCurriculumQuiz(lessonIdOrSlug);
      const id = randomUUID();
      // Old App inserts WITHOUT key_revision
      await supabase.from("curriculum_quiz_attempts").insert({
        id,
        user_id: userId,
        quiz_id: qz ? qz.quiz.id : id,
        lesson_id: qz ? qz.lessonId : lessonIdOrSlug,
        started_at: new Date().toISOString(),
        question_count: qz ? qz.questions.length : 20,
      });
      return id;
    },
    simulateOldAppSubmitAttempt: async (attemptId: string, answersV1: Record<string, number>) => {
      return supabase.rpc("submit_curriculum_quiz_attempt", {
        p_attempt_id: attemptId,
        p_answers: answersV1,
      });
    },
  };
}

let activeSimEnv: ReturnType<typeof createSimulatedAssessmentEnv> | null = null;

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/learning", () => ({
  learningEnabled: () => true,
}));

vi.mock("@/features/courses/queries", () => ({
  invalidateLearnerSnapshot: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireLearner: async () => {
    if (!activeSimEnv) {
      throw new Error("Simulated environment not initialized");
    }
    return {
      user: activeSimEnv.getUser(),
      supabase: activeSimEnv.supabase,
    };
  },
}));

import { startQuiz, submitQuiz, refreshQuiz } from "@/features/quizzes/actions";
import { getQuizView } from "@/features/quizzes/queries";
import {
  getUnitTestDefinition,
  startUnitTestAction,
  submitUnitTestAction,
} from "@/features/exam/unit-test-actions";

describe("Sprint 8O – Pre-Cloud Migration Safety Gate: Assessment Integrity, 4-State Version Skew, Rollback & Catalog Sync", () => {
  const unitTests = [1, 2, 3, 4, 5, 6].map((n) =>
    JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), `content/hsk_library/unit_tests/hsk1_unit_test_0${n}.json`),
        "utf-8"
      )
    )
  );

  beforeEach(() => {
    clearPinnedAttemptRevisionsInMemory();
    delete process.env.HANLEARN_ASSESSMENT_KEY_REVISION;
  });

  afterEach(() => {
    clearPinnedAttemptRevisionsInMemory();
    delete process.env.HANLEARN_ASSESSMENT_KEY_REVISION;
    activeSimEnv = null;
  });

  it("1. validates exact per-quiz question counts (36x8 + 2x10 = 308 Mini Quiz + 6x20 = 120 Unit Test = 428) and per-quiz A/B/C/D distributions", () => {
    expect(CURRENT_ASSESSMENT_KEY_REVISION).toBe(2);
    expect(ALL_CURRICULUM_QUIZZES.length).toBe(38);
    expect(unitTests.length).toBe(6);

    const mqDist = [0, 0, 0, 0];
    let mqCount = 0;
    let eightQuestionQuizzes = 0;
    let tenQuestionQuizzes = 0;
    const seenQuestionIds = new Set<string>();

    for (const qz of ALL_CURRICULUM_QUIZZES) {
      const perQuizDist = [0, 0, 0, 0];
      const seq: number[] = [];
      for (const q of qz.questions) {
        expect(seenQuestionIds.has(`${qz.slug}::${q.id}`)).toBe(false);
        seenQuestionIds.add(`${qz.slug}::${q.id}`);
        mqCount++;
        const idx = qz.answerKeys[q.id].correct_index;
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(q.choices.length);
        mqDist[idx]++;
        perQuizDist[idx]++;
        seq.push(idx);
      }
      if (qz.questions.length === 8) {
        eightQuestionQuizzes++;
        // Every one of the 36 8-question quizzes has exact [2, 2, 2, 2]
        expect(perQuizDist).toEqual([2, 2, 2, 2]);
      } else if (qz.questions.length === 10) {
        tenQuestionQuizzes++;
        // The 2 10-question checkpoints have complementary [3, 3, 2, 2] and [2, 2, 3, 3]
        expect(
          JSON.stringify(perQuizDist) === JSON.stringify([3, 3, 2, 2]) ||
            JSON.stringify(perQuizDist) === JSON.stringify([2, 2, 3, 3])
        ).toBe(true);
      } else {
        throw new Error(`Unexpected quiz question count: ${qz.slug} has ${qz.questions.length}`);
      }
      // No 3 consecutive identical answers in any quiz
      for (let i = 2; i < seq.length; i++) {
        expect(seq[i] === seq[i - 1] && seq[i] === seq[i - 2]).toBe(false);
      }
    }

    expect(eightQuestionQuizzes).toBe(36);
    expect(tenQuestionQuizzes).toBe(2);
    expect(eightQuestionQuizzes * 8 + tenQuestionQuizzes * 10).toBe(308);
    expect(mqCount).toBe(308);
    expect(mqDist).toEqual([77, 77, 77, 77]);

    const utDist = [0, 0, 0, 0];
    let utCount = 0;
    for (const ut of unitTests) {
      expect(ut.questions.length).toBe(20);
      const perUtDist = [0, 0, 0, 0];
      const seq: number[] = [];
      for (const q of ut.questions) {
        expect(seenQuestionIds.has(`${ut.slug}::${q.id}`)).toBe(false);
        seenQuestionIds.add(`${ut.slug}::${q.id}`);
        utCount++;
        expect(q.correct_index).toBeGreaterThanOrEqual(0);
        expect(q.correct_index).toBeLessThan(q.choices.length);
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
    expect(seenQuestionIds.size).toBe(428);

    const combinedDist = mqDist.map((c, i) => c + utDist[i]);
    expect(combinedDist).toEqual([107, 107, 107, 107]);
  });

  it("2. verifies semantic invariance, bijective V1<->V2 translation, and valid correct_index on all 6 True/False questions", () => {
    const entries = Object.values(QUESTION_REVISION_REGISTRY);
    expect(entries.length).toBe(428);

    for (const entry of entries) {
      const v1CorrectText = entry.v1Choices[entry.v1CorrectIndex];
      const v2CorrectText = entry.v2Choices[entry.v2CorrectIndex];
      expect(v2CorrectText).toBe(v1CorrectText);

      expect([...entry.v2Choices].sort()).toEqual([...entry.v1Choices].sort());
      expect(new Set(entry.v2Choices).size).toBe(entry.v2Choices.length);

      expect(entry.v2ToV1Map.length).toBe(entry.v2Choices.length);
      expect(entry.v2ToV1Map[entry.v2CorrectIndex]).toBe(entry.v1CorrectIndex);
      for (let v2Idx = 0; v2Idx < entry.v2Choices.length; v2Idx++) {
        const v1Idx = entry.v2ToV1Map[v2Idx];
        expect(entry.v2Choices[v2Idx]).toBe(entry.v1Choices[v1Idx]);
      }
    }

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
      expect(entry!.v2CorrectIndex).toBeLessThan(entry!.v2Choices.length);
    }
  });

  it("3. verifies exact 1:3 mapping between 428 questions and 1,284 rows in Migration 0011 with DEFAULT key_revision = 1 safety", () => {
    const mig011 = fs.readFileSync(
      path.join(process.cwd(), "supabase/migrations/202611200011_sprint8o_assessment_permutation.sql"),
      "utf-8"
    );

    expect(mig011).toContain("add column if not exists key_revision integer not null default 1");
    expect(mig011).toContain("alter column key_revision set default 1");
    expect(mig011).not.toContain("alter column key_revision set default 2");
    expect(mig011).toContain("new.key_revision := coalesce(new.key_revision, 1);");
    expect(mig011).toContain("v_effective_revision := coalesce(v_attempt.key_revision, 1);");

    const rowRegex = /\('([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*2\)/g;
    const sqlTuples = new Map<string, { v2: number; v1: number }>();
    let match: RegExpExecArray | null;
    while ((match = rowRegex.exec(mig011)) !== null) {
      const [, slug, qId, v2Str, v1Str] = match;
      const key = `${slug}::${qId}`;
      expect(sqlTuples.has(key)).toBe(false);
      sqlTuples.set(key, { v2: Number(v2Str), v1: Number(v1Str) });
    }

    expect(sqlTuples.size).toBe(1284);

    for (const entry of Object.values(QUESTION_REVISION_REGISTRY)) {
      const aliases = new Set([entry.lessonId, entry.quizSlug, entry.quizId]);
      expect(aliases.size).toBe(3);
      for (const alias of aliases) {
        const tuple = sqlTuples.get(`${alias}::${entry.questionId}`);
        expect(tuple).toEqual({
          v2: entry.v2CorrectIndex,
          v1: entry.v1CorrectIndex,
        });
      }
    }
  });

  it("4. verifies round-trip V2->V1 and V1->V2 answer translation across all 44 assessments", () => {
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
      const roundTripV2 = translateV1AnswersToV2(qz.slug, translatedToV1);
      expect(roundTripV2).toEqual(allCorrectV2);
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
      const roundTripV2 = translateV1AnswersToV2(ut.slug, translatedToV1);
      expect(roundTripV2).toEqual(allCorrectV2);
    }
  });

  it("5. [RELEASE BLOCKER 1] verifies all 4 deployment states (A: Old+Old, B: New+Old, C: Old+New, D: New+New), in-flight attempts, and multi-instance concurrency", async () => {
    const qz = findCurriculumQuiz("hsk1-lesson-02")!;
    const v1AnswersQuiz: Record<string, number> = {};
    const v2AnswersQuiz: Record<string, number> = {};
    for (const q of qz.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      v1AnswersQuiz[q.id] = rev.v1CorrectIndex;
      v2AnswersQuiz[q.id] = rev.v2CorrectIndex;
    }

    const ut1 = unitTests[0];
    const v1AnswersUt1: Record<string, number> = {};
    const v2AnswersUt1: Record<string, number> = {};
    for (const q of ut1.questions) {
      const rev = getQuestionRevisionEntry(ut1.slug, q.id)!;
      v1AnswersUt1[q.id] = rev.v1CorrectIndex;
      v2AnswersUt1[q.id] = rev.v2CorrectIndex;
    }

    // =========================================================================
    // STATE A: Old App + Old DB
    // =========================================================================
    activeSimEnv = createSimulatedAssessmentEnv("old_db");
    const attStateA = await activeSimEnv.simulateOldAppStartAttempt("hsk1-lesson-02");
    // Also create an unsubmitted in-flight Old-App attempt before upgrade
    const attInFlightPreMig = await activeSimEnv.simulateOldAppStartAttempt("hsk1-lesson-02");
    const attUtInFlightPreMig = await activeSimEnv.simulateOldAppStartAttempt("hsk1-unit-test-01");

    const resStateA = await activeSimEnv.simulateOldAppSubmitAttempt(attStateA, v1AnswersQuiz);
    expect(resStateA.error).toBeNull();
    expect(resStateA.data?.correct_count).toBe(8);
    expect(resStateA.data?.passed).toBe(true);

    // =========================================================================
    // STATE B: New App + Old DB
    // =========================================================================
    // B1. Viewing historical submitted State-A attempt on New App + Old DB must show V1 choices & 8/8 correct
    const viewHistoricalOnOldDb = await getQuizView(qz.lessonId, attStateA);
    expect(viewHistoricalOnOldDb).not.toBeNull();
    for (const q of viewHistoricalOnOldDb!.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v1Choices);
    }
    expect(viewHistoricalOnOldDb!.responses.every((r) => r.is_correct)).toBe(true);

    // B2. Starting & submitting a new Mini Quiz attempt on New App + Old DB
    const startStateB = await startQuiz({
      lessonId: qz.lessonId,
      startKey: "10000000-0000-4000-8000-0000000000b2",
    });
    expect(startStateB.ok).toBe(true);
    if (!startStateB.ok) throw new Error("startStateB failed");
    const attStateB = startStateB.view.attempt!.id;
    // New App serves V2 choices for the newly created attempt
    for (const q of startStateB.view.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v2Choices);
    }
    const submitStateB = await submitQuiz({
      lessonId: qz.lessonId,
      attemptId: attStateB,
      answers: v2AnswersQuiz,
    });
    expect(submitStateB.ok).toBe(true);
    if (!submitStateB.ok) throw new Error("submitStateB failed");
    expect(submitStateB.view.attempt?.correctCount).toBe(8);
    expect(submitStateB.view.attempt?.passed).toBe(true);
    expect(submitStateB.view.responses.every((r) => r.is_correct)).toBe(true);
    for (const q of submitStateB.view.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      const resp = submitStateB.view.responses.find((r) => r.question_id === q.id)!;
      expect(q.choices[resp.answer_index!]).toBe(rev.v2Choices[rev.v2CorrectIndex]);
    }

    // B3. Starting & submitting a new Unit Test attempt on New App + Old DB
    const utStartB = await startUnitTestAction(1, 2);
    expect(utStartB.ok).toBe(true);
    expect(utStartB.keyRevision).toBe(2);
    const utSubmitB = await submitUnitTestAction(1, v2AnswersUt1, 120, utStartB.attemptId);
    expect(utSubmitB.totalScore).toBe(20);
    expect(utSubmitB.passed).toBe(true);

    // =========================================================================
    // APPLY MIGRATION 0011 TO DB (Transition to New DB)
    // =========================================================================
    activeSimEnv.upgradeDbToMigration0011();

    // =========================================================================
    // STATE C: Old App + New DB (and Multi-Instance Old App + New App on New DB)
    // =========================================================================
    // C1. Old App starts an attempt on New DB (omits key_revision -> DB defaults to 1) and submits V1 answers
    const attStateC = await activeSimEnv.simulateOldAppStartAttempt("hsk1-lesson-02");
    expect(activeSimEnv.attemptsTable.get(attStateC)?.key_revision).toBe(1);
    const resStateC = await activeSimEnv.simulateOldAppSubmitAttempt(attStateC, v1AnswersQuiz);
    expect(resStateC.error).toBeNull();
    expect(resStateC.data?.correct_count).toBe(8);
    expect(resStateC.data?.passed).toBe(true);
    expect(resStateC.data?.key_revision).toBe(1);

    // C2. Multi-instance: Attempt started on Old App instance (key_revision=1 on New DB), then reloaded & submitted on New App instance!
    const attStartedOldSubmittedNew = await activeSimEnv.simulateOldAppStartAttempt("hsk1-lesson-02");
    const viewInFlightFromOldInstance = await getQuizView(qz.lessonId, attStartedOldSubmittedNew);
    expect(viewInFlightFromOldInstance).not.toBeNull();
    for (const q of viewInFlightFromOldInstance!.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v1Choices);
    }
    const subCrossInstance = await submitQuiz({
      lessonId: qz.lessonId,
      attemptId: attStartedOldSubmittedNew,
      answers: v1AnswersQuiz,
    });
    expect(subCrossInstance.ok).toBe(true);
    if (!subCrossInstance.ok) throw new Error("subCrossInstance failed");
    expect(subCrossInstance.view.attempt?.correctCount).toBe(8);
    expect(subCrossInstance.view.attempt?.passed).toBe(true);
    expect(subCrossInstance.view.responses.every((r) => r.is_correct)).toBe(true);

    // C3. In-flight attempts created BEFORE Migration 0011 (`attInFlightPreMig` and `attUtInFlightPreMig`) submitted AFTER Migration 0011 on New App
    const subPreMigQuiz = await submitQuiz({
      lessonId: qz.lessonId,
      attemptId: attInFlightPreMig,
      answers: v1AnswersQuiz,
    });
    expect(subPreMigQuiz.ok).toBe(true);
    if (!subPreMigQuiz.ok) throw new Error("subPreMigQuiz failed");
    expect(subPreMigQuiz.view.attempt?.correctCount).toBe(8);
    expect(subPreMigQuiz.view.attempt?.passed).toBe(true);

    const subPreMigUt = await submitUnitTestAction(1, v1AnswersUt1, 180, attUtInFlightPreMig);
    expect(subPreMigUt.totalScore).toBe(20);
    expect(subPreMigUt.passed).toBe(true);

    // =========================================================================
    // STATE D: New App + New DB
    // =========================================================================
    const startStateD = await startQuiz({
      lessonId: qz.lessonId,
      startKey: "10000000-0000-4000-8000-0000000000d1",
    });
    expect(startStateD.ok).toBe(true);
    if (!startStateD.ok) throw new Error("startStateD failed");
    const attStateD = startStateD.view.attempt!.id;
    expect(activeSimEnv.attemptsTable.get(attStateD)?.key_revision).toBe(2);

    const submitStateD = await submitQuiz({
      lessonId: qz.lessonId,
      attemptId: attStateD,
      answers: v2AnswersQuiz,
    });
    expect(submitStateD.ok).toBe(true);
    if (!submitStateD.ok) throw new Error("submitStateD failed");
    expect(submitStateD.view.attempt?.correctCount).toBe(8);
    expect(submitStateD.view.attempt?.passed).toBe(true);

    // Reloading submitted V2 attempt on New App + New DB returns V2 choices and 8/8 correct
    const refreshStateD = await refreshQuiz({
      lessonId: qz.lessonId,
      attemptId: attStateD,
    });
    expect(refreshStateD.ok).toBe(true);
    if (!refreshStateD.ok) throw new Error("refreshStateD failed");
    for (const q of refreshStateD.view.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v2Choices);
    }
    expect(refreshStateD.view.responses.every((r) => r.is_correct)).toBe(true);
  });

  it("6. [RELEASE BLOCKER 2] verifies Rollback Safety with in-flight V2 attempts, submitted V2 attempts, concurrent submits, and new V1 attempts", async () => {
    activeSimEnv = createSimulatedAssessmentEnv("new_db");
    const qz = findCurriculumQuiz("hsk1-lesson-03")!;
    const v1AnswersQuiz: Record<string, number> = {};
    const v2AnswersQuiz: Record<string, number> = {};
    for (const q of qz.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      v1AnswersQuiz[q.id] = rev.v1CorrectIndex;
      v2AnswersQuiz[q.id] = rev.v2CorrectIndex;
    }

    // 1. Before rollback (Revision 2 active):
    // Create one V2 attempt and submit it (`attSubmittedV2`), and create a second V2 attempt and leave it unsubmitted (`attInFlightV2`)
    const startSubV2 = await startQuiz({
      lessonId: qz.lessonId,
      startKey: "20000000-0000-4000-8000-000000000001",
    });
    if (!startSubV2.ok) throw new Error("startSubV2 failed");
    const attSubmittedV2 = startSubV2.view.attempt!.id;
    const subV2Res = await submitQuiz({
      lessonId: qz.lessonId,
      attemptId: attSubmittedV2,
      answers: v2AnswersQuiz,
    });
    expect(subV2Res.ok).toBe(true);

    const startOpenV2 = await startQuiz({
      lessonId: qz.lessonId,
      startKey: "20000000-0000-4000-8000-000000000002",
    });
    if (!startOpenV2.ok) throw new Error("startOpenV2 failed");
    const attInFlightV2 = startOpenV2.view.attempt!.id;
    expect(activeSimEnv.attemptsTable.get(attInFlightV2)?.key_revision).toBe(2);

    // 2. Activate Feature-Flag Rollback to Revision 1 (`HANLEARN_ASSESSMENT_KEY_REVISION=1`)
    process.env.HANLEARN_ASSESSMENT_KEY_REVISION = "1";
    expect(getConfiguredAssessmentRevision()).toBe(1);

    // 2A. Reloading the unsubmitted in-flight V2 attempt after rollback MUST still display V2 choices
    const viewOpenV2AfterRollback = await getQuizView(qz.lessonId, attInFlightV2);
    expect(viewOpenV2AfterRollback).not.toBeNull();
    for (const q of viewOpenV2AfterRollback!.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v2Choices);
    }

    // 2B. New attempt started after rollback pins key_revision = 1 and displays V1 choices
    const startNewV1AfterRollback = await startQuiz({
      lessonId: qz.lessonId,
      startKey: "20000000-0000-4000-8000-000000000003",
    });
    if (!startNewV1AfterRollback.ok) throw new Error("startNewV1AfterRollback failed");
    const attNewV1 = startNewV1AfterRollback.view.attempt!.id;
    expect(activeSimEnv.attemptsTable.get(attNewV1)?.key_revision).toBe(1);
    for (const q of startNewV1AfterRollback.view.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v1Choices);
    }

    // 2C. Concurrent submit of in-flight V2 attempt and post-rollback V1 attempt -> BOTH score 8/8 (100%)!
    const [resInFlightV2Submit, resNewV1Submit] = await Promise.all([
      submitQuiz({
        lessonId: qz.lessonId,
        attemptId: attInFlightV2,
        answers: v2AnswersQuiz,
      }),
      submitQuiz({
        lessonId: qz.lessonId,
        attemptId: attNewV1,
        answers: v1AnswersQuiz,
      }),
    ]);

    expect(resInFlightV2Submit.ok).toBe(true);
    if (!resInFlightV2Submit.ok) throw new Error("resInFlightV2Submit failed");
    expect(resInFlightV2Submit.view.attempt?.correctCount).toBe(8);
    expect(resInFlightV2Submit.view.attempt?.passed).toBe(true);

    expect(resNewV1Submit.ok).toBe(true);
    if (!resNewV1Submit.ok) throw new Error("resNewV1Submit failed");
    expect(resNewV1Submit.view.attempt?.correctCount).toBe(8);
    expect(resNewV1Submit.view.attempt?.passed).toBe(true);

    // 2D. Viewing already-submitted V2 attempt after rollback still displays V2 choices and 8/8 correct responses
    const viewSubmittedV2AfterRollback = await getQuizView(qz.lessonId, attSubmittedV2);
    expect(viewSubmittedV2AfterRollback).not.toBeNull();
    for (const q of viewSubmittedV2AfterRollback!.questions) {
      const rev = getQuestionRevisionEntry(qz.slug, q.id)!;
      expect(q.choices).toEqual(rev.v2Choices);
    }
    expect(viewSubmittedV2AfterRollback!.responses.every((r) => r.is_correct)).toBe(true);

    // 2E. getUnitTestDefinition during rollback returns V1 choices and key_revision = 1
    const utDefRollback = await getUnitTestDefinition(1);
    expect(utDefRollback.key_revision).toBe(1);
    const ut1Q1Rev = getQuestionRevisionEntry("hsk1-unit-test-01", utDefRollback.questions[0].id)!;
    expect(utDefRollback.questions[0].choices).toEqual(ut1Q1Rev.v1Choices);
  });

  it("7. verifies getUnitTestDefinition strips correct_index and explanation_vi from client payloads (no answer-key leakage)", async () => {
    for (let u = 1; u <= 6; u++) {
      const def = await getUnitTestDefinition(u);
      expect(def.questions.length).toBe(20);
      expect(def.key_revision).toBe(2);
      for (const q of def.questions) {
        expect(q.correct_index).toBeUndefined();
        expect(q.explanation_vi).toBeUndefined();
        expect(q.choices.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("8. verifies 300 Canonical Vocabulary items preserve all 43 Pilot v1 UUIDs as effective IDs and resolve by Pilot UUID, MD5 UUID, and Hanzi", () => {
    const all300 = getOfficial300VocabItems();
    expect(all300.length).toBe(300);

    const effectiveIds = new Set<string>();
    const sourceIds = new Set<string>();
    const simplifiedSet = new Set<string>();
    let pilotMatchedCount = 0;

    for (const item of all300) {
      expect(effectiveIds.has(item.id)).toBe(false);
      effectiveIds.add(item.id);

      expect(sourceIds.has(item.canonical_source_id)).toBe(false);
      sourceIds.add(item.canonical_source_id);

      expect(simplifiedSet.has(item.simplified)).toBe(false);
      simplifiedSet.add(item.simplified);

      if (item.pilot_v1_id) {
        pilotMatchedCount++;
        expect(item.id).toBe(item.pilot_v1_id);
        expect(item.pilot_v1_id).toBe(PILOT_V1_VOCAB_ID_BY_HANZI[item.simplified]);
      } else {
        expect(item.id).toBe(item.canonical_source_id);
      }

      expect(findOfficial300VocabItem(item.id)).toBe(item);
      expect(findOfficial300VocabItem(item.canonical_source_id)).toBe(item);
      expect(findOfficial300VocabItem(item.simplified)).toBe(item);
    }

    expect(pilotMatchedCount).toBe(43);
    expect(Object.keys(PILOT_V1_VOCAB_ID_BY_HANZI).length).toBe(43);

    // Supplementary Pilot word 越南 is NOT in the 300-word HSK 1 canonical list
    expect(findOfficial300VocabItem("越南")).toBeUndefined();

    // Polyphone 只 (zhī) and tone-sandhi 不 (bù)
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

    // Check resolveAttemptKeyRevision logic directly
    expect(resolveAttemptKeyRevision({ dbHasKeyRevisionColumn: true, dbKeyRevision: 1 })).toBe(1);
    expect(resolveAttemptKeyRevision({ dbHasKeyRevisionColumn: true, dbKeyRevision: 2 })).toBe(2);
    expect(resolveAttemptKeyRevision({ dbHasKeyRevisionColumn: false, metaKeyRevision: undefined })).toBe(1);
    expect(resolveAttemptKeyRevision({ dbHasKeyRevisionColumn: false, metaKeyRevision: 2 })).toBe(2);
  });

  it("9. verifies Migration 0012 SQL preserves all 43 Pilot UUIDs in place, upserts 257 new words with PRIVATE_INVITE_ONLY metadata, and contains zero DELETE/TRUNCATE", () => {
    const mig012 = fs.readFileSync(
      path.join(process.cwd(), "supabase/migrations/202611200012_sprint8o_vocabulary_catalog_sync.sql"),
      "utf-8"
    );

    expect(mig012).not.toMatch(/\bDELETE\s+FROM\b|\bTRUNCATE\b/i);
    expect(mig012).toContain("create or replace function private.sync_hsk1_canonical_vocabulary_catalog");
    expect(mig012).toContain("revoke all on function private.sync_hsk1_canonical_vocabulary_catalog(uuid) from public, anon, authenticated;");
    expect(mig012).toContain(
      "PRIVATE_INVITE_ONLY; AI-assisted experimental content shared with authenticated allowlisted invitees; third-party sharing/distribution rights unverified; no public release or third-party license asserted."
    );
    expect(mig012).toContain(
      "Owner — experimental personal-use acceptance (identity retained in existing private record)"
    );

    for (const item of getOfficial300VocabItems()) {
      expect(mig012).toContain(`'${item.id}'::uuid`);
    }
  });

  it("10. [KI-P2-002] verifies Unit Test submission via PostgreSQL RPC causes ZERO user_metadata growth across 25 consecutive attempts, blocks duplicate submit (PT409), and preserves Rev 1/2", async () => {
    activeSimEnv = createSimulatedAssessmentEnv("new_db");
    const ut1 = unitTests[0];
    const v2Correct: Record<string, number> = {};
    const allWrong: Record<string, number> = {};
    for (const q of ut1.questions) {
      v2Correct[q.id] = q.correct_index;
      allWrong[q.id] = (q.correct_index + 1) % q.choices.length;
    }

    // 1. Submit 25 consecutive Unit Test attempts (mix of pass & fail) on New DB -> user_metadata MUST stay empty (0 bytes growth)
    const firstAttemptIds: string[] = [];
    for (let i = 0; i < 25; i++) {
      const started = await startUnitTestAction(1, 2);
      expect(started.ok).toBe(true);
      expect(started.keyRevision).toBe(2);
      firstAttemptIds.push(started.attemptId);

      const useCorrect = i % 2 === 0;
      const res = await submitUnitTestAction(
        1,
        useCorrect ? v2Correct : allWrong,
        90 + i,
        started.attemptId
      );
      expect(res.totalScore).toBe(useCorrect ? 20 : 0);
      expect(res.passed).toBe(useCorrect);
    }

    // Verify user_metadata remained completely untouched (no quiz_attempts_hsk1-unit-test-01 bloat!)
    const metaAfter25 = activeSimEnv.getUser().user_metadata;
    expect(metaAfter25["quiz_attempts_hsk1-unit-test-01"]).toBeUndefined();
    expect(JSON.stringify(metaAfter25).length).toBe(2); // "{}"

    // 2. Duplicate submit of an already-submitted attempt_id MUST reject immediately without writing metadata or overwriting score
    await expect(
      submitUnitTestAction(1, allWrong, 100, firstAttemptIds[0])
    ).rejects.toThrow("Không được nộp trùng");
    expect(activeSimEnv.attemptsTable.get(firstAttemptIds[0])?.correct_count).toBe(20);
    expect(activeSimEnv.attemptsTable.get(firstAttemptIds[0])?.passed).toBe(true);

    // 3. Revision 1 attempt started by Old App on New DB still grades 20/20 against v1CorrectIndex without polluting user_metadata
    const oldAttId = await activeSimEnv.simulateOldAppStartAttempt("hsk1-unit-test-01");
    const v1Correct: Record<string, number> = {};
    for (const q of ut1.questions) {
      v1Correct[q.id] = getQuestionRevisionEntry("hsk1-unit-test-01", q.id)!.v1CorrectIndex;
    }
    const oldRes = await submitUnitTestAction(1, v1Correct, 120, oldAttId);
    expect(oldRes.totalScore).toBe(20);
    expect(oldRes.passed).toBe(true);
    expect(activeSimEnv.getUser().user_metadata["quiz_attempts_hsk1-unit-test-01"]).toBeUndefined();
  });
});
