import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { HSK1_UNITS } from "./constants";
import { HSK1_NINE_STAGE_LESSONS } from "@/features/content-library/curriculum-data";
import { getLessonMeta } from "@/features/curriculum/unified-metadata";
import {
  getOfficial300VocabItems,
  findOfficial300VocabItem,
} from "@/features/vocabulary/hsk1-library-vocab";

export interface LearnerCurriculumSnapshot {
  stageProgress: Array<{
    lesson_id: string;
    current_stage: number;
    completed_stages: number[];
  }>;
  quizAttempts: Array<{
    lesson_id: string;
    quiz_id: string;
    correct_count: number;
    question_count: number;
    passed: boolean;
    submitted_at?: string | null;
    answers?: unknown;
  }>;
  vocabularyProgress: Array<{
    vocabulary_id: string;
    mastery_state: string;
  }>;
  practiceHistory: Array<{
    practice_set_id: string;
    best_score: number;
    total_questions: number;
    completed_at: string;
  }>;
  dueCount: number;
}

export interface LearnerProgressOverview {
  courseSlug: string;
  totalLessons: number;
  completedLessonsCount: number;
  totalUnitTests: number;
  passedUnitTestsCount: number;
  totalVocabulary: number;
  vocabularyLearnedCount: number;
  overallPercent: number;
  nextLessonSlug: string;
  nextLessonTitle: string;
  unitProgress: Record<
    string,
    {
      unitNumber: number;
      completedLessons: number;
      totalLessons: number;
      isUnitTestPassed: boolean;
      unitTestBestScore: number | null;
      status: "not_started" | "in_progress" | "completed";
    }
  >;
  lessonProgress: Record<
    string,
    {
      isCompleted: boolean;
      currentStage: number;
      completedStagesCount: number;
    }
  >;
}

const SNAPSHOT_TTL_MS = process.env.VITEST ? 0 : 30_000;
const userSnapshotCache = new Map<
  string,
  { data: LearnerCurriculumSnapshot; expiresAt: number }
>();
const inFlightSnapshots = new Map<string, Promise<LearnerCurriculumSnapshot>>();
const extraInvalidators = new Set<(userId?: string) => void>();
let snapshotRpcFallbackUntil = 0;

export function registerSnapshotInvalidator(fn: (userId?: string) => void) {
  extraInvalidators.add(fn);
}

export function invalidateLearnerSnapshot(userId?: string) {
  if (userId) {
    userSnapshotCache.delete(userId);
    inFlightSnapshots.delete(userId);
  } else {
    userSnapshotCache.clear();
    inFlightSnapshots.clear();
  }
  for (const fn of extraInvalidators) {
    fn(userId);
  }
}

