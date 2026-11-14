"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
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
  const busy = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const key = `hanlearn-review:${initial.scope}`;
  const card = view.cards[0];
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsed = reviewInput.safeParse(JSON.parse(raw));
          if (!parsed.success) throw Error();
          setRecovery(parsed.data);
          setError({
            code: "RECOVERY",
            message:
              "Có đánh giá chưa xác nhận. Thử lại đúng yêu cầu cũ để kiểm tra kết quả đã lưu.",
            retryable: true,
            outcomeUnknown: true,
          });
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
  async function send(input: ReviewInput) {
    if (busy.current || !ready || !enabled) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(input));
    } catch {
      setError({
        code: "STORAGE",
        message: "Không lưu được yêu cầu retry. Chưa gửi đánh giá.",
        retryable: false,
        outcomeUnknown: false,
      });
      return;
    }
    busy.current = true;
    setPending(true);
    setRecovery(input);
    setError(null);
    try {
      const result = await submit(input);
      if (result.ok) {
        // Only the verified DB receipt advances this session; dates come from PostgreSQL.
        sessionStorage.removeItem(key);
        setRecovery(null);
        setView(result.view);
        setFlipped(false);
        setCount((n) => n + 1);
        setNextDue(result.receipt.nextDueAt);
      } else {
        setError(result.error);
        if (!result.error.outcomeUnknown) {
          sessionStorage.removeItem(key);
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
      busy.current = false;
      setPending(false);
    }
  }
  async function reload() {
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
          <Card>
            <CardContent className="space-y-6 p-5 sm:p-8">
              <p className="text-xs font-medium text-muted-foreground">
                {card.direction === "hanzi_to_vi"
                  ? "Hán tự → Nghĩa tiếng Việt"
                  : "Nghĩa tiếng Việt → Hán tự"}
              </p>
              <h2
                ref={heading}
                tabIndex={-1}
                className={`whitespace-pre-wrap break-words text-center font-semibold leading-relaxed outline-offset-4 ${card.direction === "hanzi_to_vi" ? "hanzi text-5xl sm:text-6xl" : "text-2xl"}`}
                lang={card.direction === "hanzi_to_vi" ? "zh-Hans" : "vi"}
              >
                {card.direction === "hanzi_to_vi" ? card.hanzi : card.meaning}
              </h2>
              {!flipped ? (
                <Button
                  variant="outline"
                  className="min-h-12 w-full"
                  disabled={pending || !ready || !!recovery}
                  onClick={() => setFlipped(true)}
                >
                  Lật thẻ
                </Button>
              ) : (
                <div
                  data-review-back
                  className="space-y-4 border-t border-border pt-5 text-center"
                >
                  {card.direction === "vi_to_hanzi" && (
                    <p
                      lang="zh-Hans"
                      className="hanzi text-4xl leading-relaxed"
                    >
                      {card.hanzi}
                    </p>
                  )}
                  <p className="text-lg text-primary">{card.pinyin}</p>
                  <p className="whitespace-pre-wrap text-base leading-8">
                    {card.meaning}
                  </p>
                  {card.example && (
                    <div className="space-y-2 rounded-xl bg-muted p-4 text-left text-sm leading-7">
                      <p lang="zh-Hans" className="hanzi text-xl">
                        {card.example.hanzi}
                      </p>
                      {card.example.pinyin && (
                        <p className="text-primary">{card.example.pinyin}</p>
                      )}
                      {card.example.meaning && <p>{card.example.meaning}</p>}
                    </div>
                  )}
                  <a
                    href={`/vocabulary/${card.vocabularyId}`}
                    className="inline-flex min-h-11 items-center text-sm text-primary underline"
                  >
                    Xem từ vựng
                  </a>
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
                className="min-h-12 px-2"
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
              Lật thẻ để mở các nút đánh giá.
            </p>
          )}
          <Button
            variant="ghost"
            disabled={pending || !!recovery}
            onClick={() => setEnded(true)}
          >
            Kết thúc phiên
          </Button>
        </>
      )}
      {summary && (
        <div role="status">
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
            <a
              href="/roadmap"
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Về lộ trình học
            </a>
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
