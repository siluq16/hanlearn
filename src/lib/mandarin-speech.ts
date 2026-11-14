/**
 * Mandarin Web Speech API Service
 * Provides client-side speech synthesis strictly in Mandarin Chinese (zh-CN / zh-TW).
 * Guaranteed:
 * - Never falls back to Vietnamese, English, or non-Chinese system voices.
 * - Supports normal (1.0x) and slow (0.7x) speech rates.
 * - Prevents Chromium garbage collection and cancel+speak race conditions.
 * - Clean cancellation when switching context or navigating.
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let pendingSpeakTimeout: ReturnType<typeof setTimeout> | null = null;
let preferredVoiceName: string | null = null;

const PREFERRED_VOICE_STORAGE_KEY = "hanlearn_preferred_mandarin_voice";
const PREFERRED_RATE_STORAGE_KEY = "hanlearn_preferred_mandarin_rate";

export const MANDARIN_RATES = {
  NORMAL: 1.0,
  /**
   * Slow speech rate for language learners (0.55x).
   * Empirically measured on Windows OneCore / Chromium engines to provide
   * a ~1.5x (+52%) duration prolongation, allowing clear phoneme enunciation
   * while strictly preserving pitch = 1.0 (zero tone distortion).
   */
  SLOW: 0.55,
  /**
   * Very slow rate (0.50x) providing ~1.7x (+71%) prolongation.
   */
  VERY_SLOW: 0.5,
  /**
   * Gentle slow rate (0.70x) providing ~1.23x (+23%) prolongation.
   */
  GENTLE_SLOW: 0.7,
} as const;

export type SpeechRate = typeof MANDARIN_RATES[keyof typeof MANDARIN_RATES] | number;

let preferredSpeechRate: SpeechRate = MANDARIN_RATES.NORMAL;
const rateChangeListeners = new Set<(rate: SpeechRate) => void>();

/**
 * Get current preferred speech rate, restoring from localStorage if saved.
 */
export function getPreferredMandarinRate(): SpeechRate {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(PREFERRED_RATE_STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed > 0) {
          preferredSpeechRate = parsed;
          return parsed;
        }
      }
    } catch {
      // Storage unavailable
    }
  }
  return preferredSpeechRate;
}

/**
 * Set preferred speech rate across all HanLearn speech components.
 * Persists to localStorage and notifies active subscribers.
 */
export function setPreferredMandarinRate(rate: SpeechRate): void {
  preferredSpeechRate = rate;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PREFERRED_RATE_STORAGE_KEY, String(rate));
    } catch {
      // Storage unavailable
    }
  }
  rateChangeListeners.forEach((listener) => {
    try {
      listener(rate);
    } catch {
      // Listener error
    }
  });
}

/**
 * Subscribe to speech rate changes across components.
 */
export function subscribeSpeechRateChanged(callback: (rate: SpeechRate) => void): () => void {
  rateChangeListeners.add(callback);
  return () => {
    rateChangeListeners.delete(callback);
  };
}

export interface MandarinVoiceCategory {
  region: "zh-CN" | "zh-TW" | "zh-HK" | "other";
  label: string;
  isMainland: boolean;
}

export function categorizeVoice(voice: { name: string; lang: string }): MandarinVoiceCategory {
  const lang = (voice.lang || "").toLowerCase().replace("_", "-");
  const name = voice.name.toLowerCase();

  if (
    lang === "zh-cn" ||
    lang.startsWith("zh-cn") ||
    lang.includes("cmn-hans") ||
    lang.includes("prc") ||
    name.includes("simplified") ||
    name.includes("prc") ||
    name.includes("huihui") ||
    name.includes("yaoyao") ||
    name.includes("kangkang")
  ) {
    return {
      region: "zh-CN",
      label: "zh-CN (Giản thể Đại lục)",
      isMainland: true,
    };
  }

  if (
    lang === "zh-tw" ||
    lang.startsWith("zh-tw") ||
    lang.includes("cmn-hant") ||
    lang.includes("taiwan") ||
    name.includes("traditional") ||
    name.includes("taiwan") ||
    name.includes("hanhan") ||
    name.includes("yating") ||
    name.includes("zhiwei")
  ) {
    return {
      region: "zh-TW",
      label: "zh-TW (Phồn thể Đài Loan)",
      isMainland: false,
    };
  }

  if (
    lang === "zh-hk" ||
    lang.startsWith("zh-hk") ||
    lang.includes("hong kong") ||
    name.includes("hong kong") ||
    name.includes("danny") ||
    name.includes("tracy")
  ) {
    return {
      region: "zh-HK",
      label: "zh-HK (Hồng Kông)",
      isMainland: false,
    };
  }

  return {
    region: "other",
    label: voice.lang || "zh",
    isMainland: false,
  };
}