export const getLearnerCurriculumSnapshot = cache(
  async (): Promise<LearnerCurriculumSnapshot> => {
    const { user, supabase } = await requireLearner();
    const now = Date.now();

    if (SNAPSHOT_TTL_MS > 0) {
      const cached = userSnapshotCache.get(user.id);
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }
      const inFlight = inFlightSnapshots.get(user.id);
      if (inFlight) {
        return inFlight;
      }
    }

    const fetchPromise = (async (): Promise<LearnerCurriculumSnapshot> => {
      // 1. Try unified single-roundtrip PostgreSQL RPC first
      if (typeof supabase.rpc === "function" && Date.now() >= snapshotRpcFallbackUntil) {
        try {
          const rpcRes = await supabase.rpc("get_learner_curriculum_snapshot");
          if (
            rpcRes &&
            !rpcRes.error &&
            rpcRes.data &&
            typeof rpcRes.data === "object" &&
            !Array.isArray(rpcRes.data)
          ) {
            const payload = rpcRes.data as Record<string, unknown>;
            const snapshot: LearnerCurriculumSnapshot = {
              stageProgress: Array.isArray(payload.stage_progress)
                ? (payload.stage_progress as LearnerCurriculumSnapshot["stageProgress"])
                : [],
              quizAttempts: Array.isArray(payload.quiz_attempts)
                ? (payload.quiz_attempts as LearnerCurriculumSnapshot["quizAttempts"])
                : [],
              vocabularyProgress: Array.isArray(payload.vocabulary_progress)
                ? (payload.vocabulary_progress as LearnerCurriculumSnapshot["vocabularyProgress"])
                : [],
              practiceHistory: Array.isArray(payload.practice_history)
                ? (payload.practice_history as LearnerCurriculumSnapshot["practiceHistory"])
                : [],
              dueCount: typeof payload.due_count === "number" ? payload.due_count : 0,
            };
            if (SNAPSHOT_TTL_MS > 0) {
              userSnapshotCache.set(user.id, {
                data: snapshot,
                expiresAt: Date.now() + SNAPSHOT_TTL_MS,
              });
            }
            return snapshot;
          }
          if (rpcRes?.error && !process.env.VITEST) {
            snapshotRpcFallbackUntil = Date.now() + 60_000;
          }
        } catch {
          if (!process.env.VITEST) {
            snapshotRpcFallbackUntil = Date.now() + 60_000;
          }
        }
      }

      // 2. Parallel batch query fallback (unified into the same shared snapshot)
      const [stageRowsRes, attemptRowsRes, vocabRowsRes, practiceRowsRes, dueRes] =
        await Promise.all([
          supabase
            .from("learner_stage_progress")
            .select("lesson_id, current_stage, completed_stages")
            .eq("user_id", user.id),
          supabase
            .from("curriculum_quiz_attempts")
            .select(
              "lesson_id, quiz_id, correct_count, question_count, passed, submitted_at, answers"
            )
            .eq("user_id", user.id)
            .order("submitted_at", { ascending: false }),
          supabase
            .from("vocabulary_progress")
            .select("vocabulary_id, mastery_state")
            .eq("user_id", user.id),
          Promise.resolve(
            supabase
              .from("learner_practice_history")
              .select("practice_set_id, best_score, total_questions, completed_at")
              .eq("user_id", user.id)
          ).catch(() => ({ data: null })),
          typeof supabase.rpc === "function"
            ? Promise.resolve(supabase.rpc("get_due_review_count")).catch(() => ({
                data: 0,
              }))
            : Promise.resolve({ data: 0 }),
        ]);

      const snapshot: LearnerCurriculumSnapshot = {
        stageProgress: (stageRowsRes?.data || []) as LearnerCurriculumSnapshot["stageProgress"],
        quizAttempts: (attemptRowsRes?.data || []) as LearnerCurriculumSnapshot["quizAttempts"],
        vocabularyProgress: (vocabRowsRes?.data ||
          []) as LearnerCurriculumSnapshot["vocabularyProgress"],
        practiceHistory: (practiceRowsRes?.data ||
          []) as LearnerCurriculumSnapshot["practiceHistory"],
        dueCount: typeof dueRes?.data === "number" ? dueRes.data : 0,
      };

      if (SNAPSHOT_TTL_MS > 0) {
        userSnapshotCache.set(user.id, {
          data: snapshot,
          expiresAt: Date.now() + SNAPSHOT_TTL_MS,
        });
      }
      return snapshot;
    })();

    if (SNAPSHOT_TTL_MS > 0) {
      inFlightSnapshots.set(user.id, fetchPromise);
      fetchPromise.finally(() => {
        if (inFlightSnapshots.get(user.id) === fetchPromise) {
          inFlightSnapshots.delete(user.id);
        }
      });
    }

    return fetchPromise;
  }
);

