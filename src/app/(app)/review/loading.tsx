import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingReview() {
  return (
    <section
      role="status"
      aria-label="Đang tải thẻ ôn"
      className="mx-auto max-w-3xl space-y-6"
    >
      <p className="text-sm">Đang tải thẻ đến hạn…</p>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </section>
  );
}
