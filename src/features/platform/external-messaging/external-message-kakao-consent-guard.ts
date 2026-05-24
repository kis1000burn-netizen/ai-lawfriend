/**
 * Product Phase 20-C — Kakao Alimtalk consent guard (stricter than email).
 */
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";

export const REAL_MESSAGING_KAKAO_CONSENT_GUARD_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-consent-guard" as const;

export function validateKakaoAlimtalkConsent(
  payload: ExternalMessageSendPayload,
): { ok: true } | { ok: false; reason: string } {
  if (payload.channel !== "KAKAO") {
    return { ok: false, reason: "KAKAO_CHANNEL_REQUIRED" };
  }

  if (payload.metadata.consentVerified !== true) {
    return { ok: false, reason: "KAKAO_CONSENT_REQUIRED" };
  }

  return { ok: true };
}
