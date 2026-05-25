/**
 * Product Phase 20-E — Secure delivery → real messaging orchestration.
 */
import { Prisma, type CaseDocumentDeliveryChannel, type ExternalMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";
import { evaluateExternalMessageRedeliveryPolicy } from "@/features/platform/reliability/external-message-redelivery.policy";
import {
  createExternalMessageLogRow,
  updateDeliveryStatus,
} from "@/features/secure-document-delivery/secure-document-delivery.repository";
import type { ExternalMessageSendPayload, ExternalMessageSendSurface } from "./external-message-adapter.schema";
import type { ExternalMessageProviderResult } from "./external-message-adapter-result";
import { buildExternalMessageLogSafeSummary } from "./external-message-adapter.service";
import {
  mapExternalMessageChannelToDeliveryChannel,
  mapProviderResultToExternalMessageLogStatus,
  recordExternalMessageAdapterResult,
  resolveExternalMessageLogFailureReason,
  sendAndRecordExternalMessage,
} from "./external-message-log.service";
import {
  buildSecureDeliveryExternalPayload,
  mapDeliveryChannelToMessageChannel,
} from "./secure-delivery-message-builder";
import {
  assertSecurePortalLinkRequired,
  evaluateSecureDeliveryConsentForChannel,
  isExternalDeliveryChannel,
  type SecureDeliveryNotificationPrefs,
} from "./secure-delivery-message-policy";

export const REAL_MESSAGING_SECURE_DELIVERY_SERVICE_MARKER_PHASE20E =
  "phase20e-real-messaging-secure-delivery-service" as const;

export const SECURE_DELIVERY_MESSAGE_AUDIT_ENTITY_TYPE = "SECURE_DELIVERY_MESSAGE" as const;

export type SecureDeliveryDispatchInput = {
  caseId: string;
  recipientUserId: string;
  deliveryId?: string | null;
  channel: CaseDocumentDeliveryChannel;
  surface: ExternalMessageSendSurface;
  portalPath: string;
  entityId: string;
  templateKey?: string;
  variables?: Record<string, string>;
  prefs: SecureDeliveryNotificationPrefs;
  metadataSource?: "CLIENT_PORTAL" | "COMMAND_CENTER" | "DEADLINE" | "DOCUMENT_DELIVERY";
  auditActorUserId?: string;
};

export type SecureDeliveryDispatchResult = {
  externalMessageLogId: string;
  status: ExternalMessageStatus;
  sent: boolean;
  provider?: string;
  redeliveryEligible: boolean;
  redeliveryBlockReason?: string;
};

async function findRecipientContact(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true, name: true },
  });
}

function buildSkippedResult(
  payload: ExternalMessageSendPayload,
  reason: string,
): ExternalMessageProviderResult {
  return {
    status: "SKIPPED",
    provider: payload.provider,
    channel: payload.channel,
    retryable: false,
    redeliveryEligible: false,
    providerStatusCode: "CONSENT_REQUIRED",
    safeSummary: {
      templateKey: payload.template.templateKey,
      recipientMasked: "(redacted)",
      portalPath: payload.safeLink?.portalPath,
    },
    rawProviderResponseRedacted: {
      safeMessage: reason,
    },
  };
}

export function evaluateSecureDeliveryRedeliveryEligibility(input: {
  logStatus: ExternalMessageStatus;
  channel: CaseDocumentDeliveryChannel;
  failureReason?: string | null;
}): { retryable: boolean; blockReason?: string } {
  const policy = evaluateExternalMessageRedeliveryPolicy({
    logStatus: input.logStatus,
    channel: input.channel,
    failureReason: input.failureReason,
    hasSuccessfulSibling: false,
    hasInFlightRedelivery: false,
    attemptCount: 0,
    maxAttempts: 3,
  });
  return { retryable: policy.retryable, blockReason: policy.blockReason };
}

async function recordSkippedSecureDeliveryLog(input: {
  caseId: string;
  recipientUserId: string;
  deliveryId?: string | null;
  payload: ExternalMessageSendPayload;
  reason: string;
}) {
  const result = buildSkippedResult(input.payload, input.reason);
  const payloadSummaryJson = buildExternalMessageLogSafeSummary(input.payload, result);
  return createExternalMessageLogRow({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    deliveryId: input.deliveryId ?? null,
    channel: mapExternalMessageChannelToDeliveryChannel(input.payload.channel),
    provider: input.payload.provider,
    templateCode: input.payload.template.templateKey,
    payloadSummaryJson,
    status: "SKIPPED_NO_CONSENT",
    failureReason: input.reason.slice(0, 500),
  });
}

