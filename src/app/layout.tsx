import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = {
  title: {
    default: "HanLearn · Học tiếng Trung mỗi ngày",
    template: "%s · HanLearn",
  },
  description:
    "Không gian học tiếng Trung cá nhân, từng bước từ HSK 1 đến HSK 5.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
