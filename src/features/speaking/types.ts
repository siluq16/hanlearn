import type { SpeakingMatchStatus } from "./matcher";

export interface SpeakingItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  type: "word" | "sentence";
  lessonId?: string;
  lessonTitle?: string;
}

export interface SpeakingSessionConfig {
  lessonId: string | "all";
  type: "all" | "word" | "sentence";
  count: number;
}

export interface SpeakingItemResult {
  item: SpeakingItem;
  transcript: string;
  status: SpeakingMatchStatus;
  attempts: number;
}

export interface SpeakingSessionSummary {
  total: number;
  exactCount: number;
  partialCount: number;
  retryCount: number;
  items: SpeakingItemResult[];
}
