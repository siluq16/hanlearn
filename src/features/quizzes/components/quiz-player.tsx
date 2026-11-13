"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  recoverySchema,
  validAnswers,
  type QuizView,
  type QuizResult,
  type Recovery,
} from "../contracts";
type Props = {
  initial: QuizView;
  enabled: boolean;
  start: (input: { lessonId: string; startKey: string }) => Promise<QuizResult>;
  submit: (input: {
    lessonId: string;
    attemptId: string;
    answers: Record<string, number>;
  }) => Promise<QuizResult>;
  refresh: (input: {
    lessonId: string;
    attemptId?: string;
  }) => Promise<QuizResult>;
};
export function QuizPlayer({
  initial,
  enabled,
  start,
  submit,
  refresh,
}: Props) {
  const [view, setView] = useState(initial),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [index, setIndex] = useState(0),
    [confirm, setConfirm] = useState(false),
    [pending, setPending] = useState(false),
    [ready, setReady] = useState(false),
    [recovery, setRecovery] = useState<Recovery | null>(null),
    [recoveryBlocked, setRecoveryBlocked] = useState(false),
    [error, setError] = useState<{
      message: string;
      retryable: boolean;
    } | null>(null);
  const busy = useRef(false),
    heading = useRef<HTMLHeadingElement>(null),
    confirmation = useRef<HTMLHeadingElement>(null);
  const storageKey = `hanlearn-quiz:${initial.recoveryScope}`;
  const attempt = view.attempt,
    submitted = !!attempt?.submittedAt,
    question = view.questions[index];
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (raw) {
          const parsed = recoverySchema.safeParse(JSON.parse(raw));
          if (
            parsed.success &&
            parsed.data.lessonId === initial.lessonId &&
            (parsed.data.operation === "start" ||
              validAnswers(parsed.data.answers, initial.questions))
          ) {
            if (!(
              parsed.data.operation === "submit" &&
              initial.attempt?.id === parsed.data.attemptId &&
              initial.attempt.submittedAt
            )) {
              setRecovery(parsed.data);
              if (parsed.data.operation === "submit")
                setAnswers(parsed.data.answers);
              setError({
                message:
                  "Có yêu cầu chưa xác định kết quả. Thử lại đúng yêu cầu cũ hoặc đọc lại kết quả.",
                retryable: true,
              });
            } else sessionStorage.removeItem(storageKey);
          } else {
            setRecoveryBlocked(true);
            setError({
              message:
                "Yêu cầu khôi phục không hợp lệ. Hãy mở lượt làm đã lưu từ lịch sử và đọc lại kết quả; chưa tạo lượt mới.",
              retryable: false,
            });
          }
        }
      } catch {
        setRecoveryBlocked(true);
        setError({
          message:
            "Không đọc được yêu cầu khôi phục. Không có thao tác tự động nào được gửi.",
          retryable: false,
        });
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey, initial]);
  useEffect(() => {
    if (submitted) heading.current?.focus();
  }, [submitted]);
  function clearRecovery() {
    sessionStorage.removeItem(storageKey);
    setRecovery(null);
    setRecoveryBlocked(false);
  }
  function accept(next: QuizView) {
    setView(next);
    setConfirm(false);
    setError(null);
    history.replaceState(null, "", `?attempt=${next.attempt?.id ?? ""}`);
  }
  async function send(envelope: Recovery) {
    if (busy.current || !enabled || !ready || recoveryBlocked) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(envelope));
    } catch {
      setError({
        message:
          "Bộ nhớ phiên chưa khả dụng. Chưa gửi yêu cầu; hãy kiểm tra cài đặt trình duyệt.",
        retryable: false,
      });
      return;
    }
    busy.current = true;
    setPending(true);
    setRecovery(envelope);
    setError(null);
    setConfirm(false);
    try {
      const result =
        envelope.operation === "start"
          ? await start({
              lessonId: envelope.lessonId,
              startKey: envelope.startKey,
            })
          : await submit({
              lessonId: envelope.lessonId,
              attemptId: envelope.attemptId,
              answers: envelope.answers,
            });
      if (result.ok) {
        accept(result.view);
        clearRecovery();
      } else {
        setError(result.error);
        if (!result.error.outcomeUnknown) clearRecovery();
      }
    } catch {
      setError({
        message:
          "Mất kết nối; kết quả có thể đã được lưu. Thử lại đúng yêu cầu cũ hoặc đọc lại kết quả.",
        retryable: true,
      });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  async function readback() {
    if (busy.current || !ready) return;
    busy.current = true;
    setPending(true);
    try {
      const result = await refresh({
        lessonId: view.lessonId,
        attemptId:
          recovery?.operation === "submit" ? recovery.attemptId : attempt?.id,
      });
      if (result.ok) {
        accept(result.view);
        if (
          result.view.attempt?.submittedAt &&
          ((recovery?.operation === "submit" &&
            result.view.attempt.id === recovery.attemptId) ||
            recoveryBlocked)
        )
          clearRecovery();
        else if (recovery)
          setError({
            message:
              "Chưa xác nhận được yêu cầu cũ đã hoàn tất. Bạn có thể thử lại đúng yêu cầu đó.",
            retryable: true,
          });
      } else setError(result.error);
    } catch {
      setError({
        message: "Chưa đọc lại được kết quả. Vui lòng thử lại.",
        retryable: false,
      });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  const locked =
    pending || !!recovery || recoveryBlocked || confirm || submitted;
  function move(next: number) {
    setIndex(next);
    requestAnimationFrame(() =>
      document.getElementById("quiz-question")?.focus(),
    );
  }
  return (
    <div className="min-w-0 space-y-6">
      <a
        href={`/lessons/${view.lessonId}`}
        className="inline-flex min-h-11 items-center text-primary underline"
      >
        ← Về bài học
      </a>
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {view.lessonTitle} · Phiên bản quiz {view.quiz.revision}
        </p>
        <h1 className="text-2xl font-bold">{view.quiz.title}</h1>
        <p className="text-sm leading-7">
          {view.questions.length} câu · Đạt từ 80% · Câu bỏ trống được tính là
          chưa đúng.
        </p>
      </header>
      {!enabled && (
        <p
          role="note"
          className="rounded-xl border border-border bg-muted p-4 text-sm"
        >
          Làm quiz chưa được mở trong môi trường này. Bạn vẫn có thể xem lịch sử
          và kết quả đã lưu nếu có.
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm">
        {pending
          ? "Đang xử lý…"
          : !ready
            ? "Đang kiểm tra phiên làm bài…"
            : submitted
              ? "Đã đọc kết quả đã lưu."
              : attempt
                ? `Đã chọn ${Object.keys(answers).length} / ${view.questions.length} câu`
                : "Chưa bắt đầu lượt làm mới."}
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive p-4 text-sm leading-7"
        >
          {error.message}
        </p>
      )}
      {recovery && (
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={pending || !enabled || !error?.retryable}
            onClick={() => void send(recovery)}
          >
            Thử lại yêu cầu cũ
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => void readback()}
          >
            Đọc lại kết quả
          </Button>
        </div>
      )}
      {submitted && attempt && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-xl font-semibold outline-offset-4"
            >
              Kết quả: {attempt.passed ? "Đạt" : "Chưa đạt"}
            </h2>
            <p className="text-3xl font-semibold">
              {attempt.correctCount} / {attempt.questionCount} câu đúng
            </p>
            <p className="text-sm leading-7">
              {view.progress.completedAt
                ? "Bài học đã hoàn thành theo tiến độ đã lưu."
                : view.progress.studiedAt
                  ? "Đã xác nhận học. Bài chỉ hoàn thành khi có lượt quiz đạt."
                  : "Chưa xác nhận học. Quiz đạt chưa có nghĩa bài học đã hoàn thành."}
            </p>
            <p className="text-xs leading-6 text-muted-foreground">
              Kết quả không đồng nghĩa với thành thạo từ vựng. Giải thích đáp án
              chưa khả dụng.
            </p>
            <ul className="space-y-4">
              {view.questions.map((q, i) => {
                const r = view.responses.find((x) => x.question_id === q.id);
                return (
                  <li
                    key={q.id}
                    className="rounded-xl bg-muted p-4 text-sm leading-7"
                  >
                    <p className="whitespace-pre-wrap break-words font-medium">
                      {i + 1}. {q.prompt}
                    </p>
                    <p>
                      Đã chọn:{" "}
                      {r?.answer_index === null || r?.answer_index === undefined
                        ? "Bỏ trống"
                        : q.choices[r.answer_index]}
                    </p>
                    <p>{r?.is_correct ? "Đúng" : "Chưa đúng"}</p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
      {!submitted && attempt && (
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <p className="text-sm text-primary">
              Câu {index + 1} / {view.questions.length}
            </p>
            <progress
              aria-label="Số câu đã chọn"
              max={view.questions.length}
              value={Object.keys(answers).length}
              className="h-2 w-full accent-primary"
            />
            <fieldset disabled={locked} className="min-w-0 space-y-3">
              <legend
                id="quiz-question"
                tabIndex={-1}
                className="mb-5 whitespace-pre-wrap [overflow-wrap:anywhere] text-xl leading-9 outline-offset-4"
              >
                {question.prompt}
              </legend>
              {question.choices.map((choice, i) => (
                <label
                  key={`${question.id}-${i}`}
                  className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-7 ${answers[question.id] === i ? "border-primary bg-secondary" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === i}
                    onChange={() =>
                      setAnswers({ ...answers, [question.id]: i })
                    }
                    className="mt-1.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {choice}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                disabled={pending || index === 0}
                onClick={() => move(index - 1)}
              >
                Câu trước
              </Button>
              <Button
                variant="outline"
                disabled={pending || index === view.questions.length - 1}
                onClick={() => move(index + 1)}
              >
                Câu tiếp
              </Button>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              Lựa chọn chưa nộp không phải kết quả đã lưu. Khi gửi lại sau lỗi,
              hệ thống giữ nguyên yêu cầu ban đầu.
            </p>
            <Button
              disabled={locked || !enabled || !ready}
              onClick={() => {
                setConfirm(true);
                requestAnimationFrame(() => confirmation.current?.focus());
              }}
            >
              Nộp bài
            </Button>
            {confirm && (
              <section
                aria-label="Xác nhận nộp bài"
                className="space-y-4 rounded-xl border border-primary p-4"
              >
                <h2
                  ref={confirmation}
                  tabIndex={-1}
                  className="font-semibold outline-offset-4"
                >
                  Nộp lượt làm này?
                </h2>
                <p className="text-sm leading-7">
                  Còn {view.questions.length - Object.keys(answers).length} câu
                  bỏ trống. Sau khi nộp, bạn không thể đổi đáp án của lượt này.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={pending}
                    onClick={() =>
                      void send({
                        operation: "submit",
                        lessonId: view.lessonId,
                        attemptId: attempt.id,
                        answers: { ...answers },
                      })
                    }
                  >
                    Xác nhận nộp
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() => setConfirm(false)}
                  >
                    Tiếp tục làm bài
                  </Button>
                </div>
              </section>
            )}
          </CardContent>
        </Card>
      )}
      {(!attempt || submitted) && (
        <Button
          disabled={
            !ready || pending || !!recovery || recoveryBlocked || !enabled
          }
          onClick={() => {
            setAnswers({});
            setIndex(0);
            void send({
              operation: "start",
              lessonId: view.lessonId,
              startKey: crypto.randomUUID(),
            });
          }}
        >
          {submitted ? "Làm lại với lượt mới" : "Bắt đầu quiz"}
        </Button>
      )}
      <Button
        variant="outline"
        disabled={!ready || pending}
        onClick={() => void readback()}
      >
        Tải lại kết quả và tiến độ
      </Button>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lịch sử gần đây</h2>
        {view.history.length ? (
          <ul className="space-y-3">
            {view.history.map((a) => (
              <li key={a.id}>
                <a
                  className="block min-h-11 rounded-xl border border-border p-3 text-sm leading-7 text-primary underline"
                  href={`?attempt=${a.id}`}
                >
                  <time dateTime={a.startedAt}>
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "Asia/Ho_Chi_Minh",
                    }).format(new Date(a.startedAt))}
                  </time>{" "}
                  ·{" "}
                  {a.submittedAt
                    ? `${a.correctCount}/${a.questionCount} · ${a.passed ? "Đạt" : "Chưa đạt"}`
                    : "Tiếp tục lượt chưa nộp"}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có lượt làm đã lưu.
          </p>
        )}
      </section>
    </div>
  );
}
