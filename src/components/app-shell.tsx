"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Route,
  Settings,
  ArrowUpRight,
  LogOut,
  UserRound,
  Layers,
  Dumbbell,
  FileCheck2,
  MoreHorizontal,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { CourseSelector } from "./course-selector";
import { logout } from "@/features/auth/actions";

const links = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/roadmap", label: "Lộ trình", icon: Route },
  { href: "/practice", label: "Luyện tập", icon: Dumbbell },
  { href: "/vocabulary", label: "Từ vựng", icon: BookOpen },
  { href: "/review", label: "Ôn tập", icon: Layers },
  { href: "/exam", label: "Kiểm tra", icon: FileCheck2 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

const mobilePrimaryLinks = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/roadmap", label: "Lộ trình", icon: Route },
  { href: "/practice", label: "Luyện tập", icon: Dumbbell },
  { href: "/vocabulary", label: "Từ vựng", icon: BookOpen },
];

const mobileSecondaryLinks = [
  { href: "/review", label: "Ôn tập SRS", icon: Layers },
  { href: "/exam", label: "Kiểm tra HSK 1", icon: FileCheck2 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

// Priority order for background idle prewarming
const PREWARM_PRIORITY_ROUTES = [
  "/roadmap",
  "/practice",
  "/vocabulary",
  "/exam",
  "/review",
  "/dashboard",
  "/settings",
];

export function AppShell({
  children,
  displayName,
}: {
  children: ReactNode;
  displayName: string;
}) {
  const path = usePathname();
  const router = useRouter();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(path);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const prewarmedRef = useRef<Set<string>>(new Set());

  if (prevPath !== path) {
    setPrevPath(path);
    setPendingHref(null);
  }

  // Pointer Intent Prefetch: immediately warm target route on hover / focus / touchstart
  const handleIntentPrefetch = useCallback(
    (href: string) => {
      if (path.startsWith(href)) return;
      prewarmedRef.current.add(href);
      router.prefetch(href);
    },
    [path, router],
  );

  // Idle Prewarming: staggeredly prefetch core sibling routes when browser is idle
  useEffect(() => {
    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const runPrewarm = () => {
      if (cancelled) return;
      const targets = PREWARM_PRIORITY_ROUTES.filter(
        (href) => !path.startsWith(href) && !prewarmedRef.current.has(href),
      );
      targets.forEach((href, index) => {
        const timer = setTimeout(() => {
          if (cancelled) return;
          prewarmedRef.current.add(href);
          router.prefetch(href);
        }, index * 120);
        timers.push(timer);
      });
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | null = null;
    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(runPrewarm, { timeout: 1200 });
    } else {
      const fallbackTimer = setTimeout(runPrewarm, 250);
      timers.push(fallbackTimer);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [path, router]);

  function handleNavClick(href: string) {
    if (!path.startsWith(href)) {
      setPendingHref(href);
    }
  }

  return (
    <div className="min-h-screen">
      {pendingHref && (
        <div
          className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20 overflow-hidden"
          role="progressbar"
          aria-label="Đang chuyển trang"
        >
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <Link
          href="/dashboard"
          prefetch={true}
          onMouseEnter={() => handleIntentPrefetch("/dashboard")}
          onFocus={() => handleIntentPrefetch("/dashboard")}
          onTouchStart={() => handleIntentPrefetch("/dashboard")}
          onClick={() => handleNavClick("/dashboard")}
          className="flex h-24 items-center gap-3 px-7"
        >
          <span
            className="hanzi grid size-10 place-items-center rounded-xl bg-primary text-2xl text-white"
            aria-hidden="true"
          >
            学
          </span>
          <span className="text-xl font-bold tracking-tight">
            HanLearn
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[.2em] text-muted-foreground">
              Học mỗi ngày
            </span>
          </span>
        </Link>
        <p className="px-7 pb-3 pt-7 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
          Không gian của bạn
        </p>
        <nav aria-label="Điều hướng chính" className="space-y-2 px-4">
          {links.map(({ href, label, icon: Icon }) => {
            const isCurrent = path.startsWith(href);
            const isPending = pendingHref === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onMouseEnter={() => handleIntentPrefetch(href)}
                onFocus={() => handleIntentPrefetch(href)}
                onTouchStart={() => handleIntentPrefetch(href)}
                onClick={() => handleNavClick(href)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors",
                  isCurrent
                    ? "bg-secondary text-primary font-semibold"
                    : isPending
                      ? "bg-secondary/70 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{label}</span>
                {isPending && (
                  <span className="ml-auto size-2 rounded-full bg-primary animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mx-5 mb-6 mt-auto rounded-2xl bg-secondary p-5">
          <p className="text-sm font-semibold">Từng chút, mỗi ngày.</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Một không gian riêng để xây nền tảng tiếng Trung vững chắc.
          </p>
          <Link
            href="/roadmap"
            prefetch={true}
            onMouseEnter={() => handleIntentPrefetch("/roadmap")}
            onFocus={() => handleIntentPrefetch("/roadmap")}
            onTouchStart={() => handleIntentPrefetch("/roadmap")}
            onClick={() => handleNavClick("/roadmap")}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary"
          >
            Xem lộ trình <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-border bg-card/90 px-5 sm:px-9">
          <Link
            href="/dashboard"
            prefetch={true}
            onTouchStart={() => handleIntentPrefetch("/dashboard")}
            onClick={() => handleNavClick("/dashboard")}
            className="flex items-center gap-2 font-bold lg:hidden"
          >
            <span className="hanzi text-2xl text-primary" aria-hidden="true">
              学
            </span>
            HanLearn
          </Link>
          <div className="flex items-center">
            <CourseSelector />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <details className="relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-2 hover:bg-muted">
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                  <UserRound size={18} />
                </span>
                <span className="hidden max-w-40 truncate text-sm font-medium sm:block">
                  {displayName}
                </span>
                <span className="sr-only">Menu tài khoản</span>
              </summary>
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border bg-card p-2 shadow-lg">
                <Link
                  href="/settings"
                  prefetch={true}
                  onMouseEnter={() => handleIntentPrefetch("/settings")}
                  onTouchStart={() => handleIntentPrefetch("/settings")}
                  onClick={() => handleNavClick("/settings")}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted"
                >
                  <Settings size={16} />
                  Cài đặt tài khoản
                </Link>
                <form action={logout}>
                  <button className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted">
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-7xl px-5 py-8 pb-36 sm:px-9 sm:py-10 lg:pb-12"
        >
          {children}
        </main>
      </div>

      {/* Mobile More Popover / Sheet */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden flex flex-col justify-end p-4 animate-in fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-4 space-y-2 shadow-2xl animate-in slide-in-from-bottom-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold text-foreground">Menu Chức năng Thêm</span>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="size-7 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {mobileSecondaryLinks.map(({ href, label, icon: Icon }) => {
                const isCurrent = path.startsWith(href);
                const isPending = pendingHref === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={true}
                    onMouseEnter={() => handleIntentPrefetch(href)}
                    onTouchStart={() => handleIntentPrefetch(href)}
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleNavClick(href);
                    }}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors",
                      isCurrent
                        ? "bg-secondary text-primary font-semibold"
                        : isPending
                          ? "bg-secondary/70 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                    {isPending && (
                      <span className="ml-auto size-2 rounded-full bg-primary animate-ping" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={18} aria-hidden="true" />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Streamlined Mobile Bottom Navigation (5 tabs) */}
      <nav
        aria-label="Điều hướng di động"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur-md px-1 pb-[env(safe-area-inset-bottom)] lg:hidden shadow-lg"
      >
        {mobilePrimaryLinks.map(({ href, label, icon: Icon }) => {
          const isCurrent = path.startsWith(href);
          const isPending = pendingHref === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onMouseEnter={() => handleIntentPrefetch(href)}
              onFocus={() => handleIntentPrefetch(href)}
              onTouchStart={() => handleIntentPrefetch(href)}
              onClick={() => handleNavClick(href)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
                isCurrent
                  ? "text-primary font-bold"
                  : isPending
                    ? "text-primary font-semibold animate-pulse"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={19} aria-hidden="true" />
              <span className="truncate w-full text-center px-0.5">{label}</span>
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onTouchStart={() => {
            mobileSecondaryLinks.forEach((l) => handleIntentPrefetch(l.href));
          }}
          onMouseEnter={() => {
            mobileSecondaryLinks.forEach((l) => handleIntentPrefetch(l.href));
          }}
          onClick={() => setIsMoreMenuOpen(true)}
          className={cn(
            "flex min-h-16 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
            mobileSecondaryLinks.some((l) => path.startsWith(l.href))
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MoreHorizontal size={19} aria-hidden="true" />
          <span className="truncate w-full text-center px-0.5">Thêm</span>
        </button>
      </nav>
    </div>
  );
}
