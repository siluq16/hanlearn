import { Skeleton } from "@/components/ui/skeleton";

export default function ExamLoading() {
  return (
    <div
      role="status"
      aria-label="Đang tải thông tin kiểm tra..."
      className="space-y-8 max-w-5xl mx-auto pb-16"
    >
      {/* Page Heading Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Official Mock Exam Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>
          <Skeleton className="h-7 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl shrink-0" />
      </div>

      {/* 6 Unit Tests Grid Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
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
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Đang tải đề thi và bài kiểm tra…</span>
    </div>
  );
}
