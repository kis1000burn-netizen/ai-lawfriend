/** 텍스트 로고 무지개 7색 SSOT (빨·주·노·초·파·남·보) */
export const AIBEOPCHIN_LOGO_RAINBOW_7 = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
] as const;

export const AIBEOPCHIN_LOGO_RAINBOW_DURATION_S = 5;

export const AIBEOPCHIN_LOGO_RAINBOW_TEXT = "AI법친";

/** lockup loop 재시작 시 法 획 색 — 7색 중 1색 (테스트용 random 주입 가능) */
export function pickRandomLogoRainbowColor(
  random: () => number = Math.random,
): (typeof AIBEOPCHIN_LOGO_RAINBOW_7)[number] {
  const index = Math.floor(random() * AIBEOPCHIN_LOGO_RAINBOW_7.length);
  return AIBEOPCHIN_LOGO_RAINBOW_7[index] ?? AIBEOPCHIN_LOGO_RAINBOW_7[0];
}
