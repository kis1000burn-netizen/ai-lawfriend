"use client";

import type { ClientPortalMobileTabKey } from "@/features/client-portal/client-portal-mobile.policy";
import { CLIENT_PORTAL_MOBILE_BOTTOM_NAV_TABS } from "@/features/client-portal/client-portal-mobile.policy";
import {
  CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E,
  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";

export const CLIENT_MOBILE_BOTTOM_NAV_A11Y_MARKER_PHASE21E =
  "phase21e-client-mobile-bottom-nav-a11y" as const;

const LABELS: Record<ClientPortalMobileTabKey, string> = {
  supplements: "요청",
  uploads: "제출",
  shared: "공유",
  chat: "대화",
  deadlines: "기일",
  history: "이력",
};

type Props = {
  activeTab: ClientPortalMobileTabKey;
  onSelect: (tab: ClientPortalMobileTabKey) => void;
};

export function ClientMobileBottomNav({ activeTab, onSelect }: Props) {
  return (
    <nav
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t border-indigo-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur motion-reduce:backdrop-blur-none md:hidden",
        CLIENT_PORTAL_MOBILE_A11Y_POLICY_MARKER_PHASE21E,
      ].join(" ")}
      aria-label="의뢰인 포털 주요 메뉴"
      data-testid="client-mobile-bottom-nav"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {CLIENT_PORTAL_MOBILE_BOTTOM_NAV_TABS.map((key) => {
          const active = activeTab === key;
          const label = LABELS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-label={`${label} 탭`}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-14 min-w-11 flex-col items-center justify-center px-1 py-2 text-[11px] font-semibold sm:text-xs",
                CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
                active ? "text-indigo-900" : "text-slate-500",
              ].join(" ")}
              data-testid={`client-mobile-bottom-nav-${key}`}
            >
              <span
                className={[
                  "mb-1 h-1.5 w-1.5 rounded-full",
                  active ? "bg-indigo-700" : "bg-transparent",
                ].join(" ")}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