export interface SpeakOptions {
  text: string;
  rate?: SpeechRate;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMessage: string) => void;
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

/**
 * Filter available voices for Chinese (Mandarin prioritized).
 * Excludes any voice that is not Chinese to prevent English or Vietnamese mispronunciations.
 */
export function getMandarinVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    return lang.startsWith("zh") || lang.startsWith("cmn");
  });
}

/**
 * Set a preferred voice by name (used by Diagnostic tool or user selection).
 * Persists selection in localStorage when available.
 */
export function setPreferredMandarinVoice(name: string | null): void {
  preferredVoiceName = name;
  if (typeof window !== "undefined") {
    try {
      if (name) {
        window.localStorage.setItem(PREFERRED_VOICE_STORAGE_KEY, name);
      } else {
        window.localStorage.removeItem(PREFERRED_VOICE_STORAGE_KEY);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }
}

/**
 * Get current preferred voice name, restoring from localStorage if initialized.
 */
export function getPreferredMandarinVoiceName(): string | null {
  if (preferredVoiceName) return preferredVoiceName;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(PREFERRED_VOICE_STORAGE_KEY);
      if (stored) {
        preferredVoiceName = stored;
        return stored;
      }
    } catch {
      // Storage unavailable or disabled
    }
  }
  return null;
}

/**
 * Select the highest quality Mandarin voice available.
 * 1. Checks preferred voice if set by user.
 * 2. Prioritizes zh-CN (Mainland Mandarin Simplified).
 * 3. Fallback policy: Strictly returns null if only zh-TW / zh-HK are present,
 *    requiring the user to actively select a fallback voice in Settings / Audio Diagnostics
 *    so the UI can transparently label the voice variant.
 */
export function getBestMandarinVoice(): SpeechSynthesisVoice | null {
  const voices = getMandarinVoices();
  if (voices.length === 0) return null;

  const preferred = getPreferredMandarinVoiceName();
  if (preferred) {
    const matched = voices.find((v) => v.name === preferred);
    if (matched) return matched;
  }

  // 1. Strict Mainland priority: zh-CN / cmn-Hans
  const zhCn = voices.find((v) => {
    const cat = categorizeVoice(v);
    return cat.region === "zh-CN";
  });
  if (zhCn) return zhCn;

  // 2. Strict policy: Do NOT automatically fallback to zh-TW without user selection.
  return null;
}

/**
 * Check whether Mandarin speech is ready to use in the current environment.
 */
export function checkMandarinSpeechSupport(): {
  supported: boolean;
  hasVoice: boolean;
  voiceName?: string;
  voiceLang?: string;
  voiceRegion?: "zh-CN" | "zh-TW" | "zh-HK" | "other";
  availableAlternativeVoices?: string[];
  message?: string;
} {
  if (!isSpeechSynthesisSupported()) {
    return {
      supported: false,
      hasVoice: false,
      message: "Trình duyệt hiện tại không hỗ trợ Web Speech API.",
    };
  }

  const voice = getBestMandarinVoice();
  if (!voice) {
    const allVoices = getMandarinVoices();
    if (allVoices.length > 0) {
      return {
        supported: true,
        hasVoice: false,
        availableAlternativeVoices: allVoices.map((v) => v.name),
        message:
          "Hệ thống chưa tìm thấy giọng zh-CN (Giản thể Đại lục). Bạn có thể cài thêm giọng zh-CN trong Windows Settings, hoặc chủ động chọn giọng zh-TW hiện có trong mục Cài đặt.",
      };
    }

    return {
      supported: true,
      hasVoice: false,
      message:
        "Thiết bị hoặc trình duyệt chưa cài đặt giọng đọc tiếng Trung (zh-CN). Vui lòng thêm giọng tiếng Trung trong cài đặt hệ thống.",
    };
  }

  const cat = categorizeVoice(voice);

  return {
    supported: true,
    hasVoice: true,
    voiceName: voice.name,
    voiceLang: voice.lang,
    voiceRegion: cat.region,
  };
}

