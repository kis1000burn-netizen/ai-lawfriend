/**
 * Product Phase 50-A — Legal Reliability Action Operations Queue lock SSOT.
 */
export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_LOCK_MARKER =
  "phase50a-legal-reliability-action-operations-queue-lock" as const;

export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE" as const;

export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-phase50a" as const;

export const PHASE50A_LEGAL_RELIABILITY_ACTION_OPERATIONS_QUEUE_VERSION = "50-A.1" as const;

export const PHASE50A_PREREQ_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-loop-rc" as const;

export const PHASE50A_PREREQ_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-LOOP-PHASE49C-RC" as const;

export const PHASE50A_LOCKED_BOUNDARIES = [
  "NO_AI_AUTO_ACTION",
  "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "NO_AUTO_OPERATION_COMPLETION",
  "NO_AUTO_LEGAL_FILING",
  "NO_CLIENT_UPLOAD_AUTO_EVIDENCE_CONFIRMATION",
] as const;

export const PHASE50A_SPEC_PATH =
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md" as const;

export const PHASE50A_RUNBOOK_PATH =
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RUNBOOK.md" as const;

export const PHASE50A_API_PATHS = [
  "src/app/api/cases/[caseId]/legal-reliability/action-operations/route.ts",
] as const;

export const PHASE50A_UI_PATHS = [
  "src/components/cases/litigation-command-center/legal-reliability-action-operations-panel.tsx",
  "src/components/cases/litigation-command-center/legal-reliability-action-operation-row.tsx",
] as const;
