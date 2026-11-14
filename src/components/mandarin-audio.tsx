"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Snail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { MANDARIN_RATES, type SpeechRate } from "@/lib/mandarin-speech";

/**
 * Shared Mandarin speech rate switcher.
 * Toggles between Normal (1.0x) and Slow (0.55x) system-wide,
 * instantly synchronizing across Lessons, Vocabulary, and Review.
 */
export function MandarinSpeedToggle({
  className = "",
}: {
  className?: string;
}) {
  const { setPreferredRate, isSlowMode } = useMandarinSpeech();

  return (
    <div
      data-mandarin-speed-toggle
      className={`inline-flex items-center rounded-xl border border-border bg-background p-0.5 text-xs shadow-xs ${className}`}
      role="group"
      aria-label="Tùy chọn tốc độ phát âm tiếng Trung"
    >
      <button
        type="button"
        onClick={() => setPreferredRate(MANDARIN_RATES.NORMAL)}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
          !isSlowMode
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={!isSlowMode}
        data-active={!isSlowMode ? "true" : "false"}
        title="Nghe ở tốc độ chuẩn (1.0x)"
      >
        <Volume2 className="size-3.5" />
        <span>1.0x</span>
      </button>

      <button
        type="button"
        onClick={() => setPreferredRate(MANDARIN_RATES.SLOW)}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
          isSlowMode
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={isSlowMode}
        data-active={isSlowMode ? "true" : "false"}
        title="Nghe chậm rõ từng âm (0.55x - kéo dài ~1.5x thời lượng, giữ nguyên thanh điệu)"
      >
        <Snail className="size-3.5" />
        <span>0.55x</span>
      </button>
    </div>
  );
}

interface MandarinAudioButtonProps {
  text: string;
  label?: string;
  showSlow?: boolean;
  size?: "default" | "sm" | "icon";
  variant?: "outline" | "ghost" | "default";
  className?: string;
}

/**
 * Compact or labeled Mandarin pronunciation button.
 * Defaults to the active preferred speech rate (1.0x or 0.55x).
 * When showSlow is true, also provides a direct 0.55x button.
 */
