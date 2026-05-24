/**
 * Product Phase 21-D — Notification center + web push dispatch preparation.
 */
import type { ExternalMessageSendSurface } from "@/features/platform/external-messaging/external-message-adapter.schema";
import { SECURE_DELIVERY_TEMPLATE_BY_SURFACE } from "@/features/platform/external-messaging/secure-delivery-message-builder";
import { createExternalMessageLogRow } from "@/features/secure-document-delivery/secure-document-delivery.repository";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { assertClientPortalUser } from "./client-portal.policy";
import {
  assertClientPortalPushPayloadSafe,
  buildClientPortalPushPayload,
  evaluateClientPortalWebPushConsent,
  isClientPortalWebPushLiveSendEnabled,
  resolveClientPortalVapidPublicKey,
  type ClientPortalPushDispatchResult,
} from "./client-portal-push-notification.policy";
import {
  countClientPushSubscriptions,
  deleteAllClientPushSubscriptions,
  deleteClientPushSubscription,
  getClientNotificationPreferenceForPortal,
  listExternalMessageLogsForNotificationCenter,
  listClientPushSubscriptions,
  updateClientNotificationPreferenceForPortal,
  upsertClientPushSubscription,
} from "./client-portal-push-notification.repository";

export const CLIENT_PORTAL_NOTIFICATION_CENTER_MARKER_PHASE21D =
  "phase21d-client-portal-notification-center" as const;

const SURFACE_LABELS: Record<ExternalMessageSendSurface, string> = {
  DOCUMENT_DELIVERY: "공유 문서",
  SUPPLEMENT_REQUEST: "보완 요청",
  COURT_DEADLINE_REMINDER: "기일 알림",
  CLIENT_PORTAL_MESSAGE: "포털 메시지",
  SYSTEM_NOTICE: "시스템 안내",
};

