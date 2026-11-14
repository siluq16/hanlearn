import type {
  ListeningCurriculumData,
  ListeningOption,
  ListeningQuestion,
  ListeningQuestionType,
  ListeningSentenceItem,
  ListeningSessionConfig,
  ListeningVocabularyItem,
} from "./types";

/**
 * Clean up Vietnamese translation text for display (remove speaker prefix e.g. "A: ", "B: ", "Tình huống A — hỏi: ", parenthetical notes)
 */
export function cleanTranslation(text: string): string {
  return text
    .replace(/^[A-Z]\s*:\s*/u, "")
    .replace(/^Tình huống [A-Z]\s*—\s*(?:hỏi|đáp)\s*:\s*/u, "")
    .replace(/^B nói thêm về bản thân:\s*/u, "")
    .replace(/\s*\([^)]*\)/gu, "")
    .trim();
}

/**
 * Fisher-Yates array shuffle
 */
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

/**
 * Generate Type A question: Nghe từ và chọn nghĩa tiếng Việt
 */
export function generateWordToMeaningQuestion(
  target: ListeningVocabularyItem,
  allVocab: ListeningVocabularyItem[],
  id: string,
): ListeningQuestion | null {
  const correctText = target.meaningVi.trim();
  const pool = allVocab.filter(
    (v) => v.id !== target.id && v.meaningVi.trim() !== correctText,
  );

  if (pool.length < 3) return null;

  const shuffledPool = shuffleArray(pool);
  const distractors: string[] = [];
  const seen = new Set<string>([correctText]);

  for (const item of shuffledPool) {
    const text = item.meaningVi.trim();
    if (!seen.has(text)) {
      seen.add(text);
      distractors.push(text);
      if (distractors.length === 3) break;
    }
  }

  if (distractors.length < 3) return null;

  const rawOptions: ListeningOption[] = [
    { id: "opt-correct", text: correctText, isCorrect: true },
    { id: "opt-dist-1", text: distractors[0], isCorrect: false },
    { id: "opt-dist-2", text: distractors[1], isCorrect: false },
    { id: "opt-dist-3", text: distractors[2], isCorrect: false },
  ];

  const shuffledOptions = shuffleArray(rawOptions).map((opt, idx) => ({
    ...opt,
    id: `opt-${idx + 1}`,
  }));

  return {
    id,
    type: "word_to_meaning",
    prompt: "Nghe phát âm từ vựng và chọn nghĩa tiếng Việt đúng:",
    audioText: target.simplified,
    options: shuffledOptions,
    reveal: {
      hanzi: target.simplified,
      pinyin: target.pinyin,
      meaningVi: target.meaningVi,
      explanation: target.exampleZh
        ? `Ví dụ: ${target.exampleZh} (${target.examplePinyin ?? ""} — ${target.exampleVi ?? ""})`
        : undefined,
    },
    lessonId: target.lessonId,
  };
}

/**
 * Generate Type B question: Nghe từ và chọn chữ Hán đúng
 */
export function generateWordToHanziQuestion(
  target: ListeningVocabularyItem,
  allVocab: ListeningVocabularyItem[],
  id: string,
): ListeningQuestion | null {
  const correctText = target.simplified.trim();
  const pool = allVocab.filter(
    (v) => v.id !== target.id && v.simplified.trim() !== correctText,
  );

  if (pool.length < 3) return null;

  const shuffledPool = shuffleArray(pool);
  const distractors: string[] = [];
  const seen = new Set<string>([correctText]);

  for (const item of shuffledPool) {
    const text = item.simplified.trim();
    if (!seen.has(text)) {
      seen.add(text);
      distractors.push(text);
      if (distractors.length === 3) break;
    }
  }

  if (distractors.length < 3) return null;

  const rawOptions: ListeningOption[] = [
    { id: "opt-correct", text: correctText, isCorrect: true },
    { id: "opt-dist-1", text: distractors[0], isCorrect: false },
    { id: "opt-dist-2", text: distractors[1], isCorrect: false },
    { id: "opt-dist-3", text: distractors[2], isCorrect: false },
  ];

  const shuffledOptions = shuffleArray(rawOptions).map((opt, idx) => ({
    ...opt,
    id: `opt-${idx + 1}`,
  }));

  return {
    id,
    type: "word_to_hanzi",
    prompt: "Nghe phát âm và chọn chữ Hán đúng:",
    audioText: target.simplified,
    options: shuffledOptions,
    reveal: {
      hanzi: target.simplified,
      pinyin: target.pinyin,
      meaningVi: target.meaningVi,
      explanation: `Nghĩa: ${target.meaningVi}`,
    },
    lessonId: target.lessonId,
  };
}

