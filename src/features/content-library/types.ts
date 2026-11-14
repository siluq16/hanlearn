/**
 * HanLearn Unified Content Library Architecture (HSK 1–5)
 * Defines standardized domain contracts for Vocabulary, Grammar, Dialogues,
 * Reading Passages, Exercises, and Lesson Structure.
 */

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type QualityStatus = "VERIFIED" | "NEEDS_REVIEW" | "DRAFT" | "REJECTED" | "UNVERIFIED_AUTOMATED";
export type CurriculumVersion =
  | "hsk2.0"
  | "hsk3.0"
  | "pilot_r3"
  | "GF0025_2021"
  | "HSK_EXAM_2025";

export interface SourceReference {
  document: string;
  edition?: string;
  page?: number;
  originalIndex?: number;
  license: string;
  notes?: string;
}

// 1. Vocabulary Entry
export interface LibraryVocabulary {
  id: string; // e.g. "voc-hsk1-001"
  simplified: string;
  traditional?: string;
  pinyin: string;
  meaningVi: string;
  meaningEn?: string;
  partOfSpeech?: string;
  hskLevel: HskLevel;
  curriculumVersion: CurriculumVersion;
  isOfficialHsk: boolean;
  isSupplemental: boolean;
  isHsk2025Core?: boolean;
  exampleSentence?: {
    hanzi: string;
    pinyin: string;
    translationVi: string;
  };
  audioUrl?: string;
  qualityStatus: QualityStatus;
  sourceRef: SourceReference;
}

// 2. Grammar Point
export interface LibraryGrammar {
  id: string; // e.g. "grm-hsk1-001"
  titleVi: string;
  pattern: string; // e.g. "S + 是 + N"
  explanationVi: string;
  hskLevel: HskLevel;
  examples: {
    hanzi: string;
    pinyin: string;
    translationVi: string;
  }[];
  notes?: string;
  qualityStatus: QualityStatus;
  sourceRef: SourceReference;
}

// 3. Dialogue Turn & Dialogue
export interface DialogueTurn {
  id: string;
  turnIndex: number;
  speaker: string; // e.g. "王明华", "方大伟", "A", "B"
  hanzi: string;
  traditional?: string;
  pinyin: string;
  meaningVi: string;
  meaningEn?: string;
  audioUrl?: string;
  keyVocabIds?: string[];
  grammarIds?: string[];
}

export interface LibraryDialogue {
  id: string; // e.g. "dlg-hsk1-001"
  lessonNumber: number;
  topicVi: string;
  topicEn?: string;
  hskLevel: HskLevel;
  difficultyScore: number; // 1 to 5
  turns: DialogueTurn[];
  qualityStatus: QualityStatus;
  clientBundling?: "SERVER_DRAFT_ONLY" | "APPROVED_CLIENT";
  sourceRef: SourceReference;
}

// 4. Reading Passage
export interface LibraryReadingPassage {
  id: string; // e.g. "rdg-hsk1-001"
  title: string;
  paragraphs: {
    hanzi: string;
    pinyin?: string;
    translationVi?: string;
  }[];
  wordCount: number;
  hskLevel: HskLevel;
  glossaryWordIds?: string[];
  qualityStatus: QualityStatus;
  sourceRef: SourceReference;
}

// 5. Interactive Exercise Types (Extended Sprint 8B)
export type ExerciseKind =
  | "vocab-mcq"
  | "matching"
  | "matching_pairs"
  | "fill-blank"
  | "sentence-order"
  | "grammar-choice"
  | "grammar_fill_blank"
  | "listen-fill"
  | "listening_cloze"
  | "listening_dictation"
  | "dialogue-response"
  | "dialogue_roleplay"
  | "reading-mcq"
  | "reading_true_false"
  | "sentence_shadowing";

export interface ExerciseOption {
  id: string;
  label: string; // text displayed on the option button
  isCorrect: boolean;
  explanationVi?: string;
}

export interface LibraryExercise {
  id: string;
  lessonId: string;
  sortOrder: number;
  kind: ExerciseKind;
  hskLevel: HskLevel;
  promptVi: string;
  targetContent?: {
    hanzi?: string;
    pinyin?: string;
    audioText?: string;
    translationVi?: string;
    speaker?: string;
  };
  options?: ExerciseOption[];
  // For matching exercises:
  matchingPairs?: {
    leftId: string;
    leftLabel: string;
    rightId: string;
    rightLabel: string;
  }[];
  // For sentence ordering:
  orderTokens?: {
    id: string;
    text: string;
    correctIndex: number;
  }[];
  // For fill-in-the-blank & cloze:
  blankTemplate?: string; // e.g. "我叫王明华，是你的新____。"
  expectedAnswer?: string;
  // For reading comprehension questions:
  readingPassage?: {
    title: string;
    text: string;
    translationVi?: string;
  };
  // For true/false evaluation:
  trueFalseStatement?: {
    statement: string;
    isTrue: boolean;
    explanationVi: string;
  };
  qualityStatus: QualityStatus;
  sourceRef: SourceReference;
}

// 6. Complete 9-Stage Lesson Mapping (Phase 5)
export type LessonStageKind =
  | "0_warmup"
  | "1_vocab_learn"
  | "2_vocab_practice"
  | "3_grammar_learn"
  | "4_grammar_practice"
  | "5_dialogue_interactive"
  | "6_listening_speaking"
  | "7_reading_comprehension"
  | "8_mini_quiz"
  | "9_srs_review";

export interface LessonContentMapping {
  lessonId: string;
  hskLevel: HskLevel;
  courseId: string;
  unitId: string;
  title: string;
  objectiveVi: string;
  estimatedMinutes: number;
  stages: {
    stage: LessonStageKind;
    titleVi: string;
    contentRefs: {
      vocabularyIds?: string[];
      grammarIds?: string[];
      dialogueId?: string;
      readingPassageId?: string;
      exerciseIds?: string[];
      quizId?: string;
    };
  }[];
}
