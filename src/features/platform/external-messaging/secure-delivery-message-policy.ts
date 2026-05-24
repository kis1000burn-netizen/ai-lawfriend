/**
 * Product Phase 20-E — Secure delivery consent · safe-link policy.
 */
import type { CaseDocumentDeliveryChannel } from "@prisma/client";
import type { ExternalMessageSendSurface } from "./external-message-adapter.schema";

export const REAL_MESSAGING_SECURE_DELIVERY_POLICY_MARKER_PHASE20E =
  "phase20e-real-messaging-secure-delivery-policy" as const;

export type SecureDeliveryNotificationPrefs = {
  kakaoOptIn: boolean;
  emailOptIn: boolean;
  documentShareNoticeEnabled: boolean;
  litigationDeadlineReminderEnabled?: boolean;
};

export type SecureDeliveryConsentResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export function evaluateSecureDeliveryConsentForChannel(
  channel: CaseDocumentDeliveryChannel,
  prefs: SecureDeliveryNotificationPrefs,
  surface: ExternalMessageSendSurface,
): SecureDeliveryConsentResult {
  if (channel === "IN_APP" || channel === "SMS") {
    if (channel === "SMS") {
      return { allowed: false, reason: "SMS 채널 미지원" };
    }
    return { allowed: true };
  }

  if (surface === "COURT_DEADLINE_REMINDER") {
    if (prefs.litigationDeadlineReminderEnabled === false) {
      return { allowed: false, reason: "의뢰인 기일 알림 수신 거부" };
    }
  } else if (!prefs.documentShareNoticeEnabled) {
    return { allowed: false, reason: "의뢰인 알림 수신 거부" };
  }

  if (channel === "KAKAO_ALIMTALK" && !prefs.kakaoOptIn) {
    return { allowed: false, reason: "카카오 알림톡 미동의" };
  }

  if (channel === "EMAIL" && !prefs.emailOptIn) {
    return { allowed: false, reason: "이메일 알림 미동의" };
  }

  return { allowed: true };
}

export function isExternalDeliveryChannel(
  channel: CaseDocumentDeliveryChannel,
): channel is "EMAIL" | "KAKAO_ALIMTALK" {
  return channel === "EMAIL" || channel === "KAKAO_ALIMTALK";
}

export function assertSecurePortalLinkRequired(
  portalPath: string | undefined,
): SecureDeliveryConsentResult {
  if (!portalPath?.trim()) {
    return { allowed: false, reason: "SAFE_LINK_REQUIRED" };
  }
  if (portalPath.length > 300) {
    return { allowed: false, reason: "PORTAL_PATH_TOO_LONG" };
  }
  return { allowed: true };
}

export const SECURE_DELIVERY_FORBIDDEN_MESSAGE_CONTENT = [
  "documentBody",
  "legalBody",
  "attachment",
  "fileContent",
] as const;
