"use client";

import { useEffect, useState } from "react";
import {
  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
  CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";
import {
  CLIENT_PORTAL_PWA_APP_NAME,
  CLIENT_PORTAL_PWA_SERVICE_WORKER_PATH,
  CLIENT_PORTAL_PWA_SCOPE,
} from "@/features/client-portal/client-portal-pwa.policy";

export const CLIENT_PORTAL_PWA_INSTALL_BANNER_MARKER_PHASE21C =
  "phase21c-client-portal-pwa-install-banner" as const;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function ClientPortalPwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950"
      aria-label={`${CLIENT_PORTAL_PWA_APP_NAME} 홈 화면 추가 안내`}
      data-testid="client-portal-pwa-install-banner"
    >
      <p className="font-semibold">{CLIENT_PORTAL_PWA_APP_NAME} 홈 화면 추가</p>
      <p className="mt-1 leading-6 text-indigo-900/85">
        홈 화면에 추가하면 카카오/이메일 링크 없이도 바로 사건 포털로 들어올 수 있습니다.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label="홈 화면에 AI법친 의뢰인 포털 추가"
          className={[
            "rounded-xl bg-indigo-900 px-3 py-2 text-xs font-semibold text-white sm:min-h-11",
            CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
            CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
          ].join(" ")}
          onClick={() => {
            void deferredPrompt.prompt().then(() => setDeferredPrompt(null));
          }}
          data-testid="client-portal-pwa-install-accept"
        >
          홈 화면에 추가
        </button>
        <button
          type="button"
          aria-label="홈 화면 추가 나중에 하기"
          className={[
            "rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-900 sm:min-h-11",
            CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
            CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
          ].join(" ")}
          onClick={() => setDismissed(true)}
          data-testid="client-portal-pwa-install-dismiss"
        >
          나중에
        </button>
      </div>
    </section>
  );
}

export function ClientPortalPwaServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register(CLIENT_PORTAL_PWA_SERVICE_WORKER_PATH, {
      scope: CLIENT_PORTAL_PWA_SCOPE,
    });
  }, []);

  return null;
}
