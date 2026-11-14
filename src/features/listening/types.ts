export type ListeningQuestionType =
  | "word_to_meaning" // Dạng A: Nghe từ và chọn nghĩa tiếng Việt
  | "word_to_hanzi" // Dạng B: Nghe từ và chọn chữ Hán
  | "sentence_comprehension"; // Dạng C: Nghe câu và chọn nghĩa đúng

export interface ListeningOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ListeningReveal {
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  explanation?: string;
}

export interface ListeningQuestion {
  id: string;
  type: ListeningQuestionType;
  prompt: string;
  audioText: string;
  options: ListeningOption[];
  reveal: ListeningReveal;
  lessonId?: string;
  lessonTitle?: string;
}

export interface ListeningVocabularyItem {
  id: string;
  simplified: string;
  pinyin: string;
  meaningVi: string;
  exampleZh?: string;
  examplePinyin?: string;
  exampleVi?: string;
  lessonId?: string;
}

export interface ListeningSentenceItem {
  hanzi: string;
  pinyin: string;
  translationVi: string;
  lessonId?: string;
}

export interface ListeningLessonItem {
  id: string;
  title: string;
  sortOrder: number;
}

export interface ListeningCurriculumData {
  lessons: ListeningLessonItem[];
  vocabulary: ListeningVocabularyItem[];
  sentences: ListeningSentenceItem[];
}

export interface ListeningSessionConfig {
  lessonId: string | "all";
  questionType: ListeningQuestionType | "all";
  questionCount: number;
}

export interface ListeningSessionResultItem {
  question: ListeningQuestion;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface ListeningSessionSummary {
  total: number;
  correctCount: number;
  wrongCount: number;
  items: ListeningSessionResultItem[];
}
