import lesson1 from "../../../content/hsk_library/hsk1_lesson_01.json";
import lesson5 from "../../../content/hsk_library/hsk1_lesson_05.json";
import lesson6 from "../../../content/hsk_library/hsk1_lesson_06.json";
import lesson7 from "../../../content/hsk_library/hsk1_lesson_07.json";
import lesson8 from "../../../content/hsk_library/hsk1_lesson_08.json";
import lesson9 from "../../../content/hsk_library/hsk1_lesson_09.json";
import lesson10 from "../../../content/hsk_library/hsk1_lesson_10.json";
import lesson11 from "../../../content/hsk_library/hsk1_lesson_11.json";
import lesson12 from "../../../content/hsk_library/hsk1_lesson_12.json";
import lesson13 from "../../../content/hsk_library/hsk1_lesson_13.json";
import lesson14 from "../../../content/hsk_library/hsk1_lesson_14.json";
import lesson15 from "../../../content/hsk_library/hsk1_lesson_15.json";
import lesson16 from "../../../content/hsk_library/hsk1_lesson_16.json";
import lesson17 from "../../../content/hsk_library/hsk1_lesson_17.json";
import lesson18 from "../../../content/hsk_library/hsk1_lesson_18.json";
import lesson19 from "../../../content/hsk_library/hsk1_lesson_19.json";
import lesson20 from "../../../content/hsk_library/hsk1_lesson_20.json";
import lesson21 from "../../../content/hsk_library/hsk1_lesson_21.json";
import lesson22 from "../../../content/hsk_library/hsk1_lesson_22.json";
import lesson23 from "../../../content/hsk_library/hsk1_lesson_23.json";
import lesson24 from "../../../content/hsk_library/hsk1_lesson_24.json";
import lesson25 from "../../../content/hsk_library/hsk1_lesson_25.json";
import lesson26 from "../../../content/hsk_library/hsk1_lesson_26.json";
import checkpoint1 from "../../../content/hsk_library/hsk1_checkpoint_01.json";
import checkpoint2 from "../../../content/hsk_library/hsk1_checkpoint_02.json";
import checkpoint3 from "../../../content/hsk_library/hsk1_checkpoint_03.json";
import checkpoint4 from "../../../content/hsk_library/hsk1_checkpoint_04.json";
import checkpoint5 from "../../../content/hsk_library/hsk1_checkpoint_05.json";
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
    translationVi?: string;
    vi?: string;
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
  lesson1 as unknown as NineStageLessonData,
  checkpoint1 as unknown as NineStageLessonData,
  lesson5 as unknown as NineStageLessonData,
  lesson6 as unknown as NineStageLessonData,
  lesson7 as unknown as NineStageLessonData,
  lesson8 as unknown as NineStageLessonData,
  checkpoint2 as unknown as NineStageLessonData,
  lesson9 as unknown as NineStageLessonData,
  lesson10 as unknown as NineStageLessonData,
  lesson11 as unknown as NineStageLessonData,
  lesson12 as unknown as NineStageLessonData,
  lesson13 as unknown as NineStageLessonData,
  lesson14 as unknown as NineStageLessonData,
  checkpoint3 as unknown as NineStageLessonData,
  lesson15 as unknown as NineStageLessonData,
  lesson16 as unknown as NineStageLessonData,
  lesson17 as unknown as NineStageLessonData,
  lesson18 as unknown as NineStageLessonData,
  lesson19 as unknown as NineStageLessonData,
  lesson20 as unknown as NineStageLessonData,
  checkpoint4 as unknown as NineStageLessonData,
  lesson21 as unknown as NineStageLessonData,
  lesson22 as unknown as NineStageLessonData,
  lesson23 as unknown as NineStageLessonData,
  lesson24 as unknown as NineStageLessonData,
  lesson25 as unknown as NineStageLessonData,
  lesson26 as unknown as NineStageLessonData,
  checkpoint5 as unknown as NineStageLessonData,
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
