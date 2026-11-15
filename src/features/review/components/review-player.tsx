"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import {
  MandarinAudioBar,
  MandarinAudioButton,
  ListenBeforeGuessButton,
  MandarinSpeedToggle,
} from "@/components/mandarin-audio";
import { stopMandarin } from "@/lib/mandarin-speech";
import {
  reviewInput,
  type ReviewInput,
  type ReviewView,
  type ReviewResult,
  type RefreshResult,
  type ReviewError,
} from "../contracts";
type Props = {
  initial: ReviewView;
  enabled: boolean;
  submit: (input: ReviewInput) => Promise<ReviewResult>;
  refresh: () => Promise<RefreshResult>;
};
export function ReviewPlayer({ initial, enabled, submit, refresh }: Props) {
  const [view, setView] = useState(initial),
    [flipped, setFlipped] = useState(false),
    [pending, setPending] = useState(false),
    [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState<ReviewInput | null>(null),
    [error, setError] = useState<ReviewError | null>(null);
  const [count, setCount] = useState(0),
    [ended, setEnded] = useState(false),
    [nextDue, setNextDue] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{
    state: "idle" | "saving" | "saved" | "error";
    text?: string;
    cardId?: string;
  }>({ state: "idle" });

  const busy = useRef(false),
    saveQueue = useRef<Promise<void>>(Promise.resolve()),
    heading = useRef<HTMLHeadingElement>(null),
    pendingCountRef = useRef(0);
  const key = `hanlearn-review:${initial.scope}`;
  const card = view.cards[0];

  const savePendingInput = (input: ReviewInput) => {
    try {
      const raw = sessionStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      map[input.cardId] = input;
      sessionStorage.setItem(key, JSON.stringify(map));
    } catch {
      // Fallback: direct set
      try {
        sessionStorage.setItem(key, JSON.stringify(input));
      } catch {}
    }
  };

  const removePendingInput = (cardId: string) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const map = JSON.parse(raw);
      if (typeof map === "object" && map !== null) {
        delete map[cardId];
        if (Object.keys(map).length === 0) {
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, JSON.stringify(map));
        }
      } else {
        sessionStorage.removeItem(key);
      }
    } catch {
      sessionStorage.removeItem(key);
    }
  };

  // Warn if leaving page with unconfirmed background saves
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingCountRef.current > 0) {
        e.preventDefault();
        e.returnValue =
          "Đánh giá SRS đang được lưu lên hệ thống. Đóng trang lúc này có thể làm gián đoạn quá trình lưu.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsedRaw = JSON.parse(raw);
          const single = reviewInput.safeParse(parsedRaw);
          const candidate = single.success
            ? single.data
            : typeof parsedRaw === "object" && parsedRaw !== null
              ? Object.values(parsedRaw)
                  .map((v) => reviewInput.safeParse(v))
                  .find((p) => p.success)?.data
              : null;
          if (candidate) {
            setRecovery(candidate);
            setError({
              code: "RECOVERY",
              message:
                "Có đánh giá chưa xác nhận từ phiên trước. Thử lại đúng yêu cầu cũ để kiểm tra kết quả đã lưu.",
              retryable: true,
              outcomeUnknown: true,
            });
          }
        }
      } catch {
        setError({
          code: "STORAGE",
          message:
            "Không đọc được bộ nhớ khôi phục. Chưa gửi đánh giá mới; hãy tải lại hoặc kiểm tra bộ nhớ phiên.",
          retryable: false,
          outcomeUnknown: false,
        });
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [key]);
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [card?.id, ready]);
  useEffect(() => {
    stopMandarin();
    return () => {
      stopMandarin();
    };
  }, [card?.id]);

  async function send(input: ReviewInput) {
    stopMandarin();
    if (busy.current || pending || !ready || !enabled) return;
    busy.current = true;
    setError(null);

    try {
      savePendingInput(input);
    } catch {
      busy.current = false;
      setError({
        code: "STORAGE",
        message: "Không lưu được yêu cầu retry. Chưa gửi đánh giá.",
        retryable: false,
        outcomeUnknown: false,
      });
      return;
    }

    const hasNextCard = view.cards.length > 1;

    if (hasNextCard) {
      // 1. OPTIMISTIC INSTANT TRANSITION (< 15ms): Advance to next card in current batch
      const currentInput = input;
      pendingCountRef.current++;
      setView((prev) => ({
        ...prev,
        cards: prev.cards.slice(1),
        dueCount: Math.max(0, prev.dueCount - 1),
        reviewedToday: prev.reviewedToday + 1,
      }));
      setFlipped(false);
      setCount((n) => n + 1);
      setSaveStatus({ state: "saving", text: "Đang lưu...", cardId: currentInput.cardId });
      busy.current = false; // Release immediately so learner can read & interact with next card!

      // 2. FIFO Background Persistence Queue: Saves without blocking the learner's flow
      saveQueue.current = saveQueue.current
        .then(async () => {
          const result = await submit(currentInput);
          pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
          if (result.ok) {
            removePendingInput(currentInput.cardId);
            setSaveStatus({ state: "saved", text: "Đã lưu", cardId: currentInput.cardId });
            setNextDue(result.receipt.nextDueAt);
            setTimeout(() => {
              setSaveStatus((s) => (s.cardId === currentInput.cardId && s.state === "saved" ? { state: "idle" } : s));
            }, 2000);
          } else {
            savePendingInput(currentInput);
            setRecovery(currentInput);
            setError(result.error);
            setSaveStatus({ state: "error", text: "Lỗi lưu", cardId: currentInput.cardId });
            if (!result.error.outcomeUnknown) {
              removePendingInput(currentInput.cardId);
              setRecovery(null);
            }
          }
        })
        .catch(() => {
          pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
          savePendingInput(currentInput);
          setRecovery(currentInput);
          setSaveStatus({ state: "error", text: "Mất kết nối", cardId: currentInput.cardId });
          setError({
            code: "NETWORK",
            message:
              "Mất kết nối; chưa rõ đánh giá đã lưu chưa. Thử lại yêu cầu cũ, không chọn mức khác.",
            retryable: true,
            outcomeUnknown: true,
          });
        });
    } else {
      // Final card of the session: Await queue to complete and finalize session with server view
      setPending(true);
      pendingCountRef.current++;
      setSaveStatus({ state: "saving", text: "Đang hoàn tất phiên ôn..." });
      try {
        await saveQueue.current;
        const result = await submit(input);
        if (result.ok) {
          removePendingInput(input.cardId);
          setRecovery(null);
          setView(result.view);
          setFlipped(false);
          setCount((n) => n + 1);
          setNextDue(result.receipt.nextDueAt);
          setSaveStatus({ state: "saved", text: "Đã lưu toàn bộ phiên" });
        } else {
          setError(result.error);
          setSaveStatus({ state: "error", text: "Lỗi lưu", cardId: input.cardId });
          if (!result.error.outcomeUnknown) {
            removePendingInput(input.cardId);
            setRecovery(null);
          }
        }
      } catch {
        setError({
          code: "NETWORK",
          message:
            "Mất kết nối; chưa rõ đánh giá đã lưu chưa. Thử lại yêu cầu cũ, không chọn mức khác.",
          retryable: true,
          outcomeUnknown: true,
        });
      } finally {
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
        busy.current = false;
        setPending(false);
      }
    }
  }
  async function reload() {
    stopMandarin();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      const result = await refresh();
      if (result.ok) {
        setView(result.view);
        setFlipped(false);
        setEnded(false);
        if (!recovery) setError(null);
      } else
        setError(
          recovery
            ? {
                code: "RECOVERY",
                message:
                  "Chưa tải lại được danh sách. Đánh giá cũ vẫn cần xác nhận; hãy thử lại đúng yêu cầu cũ.",
                retryable: true,
                outcomeUnknown: true,
              }
            : result.error,
        );
    } catch {
      setError({
        code: "NETWORK",
        message: "Chưa tải lại được danh sách. Vui lòng thử lại.",
        retryable: !!recovery,
        outcomeUnknown: !!recovery,
      });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  const summary = ended || !card;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-primary">Ôn tập hằng ngày</p>
        <h1 className="text-3xl font-semibold">Ôn từng thẻ, nhớ lâu hơn.</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Lật thẻ trước khi tự đánh giá. Lịch ôn được lưu riêng cho bạn.
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Đến hạn", view.dueCount],
          ["Lượt ôn hôm nay", view.reviewedToday],
          ["Đã ôn trong phiên", count],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-3"
          >
            <dt className="text-xs leading-5 text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-xl font-semibold" data-review-stat={label}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {!enabled && (
        <p role="note" className="rounded-xl bg-muted p-4 text-sm">
          Đánh giá SRS chưa được mở trong môi trường này.
        </p>
      )}
      {view.unsupportedAudio > 0 && (
        <p className="text-sm text-muted-foreground">
          Có {view.unsupportedAudio} thẻ nghe đến hạn; màn hình này hiện hỗ trợ
          thẻ chữ.
        </p>
      )}
      {pending && (
        <p role="status" aria-live="polite" className="text-sm text-primary">
          Đang lưu và cập nhật danh sách…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive p-4 text-sm leading-7 text-destructive"
        >
          {error.message}
        </p>
      )}
      {recovery && (
        <Button
          disabled={pending || !enabled || !error?.retryable}
          onClick={() => void send(recovery)}
        >
          Thử lại đánh giá cũ
        </Button>
      )}
      {!summary && (
        <>
          {/* Progress Bar for Current Session */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground flex items-center gap-2">
                <span>
                  Tiến độ phiên ôn {view.dueCount > view.cards.length ? `(đợt ${view.cards.length} thẻ)` : ""}
                </span>
                {saveStatus.state === "saving" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400" data-review-save-status="saving">
                    <Loader2 className="size-3 animate-spin" />
                    Đang lưu…
                  </span>
                )}
                {saveStatus.state === "saved" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in" data-review-save-status="saved">
                    <CheckCircle2 className="size-3" />
                    Đã lưu
                  </span>
                )}
                {saveStatus.state === "error" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive animate-in fade-in" data-review-save-status="error">
                    <RotateCcw className="size-3" />
                    Chưa lưu được
                  </span>
                )}
              </span>
              <span className="text-primary font-bold">
                Thẻ {count + 1} / {count + view.cards.length}
                {view.dueCount > count + view.cards.length && (
                  <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
                    (tổng {view.dueCount} đến hạn)
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.round(((count) / (count + view.cards.length)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <Card className="border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardContent className="space-y-5 p-4 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {card.direction === "hanzi_to_vi"
                    ? "Hán tự → Nghĩa tiếng Việt"
                    : "Nghĩa tiếng Việt → Hán tự"}
                </span>
                <MandarinSpeedToggle />
              </div>

              <h2
                ref={heading}
                tabIndex={-1}
                className={`whitespace-pre-wrap break-words text-center font-bold leading-relaxed outline-offset-4 ${
                  card.direction === "hanzi_to_vi"
                    ? card.hanzi.length <= 2
                      ? "hanzi text-4xl sm:text-6xl text-foreground"
                      : card.hanzi.length <= 4
                        ? "hanzi text-3xl sm:text-5xl text-foreground"
                        : "hanzi text-2xl sm:text-4xl text-foreground"
                    : (card.prompt || card.meaning).length <= 25
                      ? "text-xl sm:text-2xl font-bold text-foreground"
                      : (card.prompt || card.meaning).length <= 60
                        ? "text-base sm:text-xl font-semibold text-foreground"
                        : "text-sm sm:text-base font-medium text-foreground"
                }`}
                lang={card.direction === "hanzi_to_vi" ? "zh-Hans" : "vi"}
              >
                {card.direction === "hanzi_to_vi"
                  ? card.hanzi
                  : (card.prompt || card.meaning)}
              </h2>

              {!flipped ? (
                <div className="space-y-3.5 pt-2">
                  {card.direction === "hanzi_to_vi" && (
                    <ListenBeforeGuessButton hanzi={card.hanzi} />
                  )}
                  <Button
                    variant="outline"
                    className="min-h-11 w-full font-semibold shadow-2xs"
                    disabled={pending || !ready || !!recovery}
                    onClick={() => {
                      stopMandarin();
                      setFlipped(true);
                    }}
                  >
                    Lật thẻ
                  </Button>
                </div>
              ) : (
                <div
                  data-review-back
                  className="space-y-4 border-t border-border/60 pt-4 text-center animate-in fade-in-50 duration-200"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1">
                    <span className="font-semibold text-primary">✓ Đáp án &amp; Chi tiết</span>
                    <span>Đã lật thẻ</span>
                  </div>

                  {card.direction === "vi_to_hanzi" ? (
                    <div className="space-y-1.5">
                      <p
                        lang="zh-Hans"
                        className="hanzi text-3xl sm:text-5xl leading-relaxed font-bold text-foreground"
                      >
                        {card.hanzi}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{card.pinyin}</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-xl sm:text-2xl font-bold text-primary">{card.pinyin}</p>
                      <p
                        className={`whitespace-pre-wrap ${
                          card.meaning.length <= 40
                            ? "text-base sm:text-lg font-semibold text-foreground"
                            : "text-sm sm:text-base font-medium leading-relaxed text-foreground"
                        }`}
                      >
                        {card.meaning}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center pt-1">
                    <MandarinAudioBar text={card.hanzi} />
                  </div>

                  {card.notes && (
                    <div
                      data-review-notes
                      className="space-y-1 rounded-xl bg-muted/40 border border-border/50 p-3 sm:p-4 text-left text-xs sm:text-sm leading-relaxed"
                    >
                      <span className="font-semibold text-primary block">
                        Ghi chú &amp; cách dùng:
                      </span>
                      <p className="text-muted-foreground">{card.notes}</p>
                    </div>
                  )}

                  {card.example && (
                    <div className="space-y-1.5 rounded-xl bg-muted/40 border border-border/50 p-3 sm:p-4 text-left text-xs sm:text-sm leading-relaxed">
                      <div className="flex items-start justify-between gap-2">
                        <p lang="zh-Hans" className="hanzi text-lg sm:text-xl font-bold text-foreground">
                          {card.example.hanzi}
                        </p>
                        <MandarinAudioButton
                          text={card.example.hanzi}
                          showSlow
                          size="sm"
                          variant="ghost"
                        />
                      </div>
                      {card.example.pinyin && (
                        <p className="text-primary font-medium text-xs sm:text-sm">{card.example.pinyin}</p>
                      )}
                      {card.example.meaning && (
                        <p className="text-muted-foreground text-xs">{card.example.meaning}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-1">
                    <Link
                      href={`/vocabulary/${card.vocabularyId}`}
                      className="inline-flex min-h-9 items-center text-xs font-semibold text-primary hover:underline"
                    >
                      Xem từ vựng chi tiết →
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div
            aria-label="Tự đánh giá mức nhớ"
            className="grid grid-cols-3 gap-3"
          >
            {(
              [
                { rating: 1, label: "Quên", variant: "destructive" },
                { rating: 2, label: "Khó", variant: "outline" },
                { rating: 3, label: "Đã nhớ", variant: "default" },
              ] as const
            ).map((item) => (
              <Button
                key={item.rating}
                variant={item.variant}
                className="min-h-12 px-2 font-bold text-sm shadow-xs"
                disabled={
                  !flipped ||
                  pending ||
                  !ready ||
                  !enabled ||
                  !!recovery ||
                  !!error
                }
                onClick={() =>
                  void send({
                    cardId: card.id,
                    rating: item.rating,
                    expectedVersion: card.version,
                    idempotencyKey: crypto.randomUUID(),
                  })
                }
              >
                {item.label}
              </Button>
            ))}
          </div>
          {!flipped && (
            <p className="text-center text-xs text-muted-foreground">
              Lật thẻ để mở các nút đánh giá mức độ ghi nhớ.
            </p>
          )}
          <Button
            variant="ghost"
            disabled={pending || !!recovery}
            onClick={() => {
              stopMandarin();
              setEnded(true);
            }}
          >
            Kết thúc phiên
          </Button>
        </>
      )}
      {summary && (
        <div role="status" className="space-y-4">
          <EmptyState
            title={
              ended || count ? "Đã kết thúc phiên ôn" : "Chưa có thẻ đến hạn"
            }
            description={
              ended || count
                ? `Đã lưu ${count} lượt trong phiên. Còn ${view.dueCount} thẻ đến hạn.`
                : view.reviewedToday
                  ? `Hôm nay bạn đã ôn ${view.reviewedToday} lượt. Hãy quay lại khi thẻ đến hạn.`
                  : "Hoàn thành bài học bằng xác nhận học và quiz đạt để tạo thẻ. Thẻ chưa đến hạn sẽ xuất hiện sau."
            }
          >
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="/roadmap"
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
              >
                Về lộ trình học
              </a>
              <Link
                href="/practice"
                className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                Luyện tập kỹ năng
              </Link>
            </div>
          </EmptyState>
        </div>
      )}
      {nextDue && (
        <p className="text-sm leading-7 text-muted-foreground">
          Thẻ vừa ôn sẽ đến hạn:{" "}
          <time dateTime={nextDue}>
            {new Intl.DateTimeFormat("vi-VN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Ho_Chi_Minh",
            }).format(new Date(nextDue))}
          </time>
          .
        </p>
      )}
      <Button
        variant="outline"
        disabled={pending || !ready}
        onClick={() => void reload()}
      >
        Tải lại danh sách ôn
      </Button>
    </div>
  );
}
