/**
 * Product Phase 49-B — Graph Gap → Evidence Request Action lock SSOT.
 */
export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_LOCK_MARKER =
  "phase49b-legal-reliability-graph-gap-evidence-request-action-lock" as const;

export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49B-GRAPH-GAP-EVIDENCE-REQUEST-ACTION" as const;

export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-loop-phase49b" as const;

export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_VERSION = "49-B.1" as const;

export const PHASE49B_PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION" as const;

export const PHASE49B_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "NO_AUTO_LEGAL_FILING",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
  "NO_UNVERIFIED_EVIDENCE_LABELING",
] as const;

export const PHASE49B_SPEC_PATH =
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SPEC.md" as const;

export const PHASE49B_RUNBOOK_PATH =
  "docs/operations/AIBEOPCHIN_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_RUNBOOK.md" as const;

export const PHASE49B_API_PATHS = [
  "src/app/api/cases/[caseId]/legal-reliability/action-loop/evidence-request-candidates/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-loop/evidence-request-candidates/[candidateId]/decision/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-loop/claim-graph/[gapId]/evidence-request-candidates/route.ts",
] as const;
