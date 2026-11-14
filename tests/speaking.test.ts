import { describe, expect, it } from "vitest";
import {
  normalizeChineseText,
  evaluateSpeakingAttempt,
} from "@/features/speaking/matcher";
import { generateSpeakingSession } from "@/features/speaking/generator";
import { getRecognitionErrorMessage } from "@/lib/mandarin-recognition";
import type { ListeningCurriculumData } from "@/features/listening/types";

const mockCurriculum: ListeningCurriculumData = {
  lessons: [
    { id: "l1", title: "Bài 1", sortOrder: 1 },
    { id: "l2", title: "Bài 2", sortOrder: 2 },
  ],
  vocabulary: [
    { id: "v1", simplified: "你好", pinyin: "nǐ hǎo", meaningVi: "xin chào", lessonId: "l1" },
    { id: "v2", simplified: "谢谢", pinyin: "xièxie", meaningVi: "cảm ơn", lessonId: "l1" },
    { id: "v3", simplified: "学生", pinyin: "xuésheng", meaningVi: "học sinh", lessonId: "l2" },
  ],
  sentences: [
    { hanzi: "你好！你好吗？", pinyin: "Nǐ hǎo! Nǐ hǎo ma?", translationVi: "Chào bạn! Bạn có khỏe không?", lessonId: "l1" },
    { hanzi: "我是越南人。", pinyin: "Wǒ shì Yuènán rén.", translationVi: "Tôi là người Việt Nam.", lessonId: "l2" },
  ],
};

describe("Speaking Matcher & Recognizer", () => {
  it("normalizes Chinese text by removing punctuation and whitespace", () => {
    expect(normalizeChineseText("你好！")).toBe("你好");
    expect(normalizeChineseText("我 很好， 谢谢 你！")).toBe("我很好谢谢你");
    expect(normalizeChineseText("今天 几月 几号？")).toBe("今天几月几号");
    expect(normalizeChineseText("")).toBe("");
  });

  it("evaluates exact character matches correctly", () => {
    const res1 = evaluateSpeakingAttempt("你好", "你好");
    expect(res1.status).toBe("exact");
    expect(res1.badgeLabel).toBe("Khớp chính xác chữ Hán");

    // Exact match ignoring punctuation
    const res2 = evaluateSpeakingAttempt("你好！", "你好");
    expect(res2.status).toBe("exact");

    const res3 = evaluateSpeakingAttempt("我是越南人。", "我是越南人");
    expect(res3.status).toBe("exact");

    // Checks disclaimer presence
    expect(res1.disclaimer).toContain("không thể đo lường chuẩn xác thanh điệu");
  });

  it("evaluates partial matches correctly", () => {
    // Spoken text is substring of target
    const res1 = evaluateSpeakingAttempt("我很好，谢谢你！", "我很好");
    expect(res1.status).toBe("partial");
    expect(res1.badgeLabel).toBe("Gần khớp");

    // Target is substring of spoken text
    const res2 = evaluateSpeakingAttempt("你好", "你好吗");
    expect(res2.status).toBe("partial");
  });

  it("evaluates retry matches when completely different or empty", () => {
    const res1 = evaluateSpeakingAttempt("你好", "谢谢");
    expect(res1.status).toBe("retry");
    expect(res1.badgeLabel).toBe("Cần thử lại");

    const res2 = evaluateSpeakingAttempt("你好", "");
    expect(res2.status).toBe("retry");
    expect(res2.badgeLabel).toBe("Chưa nhận được âm thanh");
  });

  it("provides helpful error messages for recognition error codes", () => {
    expect(getRecognitionErrorMessage("not-allowed")).toContain("Quyền truy cập micro");
    expect(getRecognitionErrorMessage("no-speech")).toContain("Không phát hiện giọng nói");
    expect(getRecognitionErrorMessage("audio-capture")).toContain("Không tìm thấy thiết bị micro");
    expect(getRecognitionErrorMessage("unsupported")).toContain("chưa hỗ trợ nhận dạng giọng nói");
  });

  it("generates speaking items session filtered by type and lesson", () => {
    // All items
    const sessionAll = generateSpeakingSession(
      { lessonId: "all", type: "all", count: 10 },
      mockCurriculum,
      42,
    );
    expect(sessionAll).toHaveLength(5); // 3 words + 2 sentences

    // Word only
    const sessionWords = generateSpeakingSession(
      { lessonId: "all", type: "word", count: 2 },
      mockCurriculum,
      42,
    );
    expect(sessionWords).toHaveLength(2);
    expect(sessionWords.every((item) => item.type === "word")).toBe(true);

    // Sentence only
    const sessionSentences = generateSpeakingSession(
      { lessonId: "all", type: "sentence", count: 5 },
      mockCurriculum,
      42,
    );
    expect(sessionSentences).toHaveLength(2);
    expect(sessionSentences.every((item) => item.type === "sentence")).toBe(true);

    // Filtered by lesson
    const sessionL1 = generateSpeakingSession(
      { lessonId: "l1", type: "all", count: 5 },
      mockCurriculum,
      42,
    );
    expect(sessionL1).toHaveLength(3); // 2 words in l1 + 1 sentence in l1
    expect(sessionL1.every((item) => item.lessonId === "l1")).toBe(true);
  });
});
