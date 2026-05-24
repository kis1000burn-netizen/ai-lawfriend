/**
 * Product Phase 20-D — Webhook signature verification (email · kakao).
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const REAL_MESSAGING_WEBHOOK_SIGNATURE_MARKER_PHASE20D =
  "phase20d-real-messaging-webhook-signature" as const;

export const EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET_ENV =
  "EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET" as const;

export const EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET_ENV =
  "EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET" as const;

export type ExternalMessageWebhookSignatureProvider = "email" | "kakao";

function readWebhookSecret(provider: ExternalMessageWebhookSignatureProvider): string | null {
  const key =
    provider === "email"
      ? EXTERNAL_MESSAGE_EMAIL_WEBHOOK_SECRET_ENV
      : EXTERNAL_MESSAGE_KAKAO_WEBHOOK_SECRET_ENV;
  const value = process.env[key]?.trim();
  return value || null;
}

export function computeExternalMessageWebhookSignature(
  secret: string,
  rawBody: string,
): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyExternalMessageWebhookSignature(input: {
  provider: ExternalMessageWebhookSignatureProvider;
  rawBody: string;
  signatureHeader: string | null;
  secret?: string | null;
}): boolean {
  const secret = input.secret ?? readWebhookSecret(input.provider);
  if (!secret) {
    return false;
  }

  const header = input.signatureHeader?.trim();
  if (!header) {
    return false;
  }

  const expected = computeExternalMessageWebhookSignature(secret, input.rawBody);
  const candidates = header.startsWith("sha256=")
    ? [header.slice("sha256=".length), header]
    : [header, `sha256=${header}`];

  for (const candidate of candidates) {
    const normalized = candidate.startsWith("sha256=") ? candidate.slice(7) : candidate;
    try {
      const left = Buffer.from(normalized, "utf8");
      const right = Buffer.from(expected, "utf8");
      if (left.length === right.length && timingSafeEqual(left, right)) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}
