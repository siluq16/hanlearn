/**
 * Sanitizes the front prompt for Việt → Hán SRS Flashcards to prevent answer leaks.
 * - Extracts clean core meaning for the front prompt (no Hanzi, no pronunciation hints).
 * - Preserves grammar, usage, and pronunciation notes for display on the card back.
 */
export function sanitizeCardPrompt(
  meaningVi: string,
  targetHanzi?: string,
  targetPinyin?: string
): { prompt: string; notes: string | null } {
  if (!meaningVi) return { prompt: "", notes: null };

  const parts = meaningVi.split(";").map((p) => p.trim()).filter(Boolean);
  const promptParts: string[] = [];
  const noteParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const hasHanzi =
      /[\u4e00-\u9fa5]/.test(part) ||
      (targetHanzi ? part.includes(targetHanzi) : false);
    const hasPinyin =
      targetPinyin && targetPinyin.length > 1
        ? new RegExp(
            `\\b${targetPinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔù]/g, "\\w*")}\\b`,
            "i"
          ).test(part)
        : false;
    const hasNoteKeywords =
      /^(thường đọc|đọc|trong bài|dùng trong|phân biệt|còn có nghĩa|ở cách dùng|đơn vị chỉ|trong cách nói|không dùng|khi đếm)/i.test(
        part
      );
    const hasPronunciationNote =
      /đọc\s+(?:là\s+|nhẹ\s+|biến điệu\s+|thành\s+)/i.test(part) || Boolean(hasPinyin);

    if (i > 0 && (hasHanzi || hasNoteKeywords || hasPronunciationNote)) {
      noteParts.push(part);
    } else if (i === 0 && (hasHanzi || hasPronunciationNote)) {
      const clean = part
        .replace(/,?\s*đọc\s+(?:biến điệu\s+)?(?:là\s+|nhẹ\s+|biến điệu\s+|thành\s+)?[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?:\s+trước\s+[^);]+)?/gi, "")
        .replace(/\(\s*\)/g, "")
        .replace(/[\u4e00-\u9fa5]+/g, "…")
        .trim();
      promptParts.push(clean);
      noteParts.push(part);
    } else {
      promptParts.push(part);
    }
  }

  let prompt = promptParts.join("; ").trim();
  if (/[\u4e00-\u9fa5]/.test(prompt)) {
    prompt = prompt.replace(/[\u4e00-\u9fa5]+/g, "…").trim();
  }

  return {
    prompt: prompt || meaningVi,
    notes: noteParts.length > 0 ? noteParts.join("; ") : null,
  };
}