export function MandarinAudioButton({
  text,
  label,
  showSlow = false,
  size = "sm",
  variant = "outline",
  className = "",
}: MandarinAudioButtonProps) {
  const {
    isPlaying,
    currentRate,
    preferredRate,
    isSlowMode,
    setPreferredRate,
    speak,
    stop,
    isSupported,
    hasVoice,
    errorMessage,
  } = useMandarinSpeech();
  const [showNotice, setShowNotice] = useState(false);

  const isCurrentSlowPlaying = isPlaying && currentRate === MANDARIN_RATES.SLOW;
  const isPlayingAny = isPlaying;

  const handleClick = (e: React.MouseEvent, explicitRate?: SpeechRate) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported || !hasVoice) {
      setShowNotice(true);
      return;
    }

    const targetRate = explicitRate ?? preferredRate;
    if (isPlaying && currentRate === targetRate) {
      stop();
    } else {
      setShowNotice(false);
      speak(text, targetRate);
    }
  };

  const unavailable = !isSupported || !hasVoice;

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <div className="inline-flex items-center gap-1.5">
        <Button
          type="button"
          data-mandarin-audio-btn="true"
          variant={variant}
          size={size}
          className={`${
            isPlayingAny
              ? "border-primary bg-primary/10 text-primary animate-pulse"
              : isSlowMode && !showSlow
                ? "border-primary/40 text-primary"
                : ""
          }`}
          onClick={(e) => handleClick(e)}
          title={
            unavailable
              ? errorMessage || "Chưa có giọng phát âm tiếng Trung zh-CN"
              : isPlayingAny
                ? "Dừng phát âm"
                : isSlowMode
                  ? "Nghe phát âm tiếng Trung ở tốc độ chậm (0.55x)"
                  : "Nghe phát âm tiếng Trung ở tốc độ chuẩn (1.0x)"
          }
          aria-label={label || (isSlowMode ? "Nghe phát âm chậm 0.55x" : "Nghe phát âm tiếng Trung")}
          aria-pressed={isPlayingAny}
        >
          {unavailable ? (
            <VolumeX className="size-4 text-muted-foreground" />
          ) : isSlowMode && !showSlow ? (
            <Snail
              className={`size-4 ${
                isPlayingAny ? "text-primary" : ""
              }`}
            />
          ) : (
            <Volume2
              className={`size-4 ${
                isPlayingAny ? "text-primary" : ""
              }`}
            />
          )}
          {label && <span>{label}</span>}
          {isSlowMode && !showSlow && !label && (
            <span className="text-[10px] font-mono opacity-80">0.55x</span>
          )}
        </Button>

        {showSlow && (
          <Button
            type="button"
            variant="outline"
            size={size}
            className={`text-xs ${
              isCurrentSlowPlaying
                ? "border-primary bg-primary/10 text-primary animate-pulse"
                : isSlowMode
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : "text-muted-foreground"
            }`}
            onClick={(e) => {
              handleClick(e, MANDARIN_RATES.SLOW);
              setPreferredRate(MANDARIN_RATES.SLOW);
            }}
            title={
              unavailable
                ? errorMessage || "Chưa có giọng phát âm tiếng Trung zh-CN"
                : isCurrentSlowPlaying
                  ? "Dừng phát âm chậm"
                  : "Nghe phát âm chậm (0.55x - kéo dài thời lượng ~1.5x)"
            }
            aria-label="Phát âm chậm 0.55x"
            aria-pressed={isCurrentSlowPlaying}
          >
            <Snail className="size-3.5" />
            <span>0.55x</span>
          </Button>
        )}
      </div>

      {showNotice && (
        <p
          data-speech-notice
          className="text-xs text-destructive max-w-xs mt-1"
        >
          {errorMessage ||
            "Trình duyệt hoặc thiết bị chưa có giọng đọc tiếng Trung (zh-CN)."}
        </p>
      )}
    </div>
  );
}

/**
 * Pronunciation bar with both Normal (1.0x) and Slow (0.55x) buttons,
 * suitable for Vocabulary detail and Flashcard review.
 * Syncs the chosen rate across the application.
 */
