/**
 * Phase 18-B — External message safe re-delivery schemas (metadata only).
 */
import { z } from "zod";

export const RELIABILITY_EXTERNAL_MESSAGE_REDELIVERY_MARKER_PHASE18B =
  "phase18b-external-message-safe-redelivery" as const;

export const externalMessageRedeliveryJobCode = "EXTERNAL_MESSAGE_REDELIVER" as const;

/** Legal-safe payload keys — document body / attachment never re-transmitted */
export const EXTERNAL_MESSAGE_REDELIVERY_SAFE_PAYLOAD_KEYS = [
  "noticeBody",
  "portalPath",
  "documentTitle",
  "containsFileAttachment",
  "templateCode",
  "metadataOnly",
] as const;

export const externalMessageRedeliveryMetaSchema = z.object({
  noticeBody: z.string().max(500),
  portalPath: z.string().max(300),
  documentTitle: z.string().max(200),
  containsFileAttachment: z.literal(false),
  templateCode: z.string().max(100).optional(),
  metadataOnly: z.literal(true),
});

export const operatorExternalMessageRedeliverInputSchema = z.object({
  operatorNote: z.string().max(2000).optional(),
});

export type OperatorExternalMessageRedeliverInput = z.infer<
  typeof operatorExternalMessageRedeliverInputSchema
>;

export type ExternalMessageRedeliveryPreviewDto = {
  externalMessageLogId: string;
  retryJobId: string | null;
  caseId: string;
  channel: string;
  status: string;
  failureReason: string | null;
  retryable: boolean;
  blockReason: string | null;
  duplicateGuardPassed: boolean;
  redeliveryMeta: z.infer<typeof externalMessageRedeliveryMetaSchema>;
};

export type ExternalMessageRedeliveryResultDto = {
  originalLogId: string;
  newLogId: string;
  deliveryId: string | null;
  status: "SENT" | "FAILED" | "SKIPPED_NO_CONSENT";
  retryJobId: string | null;
};
