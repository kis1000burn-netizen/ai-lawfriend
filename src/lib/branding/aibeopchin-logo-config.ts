import type { AibeopchinLogoConfig } from "@/components/branding/aibeopchin-brand-types";
import {
  AIBEOPCHIN_HERO_DESCRIPTION_LINES,
  AIBEOPCHIN_HERO_TAGLINE_LINES,
  joinKoreanPhrases,
} from "@/lib/branding/aibeopchin-marketing-copy";

export const AIBEOPCHIN_LOGO_CONFIG: AibeopchinLogoConfig = {
  particleCount: 42,
  motionSpeed: 1,
  glowIntensity: 0.75,
  strokeWidth: 1.8,
  introDurationMs: 5200,
};

export const AIBEOPCHIN_BRAND_COPY = {
  eyebrow: "AI Legal Companion",
  title: "AI법친",
  subtitle:
    "질문에서 사건 정리, 문서 초안까지 함께 정리하는 AI 법률 동반자",
  description: joinKoreanPhrases(AIBEOPCHIN_HERO_DESCRIPTION_LINES),
  tagline: joinKoreanPhrases(AIBEOPCHIN_HERO_TAGLINE_LINES),
};
