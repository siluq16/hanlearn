import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div
      role="status"
      aria-label="Đang tải cài đặt..."
      className="space-y-6 max-w-5xl mx-auto pb-16"
    >
      {/* Page Heading Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Settings Grid Skeleton */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <span className="sr-only">Đang tải thiết lập tài khoản…</span>
    </div>
  );
}
