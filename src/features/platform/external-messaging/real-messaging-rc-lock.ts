/**
 * Product Phase 20-F — Real Messaging RC lock (20-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md
 */
export const REAL_MESSAGING_RC_LOCK_MARKER_PHASE20F =
  "phase20f-real-messaging-rc-external-send-gate" as const;

export const REAL_MESSAGING_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC" as const;

export const REAL_MESSAGING_RC_VERSION = "20-F.1" as const;

export const REAL_MESSAGING_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-real-messaging-rc" as const;

export const REAL_MESSAGING_RC_ONE_LINE_CRITERION =
  "ExternalMessageAdapter, Email/Kakao provider, webhook status sync, secure delivery integration, redelivery, redaction, consent gate를 하나의 Real Messaging RC로 묶어 배포 전 검증·운영 체크리스트·실발송 제한 기준을 잠근다" as const;

export const REAL_MESSAGING_RC_SUB_PHASES = {
  "20-A": "External Message Adapter Contract",
  "20-B": "Email Adapter",
  "20-C": "Kakao Adapter",
  "20-D": "Provider Webhook / Status Sync",
  "20-E": "Secure Delivery Integration",
  "20-F": "Real Messaging RC",
} as const;

export const REAL_MESSAGING_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-real-messaging-phase20a",
  "verify:aibeopchin-real-messaging-phase20b",
  "verify:aibeopchin-real-messaging-phase20c",
  "verify:aibeopchin-real-messaging-phase20d",
  "verify:aibeopchin-real-messaging-phase20e",
] as const;

export const REAL_MESSAGING_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20A-ADAPTER-CONTRACT",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20B-EMAIL-ADAPTER",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20C-KAKAO-ADAPTER",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20D-WEBHOOK-STATUS-SYNC",
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20E-SECURE-DELIVERY-INTEGRATION",
  REAL_MESSAGING_RC_EVIDENCE_TAG,
] as const;

export const REAL_MESSAGING_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-SECURE-DOCUMENT-KAKAO-NOTICE-PHASE15F",
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18B-EXTERNAL-MESSAGE-REDELIVERY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION",
] as const;

export const REAL_MESSAGING_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_ADAPTER_CONTRACT_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_EMAIL_ADAPTER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_KAKAO_ADAPTER_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_WEBHOOK_STATUS_SYNC_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_SECURE_DELIVERY_INTEGRATION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_REAL_MESSAGING_RC_RUNBOOK.md",
] as const;

export const REAL_MESSAGING_RC_CROSS_LINK_RUNBOOKS = [
  "docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md",
] as const;

export const REAL_MESSAGING_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_REAL_MESSAGING_RC_LOCK_SUMMARY.md",
  ...REAL_MESSAGING_RC_RUNBOOK_PATHS,
  ...REAL_MESSAGING_RC_CROSS_LINK_RUNBOOKS,
  "docs/OPERATIONS_INDEX.md",
] as const;

/** Default — provider env unset → DRY_RUN only; live send blocked until gates pass. */
export const REAL_MESSAGING_LIVE_SEND_DEFAULT_MODE = "DRY_RUN" as const;

export const REAL_MESSAGING_LIVE_SEND_LIMITED_EXECUTION_ENV =
  "EXTERNAL_MESSAGE_LIVE_SEND_ENABLED" as const;

export const REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE =
  "I ACKNOWLEDGE LIVE EXTERNAL MESSAGE SEND" as const;

export const REAL_MESSAGING_LIVE_SEND_RECIPIENT_ALLOWLIST_ENV =
  "EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST" as const;

/** Required keys documented in `.env.example` (completeness gate). */
export const REAL_MESSAGING_RC_ENV_EXAMPLE_KEYS = [
  "EMAIL_PROVIDER",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_FROM_ADDRESS",
  "SENDGRID_API_KEY",
  "KAKAO_PROVIDER",
  "KAKAO_ALIMTALK_API_URL",
  "KAKAO_ALIMTALK_API_KEY",
  "KAKAO_ALIMTALK_SENDER_KEY",
  "EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET",
  "EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET",
  "EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ACTOR_USER_ID",
  "EXTERNAL_MESSAGE_LIVE_SEND_ENABLED",
  "EXTERNAL_MESSAGE_LIVE_SEND_RECIPIENT_ALLOWLIST",
] as const;

/** Phase 18-B redelivery cross-link */
export const REAL_MESSAGING_RC_PHASE18B_CROSS_LINK = {
  redeliveryRunbook: "docs/operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md",
  reliabilityMasterVerify: "verify:aibeopchin-reliability-rc",
  retryJobsConsolePath: "/admin/operations/retry-jobs",
} as const;

/** Phase 19-B redaction cross-link */
export const REAL_MESSAGING_RC_PHASE19B_CROSS_LINK = {
  redactionRunbook: "docs/operations/AIBEOPCHIN_DATA_REDACTION_RUNBOOK.md",
  dataGovernanceMasterVerify: "verify:aibeopchin-data-governance-rc",
} as const;

/** Phase 15-F secure delivery cross-link */
export const REAL_MESSAGING_RC_PHASE15F_CROSS_LINK = {
  secureDeliveryService: "src/features/secure-document-delivery/secure-document-delivery.service.ts",
  deliveryNotificationService:
    "src/features/document-delivery/case-document-delivery-notification.service.ts",
} as const;

export function isRealMessagingLiveSendEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[REAL_MESSAGING_LIVE_SEND_LIMITED_EXECUTION_ENV]?.trim() === "true";
}

export function parseRealMessagingLiveSendRecipientAllowlist(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const raw = env[REAL_MESSAGING_LIVE_SEND_RECIPIENT_ALLOWLIST_ENV]?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
