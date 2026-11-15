import "server-only";
import { cache } from "react";
import { requireLearner } from "@/features/auth/session";
import { HSK1_UNITS } from "./constants";
import { HSK1_NINE_STAGE_LESSONS } from "@/features/content-library/curriculum-data";
import { getLessonMeta } from "@/features/curriculum/unified-metadata";
import { getOfficial300VocabItems } from "@/features/vocabulary/hsk1-library-vocab";

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

export const getLearnerCurriculumProgress = cache(
  async (): Promise<LearnerProgressOverview> => {
    const { user, supabase } = await requireLearner();

    // 1. Fetch stage progress for all lessons
    const { data: stageRows } = await supabase
      .from("learner_stage_progress")
      .select("lesson_id, current_stage, completed_stages")
      .eq("user_id", user.id);

    // 2. Fetch quiz attempts for unit tests & mini quizzes
    const { data: attemptRows } = await supabase
      .from("curriculum_quiz_attempts")
      .select("lesson_id, quiz_id, correct_count, question_count, passed")
      .eq("user_id", user.id);

    // 3. Fetch vocabulary progress records
    const { data: vocabRows } = await supabase
      .from("vocabulary_progress")
      .select("vocabulary_id, mastery_state")
      .eq("user_id", user.id)
      .neq("mastery_state", "not_introduced");

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
        const slug = (row as unknown as { lesson_id?: string; quiz_id?: string; quiz_slug?: string }).lesson_id ||
          (row as unknown as { lesson_id?: string; quiz_id?: string; quiz_slug?: string }).quiz_id ||
          (row as unknown as { lesson_id?: string; quiz_id?: string; quiz_slug?: string }).quiz_slug || "";
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

    for (const lesson of realLessons) {
      const slug = lesson.slug;
      const prog = stageMap.get(slug) || stageMap.get(lesson.id);
      const completedCount = prog?.completedStages.length || 0;
      // A lesson is considered completed if 8 or more stages are done (including Mini Quiz)
      const isCompleted = completedCount >= 8 || (prog?.completedStages.includes(8) ?? false);
      const hasStudiedVocab = isCompleted || (prog?.completedStages.includes(1) ?? false) || (prog?.completedStages.includes(2) ?? false);

      if (isCompleted) {
        completedLessonsCount += 1;
      }

      if (hasStudiedVocab) {
        for (const st of lesson.stages) {
          if (st.vocabulary) {
            for (const v of st.vocabulary) {
              learnedWordsSet.add(v.simplified);
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

    // Merge any words learned from vocabulary_progress
    if (vocabRows && vocabRows.length > 0) {
      const official300 = getOfficial300VocabItems();
      const vocabIdMap = new Map(official300.map((w) => [w.id, w.simplified]));
      for (const vr of vocabRows) {
        const hz = vocabIdMap.get(vr.vocabulary_id);
        if (hz) learnedWordsSet.add(hz);
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
      vocabularyLearnedCount: Math.min(300, Math.max(learnedWordsSet.size, vocabRows?.length || 0)),
      overallPercent,
      nextLessonSlug,
      nextLessonTitle,
      unitProgress: unitProgressRecord,
      lessonProgress: lessonProgressRecord,
    };
  }
);
