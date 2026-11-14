/**
 * Mandarin Speech Recognition (STT) Client Service
 * Uses browser Web Speech API SpeechRecognition / webkitSpeechRecognition
 * Configured strictly for Mandarin Chinese (zh-CN).
 *
 * Privacy & Security Guarantees:
 * - Client-side initiation only (explicit learner click).
 * - HanLearn does NOT store, record, or upload audio files to any server.
 * - Handles device errors, denied permissions, and unsupported browsers gracefully.
 */

// Type definitions for Web Speech API SpeechRecognition
export interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

export interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type RecognitionErrorCode =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "service-not-allowed"
  | "bad-grammar"
  | "aborted"
  | "unsupported"
  | "unknown";

export interface SpeechRecognitionResultPayload {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (payload: SpeechRecognitionResultPayload) => void;
  onError?: (error: { code: RecognitionErrorCode; message: string }) => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function getRecognitionErrorMessage(code: RecognitionErrorCode): string {
  switch (code) {
    case "not-allowed":
      return "Quyền truy cập micro đã bị từ chối. Vui lòng nhấn vào biểu tượng micro trên thanh địa chỉ trình duyệt để cấp quyền.";
    case "audio-capture":
      return "Không tìm thấy thiết bị micro. Vui lòng kiểm tra lại kết nối micro trên máy tính hoặc điện thoại.";
    case "no-speech":
      return "Không phát hiện giọng nói. Hãy nhấn micro và thử nói to, rõ ràng hơn.";
    case "network":
      return "Lỗi kết nối mạng của engine nhận dạng giọng nói. Vui lòng kiểm tra kết nối Internet.";
    case "unsupported":
      return "Trình duyệt hiện tại chưa hỗ trợ nhận dạng giọng nói Web Speech API. Khuyến nghị sử dụng Google Chrome hoặc Microsoft Edge.";
    case "aborted":
      return "Đã dừng nhận dạng giọng nói.";
    default:
      return "Không thể nhận dạng giọng nói. Vui lòng thử lại.";
  }
}

export class MandarinRecognizer {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor() {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const instance = new SpeechRecognitionClass();
        instance.continuous = false;
        instance.interimResults = true;
        instance.lang = "zh-CN";
        instance.maxAlternatives = 3;

        instance.onstart = () => {
          this.isListening = true;
          this.callbacks.onStart?.();
        };

        instance.onresult = (event: SpeechRecognitionEventLike) => {
          let interim = "";
          let final = "";
          let confidence = 0;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            const text = res[0]?.transcript || "";
            if (res.isFinal) {
              final += text;
              confidence = res[0]?.confidence || 0;
            } else {
              interim += text;
            }
          }

          const transcript = (final || interim).trim();
          if (transcript) {
            this.callbacks.onResult?.({
              transcript,
              isFinal: !!final,
              confidence,
            });
          }
        };

        instance.onerror = (event: SpeechRecognitionErrorEventLike) => {
          this.isListening = false;
          const code = (event.error as RecognitionErrorCode) || "unknown";
          this.callbacks.onError?.({
            code,
            message: getRecognitionErrorMessage(code),
          });
        };

        instance.onend = () => {
          this.isListening = false;
          this.callbacks.onEnd?.();
        };

        this.recognition = instance;
      } catch {
        this.recognition = null;
      }
    }
  }

  public setCallbacks(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  public start() {
    if (!this.recognition) {
      this.callbacks.onError?.({
        code: "unsupported",
        message: getRecognitionErrorMessage("unsupported"),
      });
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        /* ignore */
      }
    }

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      this.callbacks.onError?.({
        code: "unknown",
        message:
          err instanceof Error
            ? err.message
            : "Không thể bắt đầu nhận dạng giọng nói.",
      });
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch {
      /* ignore */
    }
    this.isListening = false;
  }

  public abort() {
    if (!this.recognition) return;
    try {
      this.recognition.abort();
    } catch {
      /* ignore */
    }
    this.isListening = false;
  }

  public get active(): boolean {
    return this.isListening;
  }
}
