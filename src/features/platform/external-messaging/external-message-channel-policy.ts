/**
 * Product Phase 20-A — Channel policy · forbidden send principles.
 */
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";
import { maskEmail, maskPhone } from "@/features/illegal-lending/illegal-lending-mask";

export const REAL_MESSAGING_CHANNEL_POLICY_MARKER_PHASE20A =
  "phase20a-real-messaging-channel-policy" as const;

/** Phase 20-A sealed prohibitions */
export const EXTERNAL_MESSAGE_FORBIDDEN_SEND_RULES = [
  "NO_RAW_PROVIDER_PAYLOAD_PERSIST",
  "NO_LEGAL_BODY_DIRECT_SEND",
  "NO_ATTACHMENT_DIRECT_SEND",
  "NO_SEND_WITHOUT_CONSENT",
  "NO_SEND_WITHOUT_TEMPLATE_KEY",
  "NO_SEND_WITHOUT_IDEMPOTENCY_KEY",
  "NO_RECIPIENT_RAW_LOG",
  "NO_PII_IN_FAILURE_PAYLOAD",
] as const;

const FORBIDDEN_TEMPLATE_VARIABLE_KEYS = [
  "documentBody",
  "attachment",
  "attachmentUrl",
  "fileContent",
  "legalBody",
  "prompt",
  "rawPayload",
] as const;

const FORBIDDEN_TEMPLATE_VARIABLE_PATTERNS = [
  /^https?:\/\/.+\.(pdf|doc|docx|zip)$/i,
];

export function maskExternalMessageRecipient(input: {
  email?: string;
  phone?: string;
  displayName?: string;
}): string {
  if (input.email) {
    return maskEmail(input.email);
  }
  if (input.phone) {
    return maskPhone(input.phone);
  }
  if (input.displayName?.trim()) {
    const name = input.displayName.trim();
    return name.length <= 1 ? "*" : `${name[0]}*`;
  }
  return "미기재";
}

export function validateExternalMessageChannelPolicy(
  payload: ExternalMessageSendPayload,
): { ok: true } | { ok: false; reason: string } {
  if (!payload.template.templateKey?.trim()) {
    return { ok: false, reason: "TEMPLATE_KEY_REQUIRED" };
  }

  if (!payload.metadata.idempotencyKey?.trim()) {
    return { ok: false, reason: "IDEMPOTENCY_KEY_REQUIRED" };
  }

  if (payload.metadata.consentVerified === false) {
    return { ok: false, reason: "CONSENT_REQUIRED" };
  }

  for (const key of Object.keys(payload.template.variables)) {
    const lower = key.toLowerCase();
    if (
      FORBIDDEN_TEMPLATE_VARIABLE_KEYS.some(
        (forbidden) => lower === forbidden.toLowerCase(),
      )
    ) {
      return { ok: false, reason: "FORBIDDEN_TEMPLATE_VARIABLE" };
    }
    const value = payload.template.variables[key];
    if (FORBIDDEN_TEMPLATE_VARIABLE_PATTERNS.some((pattern) => pattern.test(value))) {
      return { ok: false, reason: "ATTACHMENT_DIRECT_SEND_FORBIDDEN" };
    }
  }

  if (payload.channel === "EMAIL" && !payload.recipient.email) {
    return { ok: false, reason: "EMAIL_RECIPIENT_REQUIRED" };
  }

  if (payload.channel === "KAKAO" && !payload.recipient.phone) {
    return { ok: false, reason: "KAKAO_PHONE_REQUIRED" };
  }

  if (
    (payload.channel === "EMAIL" || payload.channel === "KAKAO") &&
    !payload.safeLink?.portalPath
  ) {
    return { ok: false, reason: "SAFE_LINK_REQUIRED_FOR_EXTERNAL_CHANNEL" };
  }

  return { ok: true };
}

export function channelForProvider(provider: string): "EMAIL" | "KAKAO" | "IN_APP" | null {
  if (provider === "DRY_RUN") return null;
  if (provider === "SMTP" || provider === "SENDGRID") return "EMAIL";
  if (provider === "KAKAO_ALIMTALK" || provider === "KAKAO_FRIENDTALK") return "KAKAO";
  return null;
}
