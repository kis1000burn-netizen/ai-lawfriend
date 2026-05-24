/**
 * Product Phase 24-F — Litigation Operations RC lock (24-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md
 */
export const LITIGATION_OPERATIONS_RC_LOCK_MARKER_PHASE24F =
  "phase24f-litigation-operations-rc-gate" as const;

export const LITIGATION_OPERATIONS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC" as const;

export const LITIGATION_OPERATIONS_RC_VERSION = "24-F.1" as const;

export const LITIGATION_OPERATIONS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-litigation-ops-rc" as const;

export const LITIGATION_OPERATIONS_RC_ONE_LINE_CRITERION =
  "소송 Task/Deadline 자동화·법원 제출 준비 pack·변호사 workbench·기일/제출 checklist·의뢰인 소송 진행 sync를 하나의 Product Phase 24 RC로 묶어 배포 전 검증·운영 runbook·Phase 14/15-E litigation cross-link를 잠근다" as const;

export const LITIGATION_OPERATIONS_RC_SUB_PHASES = {
  "24-A": "Litigation Task / Deadline Automation",
  "24-B": "Court Filing Preparation Pack",
  "24-C": "Lawyer Workbench Integration",
  "24-D": "Hearing / Submission Checklist",
  "24-E": "Client-facing Litigation Progress Sync",
  "24-F": "Litigation Operations RC",
} as const;

export const LITIGATION_OPERATIONS_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-litigation-ops-phase24a",
  "verify:aibeopchin-litigation-ops-phase24b",
  "verify:aibeopchin-litigation-ops-phase24c",
  "verify:aibeopchin-litigation-ops-phase24d",
  "verify:aibeopchin-litigation-ops-phase24e",
] as const;

export const LITIGATION_OPERATIONS_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24A-TASK-DEADLINE-AUTOMATION",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24B-COURT-FILING-PREPARATION-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24C-LAWYER-WORKBENCH-INTEGRATION",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24D-HEARING-SUBMISSION-CHECKLIST",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24E-CLIENT-LITIGATION-PROGRESS-SYNC",
  LITIGATION_OPERATIONS_RC_EVIDENCE_TAG,
] as const;

export const LITIGATION_OPERATIONS_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE",
] as const;

export const LITIGATION_OPERATIONS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_LITIGATION_TASK_DEADLINE_AUTOMATION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_COURT_FILING_PREPARATION_PACK_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LAWYER_WORKBENCH_INTEGRATION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_HEARING_SUBMISSION_CHECKLIST_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_LITIGATION_PROGRESS_SYNC_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_RUNBOOK.md",
] as const;

export const LITIGATION_OPERATIONS_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_LITIGATION_OPERATIONS_RC_LOCK_SUMMARY.md",
  ...LITIGATION_OPERATIONS_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

export const LITIGATION_OPERATIONS_RC_COMMAND_CENTER_PATH =
  "/cases/[caseId]/litigation-command-center" as const;

export const LITIGATION_OPERATIONS_RC_PRODUCT_CROSS_LINK = {
  aiQualityMasterVerify: "verify:aibeopchin-ai-quality-rc",
  litigationCommandCenterRcEvidence:
    "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE",
  litigationCommandCenterService:
    "src/features/document-intelligence/litigation-command-center.service.ts",
  deadlineReminderService:
    "src/features/litigation-deadline-reminder/litigation-deadline-reminder.service.ts",
  litigationOperationsService:
    "src/features/document-intelligence/litigation-operations.service.ts",
} as const;

export const LITIGATION_OPERATIONS_RC_AUDIT_ACTIONS = [
  "LITIGATION_TASK_DEADLINE_AUTOMATION_RUN",
] as const;