/**
 * Generate Type C question: Nghe câu và chọn nghĩa đúng
 */
export function generateSentenceComprehensionQuestion(
  target: ListeningSentenceItem,
  allSentences: ListeningSentenceItem[],
  id: string,
): ListeningQuestion | null {
  const correctText = cleanTranslation(target.translationVi);
  const pool = allSentences.filter(
    (s) =>
      s.hanzi !== target.hanzi &&
      cleanTranslation(s.translationVi) !== correctText,
  );

  if (pool.length < 3) return null;

  const shuffledPool = shuffleArray(pool);
  const distractors: string[] = [];
  const seen = new Set<string>([correctText]);

  for (const item of shuffledPool) {
    const text = cleanTranslation(item.translationVi);
    if (!seen.has(text) && text.length > 0) {
      seen.add(text);
      distractors.push(text);
      if (distractors.length === 3) break;
    }
  }

  if (distractors.length < 3) return null;

  const rawOptions: ListeningOption[] = [
    { id: "opt-correct", text: correctText, isCorrect: true },
    { id: "opt-dist-1", text: distractors[0], isCorrect: false },
    { id: "opt-dist-2", text: distractors[1], isCorrect: false },
    { id: "opt-dist-3", text: distractors[2], isCorrect: false },
  ];

  const shuffledOptions = shuffleArray(rawOptions).map((opt, idx) => ({
    ...opt,
    id: `opt-${idx + 1}`,
  }));

  return {
    id,
    type: "sentence_comprehension",
    prompt: "Nghe câu và chọn nghĩa đúng của câu:",
    audioText: target.hanzi,
    options: shuffledOptions,
    reveal: {
      hanzi: target.hanzi,
      pinyin: target.pinyin,
      meaningVi: correctText,
      explanation: `${target.pinyin} — ${correctText}`,
    },
    lessonId: target.lessonId,
  };
}

/**
 * Generate a complete listening session based on curriculum data and user configuration
 */
export function generateListeningSession(
  config: ListeningSessionConfig,
  data: ListeningCurriculumData,
  seed?: number,
): ListeningQuestion[] {
  const { lessonId, questionType, questionCount } = config;

  // Filter pool by lesson if requested
  const targetVocab =
    lessonId === "all"
      ? data.vocabulary
      : data.vocabulary.filter((v) => v.lessonId === lessonId);

  // If lesson has too few words, fall back to all vocabulary for distractors
  const vocabPool = targetVocab.length >= 4 ? targetVocab : data.vocabulary;
  const distractorVocabPool = data.vocabulary;

  const targetSentences =
    lessonId === "all"
      ? data.sentences
      : data.sentences.filter((s) => s.lessonId === lessonId);
  const sentencePool =
    targetSentences.length >= 4 ? targetSentences : data.sentences;

  const questions: ListeningQuestion[] = [];
  let counter = 1;

  // Question types to include
  const types: ListeningQuestionType[] =
    questionType === "all"
      ? ["word_to_meaning", "word_to_hanzi", "sentence_comprehension"]
      : [questionType];

  const shuffledVocab = shuffleArray(vocabPool, seed);
  const shuffledSentences = shuffleArray(sentencePool, seed ? seed + 1 : undefined);

  // Distribute questions evenly across requested types
  if (types.includes("word_to_meaning")) {
    for (const item of shuffledVocab) {
      if (questions.length >= questionCount * 2) break;
      const q = generateWordToMeaningQuestion(
        item,
        distractorVocabPool,
        `q-meaning-${counter++}`,
      );
      if (q) questions.push(q);
    }
  }

  if (types.includes("word_to_hanzi")) {
    for (const item of shuffledVocab) {
      if (questions.length >= questionCount * 3) break;
      const q = generateWordToHanziQuestion(
        item,
        distractorVocabPool,
        `q-hanzi-${counter++}`,
      );
      if (q) questions.push(q);
    }
  }

  if (types.includes("sentence_comprehension")) {
    for (const item of shuffledSentences) {
      if (questions.length >= questionCount * 4) break;
      const q = generateSentenceComprehensionQuestion(
        item,
        sentencePool,
        `q-sentence-${counter++}`,
      );
      if (q) questions.push(q);
    }
  }

  // Shuffle final list and slice to requested count
  const finalQuestions = shuffleArray(questions, seed ? seed + 2 : undefined).slice(
    0,
    Math.max(1, Math.min(questionCount, questions.length)),
  );

  return finalQuestions;
}
