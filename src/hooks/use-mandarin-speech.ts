"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  checkMandarinSpeechSupport,
  speakMandarin,
  stopMandarin,
  subscribeVoicesChanged,
  subscribeSpeechRateChanged,
  getPreferredMandarinRate,
  setPreferredMandarinRate,
  MANDARIN_RATES,
  type SpeechRate,
} from "@/lib/mandarin-speech";

export function useMandarinSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRate, setCurrentRate] = useState<SpeechRate | null>(null);
  const [preferredRate, setPreferredRateState] = useState<SpeechRate>(getPreferredMandarinRate);
  const [supportStatus, setSupportStatus] = useState<{
    supported: boolean;
    hasVoice: boolean;
    voiceName?: string;
    voiceLang?: string;
    voiceRegion?: "zh-CN" | "zh-TW" | "zh-HK" | "other";
    availableAlternativeVoices?: string[];
    message?: string;
  }>({ supported: true, hasVoice: true });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  // Check support on mount and whenever voices or rates change
  useEffect(() => {
    mountedRef.current = true;

    const updateStatus = () => {
      const status = checkMandarinSpeechSupport();
      if (mountedRef.current) {
        setSupportStatus(status);
        if (!status.supported || !status.hasVoice) {
          setErrorMessage(status.message ?? null);
        } else {
          setErrorMessage(null);
        }
      }
    };

    updateStatus();
    const unsubscribeVoices = subscribeVoicesChanged(updateStatus);
    const unsubscribeRate = subscribeSpeechRateChanged((newRate) => {
      if (mountedRef.current) {
        setPreferredRateState(newRate);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribeVoices();
      unsubscribeRate();
      stopMandarin();
    };
  }, []);

  const handleStop = useCallback(() => {
    requestIdRef.current++;
    stopMandarin();
    if (mountedRef.current) {
      setIsPlaying(false);
      setCurrentRate(null);
    }
  }, []);

  const handleSetPreferredRate = useCallback((newRate: SpeechRate) => {
    setPreferredMandarinRate(newRate);
  }, []);

  const handleToggleRate = useCallback(() => {
    const current = getPreferredMandarinRate();
    const next =
      current === MANDARIN_RATES.SLOW
        ? MANDARIN_RATES.NORMAL
        : MANDARIN_RATES.SLOW;
    setPreferredMandarinRate(next);
  }, []);

  const handleSpeak = useCallback(
    (text: string, rate?: SpeechRate) => {
      setErrorMessage(null);
      const reqId = ++requestIdRef.current;
      const targetRate = rate ?? getPreferredMandarinRate();

      const success = speakMandarin({
        text,
        rate: targetRate,
        onStart: () => {
          if (mountedRef.current && requestIdRef.current === reqId) {
            setIsPlaying(true);
            setCurrentRate(targetRate);
          }
        },
        onEnd: () => {
          if (mountedRef.current && requestIdRef.current === reqId) {
            setIsPlaying(false);
            setCurrentRate(null);
          }
        },
        onError: (err) => {
          if (mountedRef.current && requestIdRef.current === reqId) {
            setIsPlaying(false);
            setCurrentRate(null);
            setErrorMessage(err);
          }
        },
      });

      if (!success && mountedRef.current && requestIdRef.current === reqId) {
        setIsPlaying(false);
        setCurrentRate(null);
      }
    },
    []
  );

  return {
    isPlaying,
    currentRate,
    preferredRate,
    isSlowMode: preferredRate === MANDARIN_RATES.SLOW,
    setPreferredRate: handleSetPreferredRate,
    toggleRate: handleToggleRate,
    isSupported: supportStatus.supported,
    hasVoice: supportStatus.hasVoice,
    voiceName: supportStatus.voiceName,
    voiceLang: supportStatus.voiceLang,
    voiceRegion: supportStatus.voiceRegion,
    availableAlternativeVoices: supportStatus.availableAlternativeVoices,
    errorMessage,
    speak: handleSpeak,
    stop: handleStop,
    clearError: () => setErrorMessage(null),
  };
}
