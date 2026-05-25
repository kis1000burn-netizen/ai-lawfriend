/**
 * Product Phase 20-D — Provider webhook status sync service.
 */
import { Prisma, type CaseDocumentDeliveryStatus } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { evaluateExternalMessageRedeliveryPolicy } from "@/features/platform/reliability/external-message-redelivery.policy";
import {
  findExternalMessageLogByProviderMessageId,
  markDeliveryViewed,
  updateDeliveryStatus,
  updateExternalMessageLogRow,
} from "@/features/secure-document-delivery/secure-document-delivery.repository";
import type {
  ExternalMessageWebhookEvent,
  ExternalMessageWebhookProcessResult,
} from "./external-message-webhook.schema";
import {
  isWebhookFailureStatus,
  mapProviderWebhookStatus,
} from "./external-message-webhook-status-mapper";

export const REAL_MESSAGING_WEBHOOK_SERVICE_MARKER_PHASE20D =
  "phase20d-real-messaging-webhook-service" as const;

export const EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ENTITY_TYPE =
  "EXTERNAL_MESSAGE_LOG" as const;

export const EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ACTOR_ENV =
  "EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ACTOR_USER_ID" as const;

const MAX_PROCESSED_WEBHOOK_EVENTS = 20;

type PayloadSummary = {
  metadataOnly?: boolean;
  providerMessageId?: string;
  processedWebhookEventIds?: string[];
  lastProviderDeliveryStatus?: string;
  lastWebhookSyncedAt?: string;
  redeliveryEligible?: boolean;
  redeliveryBlockReason?: string;
};

export function resolveWebhookAuditActorUserId(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  return env[EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ACTOR_ENV]?.trim() || null;
}

export function isWebhookEventAlreadyProcessed(
  payloadSummary: unknown,
  providerEventId: string,
): boolean {
  const summary = (payloadSummary ?? {}) as PayloadSummary;
  const ids = summary.processedWebhookEventIds ?? [];
  return ids.includes(providerEventId);
}

export function mergeWebhookSafePayloadSummary(
  existing: unknown,
  input: {
    providerStatus: string;
    providerEventId: string;
    occurredAt?: string;
    redeliveryEligible: boolean;
    redeliveryBlockReason?: string;
  },
): Prisma.InputJsonValue {
  const summary = (existing ?? {}) as PayloadSummary;
  const processed = summary.processedWebhookEventIds ?? [];
  const nextProcessed = [...processed, input.providerEventId].slice(-MAX_PROCESSED_WEBHOOK_EVENTS);

  const merged: Record<string, unknown> = {
    ...summary,
    metadataOnly: true,
    lastProviderDeliveryStatus: input.providerStatus,
    lastWebhookSyncedAt: input.occurredAt ?? new Date().toISOString(),
    processedWebhookEventIds: nextProcessed,
    redeliveryEligible: input.redeliveryEligible,
    redeliveryBlockReason: input.redeliveryBlockReason,
  };

  return redactExternalMessagePayload(merged) as Prisma.InputJsonValue;
}

export async function prepCaseDocumentDeliveryFromWebhook(input: {
  deliveryId: string;
  sharedDocumentId: string;
  currentDeliveryStatus: CaseDocumentDeliveryStatus;
  deliveryStatusPrep: CaseDocumentDeliveryStatus | null;
  failureReason?: string | null;
  occurredAt: Date;
}): Promise<{ updated: boolean; deliveryStatus: CaseDocumentDeliveryStatus | null }> {
  if (!input.deliveryStatusPrep) {
    return { updated: false, deliveryStatus: null };
  }

  if (
    input.currentDeliveryStatus === "VIEWED" &&
    input.deliveryStatusPrep !== "VIEWED"
  ) {
    return { updated: false, deliveryStatus: input.currentDeliveryStatus };
  }

  if (input.deliveryStatusPrep === "VIEWED") {
    await markDeliveryViewed(input.deliveryId, input.sharedDocumentId, input.occurredAt);
    return { updated: true, deliveryStatus: "VIEWED" };
  }

  if (input.deliveryStatusPrep === "SENT" && input.currentDeliveryStatus === "PENDING") {
    await updateDeliveryStatus(input.deliveryId, {
      deliveryStatus: "SENT",
      sentAt: input.occurredAt,
      failureReason: null,
    });
    return { updated: true, deliveryStatus: "SENT" };
  }

  if (
    input.deliveryStatusPrep === "FAILED" &&
    input.currentDeliveryStatus !== "VIEWED"
  ) {
    await updateDeliveryStatus(input.deliveryId, {
      deliveryStatus: "FAILED",
      failureReason: input.failureReason ?? "Provider delivery failed",
    });
    return { updated: true, deliveryStatus: "FAILED" };
  }

  return { updated: false, deliveryStatus: input.currentDeliveryStatus };
}

