"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AibeopchinBeopKanjiLogo,
  type AibeopchinBeopKanjiLogoSize,
} from "@/components/branding/aibeopchin-beop-kanji-logo";
import {
  AIBEOPCHIN_LOGO_CELEBRATE,
  AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX,
  AIBEOPCHIN_LOGO_LOCKUP_GAP_PX,
  type AibeopchinLogoLockupSurface,
  resolveLogoCelebrateLayout,
} from "@/lib/branding/aibeopchin-logo-celebrate";
import { resolveBeopStrokeDrawDuration } from "@/lib/branding/aibeopchin-beop-strokes";
import { pickRandomLogoRainbowColor } from "@/lib/branding/aibeopchin-logo-rainbow";

type Props = {
  size?: AibeopchinBeopKanjiLogoSize;
  direction?: "horizontal" | "vertical";
  /** header: 높이 고정·scale-up 후 회전 / panel: 동일 글자 scale-up 후 회전 */
  surface?: AibeopchinLogoLockupSurface;
  loop?: boolean;
  reducedMotion?: boolean;
  /** loop 2회차부터 法 획에 7색 중 랜덤 적용 (restricted 등에서는 false) */
  rainbowCycleStroke?: boolean;
  strokeClassName?: string;
  mirrorX?: boolean;
  rotateLeft180?: boolean;
  children?: ReactNode;
  className?: string;
};

type LogoPhase = "drawing" | "scaling" | "spinning";

export function AibeopchinLogoLockup({
  size = "sm",
  direction = "horizontal",
  surface = "header",
  loop = true,
  reducedMotion,
  rainbowCycleStroke = true,
  strokeClassName,
  mirrorX = true,
  rotateLeft180 = true,
  children,
  className = "",
}: Readonly<Props>) {
  const systemReduced = useReducedMotion();
  const reduced = Boolean(reducedMotion ?? systemReduced);
  const [phase, setPhase] = useState<LogoPhase>("drawing");
  const [drawCycle, setDrawCycle] = useState(0);
  const [cycleStrokeColor, setCycleStrokeColor] = useState<string | undefined>(
    undefined,
  );

  const layout = useMemo(
    () => resolveLogoCelebrateLayout(size, surface),
    [size, surface],
  );
  const scaled = !reduced && (phase === "scaling" || phase === "spinning");
  const spinning = !reduced && phase === "spinning";
  const gapBase =
    direction === "horizontal"
      ? AIBEOPCHIN_LOGO_LOCKUP_GAP_PX.horizontal
      : AIBEOPCHIN_LOGO_LOCKUP_GAP_PX.vertical;
  const drawDurationMs = resolveBeopStrokeDrawDuration() * 1000;
  const { scaleDuration, spinDuration } = AIBEOPCHIN_LOGO_CELEBRATE;

  const layoutWidth = scaled ? layout.celebrateWidth : layout.baseWidth;
  const layoutHeight =
    direction === "vertical" && scaled
      ? layout.celebrateHeight
      : layout.baseHeight;
  const glyphScale = scaled ? layout.celebrateScale : 1;

  useEffect(() => {
    if (reduced) {
      return;
    }

    const drawTimer = window.setTimeout(() => {
      setPhase("scaling");
    }, drawDurationMs);

    return () => window.clearTimeout(drawTimer);
  }, [drawCycle, drawDurationMs, reduced]);

  useEffect(() => {
    if (reduced || phase !== "scaling") {
      return;
    }

    const scaleTimer = window.setTimeout(() => {
      setPhase("spinning");
    }, scaleDuration * 1000);

    return () => window.clearTimeout(scaleTimer);
  }, [phase, reduced, scaleDuration]);

  useEffect(() => {
    if (reduced || phase !== "spinning") {
      return;
    }

    const spinTimer = window.setTimeout(() => {
      if (loop) {
        setDrawCycle((current) => current + 1);
        if (rainbowCycleStroke) {
          setCycleStrokeColor(pickRandomLogoRainbowColor());
        }
      }
      setPhase("drawing");
    }, spinDuration * 1000);

    return () => window.clearTimeout(spinTimer);
  }, [loop, phase, rainbowCycleStroke, reduced, spinDuration]);

  const isHeaderHorizontal = surface === "header" && direction === "horizontal";

  return (
    <div
      className={[
        "inline-flex items-center",
        direction === "vertical" ? "flex-col" : "flex-row",
        isHeaderHorizontal ? "shrink-0" : "",
        className,
      ].join(" ")}
      style={
        isHeaderHorizontal
          ? {
              height: AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX,
              gap: gapBase,
            }
          : { gap: gapBase }
      }
    >
      <motion.div
        className="relative flex shrink-0 items-center justify-center overflow-visible"
        initial={false}
        animate={{
          width: layoutWidth,
          height: layoutHeight,
        }}
        transition={{
          width: {
            duration: phase === "scaling" ? scaleDuration : 0,
            ease: [0.22, 1, 0.36, 1],
          },
          height: {
            duration:
              phase === "scaling" && direction === "vertical" ? scaleDuration : 0,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
      >
        <motion.div
          className="flex items-center justify-center"
          style={{
            width: layout.baseWidth,
            height: layout.baseHeight,
            transformOrigin: "center center",
          }}
          initial={false}
          animate={{
            scale: glyphScale,
            rotate: spinning ? 360 : 0,
          }}
          transition={{
            scale: {
              duration: phase === "scaling" ? scaleDuration : 0,
              ease: [0.22, 1, 0.36, 1],
            },
            rotate: {
              duration: phase === "spinning" ? spinDuration : 0,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          <AibeopchinBeopKanjiLogo
            size={size}
            loop={false}
            drawCycle={drawCycle}
            reducedMotion={reducedMotion}
            strokeClassName={strokeClassName}
            strokeColor={cycleStrokeColor}
            mirrorX={mirrorX}
            rotateLeft180={rotateLeft180}
          />
        </motion.div>
      </motion.div>

      {children ? <div className="min-w-0">{children}</div> : null}
    </div>
  );
}
