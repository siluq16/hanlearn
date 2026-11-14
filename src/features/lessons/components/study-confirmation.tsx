"use client";
import { useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StudyProgress, StudyResult } from "../study-contract";

export function StudyConfirmation({
  lessonId,
  progress,
  enabled,
  confirm,
}: {
  lessonId: string;
  progress: StudyProgress;
  enabled: boolean;
  confirm: (input: { lessonId: string }) => Promise<StudyResult>;
}) {
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const [result, setResult] = useState<StudyResult | null>(null);
  const format = (value: string | null) =>
    value ? (
      <time dateTime={value}>
        {new Intl.DateTimeFormat("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date(value))}
      </time>
    ) : (
      "Chưa ghi nhận"
    );
  function submit() {
    if (inFlight.current || !enabled || progress.completedAt) return;
    inFlight.current = true;
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await confirm({ lessonId }));
      } catch {
        setResult({
          ok: false,
          error: {
            code: "NETWORK",
            message:
              "Mất kết nối; kết quả có thể đã được lưu. Tải lại tiến độ hoặc thử xác nhận lại cùng bài học.",
            retryable: true,
            outcomeUnknown: true,
          },
        });
      } finally {
        inFlight.current = false;
      }
    });
  }
  // Progress comes from the fresh server render, never an optimistic boolean/clock.
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <h2 className="text-base font-semibold">Tiến độ đã lưu</h2>
        <div role="status" aria-live="polite" aria-atomic="true">
          <Badge>
            {progress.completedAt
              ? "Đã hoàn thành"
              : progress.studiedAt
                ? "Đã xác nhận học"
                : "Chưa xác nhận học"}
          </Badge>
          {pending && <p className="mt-3 text-sm">Đang xác nhận học…</p>}
        </div>
        {!progress.completedAt && (
          <p className="text-sm leading-7">
            Hoàn thành bài cần cả xác nhận học và quiz đạt ít nhất 80%.
          </p>
        )}
        {!enabled && (
          <p className="text-sm">
            Chức năng xác nhận học chưa được mở trong môi trường này.
          </p>
        )}
        {result && !result.ok && (
          <p role="alert" className="text-sm leading-7 text-destructive">
            {result.error.message}
          </p>
        )}
        <Button
          className="min-h-11 w-full whitespace-normal"
          onClick={submit}
          disabled={
            pending ||
            !enabled ||
            !!progress.completedAt ||
            (!!result && !result.ok && !result.error.retryable)
          }
          aria-busy={pending}
        >
          {pending
            ? "Đang xử lý…"
            : result && !result.ok && result.error.retryable
              ? "Thử xác nhận lại an toàn"
              : progress.completedAt
                ? "Bài học đã hoàn thành"
                : progress.studiedAt
                  ? "Xác nhận lại việc học"
                  : "Tôi đã học nội dung này"}
        </Button>
        <Button asChild variant="outline" className="min-h-11 w-full">
          <a href={`/lessons/${lessonId}/quiz`}>Mở mini quiz</a>
        </Button>
        <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs leading-6">
          <div>
            <dt className="text-muted-foreground">Xác nhận học</dt>
            <dd>{format(progress.studiedAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Hoàn thành</dt>
            <dd>{format(progress.completedAt)}</dd>
          </div>
        </dl>
        <p className="text-xs leading-6 text-muted-foreground">
          Hoàn thành bài không đồng nghĩa với thành thạo từ vựng hoặc thời gian
          học.
        </p>
        <Button
          variant="outline"
          className="min-h-11 w-full"
          disabled={pending}
          onClick={() => window.location.reload()}
        >
          Tải lại tiến độ
        </Button>
      </CardContent>
    </Card>
  );
}
