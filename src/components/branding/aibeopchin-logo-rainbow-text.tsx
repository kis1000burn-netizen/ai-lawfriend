"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { AIBEOPCHIN_LOGO_RAINBOW_TEXT } from "@/lib/branding/aibeopchin-logo-rainbow";
import { AIBEOPCHIN_LOGO_POP_FONT_CLASS } from "@/lib/branding/aibeopchin-logo-typography";

type Props = {
  children?: ReactNode;
  className?: string;
  /** false면 일반 텍스트(제한 모드 등) */
  active?: boolean;
  reducedMotion?: boolean;
};

export function AibeopchinLogoRainbowText({
  children = AIBEOPCHIN_LOGO_RAINBOW_TEXT,
  className = "",
  active = true,
  reducedMotion,
}: Readonly<Props>) {
  const systemReduced = useReducedMotion();
  const reduced = Boolean(reducedMotion ?? systemReduced);
  const mergedClass = className.trim();

  if (!active || reduced) {
    return (
      <span className={[AIBEOPCHIN_LOGO_POP_FONT_CLASS, mergedClass].filter(Boolean).join(" ")}>
        {children}
      </span>
    );
  }

  return (
    <span
      className={[
        AIBEOPCHIN_LOGO_POP_FONT_CLASS,
        "aibeop-rainbow-text",
        mergedClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
