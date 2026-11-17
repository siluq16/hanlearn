import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyLoading() {
  return (
    <div
      role="status"
      aria-label="Đang tải danh sách từ vựng..."
      className="space-y-6 max-w-5xl mx-auto pb-16"
    >
      {/* Page Heading Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Stats and Filter Bar Skeleton */}
      <div className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full sm:w-60 rounded-xl" />
      </div>

      {/* Unit Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-xl" />
        ))}
      </div>

      {/* Word Cards Grid Skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border bg-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải từ vựng HSK 1…</span>
    </div>
  );
}
