"use client";

/**
 * AI법친 대표 캐릭터 — SVG + Framer Motion (이미지 없이 코드 생성).
 * 모자·얼굴·몸통은 동일 중심축(x=0)에 결합 · 망토(필) · 지휘봉 · 눈깜빡임 · 미소.
 */
import { motion, useReducedMotion } from "framer-motion";

export const AIBEOPCHIN_CHARACTER_MARKER = "aibeopchin-character-v1" as const;

type Props = {
  className?: string;
  size?: number;
  /** 온보딩·히어로 등 강조 표시 */
  variant?: "default" | "hero";
};

/** 캐릭터 중심 — viewBox (100, 118) 기준, 모든 파츠는 이 anchor 아래 x=0 정렬 */
const ORIGIN_X = 100;
const ORIGIN_Y = 118;

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
        rotate: [-10, 8, -6, 10, -10],
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
        transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const },
      };

  const armWave = reducedMotion
    ? {}
    : {
        rotate: [0, 4, -2, 3, 0],
        transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" as const },
      };

  const capeFlow = reducedMotion
    ? {}
    : {
        rotate: [0, 1.2, -0.8, 1, 0],
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div
      className={className}
      data-testid="aibeopchin-character"
      data-marker={AIBEOPCHIN_CHARACTER_MARKER}
      style={{ width: size, height: size * 1.15 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 230"
        width={size}
        height={size * 1.15}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="aibeopchinPedestalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aibeopchinHeroAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="aibeopchinCapeFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
        </defs>

        <motion.g
          animate={bodyFloat}
          style={{ transformOrigin: `${ORIGIN_X}px ${ORIGIN_Y}px`, transformBox: "view-box" }}
        >
          <g transform={`translate(${ORIGIN_X} ${ORIGIN_Y})`}>
            {hero ? (
              <motion.circle
                cx="0"
                cy="-8"
                r="72"
                fill="url(#aibeopchinHeroAura)"
                animate={
                  reducedMotion
                    ? {}
                    : { opacity: [0.12, 0.28, 0.12], scale: [0.95, 1.05, 0.95] }
                }
                transition={{ duration: 3.5, repeat: Infinity }}
                style={{ transformOrigin: "0px -8px", transformBox: "view-box" }}
              />
            ) : null}

            {/* 망토(필) — 몸 뒤, 중심축 정렬 */}
            <motion.g
              animate={capeFlow}
              style={{ transformOrigin: "0px 20px", transformBox: "view-box" }}
            >
              <path
                d="M-8 18 Q-46 28 -52 78 Q-38 92 -18 88 L18 88 Q38 92 52 78 Q46 28 8 18 Q0 12 0 12 Q0 12 -8 18 Z"
                fill="url(#aibeopchinCapeFill)"
                stroke="#c9a227"
                strokeWidth="0.9"
                opacity="0.92"
              />
              <path
                d="M-34 34 Q-40 58 -32 82 M34 34 Q40 58 32 82"
                stroke="#c9a227"
                strokeWidth="0.6"
                opacity="0.35"
                fill="none"
              />
            </motion.g>

            {/* 받침대 */}
            <g transform="translate(0 90)">
              <motion.g animate={pedestalGlow}>
                <ellipse cx="0" cy="0" rx="52" ry="10" fill="url(#aibeopchinPedestalGlow)" opacity="0.7" />
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
            </g>

            {/* 로브 · 몸통 — 중심축 x=0 */}
            <g transform="translate(0 37)">
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
              <path d="M-18 -2 L0 18 L18 -2 L14 75 L-14 75 Z" fill="#1e40af" />
              <path d="M-8 -2 L0 28 L8 -2" fill="#f8fafc" />
              <path d="M-4 8 L0 32 L4 8" fill="#1e3a8a" />
              <g transform="translate(0 31)">
                <circle r="5" fill="#c9a227" opacity="0.9" />
                <path
                  d="M-4 -2 L4 -2 M0 -2 L0 2 M-3 2 L3 2"
                  stroke="#1e3a5f"
                  strokeWidth="0.9"
                  fill="none"
                />
              </g>
            </g>

            {/* 오른팔 */}
            <motion.g
              animate={armWave}
              style={{ transformOrigin: "18px 0px", transformBox: "view-box" }}
            >
              <g transform="translate(18 0)">
                <path
                  d="M0 0 Q18 -8 28 4 L32 14 Q20 18 8 12 Z"
                  fill="#1e3a5f"
                  stroke="#c9a227"
                  strokeWidth="0.8"
                />
                <ellipse cx="30" cy="16" rx="7" ry="6" fill="#f1f5f9" />
              </g>
            </motion.g>

            {/* 왼팔 + 지휘봉 */}
            <motion.g
              animate={batonSwing}
              style={{ transformOrigin: "-28px -3px", transformBox: "view-box" }}
            >
              <g transform="translate(-28 -3)">
                <path
                  d="M0 0 Q-16 6 -24 20 L-20 28 Q-8 20 4 10 Z"
                  fill="#1e3a5f"
                  stroke="#c9a227"
                  strokeWidth="0.8"
                />
                <line
                  x1="-24"
                  y1="20"
                  x2="-42"
                  y2="-22"
                  stroke="#c9a227"
                  strokeWidth={hero ? 2.8 : 2.4}
                  strokeLinecap="round"
                />
                <circle cx="-42" cy="-22" r={hero ? 3.2 : 2.6} fill="#fde047" stroke="#c9a227" strokeWidth="0.8" />
                <motion.g
                  transform="translate(-42 -22)"
                  animate={sparkPulse}
                  style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}
                >
                  <circle r={hero ? 7 : 5.5} fill="#22d3ee" opacity="0.35" />
                  <circle r={hero ? 4 : 3.2} fill="#a5f3fc" />
                  <circle cx="-4" cy="-5" r="1.2" fill="#fef08a" opacity="0.9" />
                  <circle cx="5" cy="-3" r="0.9" fill="#67e8f9" opacity="0.85" />
                  <circle cx="2" cy="4" r="1" fill="#fde047" opacity="0.75" />
                </motion.g>
              </g>
            </motion.g>

            {/* 머리 — 모자(가발) · 얼굴 · 헤드셋 단일 그룹, x=0 정렬 */}
            <g transform="translate(0 -46)">
              {/* 판사 가발(모자) — 얼굴과 동일 중심축 */}
              <path
                d="M-30 -34 Q0 -50 30 -34 Q36 -18 28 -6 Q0 2 -28 -6 Q-36 -18 -30 -34 Z"
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="1.2"
              />
              <path
                d="M-24 -28 Q0 -38 24 -28 M-18 -18 Q0 -12 18 -18"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                fill="none"
                opacity="0.7"
              />

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

              <ellipse cx="0" cy="0" rx="34" ry="36" fill="#f8fafc" />

              <ellipse cx="-18" cy="8" rx="6" ry="3.5" fill="#fda4af" opacity="0.45" />
              <ellipse cx="18" cy="8" rx="6" ry="3.5" fill="#fda4af" opacity="0.45" />

              <motion.g
                animate={blink}
                style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}
              >
                <ellipse cx="-12" cy="-2" rx="7" ry="9" fill="#1e3a8a" />
                <ellipse cx="12" cy="-2" rx="7" ry="9" fill="#1e3a8a" />
                <circle cx="-10" cy="-4" r="2.2" fill="#fff" />
                <circle cx="14" cy="-4" r="2.2" fill="#fff" />
                <path d="M-18 -14 Q-12 -18 -6 -14" stroke="#334155" strokeWidth="1.2" fill="none" />
                <path d="M6 -14 Q12 -18 18 -14" stroke="#334155" strokeWidth="1.2" fill="none" />
              </motion.g>

              <motion.path
                d="M-10 14 Q0 22 10 14"
                stroke="#475569"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                animate={smilePulse}
                style={{ transformOrigin: "0px 18px", transformBox: "view-box" }}
              />
            </g>
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
