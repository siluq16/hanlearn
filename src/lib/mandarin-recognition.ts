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
  | "insecure-context"
  | "bad-grammar"
  | "aborted"
  | "busy"
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
  onError?: (error: { code: RecognitionErrorCode; message: string; rawError?: string }) => void;
  onEnd?: () => void;
}

export function isSecureContextEnv(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.isSecureContext === "boolean") {
    return window.isSecureContext;
  }
  const host = window.location.hostname;
  return (
    window.location.protocol === "https:" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]"
  );
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function hasMicrophoneDeviceSupport(): boolean {
  if (typeof navigator === "undefined") return false;
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function");
}

export interface MicRequestResult {
  ok: boolean;
  code?: RecognitionErrorCode;
  message?: string;
}

/**
 * Proactively requests microphone access via getUserMedia to trigger the browser's
 * native permission prompt before starting SpeechRecognition.
 * Once granted, immediately stops and releases all tracks so the hardware mic is not locked.
 */
export async function requestMicrophoneAccess(): Promise<MicRequestResult> {
  if (typeof window === "undefined") {
    return { ok: false, code: "unsupported", message: getRecognitionErrorMessage("unsupported") };
  }

  if (!isSecureContextEnv()) {
    return {
      ok: false,
      code: "insecure-context",
      message: getRecognitionErrorMessage("insecure-context"),
    };
  }

  if (!hasMicrophoneDeviceSupport()) {
    return {
      ok: false,
      code: "audio-capture",
      message: getRecognitionErrorMessage("audio-capture"),
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately release tracks so mic hardware is free for SpeechRecognition
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        /* ignore */
      }
    });
    return { ok: true };
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : "";
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Microphone getUserMedia error]", err);
    }
    if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
      return {
        ok: false,
        code: "not-allowed",
        message: getRecognitionErrorMessage("not-allowed"),
      };
    }
    if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
      return {
        ok: false,
        code: "audio-capture",
        message: getRecognitionErrorMessage("audio-capture"),
      };
    }
    return {
      ok: false,
      code: "unknown",
      message: err instanceof Error ? err.message : getRecognitionErrorMessage("unknown"),
    };
  }
}

export function getRecognitionErrorMessage(code: RecognitionErrorCode): string {
  switch (code) {
    case "insecure-context":
      return "Tính năng nhận dạng giọng nói yêu cầu kết nối bảo mật (HTTPS hoặc localhost). Bạn đang truy cập qua HTTP không bảo mật nên trình duyệt chặn quyền sử dụng micro.";
    case "not-allowed":
      return "Quyền truy cập micro đã bị từ chối hoặc bị hệ thống chặn. Nếu đã bấm Cho phép (Allow) trên thanh địa chỉ URL của trình duyệt, hãy kiểm tra thêm Cài đặt Windows: 'Privacy & security > Microphone' đảm bảo trình duyệt được phép truy cập micro.";
    case "audio-capture":
      return "Không tìm thấy thiết bị micro hoặc micro đang bị ứng dụng khác chiếm giữ. Vui lòng kiểm tra lại thiết bị thu âm trên máy tính/điện thoại.";
    case "no-speech":
      return "Không phát hiện giọng nói. Hãy nhấn micro và thử nói to, rõ ràng hơn.";
    case "network":
      return "Không thể kết nối tới dịch vụ nhận dạng giọng nói của trình duyệt. Vui lòng kiểm tra lại kết nối mạng Internet, tắt tiện ích chặn (Adblock/VPN) hoặc thử chuyển sang Google Chrome chính thức.";
    case "service-not-allowed":
      return "Dịch vụ nhận dạng giọng nói của trình duyệt bị từ chối. Trình duyệt hoặc hệ điều hành có thể đang chặn kết nối nhận dạng ngôn ngữ zh-CN.";
    case "unsupported":
      return "Trình duyệt hiện tại chưa hỗ trợ Web Speech API. Khuyến nghị sử dụng Google Chrome hoặc Microsoft Edge trên máy tính / Android.";
    case "busy":
      return "Trình duyệt đang bận xử lý phiên nhận dạng trước. Vui lòng đợi trong giây lát và thử lại.";
    case "aborted":
      return "Đã dừng nhận dạng giọng nói.";
    default:
      return "Không thể nhận dạng giọng nói lúc này. Vui lòng kiểm tra kết nối mạng và thử lại.";
  }
}

export class MandarinRecognizer {
  private activeInstance: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private callbacks: SpeechRecognitionCallbacks = {};

  public setCallbacks(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  public start() {
    const SpeechRecognitionClass =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionClass) {
      this.callbacks.onError?.({
        code: "unsupported",
        message: getRecognitionErrorMessage("unsupported"),
      });
      return;
    }

    // If currently running, cleanly abort prior session first
    if (this.isListening && this.activeInstance) {
      try {
        this.activeInstance.abort();
      } catch {
        /* ignore */
      }
      this.activeInstance = null;
      this.isListening = false;
    }

    try {
      // Always create a fresh instance per recording session to avoid Chromium reuse bugs
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
        const rawError = event.error || "unknown";
        if (process.env.NODE_ENV !== "production") {
          console.warn("[SpeechRecognition error event]", rawError);
        }

        let code: RecognitionErrorCode = "unknown";
        if (rawError === "not-allowed") code = "not-allowed";
        else if (rawError === "no-speech") code = "no-speech";
        else if (rawError === "audio-capture") code = "audio-capture";
        else if (rawError === "network") code = "network";
        else if (rawError === "service-not-allowed") code = "service-not-allowed";
        else if (rawError === "aborted") code = "aborted";

        this.callbacks.onError?.({
          code,
          message: getRecognitionErrorMessage(code),
          rawError,
        });
      };

      instance.onend = () => {
        this.isListening = false;
        this.activeInstance = null;
        this.callbacks.onEnd?.();
      };

      this.activeInstance = instance;
      instance.start();
    } catch (err: unknown) {
      this.isListening = false;
      this.activeInstance = null;
      if (process.env.NODE_ENV !== "production") {
        console.warn("[SpeechRecognition.start exception]", err);
      }
      this.callbacks.onError?.({
        code: "unknown",
        message:
          err instanceof Error
            ? err.message
            : "Không thể khởi động nhận dạng giọng nói.",
      });
    }
  }

  public stop() {
    if (!this.activeInstance || !this.isListening) return;
    try {
      this.activeInstance.stop();
    } catch {
      /* ignore */
    }
    this.isListening = false;
  }

  public abort() {
    if (!this.activeInstance) return;
    try {
      this.activeInstance.abort();
    } catch {
      /* ignore */
    }
    this.activeInstance = null;
    this.isListening = false;
  }

  public get active(): boolean {
    return this.isListening;
  }
}
