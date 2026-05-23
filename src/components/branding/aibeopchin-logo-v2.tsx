"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AibeopchinLogoV2Glyph } from "@/components/branding/aibeopchin-logo-v2-glyph";
import { AibeopchinLogoV2Orbit } from "@/components/branding/aibeopchin-logo-v2-orbit";
import { AibeopchinLogoV2Particles } from "@/components/branding/aibeopchin-logo-v2-particles";
import { AibeopchinLogoRainbowText } from "@/components/branding/aibeopchin-logo-rainbow-text";
import type {
  AibeopchinLogoV2Mode,
  AibeopchinLogoV2Size,
} from "@/components/branding/aibeopchin-logo-v2-types";
import { AIBEOPCHIN_LOGO_V2_COPY } from "@/lib/branding/aibeopchin-logo-v2-config";
import type { LogoAccentTone } from "@/lib/branding/aibeopchin-logo-v2-mode-config";
import { resolveLogoPresentation } from "@/lib/branding/aibeopchin-logo-runtime";
import { AIBEOPCHIN_LOGO_V2_TIMELINE } from "@/lib/branding/aibeopchin-logo-v2-timeline";

type Props = {
  mode?: AibeopchinLogoV2Mode;
  size?: AibeopchinLogoV2Size;
  showTagline?: boolean;
  className?: string;
  /** `prefers-reduced-motion` 등 상위에서 전달 */
  reducedMotion?: boolean;
  /** 라이트 캔버스(대시보드·네비) vs 다크 히어로 */
  variant?: "light" | "dark";
};

const sizeClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "max-w-[240px]",
  md: "max-w-[320px]",
  lg: "max-w-[420px]",
  hero: "max-w-[560px]",
};

const lockupClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "gap-2 rounded-[1.35rem] px-3 py-3",
  md: "gap-3 rounded-[1.6rem] px-4 py-4",
  lg: "gap-4 rounded-[1.85rem] px-5 py-5",
  hero: "gap-5 rounded-[2rem] px-6 py-6 md:px-8 md:py-7",
};

const symbolClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "h-10 w-10 rounded-2xl text-base",
  md: "h-11 w-11 rounded-2xl text-lg",
  lg: "h-12 w-12 rounded-[1.1rem] text-lg",
  hero: "h-14 w-14 rounded-[1.2rem] text-xl md:h-16 md:w-16 md:text-2xl",
};

const titleClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  hero: "text-3xl md:text-[2.4rem]",
};

const taglineClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
  hero: "text-sm md:text-base",
};

const statusClass: Record<AibeopchinLogoV2Size, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-[10px] px-2.5 py-1",
  lg: "text-xs px-3 py-1",
  hero: "text-xs px-3 py-1.5",
};

