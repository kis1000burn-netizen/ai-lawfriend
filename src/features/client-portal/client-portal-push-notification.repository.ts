/**
 * Product Phase 21-D — Push subscription + notification preference repository.
 */
import { prisma } from "@/lib/prisma";
import { getOrCreateClientNotificationPreference } from "@/features/secure-document-delivery/secure-document-delivery.repository";

export const CLIENT_PORTAL_PUSH_REPOSITORY_MARKER_PHASE21D =
  "phase21d-client-portal-push-repository" as const;

export async function listClientPushSubscriptions(userId: string) {
  return prisma.clientPushSubscription.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      endpoint: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function upsertClientPushSubscription(input: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}) {
  return prisma.clientPushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      userId: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
    update: {
      userId: input.userId,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function deleteClientPushSubscription(userId: string, endpoint: string) {
  return prisma.clientPushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function deleteAllClientPushSubscriptions(userId: string) {
  return prisma.clientPushSubscription.deleteMany({ where: { userId } });
}

export async function countClientPushSubscriptions(userId: string) {
  return prisma.clientPushSubscription.count({ where: { userId } });
}

export async function getClientNotificationPreferenceForPortal(userId: string) {
  return getOrCreateClientNotificationPreference(userId);
}

export async function updateClientNotificationPreferenceForPortal(
  userId: string,
  data: {
    webPushOptIn?: boolean;
    kakaoOptIn?: boolean;
    emailOptIn?: boolean;
    documentShareNoticeEnabled?: boolean;
    litigationDeadlineReminderEnabled?: boolean;
  },
) {
  await getOrCreateClientNotificationPreference(userId);
  return prisma.clientNotificationPreference.update({
    where: { userId },
    data,
  });
}

export async function listExternalMessageLogsForNotificationCenter(
  userId: string,
  limit = 50,
) {
  return prisma.externalMessageLog.findMany({
    where: { recipientUserId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      caseId: true,
      channel: true,
      status: true,
      templateCode: true,
      payloadSummaryJson: true,
      createdAt: true,
      sentAt: true,
    },
  });
}
