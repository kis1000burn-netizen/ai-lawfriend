/**
 * Phase 15-D — Client-Lawyer Collaboration Portal RC / Predeploy Closure (RC LOCKED).
 * @see docs/client-portal/AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_RC_LOCK_SUMMARY.md
 */
export const CLIENT_COLLABORATION_PORTAL_RC_LOCK_MARKER_PHASE15D =
  "phase15d-client-collaboration-portal-rc-predeploy-closure" as const;

export const CLIENT_COLLABORATION_PORTAL_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15D-RC-PREDEPLOY-CLOSURE" as const;

/** 15-A〜15-C.3 선행 verify (15-D RC 게이트가 순차 실행) */
export const CLIENT_COLLABORATION_PORTAL_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-client-supplement-tracking-phase15a",
] as const;

/** Collaboration Portal RC migration apply order (15-E migration 제외) */
export const CLIENT_COLLABORATION_PORTAL_RC_MIGRATION_DIRS = [
  "20260525140000_client_portal_collaboration_phase15a",
  "20260525150000_client_portal_phase15bc_intake_chat",
  "20260525160000_client_portal_phase15c2_review_gate",
] as const;

/** Client portal AuditLog action SSOT (15-A〜C) */
export const CLIENT_COLLABORATION_PORTAL_RC_CLIENT_AUDIT_ACTIONS = [
  "CLIENT_PORTAL_ACCESS",
  "CLIENT_SUBMISSION_SUBMITTED",
  "CLIENT_SUBMISSION_REVIEWED",
  "CASE_CONVERSATION_MESSAGE_SENT",
  "CLIENT_PORTAL_FILE_UPLOAD",
] as const;

/** Command Center adopt + action feed (15-C.3) */
export const CLIENT_COLLABORATION_PORTAL_RC_COMMAND_CENTER_AUDIT_ACTIONS = [
  "CASE_CONVERSATION_MESSAGE_ADOPTED",
  "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
] as const;

/** Client portal UI smoke testids */
export const CLIENT_COLLABORATION_PORTAL_RC_UI_SMOKE_TESTIDS = [
  "phase15a-client-lawyer-collaboration-portal-client",
  "client-portal-tab-",
  "client-portal-supplement-submit",
  "client-portal-free-upload",
  "lcc-section-client-submissions",
  "lcc-section-conversation",
] as const;

/** verify:aibeopchin-client-collaboration-portal-rc Vitest bundle */
export const CLIENT_COLLABORATION_PORTAL_RC_VITEST_TARGETS = [
  "src/features/client-portal",
  "src/features/document-intelligence/litigation-command-center-rc-lock.test.ts",
] as const;
