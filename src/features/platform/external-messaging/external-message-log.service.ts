/**
 * Product Phase 20-B/20-C — ExternalMessageLog SENT/FAILED recording (19-B redaction).
 */
import type { ExternalMessageStatus, CaseDocumentDeliveryChannel } from "@prisma/client";
import { createExternalMessageLogRow } from "@/features/secure-document-delivery/secure-document-delivery.repository";
import type { ExternalMessageSendPayload, ExternalMessageChannel } from "./external-message-adapter.schema";
import type { ExternalMessageProviderResult, ExternalMessageProviderResultStatus } from "./external-message-adapter-result";
import {
  buildExternalMessageLogSafeSummary,
  sendExternalMessageViaAdapter,
} from "./external-message-adapter.service";

export const REAL_MESSAGING_LOG_SERVICE_MARKER_PHASE20B =
  "phase20b-real-messaging-log-service" as const;

export const REAL_MESSAGING_LOG_SERVICE_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-log-service" as const;

export function mapExternalMessageChannelToDeliveryChannel(
  channel: ExternalMessageChannel,
): CaseDocumentDeliveryChannel {
  if (channel === "KAKAO") return "KAKAO_ALIMTALK";
  if (channel === "EMAIL") return "EMAIL";
  return "IN_APP";
}

export function mapProviderResultToExternalMessageLogStatus(
  status: ExternalMessageProviderResultStatus,
): ExternalMessageStatus {
  switch (status) {
    case "SENT":
      return "SENT";
    case "FAILED":
      return "FAILED";
    case "SKIPPED":
      return "SKIPPED_NO_CONSENT";
    case "DRY_RUN":
      return "SENT";
    default:
      return "FAILED";
  }
}

export function resolveExternalMessageLogFailureReason(
  result: ExternalMessageProviderResult,
): string | null {
  if (result.status !== "FAILED") {
    return null;
  }
  const safeMessage = result.rawProviderResponseRedacted?.safeMessage;
  if (typeof safeMessage === "string" && safeMessage.trim()) {
    return safeMessage.slice(0, 500);
  }
  if (result.providerStatusCode) {
    return result.providerStatusCode.slice(0, 200);
  }
  return "External message send failed";
}

export async function recordExternalMessageAdapterResult(input: {
  caseId: string;
  recipientUserId: string;
  deliveryId?: string | null;
  payload: ExternalMessageSendPayload;
  result: ExternalMessageProviderResult;
}) {
  const payloadSummaryJson = buildExternalMessageLogSafeSummary(input.payload, input.result);
  const status = mapProviderResultToExternalMessageLogStatus(input.result.status);
  const channel = mapExternalMessageChannelToDeliveryChannel(input.payload.channel);

  return createExternalMessageLogRow({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    deliveryId: input.deliveryId ?? null,
    channel,
    provider: input.result.provider,
    templateCode: input.payload.template.templateKey,
    payloadSummaryJson,
    status,
    failureReason: resolveExternalMessageLogFailureReason(input.result),
    sentAt: status === "SENT" ? new Date() : null,
  });
}

export async function sendAndRecordExternalMessage(input: {
  payload: ExternalMessageSendPayload;
  caseId: string;
  recipientUserId: string;
  deliveryId?: string | null;
}) {
  const result = await sendExternalMessageViaAdapter(input.payload);
  const log = await recordExternalMessageAdapterResult({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    deliveryId: input.deliveryId,
    payload: input.payload,
    result,
  });
  return { result, log };
}
