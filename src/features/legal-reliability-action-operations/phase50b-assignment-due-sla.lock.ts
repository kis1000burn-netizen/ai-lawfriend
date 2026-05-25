/**
 * Product Phase 50-B — Assignment / Due Date / SLA Tracking lock SSOT.
 */
export const PHASE50B_ASSIGNMENT_DUE_SLA_LOCK_MARKER =
  "phase50b-legal-reliability-action-operations-assignment-due-sla-lock" as const;

export const PHASE50B_ASSIGNMENT_DUE_SLA_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA" as const;

export const PHASE50B_ASSIGNMENT_DUE_SLA_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50b" as const;

export const PHASE50B_ASSIGNMENT_DUE_SLA_VERSION = "50-B.1" as const;

export const PHASE50B_PREREQ_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50a" as const;

export const PHASE50B_PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE" as const;

export const PHASE50B_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_AUTO_OPERATION_COMPLETION",
  "NO_SLA_ESCALATION_WITHOUT_HUMAN_OWNER",
  "CLIENT_ROLE_OPERATION_ASSIGNMENT_FORBIDDEN",
  "NO_AUTO_LEGAL_FILING",
  "NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION",
] as const;

export const PHASE50B_API_PATHS = [
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/assign/route.ts",
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/[operationId]/due-date/route.ts",
] as const;

export const PHASE50B_UI_PATHS = [
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-sla-badge.tsx",
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-assignment-controls.tsx",
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-due-date-control.tsx",
] as const;

export const PHASE50B_FINAL_JUDGMENT =
  "Phase 50-B locks operational ownership and SLA visibility for Legal Reliability Action Operations. SLA status is used for tracking and prioritization only; it does not trigger automatic completion, messaging, filing, or escalation without a human owner." as const;
