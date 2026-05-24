/**
 * Phase 15-F — Secure document sharing & external notice service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { resolveCaseSharedDocumentEffectiveStatus } from "@/lib/data-governance/attachment-lifecycle-policy";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { canRunLitigationCommandCenterActions } from "@/features/document-intelligence/litigation-command-center.policy";
import {
  assertCanAccessClientPortalCase,
  assertClientPortalUser,
} from "@/features/client-portal/client-portal.policy";
import type { CaseDocumentDeliveryChannel } from "@prisma/client";
import {
  auditDocumentDeliverySent,
  auditDocumentDeliverySkipped,
  auditSharedDocumentCreated,
  auditSharedDocumentViewed,
} from "./secure-document-delivery-audit";
import {
  buildSecurePortalPath,
  clientPortalSharedDocumentDetailSchema,
  commandCenterSharedDocumentRowSchema,
  createCaseSharedDocumentBodySchema,
  generateSecureLinkToken,
  hashSecureLinkToken,
  KAKAO_DOCUMENT_NOTICE_BODY,
  markSharedDocumentViewedBodySchema,
  SECURE_DOCUMENT_DELIVERY_VERSION,
  sendKakaoDocumentNoticeBodySchema,
} from "./secure-document-delivery.schema";
import {
  createCaseSharedDocumentRow,
  createDocumentDeliveryRow,
  findCaseClientOwner,
  findDeliveryForShareChannel,
  findLegalDocumentForCase,
  findSharedDocumentForCase,
  getOrCreateClientNotificationPreference,
  listSharedDocumentsForCommandCenter,
  listShareableDocumentsForCase,
  markDeliveryViewed,
  updateDeliveryStatus,
} from "./secure-document-delivery.repository";
import { dispatchCaseDocumentDeliveryNotification } from "@/features/document-delivery/case-document-delivery-notification.service";

export const PHASE15F_SECURE_DOCUMENT_DELIVERY_SERVICE_MARKER =
  "PHASE15F_SECURE_DOCUMENT_DELIVERY_SERVICE" as const;

function assertCanManageSharedDocuments(access: Awaited<ReturnType<typeof getCaseAccessContext>>) {
  if (!canRunLitigationCommandCenterActions(access)) {
    throw new ForbiddenError("문서 공유·알림 발송 권한이 없습니다.");
  }
}

function channelConsentGate(
  channel: CaseDocumentDeliveryChannel,
  prefs: {
    kakaoOptIn: boolean;
    emailOptIn: boolean;
    documentShareNoticeEnabled: boolean;
  },
): { allowed: boolean; reason?: string } {
  if (!prefs.documentShareNoticeEnabled) {
    return { allowed: false, reason: "의뢰인 문서 공유 알림 수신 거부" };
  }
  if (channel === "KAKAO_ALIMTALK" && !prefs.kakaoOptIn) {
    return { allowed: false, reason: "카카오 알림톡 미동의" };
  }
  if (channel === "EMAIL" && !prefs.emailOptIn) {
    return { allowed: false, reason: "이메일 알림 미동의" };
  }
  if (channel === "SMS") {
    return { allowed: false, reason: "SMS 채널 미지원(15-F stub)" };
  }
  return { allowed: true };
}

function buildDocumentPreviewText(document: {
  body: string | null;
  paragraphs: Array<{ title: string; content: string }>;
}): string | null {
  if (document.paragraphs.length > 0) {
    return document.paragraphs
      .map((p) => `${p.title}\n${p.content}`)
      .join("\n\n")
      .slice(0, 4000);
  }
  return document.body?.slice(0, 4000) ?? null;
}

function assertShareAccessible(share: {
  shareStatus: string;
  expiresAt: Date | null;
  sharedWithClientUserId: string;
}, clientUserId: string) {
  if (share.sharedWithClientUserId !== clientUserId) {
    throw new ForbiddenError("해당 공유 문서에 접근할 수 없습니다.");
  }
  if (share.shareStatus !== "ACTIVE") {
    throw new ForbiddenError("공유가 종료된 문서입니다.");
  }
  const effectiveStatus = resolveCaseSharedDocumentEffectiveStatus({
    shareStatus: share.shareStatus,
    expiresAt: share.expiresAt,
  });
  if (effectiveStatus === "EXPIRED") {
    throw new ForbiddenError("공유 링크가 만료되었습니다.");
  }
}

async function recordExternalDeliveryNotification(input: {
  caseId: string;
  recipientUserId: string;
  deliveryId: string;
  channel: CaseDocumentDeliveryChannel;
  templateCode?: string;
  portalPath: string;
  documentTitle: string;
  allowed: boolean;
  reason?: string;
  auditActorUserId: string;
  shareId: string;
}) {
  const prefs = await getOrCreateClientNotificationPreference(input.recipientUserId);
  const dispatch = await dispatchCaseDocumentDeliveryNotification({
    caseId: input.caseId,
    recipientUserId: input.recipientUserId,
    deliveryId: input.deliveryId,
    channel: input.channel,
    shareId: input.shareId,
    documentTitle: input.documentTitle,
    templateCode: input.templateCode,
    prefs,
    auditActorUserId: input.auditActorUserId,
    portalPath: input.portalPath,
  });
  return { log: { id: dispatch.externalMessageLogId }, sent: dispatch.sent as boolean };
}

export async function createCaseSharedDocumentService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanManageSharedDocuments(access);

  const input = createCaseSharedDocumentBodySchema.parse(body ?? {});
  const document = await findLegalDocumentForCase(caseId, input.documentId);
  if (!document) {
    throw new NotFoundError("공유할 문서를 찾을 수 없습니다.");
  }

  const caseRow = await findCaseClientOwner(caseId);
  if (!caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const expiresAt = new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000);
  const { token, hash } = generateSecureLinkToken();

  const share = await createCaseSharedDocumentRow({
    caseId,
    documentId: document.id,
    sharedByUserId: currentUser.id,
    sharedWithClientUserId: caseRow.ownerUserId,
    expiresAt,
  });

  const resolvedPortalPath = buildSecurePortalPath(caseId, share.id);
  const prefs = await getOrCreateClientNotificationPreference(caseRow.ownerUserId);
  const deliveryIds: string[] = [];
  const skipped: Array<{ channel: string; reason: string }> = [];

  for (const channel of input.notifyChannels) {
    const gate = channelConsentGate(channel, prefs);
    const now = new Date();
    const delivery = await createDocumentDeliveryRow({
      caseId,
      sharedDocumentId: share.id,
      documentId: document.id,
      recipientClientUserId: caseRow.ownerUserId,
      deliveryChannel: channel,
      deliveryStatus: gate.allowed
        ? channel === "IN_APP"
          ? "SENT"
          : "PENDING"
        : "SKIPPED_NO_CONSENT",
      secureLinkTokenHash: hash,
      tokenExpiresAt: expiresAt,
      failureReason: gate.reason ?? null,
      createdByUserId: currentUser.id,
      sentAt: gate.allowed && channel === "IN_APP" ? now : null,
    });
    deliveryIds.push(delivery.id);

    if (!gate.allowed) {
      skipped.push({ channel, reason: gate.reason ?? "수신 동의 없음" });
      await auditDocumentDeliverySkipped({
        actorUserId: currentUser.id,
        caseId,
        shareId: share.id,
        deliveryId: delivery.id,
        channel,
        reason: gate.reason ?? "수신 동의 없음",
      });
      await recordExternalDeliveryNotification({
        caseId,
        recipientUserId: caseRow.ownerUserId,
        deliveryId: delivery.id,
        channel,
        portalPath: resolvedPortalPath,
        documentTitle: document.title,
        allowed: false,
        reason: gate.reason,
        auditActorUserId: currentUser.id,
        shareId: share.id,
      });
      continue;
    }

    if (channel === "IN_APP") {
      await auditDocumentDeliverySent({
        actorUserId: currentUser.id,
        caseId,
        shareId: share.id,
        deliveryId: delivery.id,
        channel,
      });
      await recordExternalDeliveryNotification({
        caseId,
        recipientUserId: caseRow.ownerUserId,
        deliveryId: delivery.id,
        channel,
        portalPath: resolvedPortalPath,
        documentTitle: document.title,
        allowed: true,
        auditActorUserId: currentUser.id,
        shareId: share.id,
      });
    }
  }

  await auditSharedDocumentCreated({
    actorUserId: currentUser.id,
    caseId,
    shareId: share.id,
    documentId: document.id,
    recipientUserId: caseRow.ownerUserId,
  });

  return {
    shareId: share.id,
    documentId: document.id,
    documentTitle: document.title,
    version: SECURE_DOCUMENT_DELIVERY_VERSION,
    securePortalPath: resolvedPortalPath,
    accessToken: token,
    tokenExpiresAt: expiresAt.toISOString(),
    deliveryIds,
    skipped,
    notice: KAKAO_DOCUMENT_NOTICE_BODY,
  };
}

export async function sendKakaoDocumentNoticeService(
  currentUser: SessionUser,
  caseId: string,
  shareId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanManageSharedDocuments(access);

  const input = sendKakaoDocumentNoticeBodySchema.parse(body ?? {});
  const share = await findSharedDocumentForCase(caseId, shareId);
  if (!share) {
    throw new NotFoundError("공유 문서를 찾을 수 없습니다.");
  }
  if (share.shareStatus !== "ACTIVE") {
    throw new ValidationError("종료된 공유에는 알림을 보낼 수 없습니다.");
  }

  const prefs = await getOrCreateClientNotificationPreference(share.sharedWithClientUserId);
  const delivery =
    (await findDeliveryForShareChannel(shareId, "KAKAO_ALIMTALK")) ??
    (await createDocumentDeliveryRow({
      caseId,
      sharedDocumentId: share.id,
      documentId: share.documentId,
      recipientClientUserId: share.sharedWithClientUserId,
      deliveryChannel: "KAKAO_ALIMTALK",
      deliveryStatus: "PENDING",
      secureLinkTokenHash: share.deliveries[0]?.secureLinkTokenHash ?? hashSecureLinkToken(share.id),
      tokenExpiresAt: share.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByUserId: currentUser.id,
    }));

  const portalPath = buildSecurePortalPath(caseId, share.id);
  const gate = channelConsentGate("KAKAO_ALIMTALK", prefs);

  if (!gate.allowed) {
    await updateDeliveryStatus(delivery.id, {
      deliveryStatus: "SKIPPED_NO_CONSENT",
      failureReason: gate.reason ?? null,
    });
    const log = await recordExternalDeliveryNotification({
      caseId,
      recipientUserId: share.sharedWithClientUserId,
      deliveryId: delivery.id,
      channel: "KAKAO_ALIMTALK",
      templateCode: input.templateCode,
      portalPath,
      documentTitle: share.document.title,
      allowed: false,
      reason: gate.reason,
      auditActorUserId: currentUser.id,
      shareId,
    });
    await auditDocumentDeliverySkipped({
      actorUserId: currentUser.id,
      caseId,
      shareId,
      deliveryId: delivery.id,
      channel: "KAKAO_ALIMTALK",
      reason: gate.reason ?? "카카오 미동의",
    });

    if (input.fallbackChannel === "IN_APP") {
      const fallbackDelivery = await createDocumentDeliveryRow({
        caseId,
        sharedDocumentId: share.id,
        documentId: share.documentId,
        recipientClientUserId: share.sharedWithClientUserId,
        deliveryChannel: "IN_APP",
        deliveryStatus: "SENT",
        secureLinkTokenHash: delivery.secureLinkTokenHash,
        tokenExpiresAt: delivery.tokenExpiresAt,
        createdByUserId: currentUser.id,
        sentAt: new Date(),
      });
      await auditDocumentDeliverySent({
        actorUserId: currentUser.id,
        caseId,
        shareId,
        deliveryId: fallbackDelivery.id,
        channel: "IN_APP",
      });
    }

    return {
      shareId,
      deliveryId: delivery.id,
      status: "SKIPPED_NO_CONSENT" as const,
      externalMessageLogId: log.log.id,
      fallbackChannel: input.fallbackChannel,
    };
  }

  const result = await recordExternalDeliveryNotification({
    caseId,
    recipientUserId: share.sharedWithClientUserId,
    deliveryId: delivery.id,
    channel: "KAKAO_ALIMTALK",
    templateCode: input.templateCode,
    portalPath,
    documentTitle: share.document.title,
    allowed: true,
    auditActorUserId: currentUser.id,
    shareId,
  });

  if (result.sent) {
    await updateDeliveryStatus(delivery.id, {
      deliveryStatus: "SENT",
      sentAt: new Date(),
      failureReason: null,
    });
  }

  await auditDocumentDeliverySent({
    actorUserId: currentUser.id,
    caseId,
    shareId,
    deliveryId: delivery.id,
    channel: "KAKAO_ALIMTALK",
    externalMessageLogId: result.log.id,
  });

  return {
    shareId,
    deliveryId: delivery.id,
    status: "SENT" as const,
    externalMessageLogId: result.log.id,
    notice: KAKAO_DOCUMENT_NOTICE_BODY,
    portalPath,
  };
}

export async function getClientSharedDocumentDetailService(
  currentUser: SessionUser,
  caseId: string,
  shareId: string,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const share = await findSharedDocumentForCase(caseId, shareId);
  if (!share) {
    throw new NotFoundError("공유 문서를 찾을 수 없습니다.");
  }
  assertShareAccessible(share, currentUser.id);

  return clientPortalSharedDocumentDetailSchema.parse({
    id: share.id,
    documentId: share.documentId,
    title: share.document.title,
    shareStatus: share.shareStatus,
    sharedAt: share.sharedAt.toISOString(),
    expiresAt: share.expiresAt?.toISOString() ?? null,
    firstViewedAt: share.firstViewedAt?.toISOString() ?? null,
    previewText: buildDocumentPreviewText(share.document),
    notice: "본문은 로그인 후에만 열람됩니다. 카카오·외부 메시지에는 파일 원본이 포함되지 않습니다.",
  });
}

export async function markClientSharedDocumentViewedService(
  currentUser: SessionUser,
  caseId: string,
  shareId: string,
  body: unknown,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const input = markSharedDocumentViewedBodySchema.parse(body ?? {});
  const share = await findSharedDocumentForCase(caseId, shareId);
  if (!share) {
    throw new NotFoundError("공유 문서를 찾을 수 없습니다.");
  }
  assertShareAccessible(share, currentUser.id);

  if (input.accessToken) {
    const tokenHash = hashSecureLinkToken(input.accessToken);
    const matched = share.deliveries.some((d) => d.secureLinkTokenHash === tokenHash);
    if (!matched) {
      throw new ForbiddenError("보안 링크 토큰이 유효하지 않습니다.");
    }
  }

  const now = new Date();
  const primaryDelivery =
    share.deliveries.find((d) => d.deliveryStatus === "SENT" || d.deliveryStatus === "PENDING") ??
    share.deliveries[0];

  if (primaryDelivery) {
    await markDeliveryViewed(primaryDelivery.id, share.id, now);
  } else {
    const { prisma } = await import("@/lib/prisma");
    await prisma.caseSharedDocument.update({
      where: { id: share.id },
      data: { firstViewedAt: now },
    });
  }

  await auditSharedDocumentViewed({
    actorUserId: currentUser.id,
    caseId,
    shareId,
    deliveryId: primaryDelivery?.id,
  });

  return {
    shareId,
    viewedAt: now.toISOString(),
    status: "VIEWED" as const,
  };
}

export async function listCommandCenterSharedDocuments(caseId: string) {
  const rows = await listSharedDocumentsForCommandCenter(caseId);
  return rows.map((row) =>
    commandCenterSharedDocumentRowSchema.parse({
      id: row.id,
      documentId: row.documentId,
      documentTitle: row.document.title,
      shareStatus: row.shareStatus,
      sharedAt: row.sharedAt.toISOString(),
      expiresAt: row.expiresAt?.toISOString() ?? null,
      firstViewedAt: row.firstViewedAt?.toISOString() ?? null,
      kakaoPending: row.deliveries.some(
        (d) => d.deliveryChannel === "KAKAO_ALIMTALK" && d.deliveryStatus === "PENDING",
      ),
      kakaoSent: row.deliveries.some(
        (d) => d.deliveryChannel === "KAKAO_ALIMTALK" && d.deliveryStatus === "SENT",
      ),
      inAppSent: row.deliveries.some(
        (d) => d.deliveryChannel === "IN_APP" && d.deliveryStatus === "SENT",
      ),
    }),
  );
}

export async function listCommandCenterShareableDocuments(caseId: string) {
  return listShareableDocumentsForCase(caseId);
}
