"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { AIBEOPCHIN_LOGO_V2_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-config";
import { AIBEOPCHIN_LOGO_V2_MODE_CONFIG } from "@/lib/branding/aibeopchin-logo-v2-mode-config";
import { AIBEOPCHIN_LOGO_V2_PATHS } from "@/lib/branding/aibeopchin-logo-v2-paths";
import { AIBEOPCHIN_LOGO_V2_TIMELINE } from "@/lib/branding/aibeopchin-logo-v2-timeline";
import { AibeopchinLogoV2PathStroke } from "./aibeopchin-logo-v2-path";
import type {
  AibeopchinLogoV2GlyphKey,
  AibeopchinLogoV2Mode,
} from "./aibeopchin-logo-v2-types";

const glyphOrder: AibeopchinLogoV2GlyphKey[] = ["A", "I", "BEOP", "CHIN"];

type Props = {
  mode: AibeopchinLogoV2Mode;
  draw?: boolean;
  reveal?: boolean;
  pulseOverride?: "none" | "soft" | "medium";
  variant?: "light" | "dark";
};

const GLOW_STD_SCALE = { low: 0.72, medium: 1, high: 1.22 } as const;

export function AibeopchinLogoV2Glyph({
  mode,
  draw = true,
  reveal = false,
  pulseOverride,
  variant = "light",
}: Props) {
  const uid = useId();
  const glowId = `aibeopchin-logo-v2-glow-${uid}`;
  const gradientId = `aibeopchin-logo-v2-gradient-${uid}`;
  const modeConfig = AIBEOPCHIN_LOGO_V2_MODE_CONFIG[mode];
  const glowScale = GLOW_STD_SCALE[modeConfig.glow];
  const effectivePulse = pulseOverride ?? modeConfig.pulse;

  const pulseOpacity =
    effectivePulse === "medium"
      ? [0.72, 1, 0.78]
      : effectivePulse === "soft"
        ? [0.86, 1, 0.9]
        : 1;

  const pulseScale =
    effectivePulse === "medium"
      ? [1, 1.03, 1]
      : effectivePulse === "soft"
        ? [1, 1.015, 1]
        : 1;

  const repeatPulse = effectivePulse === "none" ? 0 : Infinity;
  const isLight = variant === "light";
  const strokeClass = isLight ? "text-aibeop-deep" : "text-cyan-100";
  const gradientStops = isLight
    ? [
        { offset: "0%", color: "#2f6b4f" },
        { offset: "45%", color: "#1f4c38" },
        { offset: "100%", color: "#8fb89e" },
      ]
    : [
        { offset: "0%", color: "#67e8f9" },
        { offset: "45%", color: "#ffffff" },
        { offset: "100%", color: "#c4b5fd" },
      ];

  return (
    <motion.svg
      viewBox="0 0 500 160"
      className="h-auto w-full overflow-visible"
      aria-hidden
      initial={mode === "intro" && draw ? { opacity: 0, y: 10 } : { opacity: 0.96, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: pulseScale }}
      transition={{
        opacity: { duration: 0.45 },
        y: { duration: 0.45 },
        scale: {
          duration: effectivePulse === "medium" ? 1.6 : 2.8,
          repeat: effectivePulse === "none" ? 0 : Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur
            stdDeviation={
              3 + AIBEOPCHIN_LOGO_V2_CONFIG.glowIntensity * 4 * glowScale
            }
            result="coloredBlur"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      <motion.g
        className={strokeClass}
        filter={`url(#${glowId})`}
        animate={{
          opacity: pulseOpacity,
        }}
        transition={{
          duration:
            effectivePulse === "medium"
              ? AIBEOPCHIN_LOGO_V2_CONFIG.idlePulseSpeed
              : 3.2,
          repeat: repeatPulse,
          ease: "easeInOut",
        }}
      >
        {glyphOrder.flatMap((glyphKey) =>
          AIBEOPCHIN_LOGO_V2_PATHS[glyphKey].map((path) => (
            <AibeopchinLogoV2PathStroke
              key={path.id}
              path={path}
              mode={mode}
              strokeWidth={AIBEOPCHIN_LOGO_V2_CONFIG.strokeWidth}
              draw={draw}
              reveal={reveal}
            />
          )),
        )}
      </motion.g>

      <motion.path
        d="M18 140 C120 154 330 154 482 140"
        pathLength={1}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={
          mode === "intro" && draw ? { pathLength: 0, opacity: 0 } : { opacity: 0.45 }
        }
        animate={{
          pathLength: 1,
          opacity: [0.45, 0.85, 0.5],
        }}
        transition={{
          pathLength: {
            delay:
              mode === "intro" && draw
                ? AIBEOPCHIN_LOGO_V2_TIMELINE.underline.delay
                : 0,
            duration:
              mode === "intro" && draw
                ? AIBEOPCHIN_LOGO_V2_TIMELINE.underline.duration
                : 0.35,
          },
          opacity: {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
    </motion.svg>
  );
}
