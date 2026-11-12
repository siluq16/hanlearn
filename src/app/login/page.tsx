import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Clock3, BookOpen, ArrowUpRight } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { getLearner, AccessError } from "@/features/auth/session";
import { getPublicConfig } from "@/lib/env";
import { ThemeToggle } from "@/components/theme-toggle";
export const metadata = { title: "Đăng nhập" };
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  let isLearner = false;
  try {
    await getLearner();
    isLearner = true;
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;
  }
  if (isLearner) redirect("/dashboard");
  const configured = !!getPublicConfig();
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-secondary px-12 py-10 lg:flex xl:px-20">
        <Link
          href="/login"
          className="flex items-center gap-3 text-xl font-bold"
        >
          <span
            className="hanzi grid size-11 place-items-center rounded-xl bg-primary text-2xl text-white"
            aria-hidden="true"
          >
            学
          </span>
          HanLearn
        </Link>
        <div className="relative my-12 max-w-lg">
          <div
            className="hanzi mb-8 text-8xl leading-none text-primary/80"
            aria-hidden="true"
          >
            学 · 习
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.22em] text-primary">
            Mỗi ngày một bước tiến
          </p>
          <h1 className="text-4xl font-semibold leading-[1.25] tracking-tight xl:text-5xl">
            Chậm mà chắc.
            <br />
            Xa hơn mỗi ngày.
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
            Xây nền tảng tiếng Trung theo cách của bạn. Một lộ trình rõ ràng,
            một thói quen nhỏ, một hành trình dài.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: BookOpen, text: "Lộ trình từ HSK 1 đến HSK 5" },
              { icon: Clock3, text: "Dành 60 phút cho việc học mỗi ngày" },
              {
                icon: ShieldCheck,
                text: "Không gian riêng, tiến độ của riêng bạn",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <span className="grid size-9 place-items-center rounded-xl border border-primary/15 bg-card/60 text-primary">
                  <Icon size={17} aria-hidden="true" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs tracking-wide text-muted-foreground">
          HANLEARN · PERSONAL CHINESE LEARNING
        </p>
      </section>
      <section className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="flex items-center gap-2 font-bold lg:invisible"
          >
            <span className="hanzi text-2xl text-primary" aria-hidden="true">
              学
            </span>
            HanLearn
          </Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto my-auto w-full max-w-sm py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Chào mừng trở lại
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Tiếp tục hành trình
          </h2>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
            Đăng nhập tài khoản cá nhân để trở về với nhịp học của bạn.
          </p>
          {!configured && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm leading-6"
            >
              <p className="font-medium">Môi trường học chưa được kết nối</p>
              <Link
                href="/setup"
                className="mt-1 inline-flex min-h-11 items-center gap-1 font-medium text-primary underline underline-offset-4"
              >
                Hướng dẫn kết nối Development <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
          <LoginForm />
          <p className="mt-7 text-center text-xs leading-6 text-muted-foreground">
            HanLearn dành cho tài khoản được cấp quyền.
            <br />
            Đăng ký công khai hiện không được mở.
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Học tập trung. Lưu tiến độ. Tiếp tục mỗi ngày.
        </p>
      </section>
    </main>
  );
}
