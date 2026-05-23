"use client";

import { useReducedMotion } from "framer-motion";
import { AibeopchinBeopKanjiLogo } from "@/components/branding/aibeopchin-beop-kanji-logo";

/** 제한·승인 대기 안내(`DashboardRestrictedState` 등)용 restricted 로고 신호. */
export function DashboardRestrictedLogoNote() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex max-w-full flex-col items-center gap-2">
      <AibeopchinBeopKanjiLogo
        size="sm"
        loop={false}
        reducedMotion={Boolean(reducedMotion)}
        strokeClassName="text-aibeop-warn"
      />
      <p className="text-xs font-bold text-aibeop-warn">제한 상태</p>
    </div>
  );
}
