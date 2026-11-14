import { describe, expect, it } from "vitest";
import {
  cleanTranslation,
  generateWordToMeaningQuestion,
  generateWordToHanziQuestion,
  generateSentenceComprehensionQuestion,
  generateListeningSession,
} from "@/features/listening/generator";
import type {
  ListeningCurriculumData,
  ListeningVocabularyItem,
  ListeningSentenceItem,
} from "@/features/listening/types";

const mockVocab: ListeningVocabularyItem[] = [
  { id: "v1", simplified: "你好", pinyin: "nǐ hǎo", meaningVi: "xin chào", lessonId: "l1" },
  { id: "v2", simplified: "谢谢", pinyin: "xièxie", meaningVi: "cảm ơn", lessonId: "l1" },
  { id: "v3", simplified: "再见", pinyin: "zàijiàn", meaningVi: "tạm biệt", lessonId: "l1" },
  { id: "v4", simplified: "学生", pinyin: "xuésheng", meaningVi: "học sinh", lessonId: "l2" },
  { id: "v5", simplified: "老师", pinyin: "lǎoshī", meaningVi: "giáo viên", lessonId: "l2" },
  { id: "v6", simplified: "朋友", pinyin: "péngyou", meaningVi: "bạn bè", lessonId: "l2" },
];

const mockSentences: ListeningSentenceItem[] = [
  { hanzi: "你好！", pinyin: "Nǐ hǎo!", translationVi: "A: Xin chào!", lessonId: "l1" },
  { hanzi: "你好吗？", pinyin: "Nǐ hǎo ma?", translationVi: "B: Bạn có khỏe không?", lessonId: "l1" },
  { hanzi: "我很好。", pinyin: "Wǒ hěn hǎo.", translationVi: "A: Tôi rất khỏe.", lessonId: "l1" },
  { hanzi: "我是学生。", pinyin: "Wǒ shì xuésheng.", translationVi: "Tôi là học sinh.", lessonId: "l2" },
  { hanzi: "他是老师。", pinyin: "Tā shì lǎoshī.", translationVi: "Thầy ấy là giáo viên.", lessonId: "l2" },
];

const mockCurriculum: ListeningCurriculumData = {
  lessons: [
    { id: "l1", title: "Bài 1", sortOrder: 1 },
    { id: "l2", title: "Bài 2", sortOrder: 2 },
  ],
  vocabulary: mockVocab,
  sentences: mockSentences,
};

describe("Listening Practice Generator", () => {
  it("cleans speaker and situation prefixes from translation", () => {
    expect(cleanTranslation("A: Xin chào!")).toBe("Xin chào!");
    expect(cleanTranslation("B: Bạn có khỏe không?")).toBe("Bạn có khỏe không?");
    expect(cleanTranslation("Tình huống A — hỏi: Hôm nay là thứ mấy?")).toBe("Hôm nay là thứ mấy?");
    expect(cleanTranslation("Tôi khỏe.")).toBe("Tôi khỏe.");
  });

  it("generates Type A: Nghe từ và chọn nghĩa tiếng Việt correctly", () => {
    const q = generateWordToMeaningQuestion(mockVocab[0], mockVocab, "q1");
    expect(q).not.toBeNull();
    if (!q) return;

    expect(q.type).toBe("word_to_meaning");
    expect(q.audioText).toBe("你好");
    expect(q.options).toHaveLength(4);

    const correctOptions = q.options.filter((o) => o.isCorrect);
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].text).toBe("xin chào");

    // All options must be distinct
    const texts = new Set(q.options.map((o) => o.text));
    expect(texts.size).toBe(4);

    // Audio text (Hanzi) must not appear in any option
    expect(texts.has("你好")).toBe(false);
  });

  it("generates Type B: Nghe từ và chọn chữ Hán correctly", () => {
    const q = generateWordToHanziQuestion(mockVocab[1], mockVocab, "q2");
    expect(q).not.toBeNull();
    if (!q) return;

    expect(q.type).toBe("word_to_hanzi");
    expect(q.audioText).toBe("谢谢");
    expect(q.options).toHaveLength(4);

    const correctOptions = q.options.filter((o) => o.isCorrect);
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].text).toBe("谢谢");

    const texts = new Set(q.options.map((o) => o.text));
    expect(texts.size).toBe(4);
  });

  it("generates Type C: Nghe câu và chọn nghĩa đúng", () => {
    const q = generateSentenceComprehensionQuestion(mockSentences[0], mockSentences, "q3");
    expect(q).not.toBeNull();
    if (!q) return;

    expect(q.type).toBe("sentence_comprehension");
    expect(q.audioText).toBe("你好！");
    expect(q.options).toHaveLength(4);

    const correctOptions = q.options.filter((o) => o.isCorrect);
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].text).toBe("Xin chào!");

    const texts = new Set(q.options.map((o) => o.text));
    expect(texts.size).toBe(4);
  });

  it("generates a full session respecting count, lesson filter, and type", () => {
    // Session filtered to Lesson 1 only
    const sessionL1 = generateListeningSession(
      { lessonId: "l1", questionType: "all", questionCount: 5 },
      mockCurriculum,
      42,
    );
    expect(sessionL1.length).toBeGreaterThanOrEqual(1);
    expect(sessionL1.length).toBeLessThanOrEqual(5);

    // Session filtered to Word to Meaning only
    const sessionTypeA = generateListeningSession(
      { lessonId: "all", questionType: "word_to_meaning", questionCount: 4 },
      mockCurriculum,
      42,
    );
    expect(sessionTypeA).toHaveLength(4);
    for (const q of sessionTypeA) {
      expect(q.type).toBe("word_to_meaning");
      expect(q.options).toHaveLength(4);
      expect(q.options.filter((o) => o.isCorrect)).toHaveLength(1);
    }

    // Session filtered to Word to Hanzi only
    const sessionTypeB = generateListeningSession(
      { lessonId: "all", questionType: "word_to_hanzi", questionCount: 4 },
      mockCurriculum,
      42,
    );
    expect(sessionTypeB).toHaveLength(4);
    for (const q of sessionTypeB) {
      expect(q.type).toBe("word_to_hanzi");
    }

    // Session filtered to Sentence comprehension only
    const sessionTypeC = generateListeningSession(
      { lessonId: "all", questionType: "sentence_comprehension", questionCount: 3 },
      mockCurriculum,
      42,
    );
    expect(sessionTypeC.length).toBeGreaterThanOrEqual(1);
    for (const q of sessionTypeC) {
      expect(q.type).toBe("sentence_comprehension");
    }
  });

  it("handles small pool gracefully without duplicating options or throwing", () => {
    const tinyVocab = mockVocab.slice(0, 2);
    const q = generateWordToMeaningQuestion(tinyVocab[0], tinyVocab, "tiny");
    expect(q).toBeNull(); // Gracefully returns null when distractors are insufficient
  });
});
