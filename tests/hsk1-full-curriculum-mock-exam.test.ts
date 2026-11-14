import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { HSK1_NINE_STAGE_LESSONS, findNineStageLesson } from "@/features/content-library/curriculum-data";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";
import mockExamData from "../content/hsk_library/hsk1_mock_exam_official.json";
import type { MockExamDefinition } from "@/features/exam/types";

describe("Sprint 8F - Full HSK 1 Curriculum Coverage & Official Mock Exam", () => {
  const libraryDir = path.resolve(process.cwd(), "content/hsk_library");

  it("proves 100% coverage (300 / 300) of the official HSK 2025 exam syllabus words", () => {
    const officialPath = path.join(libraryDir, "hsk1_exam_2025_official_300.json");
    expect(fs.existsSync(officialPath)).toBe(true);
    const officialList: { hanzi: string }[] = JSON.parse(fs.readFileSync(officialPath, "utf8"));
    expect(officialList.length).toBe(300);

    // Collect all unique taught words across pilot and 9-stage lessons
    const pilotPath = path.resolve(process.cwd(), "content/pilot-hsk1/v1/vocabulary.json");
    const pilot: { simplified?: string; hanzi?: string }[] = JSON.parse(fs.readFileSync(pilotPath, "utf8"));
    const taughtSet = new Set<string>();

    for (const item of pilot) {
      const hz = item.simplified || item.hanzi;
      if (hz) taughtSet.add(hz);
    }

    for (const lesson of HSK1_NINE_STAGE_LESSONS) {
      for (const stage of lesson.stages) {
        if (stage.vocabulary) {
          for (const v of stage.vocabulary) {
            if (v.simplified) taughtSet.add(v.simplified);
          }
        }
      }
    }

    const officialWords = officialList.map((item) => item.hanzi);
    const coveredOfficial = officialWords.filter((w) => taughtSet.has(w));
    const missingOfficial = officialWords.filter((w) => !taughtSet.has(w));

    // Full 100% coverage assertion
    expect(coveredOfficial.length).toBe(300);
    expect(missingOfficial.length).toBe(0);
  });

  it("verifies all 35 lessons and checkpoints are fully structured with 10 stages", () => {
    expect(HSK1_NINE_STAGE_LESSONS.length).toBe(35);

    // Lessons 11 to 32 (22 lessons)
    for (let i = 11; i <= 32; i++) {
      const slug = `hsk1-lesson-${i}`;
      const lesson = findNineStageLesson(slug);
      expect(lesson).toBeDefined();
      expect(lesson?.hsk_level).toBe(1);
      expect(lesson?.stages.length).toBe(10);
      expect(lesson?.stages[1].vocabulary?.length).toBeGreaterThan(0);
    }

    // Checkpoints 1 to 6 (6 checkpoints)
    for (let cp = 1; cp <= 6; cp++) {
      const slug = `hsk1-checkpoint-0${cp}`;
      const checkpoint = findNineStageLesson(slug);
      expect(checkpoint).toBeDefined();
      expect(checkpoint?.stages.length).toBe(10);
    }
  });

  it("verifies all 34 curriculum quizzes have at least 8 questions and valid answer keys", () => {
    expect(ALL_CURRICULUM_QUIZZES.length).toBe(34);

    for (const quiz of ALL_CURRICULUM_QUIZZES) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(8);
      expect(Object.keys(quiz.answerKeys).length).toBe(quiz.questions.length);

      for (const q of quiz.questions) {
        const key = quiz.answerKeys[q.id];
        expect(key).toBeDefined();
        expect(key.correct_index).toBeGreaterThanOrEqual(0);
        expect(key.correct_index).toBeLessThan(4);
      }
    }
  });

  it("validates the Official HSK 1 Mock Exam specification (40 questions, 35 mins, 200 pts, pass >= 120)", () => {
    const exam = mockExamData as unknown as MockExamDefinition;

    expect(exam.id).toBe("exam-hsk1-official-mock");
    expect(exam.duration_minutes).toBe(35);
    expect(exam.total_questions).toBe(40);
    expect(exam.listening_questions).toBe(20);
    expect(exam.reading_questions).toBe(20);
    expect(exam.max_score).toBe(200);
    expect(exam.pass_score).toBe(120);

    expect(exam.sections.length).toBe(2);
    expect(exam.sections[0].id).toBe("listening");
    expect(exam.sections[1].id).toBe("reading");

    const listeningItems = exam.questions.filter((q) => q.section === "listening");
    const readingItems = exam.questions.filter((q) => q.section === "reading");

    expect(listeningItems.length).toBe(20);
    expect(readingItems.length).toBe(20);

    // Each listening item must have audio_text
    for (const q of listeningItems) {
      expect(q.audio_text).toBeDefined();
      expect(q.audio_text?.length).toBeGreaterThan(0);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
    }

    // Each reading item must have prompt and choices
    for (const q of readingItems) {
      expect(q.prompt.length).toBeGreaterThan(10);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
    }
  });
});
