export interface MockExamQuestion {
  id: string;
  sort_order: number;
  section: "listening" | "reading";
  part: number;
  audio_text?: string;
  prompt: string;
  choices: string[];
  explanation_vi?: string;
}

export interface MockExamSection {
  id: string;
  title: string;
  questions_range: string;
  description: string;
}

export interface MockExamDefinition {
  id: string;
  slug: string;
  title: string;
  syllabus: string;
  duration_minutes: number;
  total_questions: number;
  listening_questions: number;
  reading_questions: number;
  max_score: number;
  pass_score: number;
  sections: MockExamSection[];
  questions: MockExamQuestion[];
}

export interface MockExamResult {
  examId: string;
  totalQuestions: number;
  totalScore: number;
  maxScore: number;
  listeningCorrect: number;
  listeningScore: number;
  readingCorrect: number;
  readingScore: number;
  passed: boolean;
  timeSpentSeconds: number;
  questionResults: {
    questionId: string;
    sortOrder: number;
    section: "listening" | "reading";
    userChoice: number | null;
    correctChoice: number;
    isCorrect: boolean;
    explanationVi: string;
  }[];
}
