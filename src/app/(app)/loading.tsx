import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div role="status" aria-label="Đang tải dữ liệu học">
      <Skeleton className="mb-4 h-9 w-52" />
      <Skeleton className="mb-8 h-5 w-72 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-32" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64" />
      <span className="sr-only">Đang tải dữ liệu học…</span>
    </div>
  );
}
