/**
 * Product Phase 20-D — Provider webhook event schema (metadata only).
 */
import { z } from "zod";

export const REAL_MESSAGING_WEBHOOK_SCHEMA_MARKER_PHASE20D =
  "phase20d-real-messaging-webhook-schema" as const;

export const EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES = [
  "SENT",
  "DELIVERED",
  "FAILED",
  "BOUNCED",
  "REJECTED",
  "READ",
] as const;

export const EXTERNAL_MESSAGE_WEBHOOK_PROVIDERS = [
  "EMAIL",
  "KAKAO_ALIMTALK",
] as const;

export type ExternalMessageProviderDeliveryStatus =
  (typeof EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES)[number];

export type ExternalMessageWebhookProvider =
  (typeof EXTERNAL_MESSAGE_WEBHOOK_PROVIDERS)[number];

export const externalMessageWebhookEventSchema = z.object({
  provider: z.enum(EXTERNAL_MESSAGE_WEBHOOK_PROVIDERS),
  providerMessageId: z.string().trim().min(1).max(200),
  providerEventId: z.string().trim().min(1).max(200),
  providerStatus: z.enum(EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES),
  occurredAt: z.string().datetime().optional(),
});

export type ExternalMessageWebhookEvent = z.infer<typeof externalMessageWebhookEventSchema>;

export type ExternalMessageWebhookProcessResult = {
  ok: true;
  duplicate: boolean;
  externalMessageLogId: string;
  mappedExternalMessageStatus: string;
  mappedProviderStatus: ExternalMessageProviderDeliveryStatus;
  deliveryStatusPrep: string | null;
  redeliveryEligible: boolean;
  redeliveryBlockReason?: string;
};

const FORBIDDEN_WEBHOOK_BODY_KEYS = [
  "email",
  "phone",
  "to",
  "from",
  "recipient",
  "body",
  "html",
  "text",
  "content",
  "attachment",
  "rawPayload",
];

export function assertWebhookBodyHasNoForbiddenRawFields(body: unknown): void {
  if (!body || typeof body !== "object") return;
  for (const key of Object.keys(body as Record<string, unknown>)) {
    if (FORBIDDEN_WEBHOOK_BODY_KEYS.includes(key.toLowerCase())) {
      throw new Error(`WEBHOOK_RAW_FIELD_FORBIDDEN:${key}`);
    }
  }
}

export function parseEmailWebhookEvents(body: unknown): ExternalMessageWebhookEvent[] {
  assertWebhookBodyHasNoForbiddenRawFields(body);
  const rows = Array.isArray(body) ? body : [body];
  const out: ExternalMessageWebhookEvent[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const providerMessageId =
      (typeof record.sg_message_id === "string" && record.sg_message_id) ||
      (typeof record.messageId === "string" && record.messageId) ||
      (typeof record.providerMessageId === "string" && record.providerMessageId);
    const providerEventId =
      (typeof record.sg_event_id === "string" && record.sg_event_id) ||
      (typeof record.eventId === "string" && record.eventId) ||
      (typeof record.id === "string" && record.id);
    const rawStatus =
      (typeof record.event === "string" && record.event) ||
      (typeof record.status === "string" && record.status) ||
      (typeof record.providerStatus === "string" && record.providerStatus);

    if (!providerMessageId || !providerEventId || !rawStatus) continue;

    const providerStatus = normalizeEmailProviderStatus(rawStatus);
    if (!providerStatus) continue;

    out.push(
      externalMessageWebhookEventSchema.parse({
        provider: "EMAIL",
        providerMessageId,
        providerEventId,
        providerStatus,
        occurredAt:
          typeof record.timestamp === "number"
            ? new Date(record.timestamp * 1000).toISOString()
            : typeof record.occurredAt === "string"
              ? record.occurredAt
              : undefined,
      }),
    );
  }

  return out;
}

export function parseKakaoWebhookEvents(body: unknown): ExternalMessageWebhookEvent[] {
  assertWebhookBodyHasNoForbiddenRawFields(body);
  const rows = Array.isArray(body) ? body : [body];
  const out: ExternalMessageWebhookEvent[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const providerMessageId =
      (typeof record.messageId === "string" && record.messageId) ||
      (typeof record.providerMessageId === "string" && record.providerMessageId);
    const providerEventId =
      (typeof record.eventId === "string" && record.eventId) ||
      (typeof record.requestId === "string" && record.requestId) ||
      (typeof record.id === "string" && record.id);
    const rawStatus =
      (typeof record.status === "string" && record.status) ||
      (typeof record.resultCode === "string" && record.resultCode) ||
      (typeof record.providerStatus === "string" && record.providerStatus);

    if (!providerMessageId || !providerEventId || !rawStatus) continue;

    const providerStatus = normalizeKakaoProviderStatus(rawStatus);
    if (!providerStatus) continue;

    out.push(
      externalMessageWebhookEventSchema.parse({
        provider: "KAKAO_ALIMTALK",
        providerMessageId,
        providerEventId,
        providerStatus,
        occurredAt: typeof record.occurredAt === "string" ? record.occurredAt : undefined,
      }),
    );
  }

  return out;
}

export function normalizeEmailProviderStatus(
  raw: string,
): ExternalMessageProviderDeliveryStatus | null {
  const value = raw.trim().toLowerCase();
  if (value === "sent" || value === "processed") return "SENT";
  if (value === "delivered") return "DELIVERED";
  if (value === "bounce" || value === "bounced") return "BOUNCED";
  if (value === "dropped" || value === "rejected") return "REJECTED";
  if (value === "failed" || value === "deferred") return "FAILED";
  if (value === "open" || value === "read") return "READ";
  if (EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES.includes(raw as ExternalMessageProviderDeliveryStatus)) {
    return raw as ExternalMessageProviderDeliveryStatus;
  }
  return null;
}

export function normalizeKakaoProviderStatus(
  raw: string,
): ExternalMessageProviderDeliveryStatus | null {
  const value = raw.trim().toUpperCase();
  if (value === "SUCCESS" || value === "DELIVERED" || value === "SENT") return "DELIVERED";
  if (value === "FAIL" || value === "FAILED") return "FAILED";
  if (value === "BOUNCE" || value === "BOUNCED") return "BOUNCED";
  if (value === "REJECT" || value === "REJECTED") return "REJECTED";
  if (value === "READ") return "READ";
  if (EXTERNAL_MESSAGE_PROVIDER_DELIVERY_STATUSES.includes(raw as ExternalMessageProviderDeliveryStatus)) {
    return raw as ExternalMessageProviderDeliveryStatus;
  }
  return null;
}
