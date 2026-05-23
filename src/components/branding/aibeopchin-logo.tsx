"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AIBEOPCHIN_BRAND_COPY } from "@/lib/branding/aibeopchin-logo-config";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import { AibeopchinLogoRainbowText } from "@/components/branding/aibeopchin-logo-rainbow-text";
import type { AibeopchinLogoMode, AibeopchinLogoSize } from "./aibeopchin-brand-types";

type Props = {
  mode?: AibeopchinLogoMode;
  size?: AibeopchinLogoSize;
  showSubtitle?: boolean;
  className?: string;
};

const sizeClass: Record<AibeopchinLogoSize, string> = {
  sm: "max-w-[220px]",
  md: "max-w-[300px]",
  lg: "max-w-[380px]",
  hero: "max-w-[520px]",
};

const lockupClass: Record<AibeopchinLogoSize, string> = {
  sm: "gap-2 rounded-[1.35rem] px-3 py-3",
  md: "gap-3 rounded-[1.6rem] px-4 py-4",
  lg: "gap-3 rounded-[1.85rem] px-5 py-5",
  hero: "gap-4 rounded-[2rem] px-6 py-5 md:px-7 md:py-6",
};

const symbolClass: Record<AibeopchinLogoSize, string> = {
  sm: "h-10 w-10 rounded-2xl text-base",
  md: "h-12 w-12 rounded-2xl text-lg",
  lg: "h-14 w-14 rounded-[1.2rem] text-xl",
  hero: "h-16 w-16 rounded-[1.35rem] text-2xl md:h-20 md:w-20 md:text-3xl",
};

const titleClass: Record<AibeopchinLogoSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-[2rem]",
  hero: "text-3xl md:text-[2.6rem]",
};

const subtitleClass: Record<AibeopchinLogoSize, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
  hero: "text-sm md:text-base",
};

function resolveGlyphMode(
  mode: AibeopchinLogoMode,
  pointerHover: boolean,
  allowHover: boolean,
): AibeopchinLogoMode {
  if (mode === "intro") {
    return "intro";
  }

  if (pointerHover && allowHover) {
    return "hover";
  }

  return mode;
}

function getGlyphPulseAnimation(glyphMode: AibeopchinLogoMode, particleActive: boolean) {
  if (glyphMode === "thinking") {
    return { scale: [1, 1.04, 1] };
  }

  if (glyphMode === "hover" || particleActive) {
    return { scale: [1, 1.02, 1] };
  }

  return undefined;
}

function getSubtitleCopy(glyphMode: AibeopchinLogoMode) {
  if (glyphMode === "verified") {
    return "검토와 정리가 연결되는 법률 업무 플랫폼";
  }

  if (glyphMode === "thinking") {
    return "사건 흐름을 정리하는 AI 법률 동반자";
  }

  return AIBEOPCHIN_BRAND_COPY.tagline;
}

export function AibeopchinLogo({
  mode = "idle",
  size = "md",
  showSubtitle = false,
  className = "",
}: Readonly<Props>) {
  const [pointerHover, setPointerHover] = useState(false);
  const allowHover = mode !== "intro" && mode !== "thinking" && mode !== "verified";
  const glyphMode = resolveGlyphMode(mode, pointerHover, allowHover);

  const particleActive = glyphMode !== "verified";
  const pulseAnimation = getGlyphPulseAnimation(glyphMode, particleActive);
  const subtitleCopy = getSubtitleCopy(glyphMode);

  return (
    <motion.div
      className={[
        "relative mx-auto flex flex-col items-center justify-center",
        sizeClass[size],
        className,
      ].join(" ")}
      whileHover={{ scale: size === "hero" ? 1.04 : 1.03 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      role="img"
      aria-label={AIBEOPCHIN_BRAND_COPY.title}
      onPointerEnter={() => allowHover && setPointerHover(true)}
      onPointerLeave={() => setPointerHover(false)}
    >
      <div className="relative flex w-full items-center justify-center">
        <motion.div
          className={[
            "relative flex w-full items-center justify-center border border-white/10 bg-white/[0.04] shadow-2xl shadow-slate-950/25 backdrop-blur-md",
            lockupClass[size],
          ].join(" ")}
          initial={mode === "intro" ? { opacity: 0, y: 18 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: AIBEOPCHIN_INTRO_TIMELINE.lockup.delay * 0.25,
            duration: 0.65,
            ease: "easeOut",
          }}
        >
          <div className="relative z-10 flex w-full items-center justify-center gap-3">
            <motion.div
              className={[
                "flex shrink-0 items-center justify-center bg-aibeop-green font-black tracking-[-0.04em] text-white shadow-soft",
                symbolClass[size],
              ].join(" ")}
              animate={pulseAnimation}
              transition={{
                duration: glyphMode === "thinking" ? 1.2 : 2.4,
                repeat: glyphMode === "verified" ? 0 : Infinity,
                ease: "easeInOut",
              }}
            >
              AI
            </motion.div>

            <div className="min-w-0 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 md:text-[11px]">
                {AIBEOPCHIN_BRAND_COPY.eyebrow}
              </p>
              <AibeopchinLogoRainbowText
                className={["mt-1 font-black tracking-[-0.05em]", titleClass[size]].join(" ")}
              />
              <p
                className={[
                  "mt-1 font-medium text-white/72",
                  subtitleClass[size],
                ].join(" ")}
              >
                {subtitleCopy}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {showSubtitle ? (
        <motion.p
          className="mt-3 text-center text-sm font-medium text-white/78 md:text-base"
          initial={mode === "intro" ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: AIBEOPCHIN_INTRO_TIMELINE.cta.delay,
            duration: 0.6,
          }}
        >
          {AIBEOPCHIN_BRAND_COPY.tagline}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
