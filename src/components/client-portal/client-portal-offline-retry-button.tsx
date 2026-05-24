"use client";

import {
  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
  CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";

export function ClientPortalOfflineRetryButton() {
  return (
    <button
      type="button"
      aria-label="오프라인 상태에서 페이지 다시 시도"
      className={[
        "rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 sm:min-h-11",
        CLIENT_PORTAL_MOBILE_TOUCH_TARGET_CLASS,
        CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
      ].join(" ")}
      onClick={() => window.location.reload()}
      data-testid="client-portal-offline-retry"
    >
      다시 시도
    </button>
  );
}
