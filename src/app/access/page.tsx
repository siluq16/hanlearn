import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Quyền truy cập" };
export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const unavailable = reason === "unavailable";
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <ShieldAlert className="mb-6 size-12 text-primary" />
      <h1 className="text-3xl font-semibold">
        {unavailable
          ? "Chưa xác nhận được quyền truy cập"
          : reason === "logout"
            ? "Chưa đăng xuất được"
            : "Tài khoản chưa được cấp quyền"}
      </h1>
      <p className="my-5 leading-7 text-muted-foreground">
        {unavailable
          ? "Dịch vụ có thể đang gián đoạn hoặc database chưa được cấu hình đầy đủ. Hãy kiểm tra kết nối Development và thử lại."
          : "HanLearn chỉ dành cho tài khoản đã xác nhận email và được thêm vào allowlist. Không có dữ liệu học riêng tư nào được hiển thị ở đây."}
      </p>
      <div className="flex flex-wrap gap-3">
        <form action={logout}>
          <Button type="submit">Đăng xuất / đổi tài khoản</Button>
        </form>
        <Button asChild variant="outline">
          <Link href="/login">Thử đăng nhập lại</Link>
        </Button>
      </div>
    </main>
  );
}
