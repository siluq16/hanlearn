"use client";

import { useEffect, useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Snail,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MandarinSpeedToggle } from "@/components/mandarin-audio";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import { useMandarinRecognition } from "@/hooks/use-mandarin-recognition";
import { stopMandarin } from "@/lib/mandarin-speech";
import type { ListeningCurriculumData } from "@/features/listening/types";
import type {
  SpeakingItem,
  SpeakingSessionConfig,
  SpeakingItemResult,
} from "../types";
import { generateSpeakingSession } from "../generator";
import { evaluateSpeakingAttempt, type SpeakingMatchResult } from "../matcher";

interface SpeakingPlayerProps {
  curriculum: ListeningCurriculumData;
  initialLessonId?: string;
}

type SessionStage = "setup" | "playing" | "summary";

export function SpeakingPlayer({
  curriculum,
  initialLessonId,
}: SpeakingPlayerProps) {
  // Setup configuration state
  const [stage, setStage] = useState<SessionStage>("setup");
  const [selectedLessonId, setSelectedLessonId] = useState<string | "all">(
    initialLessonId || "all",
  );
  const [selectedType, setSelectedType] = useState<"all" | "word" | "sentence">(
    "all",
  );
  const [itemCount, setItemCount] = useState<number>(10);

  // Playing session state
  const [items, setItems] = useState<SpeakingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [results, setResults] = useState<SpeakingItemResult[]>([]);
  const [currentAttempts, setCurrentAttempts] = useState<number>(0);
  const [lastMatchResult, setLastMatchResult] = useState<SpeakingMatchResult | null>(null);

  // Mandarin TTS hook
  const {
    speak,
    stop: stopTTS,
    isPlaying: isTTSPlaying,
    preferredRate,
    isSlowMode,
  } = useMandarinSpeech();

  // Speech Recognition STT hook
  const {
    isSupported: isRecognitionSupported,
    isSecureContext,
    isRequestingPermission,
    isListening,
    transcript,
    error: recognitionError,
    errorCode: recognitionErrorCode,
    startListening,
    stopListening,
    resetTranscript,
  } = useMandarinRecognition();

  const currentItem = items[currentIndex];
  const progressPercent = items.length
    ? Math.round((currentIndex / items.length) * 100)
    : 0;

  // Cleanup on unmount or stage change
  useEffect(() => {
    return () => {
      stopMandarin();
    };
  }, []);

  // When speech recognition produces a final or non-empty transcript, evaluate it
  const evaluatedTranscriptRef = useRef<string>("");
  useEffect(() => {
    if (transcript && transcript !== evaluatedTranscriptRef.current && currentItem) {
      evaluatedTranscriptRef.current = transcript;
      const evaluation = evaluateSpeakingAttempt(currentItem.hanzi, transcript);
      setLastMatchResult(evaluation);
    }
  }, [transcript, currentItem]);

  function startSession() {
    stopMandarin();
    resetTranscript();
    evaluatedTranscriptRef.current = "";
    setLastMatchResult(null);

    const config: SpeakingSessionConfig = {
      lessonId: selectedLessonId,
      type: selectedType,
      count: itemCount,
    };

    const generated = generateSpeakingSession(config, curriculum);
    if (!generated.length) return;

    setItems(generated);
    setCurrentIndex(0);
    setResults([]);
    setCurrentAttempts(0);
    setStage("playing");
  }

  function handlePlaySample(explicitRate?: number) {
    if (!currentItem) return;
    const targetRate = explicitRate ?? preferredRate;
    if (isTTSPlaying) {
      stopTTS();
    } else {
      speak(currentItem.hanzi, targetRate);
    }
  }

  function handleStartRecording() {
    stopTTS();
    resetTranscript();
    evaluatedTranscriptRef.current = "";
    setLastMatchResult(null);
    setCurrentAttempts((prev) => prev + 1);
    startListening();
  }

  function handleStopRecording() {
    stopListening();
  }

  function handleNext() {
    stopMandarin();
    resetTranscript();
    evaluatedTranscriptRef.current = "";

    // Save result of current item
    if (currentItem) {
      const finalStatus = lastMatchResult?.status ?? "retry";
      const finalTranscript = transcript || "";

      setResults((prev) => [
        ...prev,
        {
          item: currentItem,
          transcript: finalTranscript,
          status: finalStatus,
          attempts: currentAttempts,
        },
      ]);
    }

    setLastMatchResult(null);
    setCurrentAttempts(0);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStage("summary");
    }
  }

  function handleExitToSetup() {
    stopMandarin();
    resetTranscript();
    setStage("setup");
  }

  // --- 1. SETUP STAGE ---
  if (stage === "setup") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Mic className="size-6 text-primary" />
                  Thiết lập bài luyện nói HSK 1
                </CardTitle>
                <CardDescription>
                  Luyện phát âm từ vựng và câu đàm thoại tiếng Trung có hỗ trợ nhận dạng giọng nói zh-CN.
                </CardDescription>
              </div>
              <MandarinSpeedToggle />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Browser Support Alert */}
            {!isRecognitionSupported && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <MicOff className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Trình duyệt chưa hỗ trợ nhận dạng giọng nói Web Speech Recognition</p>
                  <p className="mt-1 text-xs opacity-90 leading-relaxed">
                    Tính năng nhận dạng giọng nói hoạt động tốt nhất trên trình duyệt Google Chrome hoặc Microsoft Edge. Bạn vẫn có thể nghe phát âm mẫu ở cả 2 tốc độ.
                  </p>
                </div>
              </div>
            )}

            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                1. Phạm vi nội dung luyện nói
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedLessonId("all")}
                  data-testid="scope-all"
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-colors ${
                    selectedLessonId === "all"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span>Toàn bộ HSK 1 (43 từ HSK + 1 từ bổ trợ & câu)</span>
                  {selectedLessonId === "all" && <CheckCircle2 className="size-4 text-primary" />}
                </button>

                {curriculum.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    data-testid={`scope-lesson-${lesson.sortOrder}`}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-colors ${
                      selectedLessonId === lesson.id
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="truncate">
                      Bài {lesson.sortOrder}: {lesson.title.split("—")[0].trim()}
                    </span>
                    {selectedLessonId === lesson.id && (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                2. Dạng nội dung luyện nói
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  data-testid="type-all"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "all"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Tất cả</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Kết hợp cả từ vựng và câu đàm thoại
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("word")}
                  data-testid="type-word"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "word"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Chỉ từ vựng</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Tập trung rèn phát âm từng mục từ
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType("sentence")}
                  data-testid="type-sentence"
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors ${
                    selectedType === "sentence"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-semibold">Chỉ câu đàm thoại</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Luyện nói câu hoàn chỉnh theo ngữ cảnh
                  </span>
                </button>
              </div>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                3. Số lượng từ/câu mỗi phiên
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setItemCount(n)}
                    data-testid={`count-${n}`}
                    className={`min-h-11 min-w-16 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                      itemCount === n
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {n} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy & Methodology Disclosure */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Bảo vệ quyền riêng tư & Giới hạn đánh giá phát âm:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>
                  HanLearn <strong>không chủ động ghi âm, không lưu trữ và không tải tệp âm thanh</strong> của bạn lên máy chủ ứng dụng. Tuy nhiên, tính năng sử dụng Web Speech API của trình duyệt: dịch vụ nhận dạng của trình duyệt (ví dụ Google Speech trên Chrome) có thể truyền âm thanh về máy chủ của nhà cung cấp trình duyệt để xử lý chữ Hán, và chỉ thực hiện hoàn toàn trên thiết bị nếu trình duyệt cùng hệ điều hành thực sự hỗ trợ và đã bật chế độ nhận dạng cục bộ (on-device).
                </li>
                <li>
                  Việc hệ thống nhận dạng đúng chữ Hán hỗ trợ người học kiểm tra xem âm phát ra có rõ ràng không; điều này <strong>không thay thế cho đánh giá thanh điệu chuyên sâu</strong> hoặc khẩu hình âm học.
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <Button
              type="button"
              onClick={startSession}
              data-testid="start-speaking-btn"
              className="min-h-12 w-full text-base font-semibold"
            >
              <Mic className="size-5 mr-2" />
              Bắt đầu luyện nói
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 2. SUMMARY STAGE ---
  if (stage === "summary") {
    const total = items.length;
    const exactCount = results.filter((r) => r.status === "exact").length;
    const partialCount = results.filter((r) => r.status === "partial").length;
    const retryCount = results.filter((r) => r.status === "retry").length;

    return (
      <div className="mx-auto max-w-3xl space-y-6" data-testid="speaking-summary">
        <Card className="border-border text-center shadow-xs">
          <CardHeader className="space-y-3 pb-4">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              {exactCount >= total * 0.7 ? (
                <Award className="size-8" />
              ) : (
                <Sparkles className="size-8" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              Hoàn thành phiên luyện nói!
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Đã luyện tập {total} từ/câu tiếng Trung HSK 1
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" /> {exactCount} khớp chính xác
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-4" /> {partialCount} gần khớp
              </span>
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <HelpCircle className="size-4" /> {retryCount} cần luyện thêm
              </span>
            </div>

            {/* Practiced items review */}
            <div className="space-y-3 text-left">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Chi tiết các từ & câu đã luyện:
              </h3>
              <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
                {results.map((res) => (
                  <div
                    key={res.item.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-card"
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="hanzi font-serif text-lg font-semibold">
                          {res.item.hanzi}
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {res.item.pinyin}
                        </span>
                        <Badge
                          className={`text-[10px] px-2 py-0.5 ${
                            res.status === "exact"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : res.status === "partial"
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {res.status === "exact"
                            ? "Khớp chữ"
                            : res.status === "partial"
                              ? "Gần khớp"
                              : "Cần luyện lại"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {res.item.meaningVi}
                      </p>
                      {res.transcript && (
                        <p className="mt-1 text-xs text-foreground/80">
                          Nhận dạng được: <span className="hanzi font-medium">{res.transcript}</span>
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => speak(res.item.hanzi, preferredRate)}
                      title="Nghe lại phát âm mẫu"
                    >
                      <Volume2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer in summary */}
            <p className="text-xs text-muted-foreground italic text-center">
              * Kết quả nhận diện dựa trên Web Speech API giúp người học luyện phản xạ phát âm rõ ràng, không phản ánh toàn diện độ chuẩn xác của thanh điệu âm học.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={startSession}
                className="min-h-12 w-full sm:flex-1"
                data-testid="restart-speaking-btn"
              >
                <RotateCcw className="size-4 mr-2" />
                Luyện lại phiên này
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExitToSetup}
                className="min-h-12 w-full sm:flex-1"
                data-testid="exit-to-setup-btn"
              >
                Chọn bài luyện khác
              </Button>
              <Button
                asChild
                variant="ghost"
                className="min-h-12 w-full sm:w-auto"
              >
                <a href="/dashboard">Về Tổng quan</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 3. PLAYING SESSION STAGE ---
  if (!currentItem) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6" data-testid="speaking-session-screen">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleExitToSetup}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Thoát
        </button>

        <div className="flex items-center gap-3">
          <Badge className="text-xs">
            Câu {currentIndex + 1} / {items.length}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {currentItem.type === "word" ? "Từ vựng" : "Câu đàm thoại"}
          </span>
        </div>

        <MandarinSpeedToggle />
      </div>

      <Progress
        value={progressPercent}
        label={`Câu ${currentIndex + 1} trên ${items.length}`}
      />

      {/* Target Content Card */}
      <Card className="border-border shadow-xs text-center">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <h2
              lang="zh-Hans"
              className="hanzi font-serif text-4xl sm:text-5xl font-bold leading-normal text-foreground"
              data-testid="target-hanzi"
            >
              {currentItem.hanzi}
            </h2>
            <p
              className="text-primary font-semibold text-xl"
              data-testid="target-pinyin"
            >
              {currentItem.pinyin}
            </p>
            <p
              className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto"
              data-testid="target-meaning"
            >
              {currentItem.meaningVi}
            </p>
          </div>

          {/* Sample Audio Player */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="default"
              data-testid="play-sample-btn"
              onClick={() => handlePlaySample()}
              className={`min-h-12 px-5 rounded-xl text-sm font-semibold ${
                isTTSPlaying
                  ? "border-primary bg-primary/10 text-primary animate-pulse"
                  : ""
              }`}
            >
              {isSlowMode ? (
                <Snail className="size-4 mr-2" />
              ) : (
                <Volume2 className="size-4 mr-2" />
              )}
              <span>
                {isTTSPlaying
                  ? "Đang phát..."
                  : `Nghe phát âm mẫu (${isSlowMode ? "0.55x" : "1.0x"})`}
              </span>
            </Button>
          </div>

          {/* Microphone Recording Action Card */}
          <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thực hành phát âm:
            </p>

            <div className="flex flex-col items-center justify-center gap-3">
              {isRequestingPermission ? (
                <Button
                  type="button"
                  size="default"
                  disabled
                  className="min-h-16 px-8 rounded-2xl bg-primary/70 text-primary-foreground text-base font-semibold shadow-xs transition-all"
                >
                  <Loader2 className="size-6 mr-2.5 animate-spin" />
                  <span>Đang yêu cầu quyền micro...</span>
                </Button>
              ) : !isListening ? (
                <Button
                  type="button"
                  size="default"
                  data-testid="record-btn"
                  onClick={handleStartRecording}
                  disabled={!isRecognitionSupported || !isSecureContext}
                  className="min-h-16 px-8 rounded-2xl bg-primary text-primary-foreground text-base font-semibold shadow-xs hover:opacity-90 transition-all"
                >
                  <Mic className="size-6 mr-2.5" />
                  <span>Bấm micro để nói</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="default"
                  data-testid="stop-record-btn"
                  onClick={handleStopRecording}
                  className="min-h-16 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-base font-semibold shadow-xs animate-pulse transition-all"
                >
                  <Mic className="size-6 mr-2.5 animate-bounce" />
                  <span>Đang lắng nghe... (Bấm để dừng)</span>
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                {isRequestingPermission
                  ? "Vui lòng bấm 'Allow' (Cho phép) trên hộp thoại của trình duyệt để cấp quyền micro..."
                  : isListening
                  ? "Hãy phát âm to và rõ ràng bằng tiếng Trung zh-CN..."
                  : "Có thể nghe lại mẫu và thử nói lại nhiều lần."}
              </p>
            </div>

            {/* Error message if any */}
            {recognitionError && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive text-left space-y-1.5"
                data-testid="recognition-error"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {recognitionErrorCode === "not-allowed"
                        ? "Chưa cấp quyền micro:"
                        : recognitionErrorCode === "audio-capture"
                        ? "Không tìm thấy thiết bị micro:"
                        : recognitionErrorCode === "insecure-context"
                        ? "Kết nối không bảo mật:"
                        : recognitionErrorCode === "network"
                        ? "Lỗi kết nối dịch vụ nhận dạng:"
                        : recognitionErrorCode === "service-not-allowed"
                        ? "Dịch vụ nhận dạng bị chặn:"
                        : recognitionErrorCode === "unsupported"
                        ? "Trình duyệt không hỗ trợ:"
                        : "Lỗi nhận dạng giọng nói:"}
                    </p>
                    <p className="text-foreground/90 leading-relaxed">{recognitionError}</p>
                    {recognitionErrorCode === "network" && (
                      <div className="text-muted-foreground pt-1.5 border-t border-destructive/20 space-y-1.5 leading-relaxed">
                        <p className="font-medium text-foreground">
                          👉 <strong>Nguyên nhân thường gặp & Hướng xử lý:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                          <li>
                            <strong>Trình duyệt Brave / Cốc Cốc / Opera:</strong> Các trình duyệt này mặc định không tích hợp khóa dịch vụ nhận dạng của Google. Khuyến nghị mở trang web bằng <strong>Google Chrome chính thức</strong> hoặc <strong>Microsoft Edge</strong>.
                          </li>
                          <li>
                            <strong>Cài đặt Windows Speech:</strong> Vào <em>Windows Settings $\rightarrow$ Time & Language (hoặc Privacy & Security) $\rightarrow$ Speech</em> $\rightarrow$ Bật <strong>&ldquo;Online speech recognition&rdquo;</strong> (Nhận dạng giọng nói trực tuyến).
                          </li>
                          <li>
                            <strong>Tiện ích chặn (Adblock / VPN / Pi-hole):</strong> Một số tiện ích như uBlock Origin, AdGuard hoặc VPN có thể chặn kết nối nền tới máy chủ nhận dạng của Google. Hãy thử tạm tắt trên <code>localhost</code>.
                          </li>
                        </ul>
                        <div className="pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleStartRecording}
                            className="text-xs h-8 rounded-lg"
                          >
                            <RotateCcw className="size-3.5 mr-1.5" />
                            Bấm để thử kết nối lại
                          </Button>
                        </div>
                      </div>
                    )}
                    {recognitionErrorCode === "not-allowed" && (
                      <div className="text-muted-foreground pt-1.5 border-t border-destructive/20 space-y-1.5 leading-relaxed">
                        <p className="font-medium text-foreground">
                          👉 <strong>Cách xử lý:</strong>
                        </p>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                          <li>
                            Nhấn vào biểu tượng khóa hoặc micro trên thanh địa chỉ URL của trình duyệt $\rightarrow$ Chọn <em>Cho phép (Allow)</em> cho Micro $\rightarrow$ Tải lại trang.
                          </li>
                          <li>
                            <strong>Nếu đã bấm Cho phép nhưng vẫn báo lỗi:</strong> Mở <em>Windows Settings $\rightarrow$ Privacy & security $\rightarrow$ Microphone</em>, đảm bảo <em>Microphone access</em> và <em>Let desktop apps access your microphone</em> đều đang ở trạng thái <strong>On</strong>.
                          </li>
                        </ol>
                        <div className="pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleStartRecording}
                            className="text-xs h-8 rounded-lg"
                          >
                            <RotateCcw className="size-3.5 mr-1.5" />
                            Bấm để thử lại quyền micro
                          </Button>
                        </div>
                      </div>
                    )}
                    {recognitionErrorCode === "insecure-context" && (
                      <p className="text-muted-foreground pt-1 border-t border-destructive/20 leading-relaxed">
                        👉 <strong>Cách xử lý:</strong> Trình duyệt chặn quyền truy cập micro trên giao thức HTTP thường. Vui lòng truy cập qua <code>http://localhost:3000</code> hoặc kết nối HTTPS an toàn.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recognition Result & Match Comparison Card */}
          {transcript && (
            <div
              className="rounded-2xl border border-border bg-card p-5 text-left space-y-4 animate-in fade-in-50 duration-200"
              data-testid="speaking-result-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  Văn bản nhận dạng được:
                </span>
                {lastMatchResult && (
                  <Badge
                    data-testid="match-status-badge"
                    className={`text-xs font-semibold px-2.5 py-1 ${lastMatchResult.colorClass}`}
                  >
                    {lastMatchResult.badgeLabel}
                  </Badge>
                )}
              </div>

              <div>
                <p
                  lang="zh-Hans"
                  className="hanzi font-serif text-3xl font-bold text-foreground"
                  data-testid="recognized-transcript"
                >
                  {transcript}
                </p>
                {lastMatchResult && (
                  <p
                    className="mt-2 text-sm leading-relaxed text-foreground/90"
                    data-testid="match-feedback-text"
                  >
                    {lastMatchResult.feedbackText}
                  </p>
                )}
              </div>

              {/* Scientific Disclaimer */}
              <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 leading-relaxed italic">
                * {lastMatchResult?.disclaimer || "Nhận dạng giọng nói trên trình duyệt chỉ hỗ trợ kiểm tra nhận diện chữ Hán, không thay thế cho đánh giá thanh điệu chuyên sâu."}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStartRecording}
                  data-testid="retry-speak-btn"
                  className="min-h-12 flex-1"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Thử nói lại
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  data-testid="next-speak-btn"
                  className="min-h-12 flex-1 font-semibold"
                >
                  <span>
                    {currentIndex + 1 < items.length ? "Tiếp tục" : "Xem tổng kết"}
                  </span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Fallback actions when no transcript yet */}
          {!transcript && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              {recognitionError ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentItem) {
                      evaluatedTranscriptRef.current = currentItem.hanzi;
                      setLastMatchResult(
                        evaluateSpeakingAttempt(currentItem.hanzi, currentItem.hanzi),
                      );
                    }
                  }}
                  className="text-xs h-8 rounded-lg"
                >
                  <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-600" />
                  Tự xác nhận đã phát âm câu này
                </Button>
              ) : (
                <div />
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={handleNext}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Bỏ qua câu này</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