export function reevaluateExternalMessageRedeliveryAfterWebhook(input: {
  logStatus: "PENDING" | "SENT" | "FAILED" | "SKIPPED_NO_CONSENT";
  channel: string;
  failureReason?: string | null;
  deliveryStatus?: string | null;
  hasSuccessfulSibling: boolean;
  hasInFlightRedelivery: boolean;
}) {
  return evaluateExternalMessageRedeliveryPolicy({
    logStatus: input.logStatus,
    channel: input.channel as never,
    failureReason: input.failureReason,
    deliveryStatus: input.deliveryStatus,
    hasSuccessfulSibling: input.hasSuccessfulSibling,
    hasInFlightRedelivery: input.hasInFlightRedelivery,
    attemptCount: 0,
    maxAttempts: 3,
  });
}

export async function processExternalMessageWebhookEvent(
  event: ExternalMessageWebhookEvent,
  options?: { auditActorUserId?: string | null },
): Promise<ExternalMessageWebhookProcessResult> {
  const log = await findExternalMessageLogByProviderMessageId(event.providerMessageId);
  if (!log) {
    throw new NotFoundError("ExternalMessageLog not found for providerMessageId.");
  }

  if (isWebhookEventAlreadyProcessed(log.payloadSummaryJson, event.providerEventId)) {
    return {
      ok: true,
      duplicate: true,
      externalMessageLogId: log.id,
      mappedExternalMessageStatus: log.status,
      mappedProviderStatus: event.providerStatus,
      deliveryStatusPrep: null,
      redeliveryEligible: false,
      redeliveryBlockReason: "Duplicate webhook event.",
    };
  }

  const mapping = mapProviderWebhookStatus(event.providerStatus);
  const occurredAt = event.occurredAt ? new Date(event.occurredAt) : new Date();

  const redelivery = reevaluateExternalMessageRedeliveryAfterWebhook({
    logStatus: mapping.externalMessageStatus,
    channel: log.channel,
    failureReason: mapping.failureReason,
    deliveryStatus: log.delivery?.deliveryStatus ?? null,
    hasSuccessfulSibling: false,
    hasInFlightRedelivery: false,
  });

  const payloadSummaryJson = mergeWebhookSafePayloadSummary(log.payloadSummaryJson, {
    providerStatus: event.providerStatus,
    providerEventId: event.providerEventId,
    occurredAt: occurredAt.toISOString(),
    redeliveryEligible: redelivery.retryable,
    redeliveryBlockReason: redelivery.blockReason,
  });

  await updateExternalMessageLogRow(log.id, {
    status: mapping.externalMessageStatus,
    failureReason: isWebhookFailureStatus(event.providerStatus)
      ? mapping.failureReason
      : null,
    payloadSummaryJson,
    sentAt:
      mapping.externalMessageStatus === "SENT" && !log.sentAt ? occurredAt : log.sentAt,
  });

  let deliveryStatusPrep: CaseDocumentDeliveryStatus | null = null;
  if (log.delivery && mapping.deliveryStatusPrep) {
    const prep = await prepCaseDocumentDeliveryFromWebhook({
      deliveryId: log.delivery.id,
      sharedDocumentId: log.delivery.sharedDocumentId,
      currentDeliveryStatus: log.delivery.deliveryStatus,
      deliveryStatusPrep: mapping.deliveryStatusPrep,
      failureReason: mapping.failureReason,
      occurredAt,
    });
    deliveryStatusPrep = prep.deliveryStatus;
  }

  const auditActorUserId =
    options?.auditActorUserId ?? resolveWebhookAuditActorUserId();
  if (auditActorUserId) {
    await writeAuditLog({
      actorUserId: auditActorUserId,
      action: "EXTERNAL_MESSAGE_WEBHOOK_STATUS_SYNC",
      entityType: EXTERNAL_MESSAGE_WEBHOOK_AUDIT_ENTITY_TYPE,
      entityId: log.id,
      message: `Provider webhook status sync (${event.providerStatus})`,
      metadata: {
        provider: event.provider,
        providerMessageId: event.providerMessageId,
        providerEventId: event.providerEventId,
        mappedExternalMessageStatus: mapping.externalMessageStatus,
        mappedProviderStatus: event.providerStatus,
        deliveryStatusPrep,
        redeliveryEligible: redelivery.retryable,
        metadataOnly: true,
      },
    });
  }

  return {
    ok: true,
    duplicate: false,
    externalMessageLogId: log.id,
    mappedExternalMessageStatus: mapping.externalMessageStatus,
    mappedProviderStatus: event.providerStatus,
    deliveryStatusPrep,
    redeliveryEligible: redelivery.retryable,
    redeliveryBlockReason: redelivery.blockReason,
  };
}

export async function processExternalMessageWebhookEvents(
  events: ExternalMessageWebhookEvent[],
  options?: { auditActorUserId?: string | null },
): Promise<ExternalMessageWebhookProcessResult[]> {
  if (events.length === 0) {
    throw new ValidationError("No webhook events to process.");
  }

  const results: ExternalMessageWebhookProcessResult[] = [];
  for (const event of events) {
    results.push(await processExternalMessageWebhookEvent(event, options));
  }
  return results;
}