async function auditSecureDeliveryDispatch(input: {
  actorUserId: string;
  caseId: string;
  entityId: string;
  surface: ExternalMessageSendSurface;
  channel: CaseDocumentDeliveryChannel;
  externalMessageLogId: string;
  status: ExternalMessageStatus;
}) {
  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: "SECURE_DELIVERY_EXTERNAL_MESSAGE_DISPATCH",
    entityType: SECURE_DELIVERY_MESSAGE_AUDIT_ENTITY_TYPE,
    entityId: input.externalMessageLogId,
    message: `Secure delivery ${input.surface} (${input.channel})`,
    metadata: {
      caseId: input.caseId,
      entityId: input.entityId,
      surface: input.surface,
      channel: input.channel,
      status: input.status,
      metadataOnly: true,
    },
  });
}

export async function dispatchSecureDeliveryExternalMessage(
  input: SecureDeliveryDispatchInput,
): Promise<SecureDeliveryDispatchResult> {
  const linkCheck = assertSecurePortalLinkRequired(input.portalPath);
  if (!linkCheck.allowed) {
    throw new Error(linkCheck.reason);
  }

  const consent = evaluateSecureDeliveryConsentForChannel(
    input.channel,
    input.prefs,
    input.surface,
  );

  const messageChannel = mapDeliveryChannelToMessageChannel(input.channel);
  if (!messageChannel) {
    const summary = redactExternalMessagePayload({
      metadataOnly: true,
      portalPath: input.portalPath,
      surface: input.surface,
      channel: input.channel,
    });
    const log = await createExternalMessageLogRow({
      caseId: input.caseId,
      recipientUserId: input.recipientUserId,
      deliveryId: input.deliveryId ?? null,
      channel: input.channel,
      provider: "IN_APP",
      templateCode: input.templateKey ?? input.surface,
      payloadSummaryJson: summary as Prisma.InputJsonValue,
      status: "SENT",
      sentAt: new Date(),
    });
    return {
      externalMessageLogId: log.id,
      status: "SENT",
      sent: true,
      provider: "IN_APP",
      redeliveryEligible: false,
    };
  }

  const recipient = await findRecipientContact(input.recipientUserId);
  const payload = buildSecureDeliveryExternalPayload({
    surface: input.surface,
    channel: messageChannel,
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    recipient: {
      email: recipient?.email,
      phone: recipient?.phone ?? undefined,
      displayName: recipient?.name ?? undefined,
    },
    portalPath: input.portalPath,
    templateKey: input.templateKey,
    variables: input.variables,
    entityId: input.entityId,
    consentVerified: consent.allowed,
    metadataSource: input.metadataSource,
  });

  if (!consent.allowed) {
    const log = await recordSkippedSecureDeliveryLog({
      caseId: input.caseId,
      recipientUserId: input.recipientUserId,
      deliveryId: input.deliveryId,
      payload,
      reason: consent.reason,
    });

    if (input.deliveryId) {
      await updateDeliveryStatus(input.deliveryId, {
        deliveryStatus: "SKIPPED_NO_CONSENT",
        failureReason: consent.reason,
      });
    }

    return {
      externalMessageLogId: log.id,
      status: "SKIPPED_NO_CONSENT",
      sent: false,
      provider: payload.provider,
      redeliveryEligible: false,
      redeliveryBlockReason: consent.reason,
    };
  }

  const { result, log } = await sendAndRecordExternalMessage({
    payload,
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    deliveryId: input.deliveryId,
  });

  const logStatus = mapProviderResultToExternalMessageLogStatus(result.status);
  const failureReason = resolveExternalMessageLogFailureReason(result);
  const redelivery = evaluateSecureDeliveryRedeliveryEligibility({
    logStatus,
    channel: input.channel,
    failureReason,
  });

  if (input.deliveryId && isExternalDeliveryChannel(input.channel)) {
    if (logStatus === "SENT") {
      await updateDeliveryStatus(input.deliveryId, {
        deliveryStatus: "SENT",
        sentAt: new Date(),
        failureReason: null,
      });
    } else if (logStatus === "FAILED") {
      await updateDeliveryStatus(input.deliveryId, {
        deliveryStatus: "FAILED",
        failureReason: failureReason ?? "External message failed",
      });
    }
  }

  if (input.auditActorUserId) {
    await auditSecureDeliveryDispatch({
      actorUserId: input.auditActorUserId,
      caseId: input.caseId,
      entityId: input.entityId,
      surface: input.surface,
      channel: input.channel,
      externalMessageLogId: log.id,
      status: logStatus,
    });
  }

  return {
    externalMessageLogId: log.id,
    status: logStatus,
    sent: logStatus === "SENT",
    provider: result.provider,
    redeliveryEligible: redelivery.retryable,
    redeliveryBlockReason: redelivery.blockReason,
  };
}

export async function recordExternalMessageLogFromAdapterResult(input: {
  caseId: string;
  recipientUserId: string;
  deliveryId?: string | null;
  payload: ExternalMessageSendPayload;
  result: ExternalMessageProviderResult;
}) {
  return recordExternalMessageAdapterResult(input);
}
