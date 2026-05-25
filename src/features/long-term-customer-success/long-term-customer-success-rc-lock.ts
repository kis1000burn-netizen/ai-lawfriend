/**
 * Product Phase 38-F — Long-term Customer Success RC lock (38-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md
 */
export const LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_MARKER_PHASE38F =
  "phase38f-long-term-customer-success-rc-gate" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_VERSION = "38-F.1" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-long-term-customer-success-rc" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_ONE_LINE_CRITERION =
  "Product Phase 38은 go-live 이후 90일·분기·갱신 주기 동안 고객 성과, 사용 확대, 이탈 위험, renewal 준비를 추적해 장기 Customer Success 운영 기준을 RC로 잠그는 단계다" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_SUB_PHASES = {
  "38-A": "90-Day Success Plan",
  "38-B": "Quarterly Business Review Pack",
  "38-C": "Renewal Readiness Timeline",
  "38-D": "Expansion / Upsell Playbook",
  "38-E": "Long-term Churn Prevention Loop",
  "38-F": "Long-term Customer Success RC",
} as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-long-term-customer-success-phase38a",
  "verify:aibeopchin-long-term-customer-success-phase38b",
  "verify:aibeopchin-long-term-customer-success-phase38c",
  "verify:aibeopchin-long-term-customer-success-phase38d",
  "verify:aibeopchin-long-term-customer-success-phase38e",
] as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38A-90-DAY-SUCCESS-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38B-QUARTERLY-BUSINESS-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38C-RENEWAL-READINESS-TIMELINE",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38D-EXPANSION-UPSELL-PLAYBOOK",
  "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38E-CHURN-PREVENTION-LOOP",
  LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAG,
] as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_90_DAY_SUCCESS_PLAN_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_QUARTERLY_BUSINESS_REVIEW_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_RENEWAL_READINESS_TIMELINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_EXPANSION_UPSELL_PLAYBOOK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LONG_TERM_CHURN_PREVENTION_LOOP_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK.md",
] as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_SUMMARY.md",
  ...LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_NINETY_DAY_GATE_MARKER =
  "phase38a-90-day-success-plan-gate" as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_BOUNDARY = {
  noAutoRenewal: "NO_AUTO_RENEWAL",
  noAutoUpsell: "NO_AUTO_UPSELL",
  noAutoChurnPredictionClaim: "NO_AUTO_CHURN_PREDICTION_CLAIM",
  customerSuccessPolicyOnly: "phase38-long-term-customer-success-policy-only-boundary",
} as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_PRODUCT_CROSS_LINK = {
  customerGoLiveAdoptionMasterVerify: "verify:aibeopchin-customer-go-live-adoption-rc",
  customerGoLiveAdoptionRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
  implementationReadinessMasterVerify: "verify:aibeopchin-implementation-readiness-rc",
  paidConversionScaleMasterVerify: "verify:aibeopchin-paid-conversion-scale-rc",
  revenueOpsMasterVerify: "verify:aibeopchin-revenue-ops-rc",
} as const;

export const LONG_TERM_CUSTOMER_SUCCESS_RC_AUDIT_ACTIONS = [] as const;
