import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeLoading() {
  return (
    <div
      role="status"
      aria-label="Đang tải trung tâm luyện tập..."
      className="space-y-6 max-w-5xl mx-auto pb-16"
    >
      {/* Page Heading Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
      </div>

      {/* Practice Sets Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải dữ liệu luyện tập…</span>
    </div>
  );
}
