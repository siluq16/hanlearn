export type PracticeSkill =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "reading"
  | "dialogue";

export type PracticeDifficulty = "easy" | "medium" | "hard";

export type PracticePresentationMode =
  | "single_question"
  | "matching_board"
  | "reading_comprehension"
  | "listening_comprehension"
  | "dialogue_roleplay"
  | "exam";

export interface SharedStimulus {
  type: "text_passage" | "audio" | "dialogue_script";
  title?: string;
  content?: string;             // Text passage content
  paragraphs?: string[];        // Multi-paragraph reading passage
  pinyin?: string;
  translationVi?: string;
  audioText?: string;           // Mandarin text for TTS synthesis
  audioUrl?: string;            // Direct audio file URL if available
  audioDurationSeconds?: number;
  dialogueTurns?: DialogueTurn[];
}

export interface PracticeQuestion {
  id: string;
  type: string;
  prompt: string;
  hanzi?: string;
  pinyin?: string;
  meaning_vi?: string;
  audioText?: string;
  passage?: string;
  choices?: string[];
  correct_index?: number;
  explanation_vi?: string;
  tokens?: string[];
  targetSentence?: string;
  pairs?: { left: string; right: string }[];
  targetText?: string;
  acceptedAnswers?: string[];
}

export interface DialogueTurn {
  role: "A" | "B";
  speaker: string;
  hanzi: string;
  pinyin: string;
  vi: string;
}

export interface PracticeSet {
  practice_set_id: string;
  course_id: string;
  unit_id: string;
  skill: PracticeSkill;
  exercise_type: string;
  title: string;
  description: string;
  difficulty: PracticeDifficulty;
  question_count: number;
  presentation_mode?: PracticePresentationMode;
  stimulus?: SharedStimulus;
  questions?: PracticeQuestion[];
  turns?: DialogueTurn[];
}

/**
 * Automatically resolves the optimal presentation mode for any practice set,
 * supporting both modern shared stimulus sets and legacy sets.
 */
export function resolvePracticePresentationMode(set: PracticeSet): PracticePresentationMode {
  if (set.presentation_mode) {
    return set.presentation_mode;
  }

  // Dialogue sets
  if (set.skill === "dialogue" || (set.turns && set.turns.length > 0)) {
    return "dialogue_roleplay";
  }

  // Matching sets
  if (
    set.exercise_type === "matching" ||
    set.exercise_type === "matching_pairs" ||
    set.questions?.some((q) => q.pairs && q.pairs.length > 0)
  ) {
    return "matching_board";
  }

  // Reading comprehension sets with shared passage
  if (
    set.stimulus?.type === "text_passage" ||
    set.exercise_type === "passage_qa" ||
    (set.skill === "reading" && set.questions && set.questions.some((q) => q.passage))
  ) {
    return "reading_comprehension";
  }

  // Shared audio listening sets
  if (
    set.stimulus?.type === "audio" ||
    (set.skill === "listening" && set.stimulus?.audioText)
  ) {
    return "listening_comprehension";
  }

  // Default to adaptive single question stepper
  return "single_question";
}