function getAccentClasses(tone: LogoAccentTone, variant: "light" | "dark") {
  if (variant === "dark") {
    if (tone === "restricted") {
      return {
        shell:
          "border-amber-200/30 bg-white/[0.04] shadow-2xl shadow-slate-950/25 backdrop-blur-md",
        symbol: "bg-amber-200/20 text-amber-50",
        status: "border-amber-200/30 bg-amber-300/10 text-amber-100",
        title: "text-white",
        eyebrow: "text-white/60",
        subtitle: "text-white/72",
        tagline: "text-white/75",
      };
    }

    if (tone === "verified") {
      return {
        shell:
          "border-emerald-200/30 bg-emerald-300/10 shadow-2xl shadow-slate-950/25 backdrop-blur-md",
        symbol: "bg-emerald-200/25 text-white",
        status: "border-emerald-200/30 bg-emerald-300/15 text-emerald-50",
        title: "text-white",
        eyebrow: "text-white/60",
        subtitle: "text-white/72",
        tagline: "text-white/75",
      };
    }

    if (tone === "thinking") {
      return {
        shell:
          "border-cyan-200/20 bg-white/[0.05] shadow-2xl shadow-slate-950/25 backdrop-blur-md",
        symbol: "bg-aibeop-green text-white",
        status: "border-cyan-200/25 bg-cyan-300/10 text-cyan-50",
        title: "text-white",
        eyebrow: "text-white/60",
        subtitle: "text-white/72",
        tagline: "text-white/75",
      };
    }

    return {
      shell:
        "border-white/10 bg-white/[0.04] shadow-2xl shadow-slate-950/25 backdrop-blur-md",
      symbol: "bg-aibeop-green text-white",
      status: "border-white/15 bg-white/10 text-white/80",
      title: "text-white",
      eyebrow: "text-white/60",
      subtitle: "text-white/72",
      tagline: "text-white/75",
    };
  }

  if (tone === "restricted") {
    return {
      shell:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-aibeop-card shadow-soft ring-1 ring-amber-100/80",
      symbol: "bg-amber-500/15 text-aibeop-warn ring-1 ring-amber-200/80",
      status: "border-amber-200/80 bg-amber-50 text-aibeop-warn",
      title: "text-aibeop-text",
      eyebrow: "text-aibeop-faint",
      subtitle: "text-aibeop-muted",
      tagline: "text-aibeop-muted",
    };
  }

  if (tone === "verified") {
    return {
      shell:
        "border-aibeop-line bg-gradient-to-br from-aibeop-soft via-aibeop-card to-aibeop-accent-soft shadow-soft ring-1 ring-aibeop-line/80",
      symbol: "bg-aibeop-deep text-white shadow-soft",
      status: "border-aibeop-line bg-aibeop-soft text-aibeop-deep",
      title: "text-aibeop-text",
      eyebrow: "text-aibeop-faint",
      subtitle: "text-aibeop-muted",
      tagline: "text-aibeop-muted",
    };
  }

  if (tone === "thinking") {
    return {
      shell:
        "border-aibeop-accent/50 bg-gradient-to-br from-aibeop-card via-aibeop-soft to-aibeop-pale/70 shadow-soft ring-1 ring-aibeop-accent/30",
      symbol: "bg-gradient-to-br from-aibeop-green to-aibeop-deep text-white shadow-soft",
      status: "border-aibeop-accent/40 bg-aibeop-accent-soft text-aibeop-deep",
      title: "text-aibeop-text",
      eyebrow: "text-aibeop-faint",
      subtitle: "text-aibeop-muted",
      tagline: "text-aibeop-muted",
    };
  }

  return {
    shell:
      "border-aibeop-line bg-gradient-to-br from-aibeop-card to-aibeop-soft shadow-soft ring-1 ring-aibeop-line/70",
    symbol: "bg-gradient-to-br from-aibeop-green to-aibeop-deep text-white shadow-soft",
    status: "border-aibeop-line bg-aibeop-soft text-aibeop-subtle",
    title: "text-aibeop-text",
    eyebrow: "text-aibeop-faint",
    subtitle: "text-aibeop-muted",
    tagline: "text-aibeop-muted",
  };
}

function getPulseAnimation(pulse: "none" | "soft" | "medium") {
  if (pulse === "medium") {
    return { scale: [1, 1.045, 1] };
  }

  if (pulse === "soft") {
    return { scale: [1, 1.02, 1] };
  }

  return undefined;
}

