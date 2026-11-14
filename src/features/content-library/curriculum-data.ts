import lesson1 from "../../../content/hsk_library/hsk1_lesson_01.json";
import lesson5 from "../../../content/hsk_library/hsk1_lesson_05.json";
import lesson6 from "../../../content/hsk_library/hsk1_lesson_06.json";
import type { LibraryExercise } from "./types";

export interface StageWarmupWord {
  hanzi: string;
  pinyin: string;
  vi: string;
}

export interface StageVocabWord {
  simplified: string;
  pinyin: string;
  meaning_vi: string;
}

export interface StageGrammarPoint {
  id: string;
  titleVi: string;
  pattern: string;
  explanationVi: string;
  examples: {
    hanzi: string;
    pinyin: string;
    translationVi: string;
  }[];
}

export interface StageDialogue {
  id: string;
  titleVi: string;
  turns: {
    speaker: string;
    hanzi: string;
    pinyin: string;
    translationVi: string;
  }[];
}

export interface StagePassage {
  title: string;
  text: string;
  translationVi?: string;
}

export interface NineStageLessonData {
  id: string;
  slug: string;
  hsk_level: number;
  unit_id: string;
  title: string;
  objective_vi: string;
  estimated_minutes: number;
  quality_status: string;
  stages: {
    stage: string;
    title_vi: string;
    instruction?: string;
    warmup_words?: StageWarmupWord[];
    vocabulary?: StageVocabWord[];
    grammar_points?: StageGrammarPoint[];
    dialogue?: StageDialogue;
    passage?: StagePassage;
    exercises?: LibraryExercise[];
    quizUrl?: string;
    reviewUrl?: string;
  }[];
}

export const HSK1_NINE_STAGE_LESSONS: NineStageLessonData[] = [
  lesson1 as NineStageLessonData,
  lesson5 as NineStageLessonData,
  lesson6 as NineStageLessonData,
];

export function findNineStageLesson(idOrSlug: string): NineStageLessonData | undefined {
  return HSK1_NINE_STAGE_LESSONS.find(
    (l) =>
      l.id === idOrSlug ||
      l.slug === idOrSlug ||
      // Match with Pilot Lesson 1 UUID
      (idOrSlug === "639665c9-952d-5714-a276-537a3568b463" && l.id === "l-hsk1-001")
  );
}
