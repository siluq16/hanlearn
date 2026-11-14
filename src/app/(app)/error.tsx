"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border bg-card p-8">
      <h1 className="text-2xl font-semibold">Chưa tải được dữ liệu</h1>
      <p className="my-4 text-muted-foreground">
        Kết nối có thể đang gián đoạn. Tiến độ đã lưu của bạn vẫn được giữ
        nguyên.
      </p>
      <Button onClick={reset}>Thử lại</Button>
      <Button asChild variant="outline" className="ml-3">
        <a href="/roadmap">Về lộ trình</a>
      </Button>
    </div>
  );
}
