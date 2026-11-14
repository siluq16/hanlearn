import type { LessonBundle, LessonGrammar, LessonWord } from "../types";

// Presentation accepts truthful draft provenance. Published DTOs remain strict.
export type ReaderProvenance = {
  sourceUri: string;
  license: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};
export type ReaderWord = Omit<LessonWord, "provenance"> & {
  provenance: ReaderProvenance;
};
export type ReaderGrammar = Omit<LessonGrammar, "provenance"> & {
  provenance: ReaderProvenance;
};
export type ReaderContent = {
  content: LessonBundle["content"];
  vocabulary: ReaderWord[];
  grammar: ReaderGrammar[];
  lessonId?: string;
};
