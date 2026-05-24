/**
 * Product Phase 20-B — Email templateKey allowlist (no ad-hoc templates).
 */
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";

export const REAL_MESSAGING_EMAIL_TEMPLATE_ALLOWLIST_MARKER_PHASE20B =
  "phase20b-real-messaging-email-template-allowlist" as const;

export const EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST = [
  "CLIENT_DOC_SHARE_V1",
  "SUPPLEMENT_REQUEST_V1",
  "COURT_DEADLINE_REMINDER_V1",
  "CLIENT_PORTAL_MESSAGE_V1",
  "SYSTEM_NOTICE_V1",
] as const;

export type ExternalMessageEmailTemplateKey =
  (typeof EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST)[number];

export function isEmailTemplateKeyAllowed(templateKey: string): boolean {
  return (EXTERNAL_MESSAGE_EMAIL_TEMPLATE_ALLOWLIST as readonly string[]).includes(
    templateKey,
  );
}

export function validateEmailTemplateAllowlist(
  payload: ExternalMessageSendPayload,
): { ok: true } | { ok: false; reason: string } {
  if (!isEmailTemplateKeyAllowed(payload.template.templateKey)) {
    return { ok: false, reason: "EMAIL_TEMPLATE_KEY_NOT_ALLOWED" };
  }
  return { ok: true };
}
