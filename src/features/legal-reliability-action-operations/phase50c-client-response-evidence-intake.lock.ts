/**
 * Product Phase 50-C — Client Response & Evidence Intake Sync lock SSOT.
 */
export const PHASE50C_CLIENT_RESPONSE_EVIDENCE_INTAKE_LOCK_MARKER =
  "phase50c-legal-reliability-action-operations-client-response-evidence-intake-lock" as const;

export const PHASE50C_CLIENT_RESPONSE_EVIDENCE_INTAKE_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50C-CLIENT-RESPONSE-EVIDENCE-INTAKE-SYNC" as const;

export const PHASE50C_CLIENT_RESPONSE_EVIDENCE_INTAKE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50c" as const;

export const PHASE50C_CLIENT_RESPONSE_EVIDENCE_INTAKE_VERSION = "50-C.1" as const;

export const PHASE50C_PREREQ_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50b" as const;

export const PHASE50C_PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA" as const;

export const PHASE50C_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_AUTO_OPERATION_COMPLETION",
  "NO_AUTO_LEGAL_FILING",
  "NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER",
  "CLIENT_RESPONSE_DOES_NOT_COMPLETE_OPERATION",
  "CLIENT_UPLOAD_IS_NOT_CONFIRMED_EVIDENCE",
  "LAWYER_REVIEW_REQUIRED_FOR_COMPLETION",
  "EVIDENCE_INTAKE_LINK_REQUIRED",
  "NO_AUTO_EVIDENCE_PROMOTION",
  "NO_CLIENT_SUBMISSION_DIRECT_TO_COURT_READY_PACK",
] as const;

export const PHASE50C_API_PATHS = [
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/client-response-sync/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/handoff-lawyer-review/route.ts",
] as const;

export const PHASE50C_UI_PATHS = [
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-response-badge.tsx",
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-review-handoff-control.tsx",
] as const;

export const PHASE50C_ONE_LINE_CRITERION =
  "Client submitted, not lawyer confirmed." as const;

export const PHASE50C_FINAL_JUDGMENT =
  "Client responses and uploaded files now update Legal Reliability Action Operations and create lawyer-review handoff context, but they do not complete operations, confirm evidence, enter court-ready packs, or become downstream legal context until lawyer review." as const;
