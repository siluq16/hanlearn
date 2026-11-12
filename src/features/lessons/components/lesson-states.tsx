import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
export function LessonUnavailable() {
  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold">Bài học chưa khả dụng</h1>
      <EmptyState
        title="Chưa thể mở bài học này"
        description="Bài học có thể chưa được phát hành hoặc không thuộc nội dung bạn được phép đọc."
      >
        <a
          href="/roadmap"
          className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
        >
          Về lộ trình
        </a>
      </EmptyState>
    </section>
  );
}
export function InvalidLessonContent() {
  return (
    <section
      role="alert"
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <h1 className="text-2xl font-semibold">Nội dung chưa sẵn sàng</h1>
      <p className="text-sm leading-7 text-muted-foreground">
        Nội dung bài học chưa đủ điều kiện hiển thị. Vui lòng quay lại sau.
      </p>
      <a
        href="/roadmap"
        className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
      >
        Về lộ trình
      </a>
    </section>
  );
}
export function LessonLoading() {
  return (
    <div role="status" aria-label="Đang tải bài học">
      <Skeleton className="mb-5 h-8 w-40" />
      <Skeleton className="mb-4 h-12 max-w-full w-96" />
      <Skeleton className="mb-8 h-6 max-w-full w-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Skeleton className="h-96" />
        <Skeleton className="h-60" />
      </div>
      <span className="sr-only">Đang tải bài học…</span>
    </div>
  );
}
