/**
 * Product Phase 21-F — Client Mobile / PWA RC lock (21-A~E deployment gate SSOT).
 * @see docs/platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md
 */
export const CLIENT_MOBILE_PWA_RC_LOCK_MARKER_PHASE21F =
  "phase21f-client-mobile-pwa-rc-gate" as const;

export const CLIENT_MOBILE_PWA_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC" as const;

export const CLIENT_MOBILE_PWA_RC_VERSION = "21-F.1" as const;

export const CLIENT_MOBILE_PWA_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-client-mobile-rc" as const;

export const CLIENT_MOBILE_PWA_RC_ONE_LINE_CRITERION =
  "모바일 의뢰인 포털, 업로드 UX, PWA 설치, push-ready surface, 접근성·저사양 smoke를 하나의 Client Mobile / PWA RC로 묶어 배포 전 검증·운영 runbook·보안 cache 정책을 잠근다" as const;

export const CLIENT_MOBILE_PWA_RC_SUB_PHASES = {
  "21-A": "Mobile Client Portal Baseline",
  "21-B": "Mobile Upload UX",
  "21-C": "PWA Install / Home Screen",
  "21-D": "Push-ready Notification Surface",
  "21-E": "Mobile Accessibility / Low-end Device Smoke",
  "21-F": "Client Mobile / PWA RC",
} as const;

export const CLIENT_MOBILE_PWA_RC_SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-client-mobile-phase21a",
  "verify:aibeopchin-client-mobile-phase21b",
  "verify:aibeopchin-client-mobile-phase21c",
  "verify:aibeopchin-client-mobile-phase21d",
  "verify:aibeopchin-client-mobile-phase21e",
] as const;

export const CLIENT_MOBILE_PWA_RC_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21A-PORTAL-BASELINE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21B-UPLOAD-UX",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21C-PWA-INSTALL",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21D-PUSH-NOTIFICATION-SURFACE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21E-ACCESSIBILITY-SMOKE",
  CLIENT_MOBILE_PWA_RC_EVIDENCE_TAG,
] as const;

export const CLIENT_MOBILE_PWA_RC_PREREQUISITE_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
] as const;

export const CLIENT_MOBILE_PWA_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PORTAL_BASELINE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_UPLOAD_UX_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_INSTALL_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PUSH_NOTIFICATION_SURFACE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_ACCESSIBILITY_SMOKE_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_RUNBOOK.md",
] as const;

export const CLIENT_MOBILE_PWA_RC_DOCS = [
  "docs/platform/AIBEOPCHIN_CLIENT_MOBILE_PWA_RC_LOCK_SUMMARY.md",
  ...CLIENT_MOBILE_PWA_RC_RUNBOOK_PATHS,
  "docs/OPERATIONS_INDEX.md",
] as const;

/** Web push live send — default OFF until explicit env + bundled RC pass. */
export const CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_DEFAULT_MODE = "OFF" as const;

export const CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_ENV = "CLIENT_PORTAL_WEB_PUSH_LIVE_SEND" as const;

export const CLIENT_MOBILE_PWA_VAPID_PUBLIC_KEY_ENV = "CLIENT_PORTAL_VAPID_PUBLIC_KEY" as const;

export const CLIENT_MOBILE_PWA_RC_ENV_EXAMPLE_KEYS = [
  "CLIENT_PORTAL_VAPID_PUBLIC_KEY",
  "CLIENT_PORTAL_WEB_PUSH_LIVE_SEND",
  "NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE",
] as const;

/** Phase 20 Real Messaging — notification deep link cross-link */
export const CLIENT_MOBILE_PWA_RC_PHASE20F_CROSS_LINK = {
  realMessagingMasterVerify: "verify:aibeopchin-real-messaging-rc",
  secureDeliveryBuilder:
    "src/features/platform/external-messaging/secure-delivery-message-builder.ts",
  mobileDeepLinkPolicy: "src/features/client-portal/client-portal-mobile.policy.ts",
  notificationService: "src/features/client-portal/client-portal-notification.service.ts",
} as const;

/** PWA shell-only cache · sensitive path denylist */
export const CLIENT_MOBILE_PWA_RC_CACHE_POLICY_PATHS = [
  "src/features/client-portal/client-portal-pwa.policy.ts",
  "public/client/sw.js",
  "public/manifest.webmanifest",
] as const;

export const CLIENT_MOBILE_PWA_RC_SENSITIVE_CACHE_DENY_TERMS = [
  "/api/",
  "/client/cases/",
  "shared-documents",
  "messages",
  "attachment",
  "push-subscriptions",
  "notifications",
] as const;

export function isClientMobilePwaPushLiveSendEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CLIENT_MOBILE_PWA_PUSH_LIVE_SEND_ENV]?.trim() === "true";
}
