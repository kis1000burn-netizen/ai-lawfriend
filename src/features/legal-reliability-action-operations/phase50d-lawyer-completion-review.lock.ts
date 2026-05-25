/**
 * Product Phase 50-D — Lawyer Completion Review lock SSOT.
 */
export const PHASE50D_COMPLETION_LOCK_MARKER =
  "phase50d-legal-reliability-action-operations-completion-lock" as const;

export const PHASE50D_COMPLETION_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50D-LAWYER-COMPLETION-REVIEW" as const;

export const PHASE50D_COMPLETION_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50d" as const;

export const PHASE50D_COMPLETION_VERSION = "50-D.1" as const;

export const PHASE50D_PREREQ_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50c" as const;

export const PHASE50D_PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50C-CLIENT-RESPONSE-EVIDENCE-INTAKE-SYNC" as const;

export const PHASE50D_LOCKED_BOUNDARIES = [
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "NO_CLIENT_RESPONSE_AUTO_COMPLETION",
  "NO_AI_COMPLETION_DECISION",
  "NO_EVIDENCE_CONFIRMATION_WITHOUT_LAWYER_REVIEW",
  "COMPLETION_DECISION_LEDGER_REQUIRED",
  "NO_COURT_READY_USE_WITHOUT_CONFIRMED_REVIEW",
] as const;

export const PHASE50D_API_PATHS = [
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/complete/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/request-more-info/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/reopen/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/defer/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/cancel/route.ts",
] as const;

export const PHASE50D_FINAL_JUDGMENT =
  "Operation completion is now lawyer-controlled. Client responses and uploads can trigger review, but only a lawyer or admin completion decision with ledger and audit record can complete an operation or confirm evidence for downstream use." as const;
