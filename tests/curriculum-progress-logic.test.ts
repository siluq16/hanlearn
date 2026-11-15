import { describe, it, expect } from "vitest";

describe("Course Progress Calculation & Verification", () => {
  function computeOverallPercent(completedLessons: number, passedUnitTests: number): number {
    return Math.round(((completedLessons + passedUnitTests) / (32 + 6)) * 100);
  }

  it("calculates 0% when learner has not completed any lessons or unit tests", () => {
    expect(computeOverallPercent(0, 0)).toBe(0);
  });

  it("calculates exactly 16% when learner passed 6 unit tests with 0 completed lessons", () => {
    // 6 / 38 = 0.15789... -> Math.round is 16
    expect(computeOverallPercent(0, 6)).toBe(16);
  });

  it("calculates 84% when all 32 lessons completed but 0 unit tests passed", () => {
    // 32 / 38 = 0.8421... -> Math.round is 84
    expect(computeOverallPercent(32, 0)).toBe(84);
  });

  it("calculates 100% when all 32 lessons and 6 unit tests are completed", () => {
    expect(computeOverallPercent(32, 6)).toBe(100);
  });

  it("verifies vocabulary learning accumulation rules", () => {
    const learnedWords = new Set<string>();

    // Rule 1: A lesson with stage 1 (Từ vựng) completed contributes its vocabulary
    const mockLessonStage1 = {
      stages: [
        { stage_index: 0 },
        { stage_index: 1, vocabulary: [{ simplified: "你好" }, { simplified: "谢谢" }] },
      ],
    };
    const completedStages = [0, 1];
    const hasStudiedVocab = completedStages.includes(1) || completedStages.includes(2);

    if (hasStudiedVocab) {
      for (const st of mockLessonStage1.stages) {
        if ("vocabulary" in st && Array.isArray(st.vocabulary)) {
          for (const v of st.vocabulary) {
            learnedWords.add(v.simplified);
          }
        }
      }
    }

    expect(learnedWords.has("你好")).toBe(true);
    expect(learnedWords.has("谢谢")).toBe(true);
    expect(learnedWords.size).toBe(2);
  });
});