/**
 * Cancel any ongoing speech and pending speak requests immediately.
 */
export function stopMandarin(): void {
  if (pendingSpeakTimeout) {
    clearTimeout(pendingSpeakTimeout);
    pendingSpeakTimeout = null;
  }
  if (!isSpeechSynthesisSupported()) return;
  activeUtterance = null;
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak text in Mandarin.
 * Never uses English or Vietnamese voices.
 * Always creates a fresh SpeechSynthesisUtterance and configures rate prior to speak().
 * Resolves the Chromium cancel-then-speak race condition using safe tick dispatch.
 */
export function speakMandarin({
  text,
  rate,
  onStart,
  onEnd,
  onError,
}: SpeakOptions): boolean {
  if (!isSpeechSynthesisSupported()) {
    onError?.("Trình duyệt không hỗ trợ Web Speech API.");
    return false;
  }

  const cleanText = text.trim();
  if (!cleanText) return false;

  const voice = getBestMandarinVoice();
  if (!voice) {
    onError?.(
      "Thiết bị chưa cài đặt giọng phát âm tiếng Trung (zh-CN). Vui lòng kiểm tra cài đặt âm thanh của hệ thống."
    );
    return false;
  }

  // Clear any pending timeout
  if (pendingSpeakTimeout) {
    clearTimeout(pendingSpeakTimeout);
    pendingSpeakTimeout = null;
  }

  const wasSpeaking =
    window.speechSynthesis.speaking || window.speechSynthesis.pending;

  if (wasSpeaking) {
    activeUtterance = null;
    window.speechSynthesis.cancel();
  }

  // If rate is not explicitly provided, use the global preferred rate (default 1.0, or 0.55 if slow mode is toggled)
  const resolvedRate = rate ?? getPreferredMandarinRate();
  // Clamped between 0.1 and 2.0 according to Web Speech API specification
  const targetRate = Math.max(0.1, Math.min(2.0, resolvedRate));

  const startPlayback = () => {
    pendingSpeakTimeout = null;

    try {
      const UtteranceClass = window.SpeechSynthesisUtterance;
      const utterance = new UtteranceClass(cleanText);

      // Explicitly set properties on the fresh utterance before speak()
      utterance.voice = voice;
      utterance.lang = voice.lang || "zh-CN";
      utterance.rate = targetRate;
      utterance.pitch = 1.0; // Strictly kept at 1.0 to preserve natural tones

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        onEnd?.();
      };

      utterance.onerror = (e) => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        // If canceled on purpose, do not report an error
        if (e.error === "canceled" || e.error === "interrupted") {
          onEnd?.();
          return;
        }
        onError?.(`Lỗi phát âm: ${e.error}`);
      };

      // Retain reference to prevent premature garbage collection in Chromium
      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      activeUtterance = null;
      onError?.("Không thể bắt đầu phát âm.");
    }
  };

  // If a previous utterance was canceled, Chromium needs a micro-delay (~30ms)
  // to reset its internal native TTS state machine. Otherwise speak() is dropped.
  if (wasSpeaking) {
    pendingSpeakTimeout = setTimeout(startPlayback, 30);
  } else {
    startPlayback();
  }

  return true;
}

/**
 * Listen to voiceschanged event for asynchronous voice population.
 */
export function subscribeVoicesChanged(callback: () => void): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};

  const handler = () => {
    callback();
  };

  if ("onvoiceschanged" in window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
  }

  return () => {};
}
