/** 사건 진단 카드(A안) — 법률 판단 없이 기관 안내·체크리스트·조사 힌트만 제공 */

export type CaseGuidanceExternalLink = { label: string; href: string };

export type CaseGuidanceSection = {
  id: string;
  title: string;
  bullets: string[];
  links?: CaseGuidanceExternalLink[];
};

export type CaseGuidanceCardModel = {
  /** 표시용 사건 유형 라벨 */
  caseCategoryLabel: string;
  /** 규칙 세트 식별(기본값·형사 등) */
  ruleKey: string;
  situationSummaryBullets: string[];
  suggestedNextSteps: CaseGuidanceSection;
  institutionChecklist: CaseGuidanceSection;
  researchAndCasesHint: CaseGuidanceSection;
  /** 고정 면책·한계 안내 */
  disclaimers: string[];
};
