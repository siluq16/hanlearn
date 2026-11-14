import type { ListeningCurriculumData } from "@/features/listening/types";
import type { SpeakingItem, SpeakingSessionConfig } from "./types";

function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  let s = seed !== undefined ? seed : Math.random() * 100000;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const j = Math.floor(rnd * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateSpeakingSession(
  config: SpeakingSessionConfig,
  curriculum: ListeningCurriculumData,
  seed?: number,
): SpeakingItem[] {
  const { lessonId, type, count } = config;

  const items: SpeakingItem[] = [];

  // 1. Gather vocabulary items
  if (type === "all" || type === "word") {
    const vocabPool =
      lessonId === "all"
        ? curriculum.vocabulary
        : curriculum.vocabulary.filter((v) => v.lessonId === lessonId);

    for (const v of vocabPool) {
      items.push({
        id: `spk-word-${v.id}`,
        hanzi: v.simplified,
        pinyin: v.pinyin,
        meaningVi: v.meaningVi,
        type: "word",
        lessonId: v.lessonId,
      });
    }
  }

  // 2. Gather sentence items
  if (type === "all" || type === "sentence") {
    const sentencePool =
      lessonId === "all"
        ? curriculum.sentences
        : curriculum.sentences.filter((s) => s.lessonId === lessonId);

    for (let i = 0; i < sentencePool.length; i++) {
      const s = sentencePool[i];
      items.push({
        id: `spk-sent-${i + 1}`,
        hanzi: s.hanzi,
        pinyin: s.pinyin,
        meaningVi: s.translationVi,
        type: "sentence",
        lessonId: s.lessonId,
      });
    }
  }

  if (items.length === 0) return [];

  const shuffled = shuffleArray(items, seed);
  return shuffled.slice(0, Math.max(1, Math.min(count, shuffled.length)));
}
