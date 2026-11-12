import type { LessonContent } from "./schemas";
export type Provenance = {
  sourceUri: string;
  license: string;
  reviewedBy: string;
  reviewedAt: string;
};
export type LessonWord = {
  id: string;
  hanzi: string;
  traditional: string | null;
  pinyin: string;
  meaningVi: string;
  example: { hanzi: string; pinyin?: string; translationVi?: string } | null;
  provenance: Provenance;
  audio: { status: "unavailable"; reason: "storage_unverified" };
};
export type LessonGrammar = {
  id: string;
  title: string;
  pattern: string;
  explanationVi: string;
  examples: { hanzi: string; pinyin?: string; translationVi?: string }[];
  provenance: Provenance;
};
export type LessonBundle = {
  lesson: {
    id: string;
    title: string;
    objectiveVi: string | null;
    estimatedMinutes: number;
    provenance: Provenance;
  };
  syllabus: { id: string; code: string; title: string; provenance: Provenance };
  course: {
    id: string;
    title: string;
    hskLevel: number;
    provenance: Provenance;
  };
  unit: { id: string; title: string; provenance: Provenance };
  content: LessonContent;
  vocabulary: LessonWord[];
  grammar: LessonGrammar[];
  progress: { studiedAt: string | null; completedAt: string | null };
};
export type LessonReadResult =
  { kind: "ready"; bundle: LessonBundle } | { kind: "invalid-content" } | null;
