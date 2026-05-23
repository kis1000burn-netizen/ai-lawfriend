"use client";

import { motion } from "framer-motion";
import { AIBEOPCHIN_LOGO_V2_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-config";
import type { AibeopchinLogoV2Mode, AibeopchinLogoV2Path } from "./aibeopchin-logo-v2-types";

type Props = {
  path: AibeopchinLogoV2Path;
  mode: AibeopchinLogoV2Mode;
  strokeWidth: number;
  draw?: boolean;
  /** 마운트 시 1회 획 생성(reveal) */
  reveal?: boolean;
};

function resolveOpacity(
  mode: AibeopchinLogoV2Mode,
  shouldDraw: boolean,
  shouldShimmer: boolean,
) {
  if (mode === "restricted") {
    return 0.48;
  }

  if (shouldDraw) {
    return 1;
  }

  if (shouldShimmer) {
    return [0.82, 1, 0.88];
  }

  if (mode === "verified") {
    return [0.88, 1, 0.94];
  }

  return 1;
}

export function AibeopchinLogoV2PathStroke({
  path,
  mode,
  strokeWidth,
  draw = true,
  reveal = false,
}: Props) {
  const shouldDraw = (mode === "intro" || reveal) && draw !== false;
  const speed = AIBEOPCHIN_LOGO_V2_CONFIG.drawSpeed;
  const shouldShimmer =
    !shouldDraw && mode !== "restricted" && draw !== false;
  const opacity = resolveOpacity(mode, shouldDraw, shouldShimmer);

  return (
    <motion.path
      d={path.d}
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={shouldDraw ? { pathLength: 0, opacity: 0 } : false}
      animate={{
        pathLength: 1,
        opacity,
        strokeDashoffset: shouldShimmer ? [0, -0.35, 0] : 0,
      }}
      style={shouldShimmer ? { strokeDasharray: "0.12 0.88" } : undefined}
      transition={{
        pathLength: {
          delay: shouldDraw ? path.delay / speed : 0,
          duration: shouldDraw ? path.duration / speed : 0.25,
          ease: [0.22, 1, 0.36, 1],
        },
        opacity: Array.isArray(opacity)
          ? { duration: mode === "verified" ? 3.2 : 2.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: shouldDraw ? path.duration / speed : 0.25 },
        strokeDashoffset: shouldShimmer
          ? { duration: 3.6, repeat: Infinity, ease: "linear" }
          : { duration: 0 },
      }}
    />
  );
}
