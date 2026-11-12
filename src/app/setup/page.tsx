import Link from "next/link";
import { ArrowLeft, Cable, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
export const metadata = { title: "Kết nối môi trường học" };
export default function SetupPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-8">
      <div className="mb-12 flex items-center justify-between">
        <Link
          href="/login"
          className="flex min-h-11 items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Đăng nhập
        </Link>
        <ThemeToggle />
      </div>
      <span className="mb-6 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        <Cable size={28} />
      </span>
      <h1 className="text-3xl font-semibold tracking-tight">
        Kết nối không gian học
      </h1>
      <p className="mb-8 mt-4 text-base leading-7 text-muted-foreground">
        Ứng dụng đã có thể chạy trên máy. Để đăng nhập và lưu tiến độ, hãy kết
        nối một Supabase Cloud Development project riêng.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Ba bước để bắt đầu</CardTitle>
          <CardDescription>
            Thực hiện cấu hình trên máy và Supabase Dashboard của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-6">
            {[
              "Tạo project Development riêng trên Supabase. Trong Authentication, tắt đăng ký công khai và cấp tài khoản owner đã xác nhận email.",
              "Sao chép .env.example thành .env.local. Điền Project URL và Publishable key từ Dashboard, sau đó khởi động lại ứng dụng.",
              "Kiểm tra và phê duyệt migration trước khi áp dụng. Sau đó cấp UUID owner vào allowlist bằng kết nối database quản trị.",
            ].map((text, i) => (
              <li key={text} className="flex gap-4 text-sm leading-7">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
          <div className="mt-7 flex gap-3 rounded-xl bg-muted p-4 text-sm leading-6">
            <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
            <p>
              Không cần Docker. Không gửi mật khẩu database hoặc secret key vào
              chat. Hướng dẫn chi tiết nằm trong README và
              docs/CLOUD_DEVELOPMENT.md của repository.
            </p>
          </div>
        </CardContent>
      </Card>
      <Button asChild className="mt-7">
        <Link href="/login">Về trang đăng nhập</Link>
      </Button>
    </main>
  );
}
