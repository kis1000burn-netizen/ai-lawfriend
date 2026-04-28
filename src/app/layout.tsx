import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

export const metadata = {
  title: "AI법친",
  description: "사건 정리와 상담 준비를 돕는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body className="flex min-h-dvh flex-col bg-aibeop-bg font-sans text-aibeop-text antialiased">
        <ToastProvider>
          <div className="flex-1">{children}</div>
        </ToastProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
