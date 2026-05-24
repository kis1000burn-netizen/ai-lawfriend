import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import {
  ClientPortalPwaInstallBanner,
  ClientPortalPwaServiceWorkerRegister,
} from "@/components/client-portal/client-portal-pwa-shell";
import { ClientPortalPushNotificationPanel } from "@/components/client-portal/client-portal-push-notification-panel";
import {
  CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E,
  CLIENT_PORTAL_MOBILE_LOW_END_SMOKE_TEST_ID,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";
import {
  CLIENT_PORTAL_PWA_APP_NAME,
  CLIENT_PORTAL_PWA_ICON_PATH,
  CLIENT_PORTAL_PWA_MANIFEST_PATH,
  CLIENT_PORTAL_PWA_SHORT_NAME,
  CLIENT_PORTAL_PWA_THEME_COLOR,
} from "@/features/client-portal/client-portal-pwa.policy";

export const CLIENT_MOBILE_PORTAL_LAYOUT_MARKER_PHASE21A =
  "phase21a-client-mobile-portal-layout" as const;

export const CLIENT_PORTAL_PWA_LAYOUT_MARKER_PHASE21C =
  "phase21c-client-portal-pwa-layout" as const;

export const CLIENT_PORTAL_PUSH_LAYOUT_MARKER_PHASE21D =
  "phase21d-client-portal-push-layout" as const;

export const CLIENT_PORTAL_A11Y_LAYOUT_MARKER_PHASE21E =
  "phase21e-client-portal-a11y-layout" as const;

export const metadata: Metadata = {
  applicationName: CLIENT_PORTAL_PWA_APP_NAME,
  manifest: CLIENT_PORTAL_PWA_MANIFEST_PATH,
  appleWebApp: {
    capable: true,
    title: CLIENT_PORTAL_PWA_SHORT_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: CLIENT_PORTAL_PWA_ICON_PATH,
    apple: CLIENT_PORTAL_PWA_ICON_PATH,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: CLIENT_PORTAL_PWA_THEME_COLOR,
};

type Props = {
  children: ReactNode;
};

export default function ClientMobilePortalLayout({ children }: Props) {
  return (
    <div
      className={[
        "client-mobile-portal mx-auto min-h-[60vh] w-full max-w-lg pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-base leading-relaxed md:max-w-6xl md:pb-8",
        CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E,
      ].join(" ")}
      data-testid={CLIENT_PORTAL_MOBILE_LOW_END_SMOKE_TEST_ID}
    >
      <ClientPortalPwaServiceWorkerRegister />
      <div className="mb-4 space-y-4 px-4 pt-4">
        <ClientPortalPwaInstallBanner />
        <ClientPortalPushNotificationPanel />
      </div>
      {children}
    </div>
  );
}
