export type PracticeSkill =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "reading"
  | "dialogue";

export type PracticeDifficulty = "easy" | "medium" | "hard";

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
  questions?: PracticeQuestion[];
  turns?: DialogueTurn[];
}
