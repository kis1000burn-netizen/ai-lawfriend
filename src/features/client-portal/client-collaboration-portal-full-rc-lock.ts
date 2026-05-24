/**
 * Phase 15-G — Client-Lawyer Collaboration Portal Full RC / Predeploy Closure (RC LOCKED).
 * Supersedes Phase 15-D partial RC; seals 15-A〜15-F collaboration stack.
 * @see docs/client-portal/AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_FULL_RC_LOCK_SUMMARY.md
 */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_LOCK_MARKER_PHASE15G =
  "phase15g-client-collaboration-portal-full-rc-predeploy-closure" as const;

export const CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15G-FULL-RC-PREDEPLOY-CLOSURE" as const;

export const CLIENT_COLLABORATION_PORTAL_FULL_RC_VERSION = "15-G.1" as const;

/** Full RC runs all phase verify scripts in order */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-client-supplement-tracking-phase15a",
  "verify:aibeopchin-court-schedule-client-reminder-phase15e",
  "verify:aibeopchin-secure-document-kakao-notice-phase15f",
] as const;

/** Full migration apply order (15-A〜15-F) */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_MIGRATION_DIRS = [
  "20260525140000_client_portal_collaboration_phase15a",
  "20260525150000_client_portal_phase15bc_intake_chat",
  "20260525160000_client_portal_phase15c2_review_gate",
  "20260525170000_litigation_deadline_client_reminder_phase15d",
  "20260525180000_secure_document_delivery_phase15f",
] as const;

/** Intake · chat · submission audit (15-A〜C) */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_CLIENT_AUDIT_ACTIONS = [
  "CLIENT_PORTAL_ACCESS",
  "CLIENT_SUBMISSION_SUBMITTED",
  "CLIENT_SUBMISSION_REVIEWED",
  "CASE_CONVERSATION_MESSAGE_SENT",
  "CLIENT_PORTAL_FILE_UPLOAD",
] as const;

/** adopt-record · Review Queue (15-C.2/C.3) */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_REVIEW_AUDIT_ACTIONS = [
  "CASE_CONVERSATION_MESSAGE_ADOPTED",
  "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
] as const;

/** Court schedule reminders (15-E) */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_DEADLINE_AUDIT_ACTIONS = [
  "LITIGATION_DEADLINE_MANUAL_CREATED",
  "LITIGATION_DEADLINE_NOTIFY_SCHEDULED",
  "LITIGATION_DEADLINE_IN_APP_SENT",
] as const;

/** Secure document · external notice (15-F) */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_DOCUMENT_DELIVERY_AUDIT_ACTIONS = [
  "CASE_SHARED_DOCUMENT_CREATED",
  "CASE_DOCUMENT_DELIVERY_SENT",
  "CASE_DOCUMENT_DELIVERY_SKIPPED",
  "CASE_SHARED_DOCUMENT_VIEWED",
] as const;

/** Full RC safety principles (immutable) */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_SAFETY_PRINCIPLES = [
  "CLIENT_NOTIFICATION_PREFERENCE_CONSENT_GATE",
  "EXTERNAL_MESSAGE_NO_RAW_FILE_ATTACHMENT",
  "SECURE_LINK_LOGIN_REQUIRED",
  "SECURE_LINK_TOKEN_EXPIRY",
  "VIEW_AND_DELIVERY_AUDIT_LOG",
  "LAWYER_STAFF_ADMIN_ROLE_SEPARATION",
  "CLIENT_OPT_OUT_RESPECTED",
  "DELIVERY_FAILURE_FALLBACK_LOGGED",
] as const;

/** UI smoke testids across portal + command center */
export const CLIENT_COLLABORATION_PORTAL_FULL_RC_UI_SMOKE_TESTIDS = [
  "phase15a-client-lawyer-collaboration-portal-client",
  "client-portal-supplement-submit",
  "client-portal-free-upload",
  "client-portal-shared-open-",
  "다음 재판기일",
  "lcc-section-client-submissions",
  "lcc-section-conversation",
  "lcc-section-deadlines",
  "lcc-section-shared-documents",
] as const;

export const CLIENT_COLLABORATION_PORTAL_FULL_RC_VITEST_TARGETS = [
  "src/features/client-portal",
  "src/features/litigation-deadline-reminder",
  "src/features/secure-document-delivery",
] as const;

export const CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_VERIFY_SCRIPT =
  "verify:aibeopchin-client-collaboration-portal-full-rc" as const;
