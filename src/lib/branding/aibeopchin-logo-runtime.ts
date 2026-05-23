/**
 * Logo Runtime — CMB 패턴 미러 (CORE 고정 · SSOT 읽기 전용)
 * CaseType/CMB config와 분리. 역할·제한 상태만 mode를 결정한다.
 */
import type { AibeopchinLogoV2Mode } from "@/components/branding/aibeopchin-logo-v2-types";
import type { DashboardRole } from "@/lib/dashboard/dashboard-role-config";
import {
  AIBEOPCHIN_LOGO_V2_MODE_CONFIG,
  type AibeopchinLogoV2ModeConfig,
} from "@/lib/branding/aibeopchin-logo-v2-mode-config";
import {
  getAibeopchinLogoV2MotionPolicy,
  type AibeopchinLogoV2MotionPolicy,
} from "@/lib/branding/aibeopchin-logo-v2-motion-policy";
import {
  AIBEOPCHIN_LOGO_V2_ROLE_MEANING,
  AIBEOPCHIN_LOGO_V2_ROLE_MODE,
} from "@/lib/branding/aibeopchin-logo-v2-role-mode";

export type LogoRuntimeInput = {
  role?: DashboardRole;
  restricted?: boolean;
  mode?: AibeopchinLogoV2Mode;
  reducedMotion?: boolean;
};

export type LogoPresentation = {
  mode: AibeopchinLogoV2Mode;
  config: AibeopchinLogoV2ModeConfig;
  motion: AibeopchinLogoV2MotionPolicy;
  roleMeaning?: string;
};

/** CMB `getCmbBlocksForRole`에 대응 — 역할·제한 → 로고 mode */
export function resolveLogoMode(input: LogoRuntimeInput): AibeopchinLogoV2Mode {
  if (input.restricted) {
    return "restricted";
  }

  if (input.mode) {
    return input.mode;
  }

  if (input.role) {
    return AIBEOPCHIN_LOGO_V2_ROLE_MODE[input.role];
  }

  return "idle";
}

export function getLogoModeConfig(mode: AibeopchinLogoV2Mode): AibeopchinLogoV2ModeConfig {
  return AIBEOPCHIN_LOGO_V2_MODE_CONFIG[mode];
}

/** UI는 config·motion policy를 읽기만 한다 (CMB runtime과 동일 계약). */
export function resolveLogoPresentation(input: LogoRuntimeInput): LogoPresentation {
  const mode = resolveLogoMode(input);
  const config = getLogoModeConfig(mode);
  const motion = getAibeopchinLogoV2MotionPolicy({
    mode,
    reducedMotion: Boolean(input.reducedMotion),
  });

  return {
    mode,
    config,
    motion,
    roleMeaning: input.role ? AIBEOPCHIN_LOGO_V2_ROLE_MEANING[input.role] : undefined,
  };
}
