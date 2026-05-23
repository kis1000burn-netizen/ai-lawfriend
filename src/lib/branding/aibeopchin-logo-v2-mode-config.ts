import type { AibeopchinLogoV2Mode } from "@/components/branding/aibeopchin-logo-v2-types";

export type LogoAccentTone = "default" | "thinking" | "verified" | "restricted";

export type AibeopchinLogoV2ModeConfig = {
  label: string;
  description: string;
  accentTone: LogoAccentTone;
  particles: boolean;
  orbit: boolean;
  pulse: "none" | "soft" | "medium";
  opacity: number;
  glow: "low" | "medium" | "high";
};

export const AIBEOPCHIN_LOGO_V2_MODE_CONFIG: Record<
  AibeopchinLogoV2Mode,
  AibeopchinLogoV2ModeConfig
> = {
  intro: {
    label: "생성",
    description: "AI법친 로고가 처음 생성되는 인트로 상태입니다.",
    accentTone: "thinking",
    particles: true,
    orbit: true,
    pulse: "medium",
    opacity: 1,
    glow: "high",
  },
  idle: {
    label: "대기",
    description: "안정적으로 대기하는 기본 상태입니다.",
    accentTone: "default",
    particles: true,
    orbit: false,
    pulse: "soft",
    opacity: 1,
    glow: "medium",
  },
  hover: {
    label: "반응",
    description: "사용자의 관심에 반응하는 상태입니다.",
    accentTone: "default",
    particles: true,
    orbit: true,
    pulse: "soft",
    opacity: 1,
    glow: "high",
  },
  thinking: {
    label: "정리 중",
    description: "사건 흐름을 이해하고 구조화하는 상태입니다.",
    accentTone: "thinking",
    particles: true,
    orbit: true,
    pulse: "medium",
    opacity: 1,
    glow: "high",
  },
  verified: {
    label: "검증",
    description: "기준이 정리되고 안정화된 상태입니다.",
    accentTone: "verified",
    particles: false,
    orbit: true,
    pulse: "soft",
    opacity: 0.96,
    glow: "medium",
  },
  restricted: {
    label: "제한",
    description: "역할 또는 승인 상태에 따라 제한된 상태입니다.",
    accentTone: "restricted",
    particles: false,
    orbit: false,
    pulse: "none",
    opacity: 0.52,
    glow: "low",
  },
};
