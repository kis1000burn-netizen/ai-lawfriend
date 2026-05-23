"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import {
  AIBEOPCHIN_BEOP_STROKES,
  AIBEOPCHIN_BEOP_UNICODE,
  AIBEOPCHIN_BEOP_VIEWBOX,
  buildBeopLogoTransform,
  resolveBeopStrokeCycleDuration,
  resolveBeopStrokeDelay,
} from "@/lib/branding/aibeopchin-beop-strokes";

export type AibeopchinBeopKanjiLogoSize = "xs" | "sm" | "md" | "lg" | "hero";

type Props = {
  size?: AibeopchinBeopKanjiLogoSize;
  className?: string;
  /** 외부 lockup이 drawCycle을 올리면 획 애니메이션 재시작 */
  drawCycle?: number;
  /** 완료 후 처음부터 반복(외부 lockup 미사용 시) */
  loop?: boolean;
  reducedMotion?: boolean;
  strokeClassName?: string;
  /** currentColor 대신 고정 hex (lockup cycle rainbow) */
  strokeColor?: string;
  /** true(기본)면 좌↔우 거울 반전 */
  mirrorX?: boolean;
  /** true(기본)면 현재 변환 위에 왼쪽(반시계) 180° */
  rotateLeft180?: boolean;
};

const sizeClass: Record<AibeopchinBeopKanjiLogoSize, string> = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  hero: "h-28 w-28 md:h-32 md:w-32",
};

const edgeStrokeWidth: Record<AibeopchinBeopKanjiLogoSize, number> = {
  xs: 6,
  sm: 7,
  md: 8,
  lg: 10,
  hero: 12,
};

const popOutlineWidth: Record<AibeopchinBeopKanjiLogoSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  hero: 26,
};

function renderStrokeLayers({
  stroke,
  index,
  cycle,
  reduced,
  size,
  strokeClassName,
  strokeColor,
}: {
  stroke: (typeof AIBEOPCHIN_BEOP_STROKES)[number];
  index: number;
  cycle: number;
  reduced: boolean;
  size: AibeopchinBeopKanjiLogoSize;
  strokeClassName: string;
  strokeColor?: string;
}) {
  const delay = resolveBeopStrokeDelay(index);
  const edge = edgeStrokeWidth[size];
  const popOutline = popOutlineWidth[size];
  const ink = strokeColor ?? "currentColor";

  const outlinePath = (
    <path
      d={stroke.d}
      fill="#ffffff"
      stroke="#ffffff"
      strokeWidth={popOutline}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );

  const bodyPathProps = {
    d: stroke.d,
    fill: ink,
    stroke: ink,
    strokeWidth: edge,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    ...(strokeColor ? {} : { className: strokeClassName }),
  };

  if (reduced) {
    return (
      <g key={stroke.id}>
        {outlinePath}
        <path {...bodyPathProps} />
      </g>
    );
  }

  return (
    <g key={`${stroke.id}-${cycle}`}>
      <motion.g
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay,
          duration: stroke.duration,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: "center", transformBox: "fill-box" as const }}
      >
        {outlinePath}
        <motion.path
          {...bodyPathProps}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay,
            duration: stroke.duration * 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </motion.g>
    </g>
  );
}

export function AibeopchinBeopKanjiLogo({
  size = "sm",
  className = "",
  drawCycle: drawCycleProp,
  loop = true,
  reducedMotion,
  strokeClassName = "text-aibeop-text",
  strokeColor,
  mirrorX = true,
  rotateLeft180 = true,
}: Readonly<Props>) {
  const uid = useId();
  const systemReduced = useReducedMotion();
  const reduced = Boolean(reducedMotion ?? systemReduced);
  const cycleDuration = useMemo(() => resolveBeopStrokeCycleDuration(), []);
  const [internalCycle, setInternalCycle] = useState(0);
  const cycle = drawCycleProp ?? internalCycle;
  const logoTransform = buildBeopLogoTransform({ mirrorX, rotateLeft180 });

  useEffect(() => {
    if (reduced || !loop || drawCycleProp !== undefined) {
      return;
    }

    const timer = window.setInterval(() => {
      setInternalCycle((current) => current + 1);
    }, cycleDuration * 1000);

    return () => window.clearInterval(timer);
  }, [cycleDuration, drawCycleProp, loop, reduced]);

  const strokeNodes = AIBEOPCHIN_BEOP_STROKES.map((stroke, index) =>
    renderStrokeLayers({
      stroke,
      index,
      cycle,
      reduced,
      size,
      strokeClassName,
      strokeColor,
    }),
  );

  const glyph = (
    <g className="aibeop-beop-kanji-pop" filter={`url(#aibeop-beop-pop-${uid})`}>
      {strokeNodes}
    </g>
  );

  return (
    <svg
      viewBox={AIBEOPCHIN_BEOP_VIEWBOX}
      role="img"
      aria-label={AIBEOPCHIN_BEOP_UNICODE}
      className={["shrink-0 overflow-visible", sizeClass[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      <title>{AIBEOPCHIN_BEOP_UNICODE}</title>
      <defs>
        <filter id={`aibeop-beop-pop-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#18231d" floodOpacity="0.16" />
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#2f6b4f" floodOpacity="0.1" />
        </filter>
      </defs>
      {logoTransform ? <g transform={logoTransform}>{glyph}</g> : glyph}
    </svg>
  );
}
