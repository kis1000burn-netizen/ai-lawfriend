/**
 * Product Phase 20-E — Client portal notifications (supplement · deadline · message).
 * Product Phase 21-D — Notification center IN_APP entry + web push dispatch prep (live send OFF).
 */
import type { CaseDocumentDeliveryChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateClientNotificationPreference } from "@/features/secure-document-delivery/secure-document-delivery.repository";
import {
  buildSecureDeliveryPortalPath,
  SECURE_DELIVERY_NOTICE_BY_SURFACE,
} from "@/features/platform/external-messaging/secure-delivery-message-builder";
import {
  dispatchSecureDeliveryExternalMessage,
  type SecureDeliveryDispatchResult,
} from "@/features/platform/external-messaging/secure-delivery-message.service";
import {
  prepareClientPortalWebPushDispatch,
  recordClientPortalNotificationCenterInAppEntry,
} from "./client-portal-push-notification.service";

export const REAL_MESSAGING_CLIENT_PORTAL_NOTIFICATION_MARKER_PHASE20E =
  "phase20e-client-portal-notification" as const;

export const CLIENT_PORTAL_NOTIFICATION_PUSH_SURFACE_MARKER_PHASE21D =
  "phase21d-client-portal-notification-push-surface" as const;

const EXTERNAL_NOTIFY_CHANNELS: CaseDocumentDeliveryChannel[] = [
  "KAKAO_ALIMTALK",
  "EMAIL",
];

async function dispatchToExternalChannels(input: {
  caseId: string;
  recipientUserId: string;
  surface: "SUPPLEMENT_REQUEST" | "COURT_DEADLINE_REMINDER" | "CLIENT_PORTAL_MESSAGE";
  entityId: string;
  variables?: Record<string, string>;
  auditActorUserId: string;
}): Promise<SecureDeliveryDispatchResult[]> {
  const prefs = await getOrCreateClientNotificationPreference(input.recipientUserId);
  const portalPath = buildSecureDeliveryPortalPath({
    caseId: input.caseId,
    surface: input.surface,
    entityId: input.entityId,
  });

  await recordClientPortalNotificationCenterInAppEntry({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    surface: input.surface,
    portalPath,
    entityId: input.entityId,
  });

  await prepareClientPortalWebPushDispatch({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    surface: input.surface,
    portalPath,
    entityId: input.entityId,
    webPushOptIn: prefs.webPushOptIn,
  });

  const results: SecureDeliveryDispatchResult[] = [];
  for (const channel of EXTERNAL_NOTIFY_CHANNELS) {
    results.push(
      await dispatchSecureDeliveryExternalMessage({
        caseId: input.caseId,
        recipientUserId: input.recipientUserId,
        channel,
        surface: input.surface,
        portalPath,
        entityId: input.entityId,
        variables: {
          noticeBody: SECURE_DELIVERY_NOTICE_BY_SURFACE[input.surface],
          ...input.variables,
        },
        prefs,
        metadataSource:
          input.surface === "COURT_DEADLINE_REMINDER" ? "DEADLINE" : "CLIENT_PORTAL",
        auditActorUserId: input.auditActorUserId,
      }),
    );
  }
  return results;
}

export async function notifySupplementRequestSent(input: {
  caseId: string;
  requestId: string;
  targetUserId: string;
  title: string;
  auditActorUserId: string;
}) {
  return dispatchToExternalChannels({
    caseId: input.caseId,
    recipientUserId: input.targetUserId,
    surface: "SUPPLEMENT_REQUEST",
    entityId: input.requestId,
    variables: {
      documentTitle: input.title.slice(0, 200),
    },
    auditActorUserId: input.auditActorUserId,
  });
}

export async function notifyCourtDeadlineReminder(input: {
  caseId: string;
  deadlineId: string;
  notificationId: string;
  recipientUserId: string;
  deadlineLabel: string;
  auditActorUserId: string;
}) {
  return dispatchToExternalChannels({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    surface: "COURT_DEADLINE_REMINDER",
    entityId: input.notificationId,
    variables: {
      deadlineLabel: input.deadlineLabel.slice(0, 120),
      caseTitle: input.deadlineLabel.slice(0, 200),
    },
    auditActorUserId: input.auditActorUserId,
  });
}

export async function notifyClientPortalMessage(input: {
  caseId: string;
  messageId: string;
  recipientUserId: string;
  auditActorUserId: string;
}) {
  return dispatchToExternalChannels({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    surface: "CLIENT_PORTAL_MESSAGE",
    entityId: input.messageId,
    auditActorUserId: input.auditActorUserId,
  });
}

export async function resolveCaseOwnerUserId(caseId: string): Promise<string | null> {
  const row = await prisma.case.findUnique({
    where: { id: caseId },
    select: { ownerUserId: true },
  });
  return row?.ownerUserId ?? null;
}
