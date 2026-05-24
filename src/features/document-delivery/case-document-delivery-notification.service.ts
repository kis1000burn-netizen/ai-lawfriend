/**
 * Product Phase 20-E — CaseDocumentDelivery → ExternalMessageLog integration.
 */
import type { CaseDocumentDeliveryChannel } from "@prisma/client";
import { KAKAO_DOCUMENT_NOTICE_BODY } from "@/features/secure-document-delivery/secure-document-delivery.schema";
import {
  buildSecureDeliveryPortalPath,
} from "@/features/platform/external-messaging/secure-delivery-message-builder";
import {
  dispatchSecureDeliveryExternalMessage,
  type SecureDeliveryDispatchResult,
} from "@/features/platform/external-messaging/secure-delivery-message.service";
import type { SecureDeliveryNotificationPrefs } from "@/features/platform/external-messaging/secure-delivery-message-policy";

export const REAL_MESSAGING_CASE_DOCUMENT_DELIVERY_NOTIFICATION_MARKER_PHASE20E =
  "phase20e-case-document-delivery-notification" as const;

export async function dispatchCaseDocumentDeliveryNotification(input: {
  caseId: string;
  recipientUserId: string;
  deliveryId: string;
  channel: CaseDocumentDeliveryChannel;
  shareId: string;
  documentTitle: string;
  templateCode?: string;
  prefs: SecureDeliveryNotificationPrefs;
  auditActorUserId: string;
  portalPath?: string;
}): Promise<SecureDeliveryDispatchResult> {
  const portalPath =
    input.portalPath ??
    buildSecureDeliveryPortalPath({
      caseId: input.caseId,
      surface: "DOCUMENT_DELIVERY",
      entityId: input.shareId,
    });

  return dispatchSecureDeliveryExternalMessage({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    deliveryId: input.deliveryId,
    channel: input.channel,
    surface: "DOCUMENT_DELIVERY",
    portalPath,
    entityId: input.deliveryId,
    templateKey: input.templateCode ?? "CLIENT_DOC_SHARE_V1",
    variables: {
      noticeBody: KAKAO_DOCUMENT_NOTICE_BODY,
      documentTitle: input.documentTitle.slice(0, 200),
    },
    prefs: input.prefs,
    metadataSource: "DOCUMENT_DELIVERY",
    auditActorUserId: input.auditActorUserId,
  });
}
