/**
 * Product Phase 20-D — Provider webhook status mapping (ExternalMessageLog · delivery prep).
 */
import type {
  CaseDocumentDeliveryStatus,
  ExternalMessageStatus,
} from "@prisma/client";
import type { ExternalMessageProviderDeliveryStatus } from "./external-message-webhook.schema";

export const REAL_MESSAGING_WEBHOOK_STATUS_MAPPER_MARKER_PHASE20D =
  "phase20d-real-messaging-webhook-status-mapper" as const;

export type ExternalMessageWebhookStatusMapping = {
  externalMessageStatus: ExternalMessageStatus;
  deliveryStatusPrep: CaseDocumentDeliveryStatus | null;
  failureReason: string | null;
  providerDeliveryStatus: ExternalMessageProviderDeliveryStatus;
  terminal: boolean;
};

export function mapProviderWebhookStatus(
  providerStatus: ExternalMessageProviderDeliveryStatus,
): ExternalMessageWebhookStatusMapping {
  switch (providerStatus) {
    case "SENT":
      return {
        externalMessageStatus: "SENT",
        deliveryStatusPrep: "SENT",
        failureReason: null,
        providerDeliveryStatus: providerStatus,
        terminal: false,
      };
    case "DELIVERED":
      return {
        externalMessageStatus: "SENT",
        deliveryStatusPrep: "SENT",
        failureReason: null,
        providerDeliveryStatus: providerStatus,
        terminal: true,
      };
    case "READ":
      return {
        externalMessageStatus: "SENT",
        deliveryStatusPrep: "VIEWED",
        failureReason: null,
        providerDeliveryStatus: providerStatus,
        terminal: true,
      };
    case "FAILED":
      return {
        externalMessageStatus: "FAILED",
        deliveryStatusPrep: "FAILED",
        failureReason: "Provider delivery failed",
        providerDeliveryStatus: providerStatus,
        terminal: true,
      };
    case "BOUNCED":
      return {
        externalMessageStatus: "FAILED",
        deliveryStatusPrep: "FAILED",
        failureReason: "BOUNCED",
        providerDeliveryStatus: providerStatus,
        terminal: true,
      };
    case "REJECTED":
      return {
        externalMessageStatus: "FAILED",
        deliveryStatusPrep: "FAILED",
        failureReason: "REJECTED",
        providerDeliveryStatus: providerStatus,
        terminal: true,
      };
    default:
      return {
        externalMessageStatus: "FAILED",
        deliveryStatusPrep: "FAILED",
        failureReason: "UNKNOWN_PROVIDER_STATUS",
        providerDeliveryStatus: providerStatus,
        terminal: true,
      };
  }
}

export function isWebhookFailureStatus(
  providerStatus: ExternalMessageProviderDeliveryStatus,
): boolean {
  return providerStatus === "FAILED" || providerStatus === "BOUNCED" || providerStatus === "REJECTED";
}
