import type { IllegalLendingPromoVariant } from "./illegal-lending-promo-events";

export type IllegalLendingPromoCopy = {
  variant: IllegalLendingPromoVariant;
  badge: string;
  headline: string;
  subheadline: string;
  cta: string;
  secondaryCta: string;
  popupHeadline: string;
  popupBody: string;
};

export const ILLEGAL_LENDING_PROMO_COPIES: Record<
  IllegalLendingPromoVariant,
  IllegalLendingPromoCopy
> = {
  A: {
    variant: "A",
    badge: "AI법친 공익 무료 서비스",
    headline: "불법사금융 피해,\n혼자 정리하지 마세요.",
    subheadline:
      "초고금리, 불법추심, 협박, 가족·직장 연락, 개인정보 유포 협박 피해를 AI법친이 신고서 형식에 맞게 무료로 정리해드립니다.",
    cta: "무료 신고서 작성 시작하기",
    secondaryCta: "어떻게 도와주나요?",
    popupHeadline: "불법사금융 피해를\n당하고 계신가요?",
    popupBody:
      "초고금리, 불법추심, 협박, 가족·직장 연락, 개인정보 유포 협박 피해를 신고서 형식으로 무료 정리해드립니다.",
  },
  B: {
    variant: "B",
    badge: "초고금리·불법추심 피해 무료 정리",
    headline: "협박성 추심과 고금리 피해,\n신고서부터 정리하세요.",
    subheadline:
      "문자, 카카오톡, 통화녹음, 계좌이체내역, 계약 내용을 바탕으로 피해사실과 증거목록을 신고서 초안으로 정리합니다.",
    cta: "피해 신고서 무료로 만들기",
    secondaryCta: "피해 유형 확인하기",
    popupHeadline: "협박성 추심을\n받고 계신가요?",
    popupBody:
      "문자·카카오톡·통화녹음·계좌이체내역을 바탕으로 피해 신고서 초안을 무료로 정리할 수 있습니다.",
  },
};

const STORAGE_KEY = "aibeopchin-illegal-lending-promo-variant-v1";

export function getConfiguredIllegalLendingPromoVariant():
  | IllegalLendingPromoVariant
  | "auto" {
  const raw = process.env.NEXT_PUBLIC_ILLEGAL_LENDING_PROMO_VARIANT;

  if (raw === "A" || raw === "B") {
    return raw;
  }

  return "auto";
}

export function getClientIllegalLendingPromoVariant(): IllegalLendingPromoVariant {
  const configured = getConfiguredIllegalLendingPromoVariant();

  if (configured !== "auto") {
    return configured;
  }

  if (typeof window === "undefined" || !window.localStorage) {
    return "A";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "A" || stored === "B") {
    return stored;
  }

  const variant: IllegalLendingPromoVariant = Math.random() < 0.5 ? "A" : "B";
  window.localStorage.setItem(STORAGE_KEY, variant);

  return variant;
}

export function getIllegalLendingPromoCopy(variant: IllegalLendingPromoVariant) {
  return ILLEGAL_LENDING_PROMO_COPIES[variant];
}