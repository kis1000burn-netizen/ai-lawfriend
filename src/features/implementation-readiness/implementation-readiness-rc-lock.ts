/**
 * Product Phase 36-F — Implementation Readiness RC lock (36-A~E SSOT).
 * @see docs/platform/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md
 */
export const IMPLEMENTATION_READINESS_RC_LOCK_MARKER_PHASE36F =
  "phase36f-implementation-readiness-rc-gate" as const;

export const IMPLEMENTATION_READINESS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC" as const;

export const IMPLEMENTATION_READINESS_RC_VERSION = "36-F.1" as const;

export const IMPLEMENTATION_READINESS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-implementation-readiness-rc" as const;

export const IMPLEMENTATION_READINESS_RC_ONE_LINE_CRITERION =
  "Product Phase 36은 계약 이후 tenant provisioning, 고객 데이터 준비, 관리자·변호사 교육, go-live 성공 기준, 변경관리·리스크 통제를 하나의 Implementation Readiness RC로 잠그는 단계다" as const;

export const IMPLEMENTATION_READINESS_RC_SUB_PHASES = {
  "36-A": "Implementation Project Plan",
  "36-B": "Customer Data / Tenant Provisioning Plan",
  "36-C": "Admin / Lawyer Training Schedule",
  "36-D": "Go-Live Success Criteria",
  "36-E": "Post-Contract Risk / Change Control",
  "36-F": "Implementation Readiness RC",
} as const;

export const IMPLEMENTATION_READINESS_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-implementation-readiness-phase36a",
  "verify:aibeopchin-implementation-readiness-phase36b",
  "verify:aibeopchin-implementation-readiness-phase36c",
  "verify:aibeopchin-implementation-readiness-phase36d",
  "verify:aibeopchin-implementation-readiness-phase36e",
] as const;

export const IMPLEMENTATION_READINESS_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36A-IMPLEMENTATION-PROJECT-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36B-TENANT-PROVISIONING-PLAN",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36C-ADMIN-LAWYER-TRAINING",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36D-GO-LIVE-SUCCESS-CRITERIA",
  "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36E-POST-CONTRACT-RISK-CHANGE",
  IMPLEMENTATION_READINESS_RC_EVIDENCE_TAG,
] as const;

export const IMPLEMENTATION_READINESS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
] as const;

export const IMPLEMENTATION_READINESS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_IMPLEMENTATION_PROJECT_PLAN_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CUSTOMER_DATA_TENANT_PROVISIONING_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_ADMIN_LAWYER_TRAINING_SCHEDULE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_GO_LIVE_SUCCESS_CRITERIA_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_POST_CONTRACT_RISK_CHANGE_CONTROL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_RUNBOOK.md",
] as const;

export const IMPLEMENTATION_READINESS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_IMPLEMENTATION_READINESS_RC_LOCK_SUMMARY.md",
  ...IMPLEMENTATION_READINESS_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const IMPLEMENTATION_READINESS_RC_PROJECT_PLAN_GATE_MARKER =
  "phase36a-implementation-project-plan-gate" as const;

export const IMPLEMENTATION_READINESS_RC_BOUNDARY = {
  noAutoTenantProvisioning: "NO_AUTO_TENANT_PROVISIONING",
  noAutoGoLive: "NO_AUTO_GO_LIVE",
  implementationPolicyOnly: "phase36-implementation-readiness-policy-only-boundary",
} as const;

export const IMPLEMENTATION_READINESS_RC_PRODUCT_CROSS_LINK = {
  contractingLegalOpsMasterVerify: "verify:aibeopchin-contracting-legal-ops-rc",
  contractingLegalOpsRcEvidence:
    "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
  salesPipelineDealDeskMasterVerify: "verify:aibeopchin-sales-pipeline-deal-desk-rc",
  productionLaunchMasterVerify: "verify:aibeopchin-production-launch-rc",
  paidConversionScaleMasterVerify: "verify:aibeopchin-paid-conversion-scale-rc",
} as const;

export const IMPLEMENTATION_READINESS_RC_AUDIT_ACTIONS = [] as const;
