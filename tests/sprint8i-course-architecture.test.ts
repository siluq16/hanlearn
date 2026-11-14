import { describe, it, expect } from "vitest";
import { AVAILABLE_COURSES, HSK1_UNITS } from "@/features/courses/constants";
import { getUnitTestDefinition } from "@/features/exam/unit-test-actions";
import { getPrebuiltPracticeSets } from "@/features/practice/queries";
import { HSK1_LIBRARY_VOCABULARY } from "@/features/vocabulary/hsk1-library-vocab";
import { findNineStageLesson } from "@/features/content-library/curriculum-data";

describe("Sprint 8I: Course, Unit, Prebuilt Practice & Curriculum Architecture", () => {
  describe("Phase 1 & 2: Course Architecture & Selector", () => {
    it("defines 5 standard courses with HSK 1 available and HSK 2-5 coming soon", () => {
      expect(AVAILABLE_COURSES.length).toBe(5);

      const hsk1 = AVAILABLE_COURSES.find((c) => c.course_id === "course-hsk1");
      expect(hsk1).toBeDefined();
      expect(hsk1?.status).toBe("available");
      expect(hsk1?.total_units).toBe(6);
      expect(hsk1?.total_lessons).toBe(32);
      expect(hsk1?.total_vocabulary).toBe(300);

      const comingSoonCourses = AVAILABLE_COURSES.filter((c) => c.status === "coming_soon");
      expect(comingSoonCourses.length).toBe(4);
      expect(comingSoonCourses.map((c) => c.slug)).toEqual(["hsk2", "hsk3", "hsk4", "hsk5"]);
    });
  });

  describe("Phase 3: 6-Unit Roadmap Structure", () => {
    it("has exactly 6 units covering all 32 lessons without gaps or overlaps", () => {
      expect(HSK1_UNITS.length).toBe(6);

      const allSlugs = HSK1_UNITS.flatMap((u) => u.lesson_slugs);
      expect(allSlugs.length).toBe(32);

      // Verify no duplicates
      const uniqueSlugs = new Set(allSlugs);
      expect(uniqueSlugs.size).toBe(32);

      // Unit 1: Lessons 1-4
      expect(HSK1_UNITS[0].unit_number).toBe(1);
      expect(HSK1_UNITS[0].lesson_slugs).toEqual([
        "hsk1-lesson-01",
        "hsk1-lesson-02",
        "hsk1-lesson-03",
        "hsk1-lesson-04",
      ]);

      // Unit 2: Lessons 5-8
      expect(HSK1_UNITS[1].unit_number).toBe(2);
      expect(HSK1_UNITS[1].lesson_slugs).toEqual([
        "hsk1-lesson-05",
        "hsk1-lesson-06",
        "hsk1-lesson-07",
        "hsk1-lesson-08",
      ]);

      // Unit 3: Lessons 9-14
      expect(HSK1_UNITS[2].unit_number).toBe(3);
      expect(HSK1_UNITS[2].lesson_slugs.length).toBe(6);

      // Unit 4: Lessons 15-20
      expect(HSK1_UNITS[3].unit_number).toBe(4);
      expect(HSK1_UNITS[3].lesson_slugs.length).toBe(6);

      // Unit 5: Lessons 21-25
      expect(HSK1_UNITS[4].unit_number).toBe(5);
      expect(HSK1_UNITS[4].lesson_slugs.length).toBe(5);

      // Unit 6: Lessons 26-32
      expect(HSK1_UNITS[5].unit_number).toBe(6);
      expect(HSK1_UNITS[5].lesson_slugs.length).toBe(7);
      expect(HSK1_UNITS[5].lesson_slugs[6]).toBe("hsk1-lesson-32");
    });
  });

  describe("Phase 4: Unified 9-Stage Curriculum & Lessons 2, 3, 4", () => {
    it("ensures lessons 1 through 32 are all complete 9-stage lessons", () => {
      for (let i = 1; i <= 32; i++) {
        const slug = `hsk1-lesson-${String(i).padStart(2, "0")}`;
        const lesson = findNineStageLesson(slug);
        expect(lesson).toBeDefined();
        expect(lesson?.stages.length).toBeGreaterThanOrEqual(9);
        expect(lesson?.stages[1].vocabulary?.length).toBeGreaterThan(0);
      }
    });

    it("verifies pilot UUID mapping resolves to full 9-stage lessons", () => {
      const pilotL1 = findNineStageLesson("639665c9-952d-5714-a276-537a3568b463");
      const pilotL2 = findNineStageLesson("022f2393-6cff-54f0-b24f-03ee7cfc3cfe");
      const pilotL3 = findNineStageLesson("321e1ed9-a427-57b3-817e-5acbb1b9bab8");
      const pilotL4 = findNineStageLesson("47097e01-9557-5f82-a84b-fba132cfca05");

      expect(pilotL1?.slug).toBe("hsk1-lesson-01");
      expect(pilotL2?.slug).toBe("hsk1-lesson-02");
      expect(pilotL3?.slug).toBe("hsk1-lesson-03");
      expect(pilotL4?.slug).toBe("hsk1-lesson-04");
    });
  });

  describe("Phase 5: 6 Unit Tests Architecture", () => {
    it("verifies all 6 Unit Tests load, have 20 questions, and strict 80% passing standard", async () => {
      for (let u = 1; u <= 6; u++) {
        const unitTest = await getUnitTestDefinition(u);
        expect(unitTest).toBeDefined();
        expect(unitTest.unit_number).toBe(u);
        expect(unitTest.total_questions).toBe(20);
        expect(unitTest.passing_score).toBe(16);
        expect(unitTest.duration_minutes).toBe(20);
        expect(unitTest.questions.length).toBe(20);

        // Security check: correct_index must be stripped from public client view
        for (const q of unitTest.questions) {
          expect("correct_index" in q).toBe(false);
        }

        const listeningCount = unitTest.questions.filter((q) => q.section === "listening").length;
        const vocabCount = unitTest.questions.filter((q) => q.section === "vocabulary").length;
        const grammarCount = unitTest.questions.filter((q) => q.section === "grammar").length;
        const readingCount = unitTest.questions.filter((q) => q.section === "reading").length;

        expect(listeningCount).toBe(6);
        expect(vocabCount).toBe(4);
        expect(grammarCount).toBe(4);
        expect(readingCount).toBe(6);
      }
    });
  });

  describe("Phase 6 & 7 & 8: Prebuilt Practice Bank (56 sets)", () => {
    it("verifies 56 prebuilt practice sets across 6 skills", async () => {
      const sets = await getPrebuiltPracticeSets();
      expect(sets.length).toBe(56);

      const vocabSets = sets.filter((s) => s.skill === "vocabulary");
      const grammarSets = sets.filter((s) => s.skill === "grammar");
      const listeningSets = sets.filter((s) => s.skill === "listening");
      const speakingSets = sets.filter((s) => s.skill === "speaking");
      const readingSets = sets.filter((s) => s.skill === "reading");
      const dialogueSets = sets.filter((s) => s.skill === "dialogue");

      expect(vocabSets.length).toBe(12);
      expect(grammarSets.length).toBe(10);
      expect(listeningSets.length).toBe(10);
      expect(speakingSets.length).toBe(8);
      expect(readingSets.length).toBe(8);
      expect(dialogueSets.length).toBe(8);

      // Verify every set has valid items or turns
      for (const s of sets) {
        expect(s.title).toBeTruthy();
        expect(s.description).toBeTruthy();
        if (s.skill === "dialogue") {
          expect(s.turns).toBeDefined();
          expect(s.turns!.length).toBeGreaterThan(0);
        } else {
          expect(s.questions).toBeDefined();
          expect(s.questions!.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Phase 9: Vocabulary 300 Synchronization", () => {
    it("returns 300 HSK 1 vocabulary entries in query", () => {
      expect(HSK1_LIBRARY_VOCABULARY.length).toBe(300);

      const found = HSK1_LIBRARY_VOCABULARY.find((w) => w.simplified === "好");
      expect(found).toBeDefined();
      expect(found?.meaning_vi).toBeTruthy();
    });
  });
});