export const getLearnerCurriculumProgress = cache(
  async (): Promise<LearnerProgressOverview> => {
    const [{ user }, snapshot] = await Promise.all([
      requireLearner(),
      getLearnerCurriculumSnapshot(),
    ]);

    const stageRows = snapshot.stageProgress;
    const attemptRows = snapshot.quizAttempts;
    const vocabRows = snapshot.vocabularyProgress.filter(
      (r) => r.mastery_state && r.mastery_state !== "not_introduced"
    );

    const stageMap = new Map<string, { currentStage: number; completedStages: number[] }>();
    if (stageRows) {
      for (const row of stageRows) {
        stageMap.set(row.lesson_id, {
          currentStage: row.current_stage || 0,
          completedStages: Array.isArray(row.completed_stages) ? row.completed_stages : [],
        });
      }
    }

    // Also check user_metadata fallback for stages
    const meta = user.user_metadata || {};
    for (const key of Object.keys(meta)) {
      if (key.startsWith("stage_prog_")) {
        const lessonId = key.replace("stage_prog_", "").replace(/_/g, "-");
        if (!stageMap.has(lessonId)) {
          const val = meta[key];
          stageMap.set(lessonId, {
            currentStage: typeof val?.current_stage === "number" ? val.current_stage : 0,
            completedStages: Array.isArray(val?.completed_stages) ? val.completed_stages : [],
          });
        }
      }
    }

    const testAttemptMap = new Map<string, { passed: boolean; bestScore: number }>();
    if (attemptRows) {
      for (const row of attemptRows) {
        const slug =
          (row as unknown as { lesson_id?: string; quiz_id?: string; quiz_slug?: string })
            .lesson_id ||
          (row as unknown as { lesson_id?: string; quiz_id?: string; quiz_slug?: string })
            .quiz_id ||
          (row as unknown as { lesson_id?: string; quiz_id?: string; quiz_slug?: string })
            .quiz_slug ||
          "";
        const existing = testAttemptMap.get(slug);
        const score = row.correct_count || 0;
        testAttemptMap.set(slug, {
          passed: Boolean(existing?.passed || row.passed),
          bestScore: Math.max(existing?.bestScore || 0, score),
        });
      }
    }

    // Process all 32 HSK 1 lessons
    const realLessons = HSK1_NINE_STAGE_LESSONS.filter((l) =>
      l.slug.startsWith("hsk1-lesson-")
    );

    let completedLessonsCount = 0;
    const lessonProgressRecord: LearnerProgressOverview["lessonProgress"] = {};
    const learnedWordsSet = new Set<string>();

    let nextLessonSlug = realLessons[0]?.slug || "hsk1-lesson-01";
    let nextLessonTitle = getLessonMeta(nextLessonSlug).fullTitle;
    let foundNext = false;

    const official300 = getOfficial300VocabItems();
    const official300Set = new Set(official300.map((w) => w.simplified));

    for (const lesson of realLessons) {
      const slug = lesson.slug;
      const prog = stageMap.get(slug) || stageMap.get(lesson.id);
      const completedCount = prog?.completedStages.length || 0;
      // A lesson is considered completed if 8 or more stages are done (including Mini Quiz)
      const isCompleted = completedCount >= 8 || (prog?.completedStages.includes(8) ?? false);
      const hasStudiedVocab =
        isCompleted ||
        (prog?.completedStages.includes(1) ?? false) ||
        (prog?.completedStages.includes(2) ?? false);

      if (isCompleted) {
        completedLessonsCount += 1;
      }

      if (hasStudiedVocab) {
        for (const st of lesson.stages) {
          if (st.vocabulary) {
            for (const v of st.vocabulary) {
              if (official300Set.has(v.simplified)) {
                learnedWordsSet.add(v.simplified);
              }
            }
          }
        }
      } else if (!foundNext && !isCompleted) {
        nextLessonSlug = slug;
        nextLessonTitle = getLessonMeta(slug).fullTitle;
        foundNext = true;
      }

      lessonProgressRecord[slug] = {
        isCompleted,
        currentStage: prog?.currentStage || 0,
        completedStagesCount: completedCount,
      };
    }

    // Merge any words learned from vocabulary_progress (matching both Pilot v1 UUIDs and MD5 UUIDs)
    let validVocabProgressCount = 0;
    if (vocabRows && vocabRows.length > 0) {
      for (const vr of vocabRows) {
        const canonical = findOfficial300VocabItem(vr.vocabulary_id);
        if (canonical) {
          learnedWordsSet.add(canonical.simplified);
          validVocabProgressCount += 1;
        }
      }
    }

    // Process 6 Units
    let passedUnitTestsCount = 0;
    const unitProgressRecord: LearnerProgressOverview["unitProgress"] = {};

    for (const unit of HSK1_UNITS) {
      let unitCompletedLessons = 0;
      for (const lSlug of unit.lesson_slugs) {
        if (lessonProgressRecord[lSlug]?.isCompleted) {
          unitCompletedLessons += 1;
        }
      }

      const testSlug = `hsk1-unit-test-0${unit.unit_number}`;
      const testInfo = testAttemptMap.get(testSlug);
      const isUnitTestPassed = testInfo?.passed || false;
      if (isUnitTestPassed) passedUnitTestsCount += 1;

      let status: "not_started" | "in_progress" | "completed" = "not_started";
      if (unitCompletedLessons === unit.lesson_slugs.length && isUnitTestPassed) {
        status = "completed";
      } else if (unitCompletedLessons > 0 || isUnitTestPassed) {
        status = "in_progress";
      }

      unitProgressRecord[unit.unit_id] = {
        unitNumber: unit.unit_number,
        completedLessons: unitCompletedLessons,
        totalLessons: unit.lesson_slugs.length,
        isUnitTestPassed,
        unitTestBestScore: testInfo ? testInfo.bestScore : null,
        status,
      };
    }

    const overallPercent = Math.round(
      ((completedLessonsCount + passedUnitTestsCount) / (32 + 6)) * 100
    );

    return {
      courseSlug: "hsk1",
      totalLessons: 32,
      completedLessonsCount,
      totalUnitTests: 6,
      passedUnitTestsCount,
      totalVocabulary: 300,
      vocabularyLearnedCount: Math.min(
        300,
        Math.max(learnedWordsSet.size, validVocabProgressCount)
      ),
      overallPercent,
      nextLessonSlug,
      nextLessonTitle,
      unitProgress: unitProgressRecord,
      lessonProgress: lessonProgressRecord,
    };
  }
);
