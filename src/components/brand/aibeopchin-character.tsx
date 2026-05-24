"use client";

/**
 * AI법친 대표 캐릭터 — SVG + Framer Motion (이미지 없이 코드 생성).
 * 눈깜빡임 · 미소 · 지휘봉·빛 · 몸동작 미세 움직임.
 */
import { motion, useReducedMotion } from "framer-motion";

export const AIBEOPCHIN_CHARACTER_MARKER = "aibeopchin-character-v1" as const;

type Props = {
  className?: string;
  size?: number;
  /** 온보딩·히어로 등 강조 표시 */
  variant?: "default" | "hero";
};

export function AibeopchinCharacter({
  className,
  size = 280,
  variant = "default",
}: Readonly<Props>) {
  const reducedMotion = useReducedMotion();
  const hero = variant === "hero";

  const bodyFloat = reducedMotion
    ? {}
    : {
        y: [0, -5, 0, -3, 0],
        rotate: [0, 0.6, 0, -0.4, 0],
        transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" as const },
      };

  const blink = reducedMotion
    ? {}
    : {
        scaleY: [1, 1, 0.08, 1, 1],
        transition: {
          duration: 4.2,
          repeat: Infinity,
          times: [0, 0.88, 0.92, 0.96, 1],
        },
      };

  const smilePulse = reducedMotion
    ? {}
    : {
        scaleX: [1, 1.04, 1],
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
      };

  const batonSwing = reducedMotion
    ? {}
    : {
        rotate: [-8, 6, -4, 8, -8],
        transition: { duration: 3.8, repeat: Infinity, ease: "easeInOut" as const },
      };

  const sparkPulse = reducedMotion
    ? {}
    : {
        opacity: [0.35, 1, 0.5, 0.95, 0.35],
        scale: [0.85, 1.15, 0.9, 1.1, 0.85],
        transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const },
      };

  const pedestalGlow = reducedMotion
    ? {}
    : {
        opacity: [0.4, 0.85, 0.4],
        scale: [1, 1.06, 1],
        transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div
      className={className}
      data-testid="aibeopchin-character"
      data-marker={AIBEOPCHIN_CHARACTER_MARKER}
      style={{ width: size, height: size * 1.15 }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 200 230"
        width={size}
        height={size * 1.15}
        className="overflow-visible"
        animate={bodyFloat}
      >
        {hero ? (
          <motion.circle
            cx="100"
            cy="110"
            r="72"
            fill="url(#heroAura)"
            animate={
              reducedMotion
                ? {}
                : { opacity: [0.12, 0.28, 0.12], scale: [0.95, 1.05, 0.95] }
            }
            transition={{ duration: 3.5, repeat: Infinity }}
          />
        ) : null}

        {/* 받침대 */}
        <motion.g transform="translate(100 208)" animate={pedestalGlow}>
          <ellipse cx="0" cy="0" rx="52" ry="10" fill="url(#pedestalGlow)" opacity="0.7" />
          <ellipse
            cx="0"
            cy="0"
            rx="38"
            ry="7"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="26"
            ry="5"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="0.8"
            opacity="0.75"
          />
        </motion.g>

        {/* 로브 · 몸 */}
        <g transform="translate(100 155)">
          <path
            d="M-42 8 Q-48 55 -38 88 L38 88 Q48 55 42 8 Q28 -8 0 -8 Q-28 -8 -42 8 Z"
            fill="#1e3a5f"
            stroke="#c9a227"
            strokeWidth="1.2"
          />
          <path
            d="M-30 12 L-22 82 M30 12 L22 82"
            stroke="#c9a227"
            strokeWidth="0.8"
            opacity="0.45"
            fill="none"
          />
          {/* 조끼·셔츠 */}
          <path d="M-18 -2 L0 18 L18 -2 L14 75 L-14 75 Z" fill="#1e40af" />
          <path d="M-8 -2 L0 28 L8 -2" fill="#f8fafc" />
          <path d="M-4 8 L0 32 L4 8" fill="#1e3a8a" />
          {/* 저울 핀 */}
          <g transform="translate(-22 -6)">
            <circle r="5" fill="#c9a227" opacity="0.9" />
            <path
              d="M-4 -2 L4 -2 M0 -2 L0 2 M-3 2 L3 2"
              stroke="#1e3a5f"
              strokeWidth="0.9"
              fill="none"
            />
          </g>
        </g>

        {/* 오른팔 — 환영 */}
        <motion.g
          transform="translate(118 118)"
          animate={
            reducedMotion
              ? {}
              : { rotate: [0, 4, -2, 3, 0], transition: { duration: 4.5, repeat: Infinity } }
          }
          style={{ transformOrigin: "0px 0px" }}
        >
          <path
            d="M0 0 Q18 -8 28 4 L32 14 Q20 18 8 12 Z"
            fill="#1e3a5f"
            stroke="#c9a227"
            strokeWidth="0.8"
          />
          <ellipse cx="30" cy="16" rx="7" ry="6" fill="#f1f5f9" />
        </motion.g>

        {/* 왼팔 + 지휘봉 */}
        <motion.g transform="translate(72 115)" animate={batonSwing} style={{ transformOrigin: "8px 8px" }}>
          <path
            d="M0 0 Q-16 6 -24 20 L-20 28 Q-8 20 4 10 Z"
            fill="#1e3a5f"
            stroke="#c9a227"
            strokeWidth="0.8"
          />
          <line x1="-24" y1="20" x2="-38" y2="-18" stroke="#c9a227" strokeWidth="2.2" strokeLinecap="round" />
          <motion.g transform="translate(-38 -18)" animate={sparkPulse}>
            <circle r="6" fill="#22d3ee" opacity="0.35" />
            <circle r="3.5" fill="#a5f3fc" />
            <circle cx="-4" cy="-5" r="1.2" fill="#fef08a" opacity="0.9" />
            <circle cx="5" cy="-3" r="0.9" fill="#67e8f9" opacity="0.85" />
            <circle cx="2" cy="4" r="1" fill="#fde047" opacity="0.75" />
          </motion.g>
        </motion.g>

        {/* 머리 */}
        <g transform="translate(100 72)">
          {/* 헤드셋 */}
          <path
            d="M-38 -8 Q-42 20 -28 38 L28 38 Q42 20 38 -8 Q20 -42 -20 -42 Q-38 -28 -38 -8"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
          <rect x="-44" y="2" width="14" height="22" rx="6" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="30" y="2" width="14" height="22" rx="6" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="-37" cy="13" r="5" fill="#0ea5e9" opacity="0.25" />
          <circle cx="37" cy="13" r="5" fill="#0ea5e9" opacity="0.25" />
          <text
            x="-37"
            y="16"
            textAnchor="middle"
            fill="#0369a1"
            fontSize="6"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            AI
          </text>

          {/* 얼굴 */}
          <ellipse cx="0" cy="0" rx="34" ry="36" fill="#f8fafc" />
          <ellipse cx="0" cy="-32" rx="8" ry="6" fill="#f8fafc" />

          {/* 볼 */}
          <ellipse cx="-18" cy="8" rx="6" ry="3.5" fill="#fda4af" opacity="0.45" />
          <ellipse cx="18" cy="8" rx="6" ry="3.5" fill="#fda4af" opacity="0.45" />

          {/* 눈 */}
          <motion.g animate={blink} style={{ transformOrigin: "0px 0px" }}>
            <ellipse cx="-12" cy="-2" rx="7" ry="9" fill="#1e3a8a" />
            <ellipse cx="12" cy="-2" rx="7" ry="9" fill="#1e3a8a" />
            <circle cx="-10" cy="-4" r="2.2" fill="#fff" />
            <circle cx="14" cy="-4" r="2.2" fill="#fff" />
            <path d="M-18 -14 Q-12 -18 -6 -14" stroke="#334155" strokeWidth="1.2" fill="none" />
            <path d="M6 -14 Q12 -18 18 -14" stroke="#334155" strokeWidth="1.2" fill="none" />
          </motion.g>

          {/* 미소 */}
          <motion.path
            d="M-10 14 Q0 22 10 14"
            stroke="#475569"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            animate={smilePulse}
            style={{ transformOrigin: "0px 16px" }}
          />
        </g>

        <defs>
          <radialGradient id="pedestalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
