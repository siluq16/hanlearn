/**
 * Mandarin Speech Recognition Matching and Evaluation Logic
 *
 * IMPORTANT SCIENTIFIC DISCLAIMER:
 * Character-level SpeechRecognition matching tests whether the browser's speech model
 * successfully decoded the acoustic stream into Chinese characters.
 * It is NOT an acoustic phonetic or tonal accuracy scoring system.
 * We do NOT manufacture pseudo-percentages (e.g. "97% accurate tone").
 */

export type SpeakingMatchStatus = "exact" | "partial" | "retry";

export interface SpeakingMatchResult {
  status: SpeakingMatchStatus;
  targetClean: string;
  spokenClean: string;
  badgeLabel: string;
  feedbackText: string;
  colorClass: string;
  disclaimer: string;
}

/**
 * Remove whitespace, Chinese/ASCII punctuation and normalize NFKC
 */
export function normalizeChineseText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\s,.\-!?:;"'()<>，。！？、；：“”‘’（）《》·—…~]/gu, "")
    .trim();
}

/**
 * Calculate character overlap ratio between two strings
 */
function getCharacterOverlapRatio(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const chars1 = Array.from(str1);
  const chars2 = Array.from(str2);

  let matchCount = 0;
  const used = new Array(chars2.length).fill(false);

  for (const char of chars1) {
    const idx = chars2.findIndex((c, i) => !used[i] && c === char);
    if (idx !== -1) {
      used[idx] = true;
      matchCount++;
    }
  }

  const maxLen = Math.max(chars1.length, chars2.length);
  return maxLen > 0 ? matchCount / maxLen : 0;
}

export function evaluateSpeakingAttempt(
  targetText: string,
  spokenText: string,
): SpeakingMatchResult {
  const targetClean = normalizeChineseText(targetText);
  const spokenClean = normalizeChineseText(spokenText);

  const disclaimer =
    "Nhận dạng giọng nói trên trình duyệt hỗ trợ kiểm tra nhận diện chữ Hán, không thể đo lường chuẩn xác thanh điệu hoặc khẩu hình âm học.";

  if (!spokenClean) {
    return {
      status: "retry",
      targetClean,
      spokenClean,
      badgeLabel: "Chưa nhận được âm thanh",
      feedbackText: "Chưa nhận diện được giọng nói. Bạn hãy bấm micro và nói lại nhé.",
      colorClass: "text-muted-foreground bg-muted border-border",
      disclaimer,
    };
  }

  // 1. Exact character match
  if (targetClean === spokenClean) {
    return {
      status: "exact",
      targetClean,
      spokenClean,
      badgeLabel: "Khớp chính xác chữ Hán",
      feedbackText: "Tuyệt vời! Bạn đã phát âm để trình duyệt nhận diện chính xác các chữ Hán này.",
      colorClass: "text-emerald-700 bg-emerald-500/10 border-emerald-500 dark:text-emerald-400",
      disclaimer,
    };
  }

  // 2. Partial match (contains or high character overlap)
  const isSubstring =
    spokenClean.includes(targetClean) || targetClean.includes(spokenClean);
  const overlapRatio = getCharacterOverlapRatio(targetClean, spokenClean);

  if (isSubstring || overlapRatio >= 0.6) {
    return {
      status: "partial",
      targetClean,
      spokenClean,
      badgeLabel: "Gần khớp",
      feedbackText: "Khá tốt! Đã nhận dạng được phần lớn chữ Hán. Bạn có thể nghe lại mẫu và thử lại để hoàn thiện hơn.",
      colorClass: "text-amber-700 bg-amber-500/10 border-amber-500 dark:text-amber-400",
      disclaimer,
    };
  }

  // 3. Retry required
  return {
    status: "retry",
    targetClean,
    spokenClean,
    badgeLabel: "Cần thử lại",
    feedbackText: "Chưa khớp với từ mẫu. Hãy bấm nghe phát âm chuẩn và thử nói lại một lần nữa.",
    colorClass: "text-destructive bg-destructive/10 border-destructive",
    disclaimer,
  };
}