function readSummaryString(summary: Record<string, unknown>, key: string): string | null {
  const value = summary[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function resolveSurfaceFromTemplate(templateCode: string | null | undefined): ExternalMessageSendSurface | null {
  if (!templateCode) return null;
  const entry = Object.entries(SECURE_DELIVERY_TEMPLATE_BY_SURFACE).find(
    ([, code]) => code === templateCode,
  );
  return (entry?.[0] as ExternalMessageSendSurface | undefined) ?? null;
}

export async function getClientPortalPushSurfaceState(userId: string) {
  const [prefs, subscriptions] = await Promise.all([
    getClientNotificationPreferenceForPortal(userId),
    listClientPushSubscriptions(userId),
  ]);

  return {
    vapidPublicKey: resolveClientPortalVapidPublicKey(),
    liveSendEnabled: isClientPortalWebPushLiveSendEnabled(),
    preferences: {
      webPushOptIn: prefs.webPushOptIn,
      kakaoOptIn: prefs.kakaoOptIn,
      emailOptIn: prefs.emailOptIn,
      documentShareNoticeEnabled: prefs.documentShareNoticeEnabled,
      litigationDeadlineReminderEnabled: prefs.litigationDeadlineReminderEnabled,
    },
    subscriptions,
  };
}

export async function registerClientPortalPushSubscription(
  userId: string,
  input: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string | null;
  },
) {
  const prefs = await getClientNotificationPreferenceForPortal(userId);
  if (!prefs.webPushOptIn) {
    await updateClientNotificationPreferenceForPortal(userId, { webPushOptIn: true });
  }

  return upsertClientPushSubscription({
    userId,
    endpoint: input.endpoint,
    p256dh: input.p256dh,
    auth: input.auth,
    userAgent: input.userAgent,
  });
}

export async function unregisterClientPortalPushSubscription(userId: string, endpoint: string) {
  return deleteClientPushSubscription(userId, endpoint);
}

export async function disableClientPortalWebPush(userId: string) {
  await deleteAllClientPushSubscriptions(userId);
  return updateClientNotificationPreferenceForPortal(userId, { webPushOptIn: false });
}

export async function updateClientPortalNotificationPreferences(
  userId: string,
  data: {
    webPushOptIn?: boolean;
    kakaoOptIn?: boolean;
    emailOptIn?: boolean;
    documentShareNoticeEnabled?: boolean;
    litigationDeadlineReminderEnabled?: boolean;
  },
) {
  if (data.webPushOptIn === false) {
    await deleteAllClientPushSubscriptions(userId);
  }
  return updateClientNotificationPreferenceForPortal(userId, data);
}

export async function listClientPortalNotificationCenterItems(currentUser: SessionUser) {
  assertClientPortalUser(currentUser);

  const rows = await listExternalMessageLogsForNotificationCenter(currentUser.id);
  return rows.map((row) => {
    const summary =
      row.payloadSummaryJson && typeof row.payloadSummaryJson === "object"
        ? (row.payloadSummaryJson as Record<string, unknown>)
        : {};
    const surface = resolveSurfaceFromTemplate(row.templateCode);
    const portalPath = readSummaryString(summary, "portalPath");
    const noticeBody = readSummaryString(summary, "noticeBody");

    return {
      id: row.id,
      caseId: row.caseId,
      channel: row.channel,
      status: row.status,
      surface,
      surfaceLabel: surface ? SURFACE_LABELS[surface] : "알림",
      title: noticeBody?.replace(/^\[AI법친\]\s*/, "") ?? "포털 알림",
      portalPath,
      createdAt: row.createdAt.toISOString(),
      sentAt: row.sentAt?.toISOString() ?? null,
      metadataOnly: summary.metadataOnly === true,
    };
  });
}

export async function recordClientPortalNotificationCenterInAppEntry(input: {
  caseId: string;
  recipientUserId: string;
  surface: ExternalMessageSendSurface;
  portalPath: string;
  entityId: string;
}) {
  const noticeBody = buildClientPortalPushPayload({
    caseId: input.caseId,
    surface: input.surface,
    portalPath: input.portalPath,
    entityId: input.entityId,
  }).body;

  return createExternalMessageLogRow({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    channel: "IN_APP",
    provider: "CLIENT_PORTAL",
    templateCode: SECURE_DELIVERY_TEMPLATE_BY_SURFACE[input.surface],
    payloadSummaryJson: {
      metadataOnly: true,
      noticeBody: `[AI법친] ${noticeBody}`,
      portalPath: input.portalPath,
      templateKey: SECURE_DELIVERY_TEMPLATE_BY_SURFACE[input.surface],
      surface: input.surface,
      entityId: input.entityId,
    },
    status: "SENT",
    sentAt: new Date(),
  });
}

export async function prepareClientPortalWebPushDispatch(input: {
  caseId: string;
  recipientUserId: string;
  surface: ExternalMessageSendSurface;
  portalPath: string;
  entityId: string;
  webPushOptIn: boolean;
  permission?: "granted" | "denied" | "default" | "unsupported";
}): Promise<ClientPortalPushDispatchResult> {
  if (!isClientPortalWebPushLiveSendEnabled()) {
    return { status: "SKIPPED_LIVE_SEND_OFF" };
  }

  const consent = evaluateClientPortalWebPushConsent({
    webPushOptIn: input.webPushOptIn,
    permission: input.permission ?? "granted",
  });
  if (!consent.allowed) {
    return { status: "SKIPPED_NO_CONSENT" };
  }

  const subscriptionCount = await countClientPushSubscriptions(input.recipientUserId);
  if (subscriptionCount === 0) {
    return { status: "SKIPPED_NO_SUBSCRIPTION" };
  }

  const payload = buildClientPortalPushPayload({
    caseId: input.caseId,
    surface: input.surface,
    portalPath: input.portalPath,
    entityId: input.entityId,
  });
  assertClientPortalPushPayloadSafe(payload);

  return { status: "PREPARED", payload, subscriptionCount };
}
