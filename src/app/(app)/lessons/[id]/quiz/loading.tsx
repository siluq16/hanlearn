import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingQuiz() {
  return (
    <section
      role="status"
      aria-label="Đang tải mini quiz"
      className="max-w-3xl space-y-6"
    >
      <p className="text-sm text-muted-foreground">Đang tải quiz…</p>
      <Skeleton className="h-9 w-3/4" />
      <div
        aria-hidden="true"
        className="space-y-4 rounded-2xl border border-border p-5"
      >
        <Skeleton className="h-7 w-2/3" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </section>
  );
}
