"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MandarinRecognizer,
  isSpeechRecognitionSupported,
  type RecognitionErrorCode,
} from "@/lib/mandarin-recognition";

export function useMandarinRecognition() {
  const [isSupported] = useState(() => isSpeechRecognitionSupported());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<RecognitionErrorCode | null>(null);

  const recognizerRef = useRef<MandarinRecognizer | null>(null);

  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const recognizer = new MandarinRecognizer();
      recognizerRef.current = recognizer;

      recognizer.setCallbacks({
        onStart: () => {
          setIsListening(true);
          setError(null);
          setErrorCode(null);
        },
        onResult: (payload) => {
          setTranscript(payload.transcript);
          setIsFinal(payload.isFinal);
          if (payload.confidence !== undefined) {
            setConfidence(payload.confidence);
          }
        },
        onError: (err) => {
          setIsListening(false);
          setError(err.message);
          setErrorCode(err.code);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
    }

    return () => {
      recognizerRef.current?.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setErrorCode(null);
    setTranscript("");
    setIsFinal(false);
    setConfidence(undefined);

    if (!recognizerRef.current) {
      if (!isSpeechRecognitionSupported()) {
        setError(
          "Trình duyệt hiện tại chưa hỗ trợ Web Speech Recognition. Khuyến nghị sử dụng Google Chrome hoặc Microsoft Edge.",
        );
        setErrorCode("unsupported");
        return;
      }
      recognizerRef.current = new MandarinRecognizer();
    }

    recognizerRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    recognizerRef.current?.abort();
    setIsListening(false);
    setTranscript("");
    setIsFinal(false);
    setConfidence(undefined);
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    isFinal,
    confidence,
    error,
    errorCode,
    startListening,
    stopListening,
    resetTranscript,
  };
}
