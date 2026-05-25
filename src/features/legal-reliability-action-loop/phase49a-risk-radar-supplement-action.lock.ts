/**
 * Product Phase 49-A — Risk Radar → Supplement Request Action lock SSOT.
 */
export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_LOCK_MARKER =
  "phase49a-legal-reliability-risk-radar-supplement-action-lock" as const;

export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION" as const;

export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-loop-phase49a" as const;

export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_VERSION = "49-A.1" as const;

export const PHASE49A_PREREQ_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-lawyer-workbench-rc" as const;

export const PHASE49A_PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48F-RC" as const;

export const PHASE49A_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_LEGAL_FILING",
  "NO_UNREVIEWED_DRAFT_CONTEXT",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
] as const;

export const PHASE49A_SPEC_PATH =
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SPEC.md" as const;

export const PHASE49A_RUNBOOK_PATH =
  "docs/operations/AIBEOPCHIN_RISK_RADAR_SUPPLEMENT_ACTION_RUNBOOK.md" as const;

export const PHASE49A_API_PATHS = [
  "src/app/api/cases/[caseId]/legal-reliability/action-loop/supplement-candidates/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-loop/supplement-candidates/[candidateId]/decision/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-loop/risk-radar/[signalId]/supplement-candidates/route.ts",
] as const;
