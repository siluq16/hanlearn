import { Clock3, Globe2, LogOut } from "lucide-react";
import { getSettings } from "@/features/settings/queries";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { logout } from "@/features/auth/actions";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AudioDiagnosticsCard } from "@/components/audio-diagnostics";
export const metadata = { title: "Cài đặt" };
export default async function SettingsPage() {
  const { user, profile, syllabuses } = await getSettings();
  return (
    <>
      <PageHeading
        eyebrow="Theo cách của bạn"
        title="Thiết lập nhịp học."
        description="Lưu mục tiêu cá nhân và giữ không gian học phù hợp với bạn."
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ học tập</CardTitle>
            <CardDescription>
              {profile
                ? "Điều chỉnh mục tiêu khi cần. Trình độ tự khai báo không thay đổi mastery từ vựng."
                : "Các giá trị dưới đây là gợi ý ban đầu. Nhấn lưu để tạo hồ sơ."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm profile={profile} syllabuses={syllabuses} />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thói quen và giao diện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock3 className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">60 phút mỗi ngày</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mục tiêu cố định trong MVP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe2 className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Asia/Ho_Chi_Minh</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Múi giờ tính ngày học và hoạt động
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
                <div>
                  <p className="text-sm font-medium">Giao diện sáng / tối</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Được ghi nhớ trên trình duyệt này
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản</CardTitle>
              <CardDescription className="break-all">
                {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-5 text-xs leading-6 text-muted-foreground">
                Tài khoản cá nhân đã xác nhận email. Dữ liệu học được giới hạn
                theo quyền truy cập của bạn.
              </p>
              <form action={logout}>
                <Button type="submit" variant="outline">
                  <LogOut />
                  Đăng xuất
                </Button>
              </form>
            </CardContent>
          </Card>
          <AudioDiagnosticsCard />
        </div>
      </div>
    </>
  );
}