export function MandarinAudioBar({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const {
    isPlaying,
    currentRate,
    setPreferredRate,
    speak,
    stop,
    isSupported,
    hasVoice,
    voiceName,
    voiceRegion,
    errorMessage,
  } = useMandarinSpeech();
  const [showNotice, setShowNotice] = useState(false);

  const unavailable = !isSupported || !hasVoice;
  const isNormalPlaying = isPlaying && currentRate === MANDARIN_RATES.NORMAL;
  const isSlowPlaying = isPlaying && currentRate === MANDARIN_RATES.SLOW;

  const handlePlay = (rate: number) => {
    if (unavailable) {
      setShowNotice(true);
      return;
    }

    // Synchronize preferred rate so navigating retains the learner's choice
    setPreferredRate(rate);

    if (isPlaying && currentRate === rate) {
      stop();
    } else {
      setShowNotice(false);
      speak(text, rate);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className={`min-h-11 ${
            isNormalPlaying
              ? "border-primary bg-primary/10 text-primary animate-pulse"
              : ""
          }`}
          onClick={() => handlePlay(MANDARIN_RATES.NORMAL)}
          aria-pressed={isNormalPlaying}
          title="Phát âm tiếng Trung ở tốc độ chuẩn (1.0x)"
        >
          {unavailable ? (
            <VolumeX className="size-4 text-muted-foreground" />
          ) : (
            <Volume2 className={`size-4 ${isNormalPlaying ? "text-primary" : ""}`} />
          )}
          <span>{isNormalPlaying ? "Dừng phát âm" : "Nghe phát âm (1.0x)"}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className={`min-h-11 ${
            isSlowPlaying
              ? "border-primary bg-primary/10 text-primary animate-pulse"
              : ""
          }`}
          onClick={() => handlePlay(MANDARIN_RATES.SLOW)}
          aria-pressed={isSlowPlaying}
          title="Phát âm tiếng Trung chậm (0.55x - kéo dài thời lượng ~1.5x, giữ nguyên thanh điệu)"
        >
          <Snail className={`size-4 ${isSlowPlaying ? "text-primary" : ""}`} />
          <span>{isSlowPlaying ? "Dừng phát âm chậm" : "Nghe chậm (0.55x)"}</span>
        </Button>

        {hasVoice && voiceRegion && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              voiceRegion === "zh-CN"
                ? "bg-primary/10 text-primary"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            }`}
            title={`Giọng đang dùng: ${voiceName || ""}`}
          >
            {voiceRegion === "zh-CN" ? "zh-CN (Đại lục)" : "zh-TW (Đài Loan dự phòng)"}
          </span>
        )}
      </div>

      {showNotice && (
        <p
          data-speech-notice
          className="rounded-lg border border-dashed border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive leading-relaxed"
        >
          {errorMessage ||
            "Thiết bị/trình duyệt chưa cài đặt giọng phát âm tiếng Trung zh-CN. Để nghe phát âm, hãy cài thêm gói ngôn ngữ tiếng Trung trong hệ thống."}
        </p>
      )}
    </div>
  );
}

/**
 * Listen-first button for SRS flashcards.
 * Allows learners to hear the pronunciation before revealing the meaning.
 * Supports both standard rate and slow (0.55x) rate.
 */
export function ListenBeforeGuessButton({
  hanzi,
  className = "",
}: {
  hanzi: string;
  className?: string;
}) {
  const {
    isPlaying,
    currentRate,
    preferredRate,
    setPreferredRate,
    speak,
    stop,
    isSupported,
    hasVoice,
    errorMessage,
  } = useMandarinSpeech();
  const [showNotice, setShowNotice] = useState(false);

  const unavailable = !isSupported || !hasVoice;

  const handlePlay = (rate?: number) => {
    if (unavailable) {
      setShowNotice(true);
      return;
    }
    const targetRate = rate ?? preferredRate;
    if (rate !== undefined) {
      setPreferredRate(rate);
    }
    if (isPlaying && currentRate === targetRate) {
      stop();
    } else {
      setShowNotice(false);
      speak(hanzi, targetRate);
    }
  };

  const isSlowMode = preferredRate === MANDARIN_RATES.SLOW;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          data-listen-guess-btn="true"
          variant="outline"
          size="sm"
          className={`${
            isPlaying && currentRate === preferredRate
              ? "border-primary bg-primary/10 text-primary animate-pulse"
              : ""
          }`}
          onClick={() => handlePlay()}
          title={`Nghe phát âm trước khi lật thẻ (${isSlowMode ? "0.55x" : "1.0x"})`}
        >
          {isSlowMode ? <Snail className="size-4" /> : <Volume2 className="size-4" />}
          <span>{isSlowMode ? "Nghe trước (0.55x)" : "Nghe trước (1.0x)"}</span>
        </Button>

        <Button
          type="button"
          data-listen-guess-alt="true"
          variant="outline"
          size="sm"
          className={`text-xs ${
            isPlaying && currentRate === (isSlowMode ? MANDARIN_RATES.NORMAL : MANDARIN_RATES.SLOW)
              ? "border-primary bg-primary/10 text-primary animate-pulse"
              : "text-muted-foreground"
          }`}
          onClick={() => handlePlay(isSlowMode ? MANDARIN_RATES.NORMAL : MANDARIN_RATES.SLOW)}
          title={`Nghe trước ở tốc độ ${isSlowMode ? "1.0x" : "0.55x"}`}
        >
          {isSlowMode ? <Volume2 className="size-3.5" /> : <Snail className="size-3.5" />}
          <span>{isSlowMode ? "1.0x" : "0.55x"}</span>
        </Button>
      </div>

      {showNotice && (
        <p
          data-speech-notice
          className="text-center text-xs text-destructive"
        >
          {errorMessage || "Thiết bị chưa có giọng phát âm tiếng Trung zh-CN."}
        </p>
      )}
    </div>
  );
}
