/**
 * Phase 14-E — Litigation Command Center Release Candidate / Predeploy Closure (RC LOCKED).
 * @see docs/ai/AIBEOPCHIN_LITIGATION_COMMAND_CENTER_RC_LOCK_SUMMARY.md
 */
export const LITIGATION_COMMAND_CENTER_RC_LOCK_MARKER_PHASE14E =
  "phase14e-litigation-command-center-rc-predeploy-closure" as const;

export const LITIGATION_COMMAND_CENTER_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE" as const;

/** 14-A〜14-D 선행 verify (14-E RC 게이트가 순차 실행) */
export const LITIGATION_COMMAND_CENTER_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-document-intelligence-phase14a",
  "verify:aibeopchin-legal-document-intelligence-phase14b",
  "verify:aibeopchin-legal-document-intelligence-phase14c",
  "verify:aibeopchin-legal-document-intelligence-phase14d",
] as const;

/** Command Center downstream DB — 13-H ops integration migration (14-A〜D 신규 migration 없음) */
export const LITIGATION_COMMAND_CENTER_RC_DEPENDENCY_MIGRATION_DIRS = [
  "20260524220000_litigation_operations_integration_phase13h",
] as const;

/** Command Center in-place action AuditLog action SSOT */
export const LITIGATION_COMMAND_CENTER_RC_AUDIT_ACTIONS = [
  "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
  "LITIGATION_CMD_CENTER_DEADLINE_UPDATED",
  "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT",
  "LITIGATION_CMD_CENTER_DRAFT_GENERATED",
] as const;

/** Command Center UI smoke testids (view · actions · feedback · dashboard widget) */
export const LITIGATION_COMMAND_CENTER_RC_UI_SMOKE_TESTIDS = [
  "litigation-command-center",
  "open-litigation-command-center",
  "lcc-mode-readonly",
  "lcc-mode-actions-enabled",
  "lcc-section-action-feed",
  "lcc-list-open-",
  "lawyer-command-center-preview",
] as const;

/** verify:aibeopchin-litigation-command-center-rc Vitest bundle */
export const LITIGATION_COMMAND_CENTER_RC_VITEST_TARGET =
  "src/features/document-intelligence/litigation-command-center" as const;
