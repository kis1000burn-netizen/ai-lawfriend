import type { AibeopchinBeopKanjiLogoSize } from "@/components/branding/aibeopchin-beop-kanji-logo";

/** 로고 완성 축하 타이밍 SSOT */
export const AIBEOPCHIN_LOGO_CELEBRATE = {
  scaleDuration: 0.55,
  spinDuration: 0.85,
  holdMs: 450,
} as const;

/** 헤더 행 고정 높이(h-11) — 세로 확장 금지 */
export const AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX = 44;

/** layout 박스 기준 크기(px) */
export const AIBEOPCHIN_LOGO_SLOT_PX: Record<
  AibeopchinBeopKanjiLogoSize,
  { width: number; height: number }
> = {
  xs: { width: 28, height: 28 },
  sm: { width: 36, height: 36 },
  md: { width: 48, height: 48 },
  lg: { width: 80, height: 80 },
  hero: { width: 128, height: 128 },
};

export const AIBEOPCHIN_LOGO_LOCKUP_GAP_PX = {
  horizontal: 10,
  vertical: 12,
} as const;

export type AibeopchinLogoLockupSurface = "header" | "panel";

export type AibeopchinLogoCelebrateLayout = {
  containerHeight: number;
  baseWidth: number;
  baseHeight: number;
  celebrateWidth: number;
  celebrateHeight: number;
  /** layout 박스는 base 고정 · 시각적 확대는 transform scale */
  celebrateScale: number;
  textPushPx: number;
};

/** header: 높이 고정·헤더 채움 scale / panel: 동일 글자 scale-up 후 회전 */
export function resolveLogoCelebrateLayout(
  size: AibeopchinBeopKanjiLogoSize,
  surface: AibeopchinLogoLockupSurface,
): AibeopchinLogoCelebrateLayout {
  const base = AIBEOPCHIN_LOGO_SLOT_PX[size];

  if (surface === "header") {
    const fill = AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX;
    return {
      containerHeight: fill,
      baseWidth: base.width,
      baseHeight: base.height,
      celebrateWidth: fill,
      celebrateHeight: fill,
      celebrateScale: fill / base.height,
      textPushPx: Math.max(0, fill - base.width),
    };
  }

  const panelScale = 1.15;

  return {
    containerHeight: base.height,
    baseWidth: base.width,
    baseHeight: base.height,
    celebrateWidth: Math.round(base.width * panelScale),
    celebrateHeight: Math.round(base.height * panelScale),
    celebrateScale: panelScale,
    textPushPx: Math.round(base.width * panelScale) - base.width,
  };
}
