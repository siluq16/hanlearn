import type { Provenance } from "../types";
export function safeSourceHref(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function ContentProvenance({ value }: { value: Provenance }) {
  const href = safeSourceHref(value.sourceUri);
  return (
    <details className="mt-4 border-t border-border pt-2 text-xs leading-6 text-muted-foreground">
      <summary className="flex min-h-11 cursor-pointer items-center font-medium">
        Nguồn và quyền sử dụng
      </summary>
      <div className="space-y-1 pb-2">
        <p className="[overflow-wrap:anywhere]">Giấy phép: {value.license}</p>
        <p className="[overflow-wrap:anywhere]">
          Người rà soát: {value.reviewedBy}
        </p>
        <p>
          Rà soát ngày{" "}
          <time dateTime={value.reviewedAt}>
            {new Intl.DateTimeFormat("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            }).format(new Date(value.reviewedAt))}
          </time>
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center break-all text-primary underline underline-offset-4"
          >
            Xem nguồn tham khảo
          </a>
        ) : (
          <p className="break-all">{value.sourceUri}</p>
        )}
      </div>
    </details>
  );
}
