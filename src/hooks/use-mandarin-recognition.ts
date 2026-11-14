"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MandarinRecognizer,
  isSpeechRecognitionSupported,
  isSecureContextEnv,
  requestMicrophoneAccess,
  getRecognitionErrorMessage,
  type RecognitionErrorCode,
} from "@/lib/mandarin-recognition";

export function useMandarinRecognition() {
  const [isSupported] = useState(() => isSpeechRecognitionSupported());
  const [isSecureContext] = useState(() => isSecureContextEnv());
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<RecognitionErrorCode | null>(null);

  const recognizerRef = useRef<MandarinRecognizer | null>(null);

  useEffect(() => {
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

    return () => {
      recognizerRef.current?.abort();
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setErrorCode(null);
    setTranscript("");
    setIsFinal(false);
    setConfidence(undefined);

    // 1. Check secure context
    if (!isSecureContextEnv()) {
      setError(getRecognitionErrorMessage("insecure-context"));
      setErrorCode("insecure-context");
      return;
    }

    // 2. Check browser SpeechRecognition support
    if (!isSpeechRecognitionSupported()) {
      setError(getRecognitionErrorMessage("unsupported"));
      setErrorCode("unsupported");
      return;
    }

    // 3. Proactively trigger native microphone permission prompt via getUserMedia
    setIsRequestingPermission(true);
    const micResult = await requestMicrophoneAccess();
    setIsRequestingPermission(false);

    if (!micResult.ok) {
      setError(
        micResult.message || getRecognitionErrorMessage(micResult.code || "unknown"),
      );
      setErrorCode(micResult.code || "unknown");
      return;
    }

    // 4. Start SpeechRecognition session
    if (!recognizerRef.current) {
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
    isSecureContext,
    isRequestingPermission,
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
