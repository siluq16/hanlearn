import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import {
  isSpeechSynthesisSupported,
  getMandarinVoices,
  getBestMandarinVoice,
  setPreferredMandarinVoice,
  checkMandarinSpeechSupport,
  speakMandarin,
  stopMandarin,
  MANDARIN_RATES,
  getPreferredMandarinRate,
  setPreferredMandarinRate,
  subscribeSpeechRateChanged,
} from "@/lib/mandarin-speech";

describe("Mandarin Web Speech Service", () => {
  let mockVoices: Array<{ name: string; lang: string }> = [];
  let speakMock: ReturnType<typeof vi.fn>;
  let cancelMock: ReturnType<typeof vi.fn>;
  let mockSpeaking = false;
  let mockPending = false;

  const originalWindow = (globalThis as unknown as { window?: unknown }).window;

  beforeEach(() => {
    vi.useFakeTimers();
    speakMock = vi.fn(() => {
      mockSpeaking = true;
    });
    cancelMock = vi.fn(() => {
      mockSpeaking = false;
      mockPending = false;
    });
    mockSpeaking = false;
    mockPending = false;
    setPreferredMandarinVoice(null);
    setPreferredMandarinRate(MANDARIN_RATES.NORMAL);

    class MockUtterance {
      text: string;
      lang = "";
      voice: unknown = null;
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    const mockSpeechSynthesis = {
      getVoices: vi.fn(() => mockVoices),
      speak: speakMock,
      cancel: cancelMock,
      get speaking() {
        return mockSpeaking;
      },
      get pending() {
        return mockPending;
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const storage = new Map<string, string>();
    const mockLocalStorage = {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
      clear: () => storage.clear(),
    };

    (globalThis as unknown as { window: unknown }).window = {
      speechSynthesis: mockSpeechSynthesis,
      SpeechSynthesisUtterance: MockUtterance,
      localStorage: mockLocalStorage,
    };
  });

  afterEach(() => {
    mockVoices = [];
    vi.restoreAllMocks();
    vi.useRealTimers();
    if (originalWindow !== undefined) {
      (globalThis as unknown as { window: unknown }).window = originalWindow;
    } else {
      delete (globalThis as unknown as { window?: unknown }).window;
    }
  });

  it("detects whether speech synthesis is supported", () => {
    expect(isSpeechSynthesisSupported()).toBe(true);
  });

  it("filters out English and Vietnamese voices and keeps only Chinese voices", () => {
    mockVoices = [
      { name: "Vietnamese Voice", lang: "vi-VN" },
      { name: "English Voice", lang: "en-US" },
      { name: "Google 普通话", lang: "zh-CN" },
      { name: "Taiwanese Voice", lang: "zh-TW" },
    ];

    const voices = getMandarinVoices();
    expect(voices).toHaveLength(2);
    expect(voices.map((v) => v.name)).toEqual(["Google 普通话", "Taiwanese Voice"]);
  });

  it("strictly returns null if no Chinese voice is available", () => {
    mockVoices = [
      { name: "Vietnamese Voice", lang: "vi-VN" },
      { name: "English Voice", lang: "en-US" },
      { name: "French Voice", lang: "fr-FR" },
    ];

    expect(getMandarinVoices()).toHaveLength(0);
    expect(getBestMandarinVoice()).toBeNull();

    const support = checkMandarinSpeechSupport();
    expect(support.supported).toBe(true);
    expect(support.hasVoice).toBe(false);
    expect(support.message).toContain("chưa cài đặt giọng đọc tiếng Trung");
  });

  it("prioritizes zh-CN over other regional Chinese voices", () => {
    mockVoices = [
      { name: "Hong Kong Voice", lang: "zh-HK" },
      { name: "Mainland Mandarin", lang: "zh-CN" },
      { name: "Taiwan Voice", lang: "zh-TW" },
    ];

    const best = getBestMandarinVoice();
    expect(best?.name).toBe("Mainland Mandarin");
  });

  it("allows selecting a preferred Mandarin voice", () => {
    mockVoices = [
      { name: "Mainland Mandarin", lang: "zh-CN" },
      { name: "Taiwan Voice", lang: "zh-TW" },
    ];

    setPreferredMandarinVoice("Taiwan Voice");
    expect(getBestMandarinVoice()?.name).toBe("Taiwan Voice");

    setPreferredMandarinVoice(null);
    expect(getBestMandarinVoice()?.name).toBe("Mainland Mandarin");
  });

  it("refuses to speak with English or Vietnamese voices", () => {
    mockVoices = [
      { name: "Vietnamese Voice", lang: "vi-VN" },
    ];

    const onError = vi.fn();
    const result = speakMandarin({
      text: "你好",
      onError,
    });

    expect(result).toBe(false);
    expect(speakMock).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining("chưa cài đặt giọng phát âm tiếng Trung")
    );
  });

  it("speaks Chinese text with zh-CN voice and normal rate", () => {
    mockVoices = [
      { name: "Google 普通话", lang: "zh-CN" },
    ];

    const onStart = vi.fn();
    const result = speakMandarin({
      text: "你好",
      rate: MANDARIN_RATES.NORMAL,
      onStart,
    });

    expect(result).toBe(true);
    expect(speakMock).toHaveBeenCalledTimes(1);

    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("你好");
    expect(utterance.rate).toBe(1.0);
    expect(utterance.pitch).toBe(1.0);
    expect(utterance.voice.name).toBe("Google 普通话");
  });

  it("speaks Chinese text with slow rate (0.55x)", () => {
    mockVoices = [
      { name: "Google 普通话", lang: "zh-CN" },
    ];

    const result = speakMandarin({
      text: "谢谢",
      rate: MANDARIN_RATES.SLOW,
    });

    expect(result).toBe(true);
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("谢谢");
    expect(utterance.rate).toBe(0.55);
    expect(utterance.pitch).toBe(1.0);
  });

  it("handles switching rate while speaking with safe cancelation tick", () => {
    mockVoices = [
      { name: "Google 普通话", lang: "zh-CN" },
    ];

    // Start 1.0x
    speakMandarin({ text: "我是学生。", rate: MANDARIN_RATES.NORMAL });
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].rate).toBe(1.0);

    // Switch to 0.55x while speaking
    mockSpeaking = true;
    speakMandarin({ text: "我是学生。", rate: MANDARIN_RATES.SLOW });
    expect(cancelMock).toHaveBeenCalledTimes(1);

    // After 30ms tick, new utterance at 0.55x is queued
    vi.advanceTimersByTime(35);
    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0].rate).toBe(0.55);
  });

  it("does not silently fallback to zh-TW without explicit user selection", () => {
    mockVoices = [
      { name: "Microsoft Hanhan", lang: "zh-TW" },
    ];

    // With no preference set, best voice is null because zh-CN is missing
    expect(getBestMandarinVoice()).toBeNull();

    const support = checkMandarinSpeechSupport();
    expect(support.hasVoice).toBe(false);
    expect(support.availableAlternativeVoices).toEqual(["Microsoft Hanhan"]);

    // When user explicitly selects the zh-TW voice
    setPreferredMandarinVoice("Microsoft Hanhan");
    expect(getBestMandarinVoice()?.name).toBe("Microsoft Hanhan");

    const userSupport = checkMandarinSpeechSupport();
    expect(userSupport.hasVoice).toBe(true);
    expect(userSupport.voiceRegion).toBe("zh-TW");
  });

  it("manages and synchronizes preferred speech rate across components", () => {
    expect(getPreferredMandarinRate()).toBe(MANDARIN_RATES.NORMAL);

    const listener = vi.fn();
    const unsubscribe = subscribeSpeechRateChanged(listener);

    setPreferredMandarinRate(MANDARIN_RATES.SLOW);
    expect(getPreferredMandarinRate()).toBe(MANDARIN_RATES.SLOW);
    expect(listener).toHaveBeenCalledWith(MANDARIN_RATES.SLOW);

    unsubscribe();
    setPreferredMandarinRate(MANDARIN_RATES.NORMAL);
    expect(listener).toHaveBeenCalledTimes(1); // not called again after unsubscribe
  });

  it("speaks at preferred speech rate when rate is omitted", () => {
    mockVoices = [
      { name: "Google 普通话", lang: "zh-CN" },
    ];

    setPreferredMandarinRate(MANDARIN_RATES.SLOW);

    const result = speakMandarin({ text: "你好" });
    expect(result).toBe(true);

    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.rate).toBe(0.55);
  });

  it("persists preferred speech rate to localStorage", () => {
    setPreferredMandarinRate(MANDARIN_RATES.SLOW);
    const win = (globalThis as unknown as { window: { localStorage: { getItem: (k: string) => string | null } } }).window;
    expect(win.localStorage.getItem("hanlearn_preferred_mandarin_rate")).toBe("0.55");

    setPreferredMandarinRate(MANDARIN_RATES.NORMAL);
    expect(win.localStorage.getItem("hanlearn_preferred_mandarin_rate")).toBe("1");
  });

  it("cancels speech immediately with stopMandarin", () => {
    mockSpeaking = true;
    stopMandarin();
    expect(cancelMock).toHaveBeenCalled();
  });
});
