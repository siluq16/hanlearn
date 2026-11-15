import { describe, it, expect } from "vitest";
import { sanitizeCardPrompt } from "@/features/review/hint-sanitizer";
import fs from "node:fs";
import path from "node:path";

describe("SRS Flashcard Front Prompt Hint Sanitization", () => {
  it("sanitizes '个' front prompt by removing pronunciation hint 'ge'", () => {
    const rawMeaning = "lượng từ thông dụng; thường đọc nhẹ ge trong ví dụ của bài";
    const res = sanitizeCardPrompt(rawMeaning, "个", "gè");

    expect(res.prompt).toBe("lượng từ thông dụng");
    expect(res.prompt).not.toMatch(/\bge\b/i);
    expect(res.prompt).not.toMatch(/[\u4e00-\u9fa5]/);
    expect(res.notes).toBe("thường đọc nhẹ ge trong ví dụ của bài");
  });

  it("sanitizes '一' front prompt by moving tone sandhi note 'yí ge' and Hanzi to notes", () => {
    const rawMeaning = "một; trong 一个 đọc biến điệu yí ge";
    const res = sanitizeCardPrompt(rawMeaning, "一", "yī");

    expect(res.prompt).toBe("một");
    expect(res.prompt).not.toMatch(/一个/);
    expect(res.prompt).not.toMatch(/yí/);
    expect(res.notes).toBe("trong 一个 đọc biến điệu yí ge");
  });

  it("sanitizes '二' front prompt by moving comparison with '两' to notes", () => {
    const rawMeaning = "hai khi đếm hoặc đọc số; phân biệt với 两 trước lượng từ";
    const res = sanitizeCardPrompt(rawMeaning, "二", "èr");

    expect(res.prompt).toBe("hai khi đếm hoặc đọc số");
    expect(res.prompt).not.toMatch(/两/);
    expect(res.notes).toBe("phân biệt với 两 trước lượng từ");
  });

  it("sanitizes '叫' front prompt by removing sample sentence with Hanzi '我叫'", () => {
    const rawMeaning = "mang tên; dùng trong mẫu giới thiệu tên 我叫…";
    const res = sanitizeCardPrompt(rawMeaning, "叫", "jiào");

    expect(res.prompt).toBe("mang tên");
    expect(res.prompt).not.toMatch(/我叫/);
    expect(res.notes).toBe("dùng trong mẫu giới thiệu tên 我叫…");
  });

  it("sanitizes '不' front prompt by removing usage note with Hanzi '是'", () => {
    const rawMeaning = "không; trong bài dùng để phủ định 是";
    const res = sanitizeCardPrompt(rawMeaning, "不", "bù");

    expect(res.prompt).toBe("không");
    expect(res.prompt).not.toMatch(/是/);
    expect(res.notes).toBe("trong bài dùng để phủ định 是");
  });

  it("sanitizes '七' front prompt by moving 'không dùng 星期七' to notes", () => {
    const rawMeaning = "bảy; không dùng 星期七 để nói Chủ nhật";
    const res = sanitizeCardPrompt(rawMeaning, "七", "qī");

    expect(res.prompt).toBe("bảy");
    expect(res.prompt).not.toMatch(/星期七/);
    expect(res.notes).toBe("không dùng 星期七 để nói Chủ nhật");
  });

  it("sanitizes '天' front prompt by moving 'trong cụm 星期天...' to notes", () => {
    const rawMeaning = "ngày; trong cụm 星期天, cả cụm chỉ Chủ nhật, không dịch tách từng chữ";
    const res = sanitizeCardPrompt(rawMeaning, "天", "tiān");

    expect(res.prompt).toBe("ngày");
    expect(res.prompt).not.toMatch(/星期天/);
    expect(res.notes).toBe("trong cụm 星期天, cả cụm chỉ Chủ nhật, không dịch tách từng chữ");
  });

  it("preserves pure synonyms when no notes or Hanzi are present", () => {
    const pureCases = [
      { raw: "bạn; cậu (đại từ ngôi hai)", expected: "bạn; cậu (đại từ ngôi hai)" },
      { raw: "tốt; khỏe; ổn (nghĩa dùng trong lời hỏi thăm)", expected: "tốt; khỏe; ổn (nghĩa dùng trong lời hỏi thăm)" },
      { raw: "tạm biệt; hẹn gặp lại", expected: "tạm biệt; hẹn gặp lại" },
      { raw: "tiếng Hán; tiếng Trung", expected: "tiếng Hán; tiếng Trung" },
      { raw: "bố; ba", expected: "bố; ba" },
    ];

    for (const c of pureCases) {
      const res = sanitizeCardPrompt(c.raw);
      expect(res.prompt).toBe(c.expected);
      expect(res.notes).toBeNull();
    }
  });

  it("audits all 32 curriculum lessons to ensure zero Hanzi leaks in sanitized prompts", () => {
    let count = 0;
    for (let i = 1; i <= 32; i++) {
      const pad = String(i).padStart(2, "0");
      const p = path.join(process.cwd(), `content/hsk_library/hsk1_lesson_${pad}.json`);
      if (!fs.existsSync(p)) continue;
      const lesson = JSON.parse(fs.readFileSync(p, "utf-8"));
      for (const st of lesson.stages || []) {
        for (const v of st.vocabulary || []) {
          count++;
          const res = sanitizeCardPrompt(v.meaning_vi || v.meaning, v.simplified, v.pinyin);
          expect(res.prompt).not.toMatch(/[\u4e00-\u9fa5]/);
        }
      }
    }
    expect(count).toBeGreaterThanOrEqual(300);
  });
});
