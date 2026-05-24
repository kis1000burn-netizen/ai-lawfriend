import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PromoAnalyticsProvider } from "@/components/analytics/promo-analytics-provider";
import { CmbOnboardingGate } from "@/components/onboarding/cmb-onboarding-gate";
import { SiteFooter } from "@/components/layout/site-footer";
import { SitePromoPopupProvider } from "@/components/layout/site-promo-popup-provider";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { siteOrigin } from "@/lib/site-origin";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
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
          <CmbOnboardingGate />
          <div className="flex-1">{children}</div>
          <SitePromoPopupProvider />
          <PromoAnalyticsProvider />
        </ToastProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
