import type { ReaderProvenance } from "./reader-types";
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
export function ContentProvenance({ value }: { value: ReaderProvenance }) {
  const href = safeSourceHref(value.sourceUri);
  return (
    <details className="mt-4 border-t border-border pt-2 text-xs leading-6 text-muted-foreground">
      <summary className="flex min-h-11 cursor-pointer items-center font-medium">
        Nguồn và quyền sử dụng
      </summary>
      <div className="space-y-1 pb-2">
        <p className="[overflow-wrap:anywhere]">
          {value.license === "pending-rights-review"
            ? "Quyền sử dụng: metadata bản nháp đang chờ rà soát"
            : `Giấy phép: ${value.license}`}
        </p>
        <p className="[overflow-wrap:anywhere]">
          Người rà soát: {value.reviewedBy ?? "Chưa ghi nhận"}
        </p>
        <p>
          Rà soát ngày{" "}
          {value.reviewedAt ? (
            <time dateTime={value.reviewedAt}>
              {new Intl.DateTimeFormat("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              }).format(new Date(value.reviewedAt))}
            </time>
          ) : (
            "Chưa ghi nhận"
          )}
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
