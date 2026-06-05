/**
 * Product Phase 62~70 — Legal Intelligence Platform roadmap SSOT (registry).
 * @see docs/platform/AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_PHASE62_70_ROADMAP.md
 */
export const LEGAL_INTELLIGENCE_PLATFORM_ROADMAP_MARKER =
  "legal-intelligence-platform-roadmap-v1" as const;

export const LEGAL_INTELLIGENCE_PLATFORM_ROADMAP_ONE_LINE =
  "Phase 62~70은 공부호 지능, 변호사 전략 보조, 증거공백, 반박초안, 판례근거, 의뢰인 설명, 변호사 지식화, 기업형 다중사건 분석, ROI 지표를 하나로 묶어 AI법친을 Legal Intelligence Platform으로 봉인하는 단계다." as const;

export const LEGAL_INTELLIGENCE_PLATFORM_IMPLEMENTATION_ORDER = [
  "61-A",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "70",
] as const;

export const LEGAL_INTELLIGENCE_PLATFORM_PHASES = {
  "59": "Gongbuho Intelligence Layer",
  "60": "Control Tower Brain",
  "61": "AI Legal Strategy Assistant",
  "62": "Evidence Gap Auto Planner",
  "63": "Counter-Argument Draft Engine",
  "64": "Judgment-backed Reasoning View",
  "65": "Litigation Strategy Workspace",
  "66": "Client-safe Explanation Layer",
  "67": "Lawyer Knowledge Studio",
  "68": "Enterprise Multi-Case Intelligence",
  "69": "Commercial Performance / ROI Intelligence",
  "70": "Legal Intelligence Platform RC",
} as const;

export const LEGAL_INTELLIGENCE_PLATFORM_RC_TARGET_STATUS =
  "LEGAL_INTELLIGENCE_PLATFORM_RC_LOCKED" as const;

export const LEGAL_INTELLIGENCE_PLATFORM_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-intelligence-platform-rc" as const;

export const LEGAL_INTELLIGENCE_PLATFORM_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-gongbuho-intelligence-rc",
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-assistant-rc",
  "verify:aibeopchin-evidence-gap-planner-rc",
  "verify:aibeopchin-counter-argument-engine-rc",
  "verify:aibeopchin-judgment-backed-reasoning-rc",
  "verify:aibeopchin-litigation-strategy-workspace-rc",
  "verify:aibeopchin-client-safe-explanation-rc",
  "verify:aibeopchin-lawyer-knowledge-studio-rc",
  "verify:aibeopchin-enterprise-intelligence-rc",
  "verify:aibeopchin-commercial-roi-rc",
] as const;

export const LEGAL_INTELLIGENCE_PLATFORM_RC_FINAL_BOUNDARIES = [
  "NO_AI_FINAL_LEGAL_JUDGMENT",
  "NO_CLIENT_VISIBLE_STRATEGY_WITHOUT_LAWYER_APPROVAL",
  "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
  "NO_CROSS_TENANT_INTELLIGENCE",
  "NO_UNAPPROVED_REAL_TIME_SIGNAL",
  "NO_REUSABLE_PATTERN_WITHOUT_ANONYMIZATION",
  "NO_AUTO_FILING",
  "NO_AUTO_DEPLOY",
  "NO_UNVERIFIED_ROI_CLAIM",
  "AUDIT_EVERY_INTELLIGENCE_ACTION",
  "CONTROL_TOWER_VERIFY_REQUIRED",
  "MASTER_PLATFORM_VERIFY_REQUIRED",
] as const;

export const LEGAL_INTELLIGENCE_PLATFORM_ROADMAP_DOC =
  "docs/platform/AIBEOPCHIN_LEGAL_INTELLIGENCE_PLATFORM_PHASE62_70_ROADMAP.md" as const;

export const LEGAL_INTELLIGENCE_PLATFORM_NEXT_PHASE = "64" as const;

export const LEGAL_INTELLIGENCE_PLATFORM_NEXT_ACTION =
  "Phase 64-C — Judgment Reasoning View RC (TBD)" as const;
