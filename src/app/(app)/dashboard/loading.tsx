import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Đang tải tổng quan..." className="space-y-6">
      {/* Page Heading Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>

      {/* Course Overall Progress Card Skeleton */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-7 w-60" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Quick Action Buttons Skeleton */}
      <div className="flex flex-wrap gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-11 w-44 rounded-xl" />
        ))}
      </div>

      {/* Grid Next Step & Curriculum Progress */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
      <span className="sr-only">Đang tải dữ liệu tổng quan…</span>
    </div>
  );
}
