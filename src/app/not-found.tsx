import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <p className="text-sm text-primary">HanLearn / 404</p>
      <h1 className="my-5 text-3xl font-semibold">Không tìm thấy nội dung</h1>
      <p className="mb-8 text-muted-foreground">
        Nội dung có thể chưa được phát hành hoặc đường dẫn không còn phù hợp.
      </p>
      <Button asChild>
        <Link href="/dashboard">Về tổng quan</Link>
      </Button>
    </main>
  );
}