export function AibeopchinLogoV2({
  mode = "idle",
  size = "md",
  showTagline = false,
  className = "",
  reducedMotion = false,
  variant = "light",
}: Readonly<Props>) {
  const [pointerHover, setPointerHover] = useState(false);
  const [revealActive, setRevealActive] = useState(true);
  const reduced = Boolean(reducedMotion);

  useEffect(() => {
    if (reduced || mode === "restricted") {
      setRevealActive(false);
      return;
    }

    const timer = window.setTimeout(() => setRevealActive(false), 2200);
    return () => window.clearTimeout(timer);
  }, [mode, reduced]);

  const visualMode: AibeopchinLogoV2Mode =
    mode === "idle" && pointerHover && !reduced ? "hover" : mode;

  const presentation = useMemo(
    () =>
      resolveLogoPresentation({
        mode: visualMode,
        reducedMotion: reduced,
      }),
    [visualMode, reduced],
  );

  const { config, motion: motionPolicy } = presentation;
  const effectiveMode = motionPolicy.effectiveMode;
  const accent = getAccentClasses(config.accentTone, variant);
  const pulseAnimation = getPulseAnimation(motionPolicy.pulse);
  const showGlyph = size === "lg" || size === "hero";
  const rainbowActive = effectiveMode !== "restricted";

  return (
    <motion.div
      className={[
        "relative mx-auto flex w-full flex-col items-center justify-center",
        sizeClass[size],
        className,
      ].join(" ")}
      style={{ opacity: config.opacity }}
      whileHover={
        !motionPolicy.hoverScale
          ? undefined
          : { scale: size === "hero" ? 1.03 : 1.025 }
      }
      transition={{ type: "spring", stiffness: 170, damping: 20 }}
      role="img"
      aria-label={`${AIBEOPCHIN_LOGO_V2_COPY.label} - ${config.label} 상태`}
      onPointerEnter={() => mode === "idle" && !reduced && setPointerHover(true)}
      onPointerLeave={() => setPointerHover(false)}
    >
      <div
        className={[
          "relative w-full overflow-visible",
          accent.shell,
          lockupClass[size],
        ].join(" ")}
      >
        <AibeopchinLogoV2Orbit active={motionPolicy.orbit} variant={variant} />
        <AibeopchinLogoV2Particles
          active={motionPolicy.particles}
          variant={variant}
        />

        <motion.div
          className="relative z-10 flex w-full flex-col items-center gap-3"
          initial={
            effectiveMode === "intro" ? { opacity: 0, filter: "blur(8px)" } : false
          }
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55 }}
        >
          {showGlyph ? (
            <div className="w-full px-1">
              <AibeopchinLogoV2Glyph
                mode={effectiveMode}
                draw={motionPolicy.draw}
                reveal={motionPolicy.reveal && revealActive}
                pulseOverride={motionPolicy.pulse}
                variant={variant}
              />
            </div>
          ) : (
            <div className="flex w-full items-center gap-3">
              <motion.div
                className={[
                  "flex shrink-0 items-center justify-center font-black tracking-[-0.04em]",
                  symbolClass[size],
                  accent.symbol,
                ].join(" ")}
                animate={pulseAnimation}
                transition={{
                  duration: motionPolicy.pulse === "medium" ? 1.4 : 2.4,
                  repeat: motionPolicy.pulse === "none" ? 0 : Infinity,
                  ease: "easeInOut",
                }}
              >
                AI
              </motion.div>

              <div className="min-w-0 text-left">
                <p
                  className={[
                    "font-semibold uppercase tracking-[0.24em]",
                    accent.eyebrow,
                    taglineClass[size],
                  ].join(" ")}
                >
                  {AIBEOPCHIN_LOGO_V2_COPY.label}
                </p>
                <AibeopchinLogoRainbowText
                  active={rainbowActive}
                  reducedMotion={reduced}
                  className={[
                    "mt-1 font-black tracking-[-0.05em]",
                    rainbowActive ? "" : accent.title,
                    titleClass[size],
                  ].join(" ")}
                />
              </div>
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-2 text-center">
            {showGlyph ? (
              <AibeopchinLogoRainbowText
                active={rainbowActive}
                reducedMotion={reduced}
                className={[
                  "font-black tracking-[-0.05em]",
                  rainbowActive ? "" : accent.title,
                  titleClass[size],
                ].join(" ")}
              />
            ) : null}

            <span
              className={[
                "inline-flex items-center rounded-full border font-bold uppercase tracking-[0.18em]",
                accent.status,
                statusClass[size],
              ].join(" ")}
            >
              {config.label}
            </span>

            <p
              className={[
                "max-w-[28ch] text-pretty font-semibold leading-snug",
                accent.subtitle,
                taglineClass[size],
              ].join(" ")}
            >
              {config.description}
            </p>
          </div>
        </motion.div>
      </div>

      {showTagline ? (
        <motion.p
          className={[
            "mt-3 text-center text-sm font-semibold md:text-base",
            accent.tagline,
          ].join(" ")}
          initial={effectiveMode === "intro" ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay:
              effectiveMode === "intro"
                ? AIBEOPCHIN_LOGO_V2_TIMELINE.tagline.delay
                : 0,
            duration: AIBEOPCHIN_LOGO_V2_TIMELINE.tagline.duration,
          }}
        >
          {AIBEOPCHIN_LOGO_V2_COPY.tagline}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
