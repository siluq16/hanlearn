import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapLoading() {
  return (
    <div
      role="status"
      aria-label="Đang tải lộ trình học..."
      className="space-y-8 max-w-5xl mx-auto pb-16"
    >
      {/* Page Heading Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Course Overall Progress Card Skeleton */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-52" />
          </div>
          <Skeleton className="h-11 w-48 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* 6 Unit Accordions Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải dữ liệu lộ trình…</span>
    </div>
  );
}
