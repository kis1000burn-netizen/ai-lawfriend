/**
 * Phase 18-B — External message safe re-delivery (RetryJob linkage · duplicate guard).
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import { hasMinRole } from "@/lib/auth/roles";
import { KAKAO_DOCUMENT_NOTICE_BODY } from "@/features/secure-document-delivery/secure-document-delivery.schema";
import {
  createExternalMessageLogRow,
  getOrCreateClientNotificationPreference,
  updateDeliveryStatus,
} from "@/features/secure-document-delivery/secure-document-delivery.repository";
import { recordFailedRetryJob } from "./retry-job.service";
import { redactExternalMessagePayload } from "@/lib/data-governance/data-redaction.service";
import {
  externalMessageRedeliveryJobCode,
  type ExternalMessageRedeliveryPreviewDto,
  type ExternalMessageRedeliveryResultDto,
  type OperatorExternalMessageRedeliverInput,
  operatorExternalMessageRedeliverInputSchema,
} from "./external-message-redelivery.schema";
import {
  evaluateExternalMessageRedeliveryPolicy,
  extractSafeRedeliveryMeta,
} from "./external-message-redelivery.policy";

export const RELIABILITY_EXTERNAL_MESSAGE_REDELIVERY_SERVICE_MARKER_PHASE18B =
  "phase18b-external-message-redelivery-service" as const;

function assertPlatformAdmin(user: SessionUser) {
  if (!hasMinRole(user.role, "ADMIN")) {
    throw new ForbiddenError("External message re-delivery requires ADMIN role.");
  }
}

async function loadExternalMessageLog(logId: string) {
  return prisma.externalMessageLog.findUnique({
    where: { id: logId },
    include: {
      delivery: {
        select: {
          id: true,
          deliveryStatus: true,
          deliveryChannel: true,
          sharedDocumentId: true,
        },
      },
    },
  });
}

async function findRetryJobForExternalLog(logId: string) {
  return prisma.retryJob.findUnique({
    where: {
      sourceType_sourceRefId: {
        sourceType: "EXTERNAL_MESSAGE",
        sourceRefId: logId,
      },
    },
  });
}

async function duplicateGuardContext(log: {
  id: string;
  deliveryId: string | null;
  channel: string;
}) {
  if (!log.deliveryId) {
    return { hasSuccessfulSibling: false, hasInFlightRedelivery: false };
  }

  const [successfulSibling, inFlightRetry, siblingLogs] = await Promise.all([
    prisma.externalMessageLog.findFirst({
      where: {
        deliveryId: log.deliveryId,
        channel: log.channel,
        status: "SENT",
        id: { not: log.id },
      },
    }),
    prisma.retryJob.findFirst({
      where: {
        sourceType: "EXTERNAL_MESSAGE",
        sourceRefId: log.id,
        status: { in: ["PENDING_RETRY", "RETRYING"] },
      },
    }),
    prisma.externalMessageLog.findMany({
      where: {
        deliveryId: log.deliveryId,
        channel: log.channel,
        status: "SENT",
      },
      select: { id: true, payloadSummaryJson: true },
    }),
  ]);

  const redeliverySent = siblingLogs.some((row) => {
    const payload = row.payloadSummaryJson as { redeliveryOfLogId?: string } | null;
    return payload?.redeliveryOfLogId === log.id;
  });

  return {
    hasSuccessfulSibling: Boolean(successfulSibling || redeliverySent),
    hasInFlightRedelivery: Boolean(inFlightRetry),
  };
}

export async function syncFailedExternalMessagesToRetryJobs(limit = 50) {
  const failedLogs = await prisma.externalMessageLog.findMany({
    where: { status: "FAILED" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  let created = 0;
  for (const log of failedLogs) {
    const existing = await findRetryJobForExternalLog(log.id);
    if (existing) continue;

    await recordFailedRetryJob({
      sourceType: "EXTERNAL_MESSAGE",
      sourceRefId: log.id,
      jobCode: `${externalMessageRedeliveryJobCode}:${log.channel}`,
      caseId: log.caseId,
      failureReason: log.failureReason ?? "External message delivery failed",
      failurePayload: {
        channel: log.channel,
        deliveryId: log.deliveryId,
        metadataOnly: true,
      },
    });
    created += 1;
  }

  return { scanned: failedLogs.length, created };
}

export async function previewExternalMessageRedelivery(
  externalMessageLogId: string,
): Promise<ExternalMessageRedeliveryPreviewDto> {
  const log = await loadExternalMessageLog(externalMessageLogId);
  if (!log) {
    throw new NotFoundError("External message log not found.");
  }

  const retryJob = await findRetryJobForExternalLog(log.id);
  const dup = await duplicateGuardContext(log);
  const policy = evaluateExternalMessageRedeliveryPolicy({
    logStatus: log.status,
    channel: log.channel,
    failureReason: log.failureReason,
    deliveryStatus: log.delivery?.deliveryStatus ?? null,
    hasSuccessfulSibling: dup.hasSuccessfulSibling,
    hasInFlightRedelivery: dup.hasInFlightRedelivery,
    attemptCount: retryJob?.attemptCount ?? 0,
    maxAttempts: retryJob?.maxAttempts ?? 5,
  });

  const safe = extractSafeRedeliveryMeta(log.payloadSummaryJson);
  if (!safe.ok || !safe.meta) {
    return {
      externalMessageLogId: log.id,
      retryJobId: retryJob?.id ?? null,
      caseId: log.caseId,
      channel: log.channel,
      status: log.status,
      failureReason: log.failureReason,
      retryable: false,
      blockReason: safe.error ?? policy.blockReason ?? "Unsafe payload.",
      duplicateGuardPassed: false,
      redeliveryMeta: {
        noticeBody: KAKAO_DOCUMENT_NOTICE_BODY,
        portalPath: "/client",
        documentTitle: "공유 문서",
        containsFileAttachment: false,
        metadataOnly: true,
      },
    };
  }

  return {
    externalMessageLogId: log.id,
    retryJobId: retryJob?.id ?? null,
    caseId: log.caseId,
    channel: log.channel,
    status: log.status,
    failureReason: log.failureReason,
    retryable: policy.retryable,
    blockReason: policy.blockReason ?? null,
    duplicateGuardPassed: !dup.hasSuccessfulSibling && !dup.hasInFlightRedelivery,
    redeliveryMeta: safe.meta,
  };
}

async function channelConsentAllowed(
  recipientUserId: string,
  channel: "KAKAO_ALIMTALK" | "EMAIL" | "IN_APP" | "SMS",
): Promise<{ allowed: boolean; reason?: string }> {
  const prefs = await getOrCreateClientNotificationPreference(recipientUserId);
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
    return { allowed: false, reason: "SMS 채널 미지원" };
  }
  return { allowed: true };
}

export async function operatorRedeliverExternalMessageService(
  user: SessionUser,
  externalMessageLogId: string,
  input?: OperatorExternalMessageRedeliverInput,
): Promise<ExternalMessageRedeliveryResultDto> {
  assertPlatformAdmin(user);
  operatorExternalMessageRedeliverInputSchema.parse(input ?? {});

  const preview = await previewExternalMessageRedelivery(externalMessageLogId);
  if (!preview.retryable) {
    throw new ValidationError(preview.blockReason ?? "Re-delivery not allowed.");
  }
  if (!preview.duplicateGuardPassed) {
    throw new ValidationError("Duplicate guard blocked re-delivery.");
  }

  const log = await loadExternalMessageLog(externalMessageLogId);
  if (!log) {
    throw new NotFoundError("External message log not found.");
  }

  let retryJob = await findRetryJobForExternalLog(log.id);
  if (!retryJob) {
    retryJob = await recordFailedRetryJob({
      sourceType: "EXTERNAL_MESSAGE",
      sourceRefId: log.id,
      jobCode: `${externalMessageRedeliveryJobCode}:${log.channel}`,
      caseId: log.caseId,
      failureReason: log.failureReason ?? undefined,
    });
  }

  await prisma.retryJob.update({
    where: { id: retryJob.id },
    data: {
      status: "RETRYING",
      resolvedByUserId: user.id,
      operatorNote: input?.operatorNote?.trim() || null,
      attemptCount: { increment: 1 },
      lastAttemptAt: new Date(),
    },
  });

  const consent = await channelConsentAllowed(log.recipientUserId, log.channel);
  const meta = preview.redeliveryMeta;
  const payloadSummaryJson: Prisma.InputJsonValue = redactExternalMessagePayload({
    ...meta,
    redeliveryOfLogId: log.id,
    operatorRedelivery: true,
    redeliveryAttempt: retryJob.attemptCount + 1,
  }) as Prisma.InputJsonValue;

  const now = new Date();

  if (!consent.allowed) {
    const skipped = await createExternalMessageLogRow({
      caseId: log.caseId,
      recipientUserId: log.recipientUserId,
      deliveryId: log.deliveryId,
      channel: log.channel,
      templateCode: log.templateCode,
      payloadSummaryJson,
      status: "SKIPPED_NO_CONSENT",
      failureReason: consent.reason ?? "수신 동의 없음",
    });

    await prisma.retryJob.update({
      where: { id: retryJob.id },
      data: { status: "FAILED", failureReason: consent.reason ?? null },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "EXTERNAL_MESSAGE_REDELIVERY_SKIPPED",
      entityType: "ExternalMessageLog",
      entityId: log.id,
      message: `Re-delivery skipped (consent) for ${log.channel}`,
      metadata: { newLogId: skipped.id, metadataOnly: true },
    });

    return {
      originalLogId: log.id,
      newLogId: skipped.id,
      deliveryId: log.deliveryId,
      status: "SKIPPED_NO_CONSENT",
      retryJobId: retryJob.id,
    };
  }

  const newLog = await createExternalMessageLogRow({
    caseId: log.caseId,
    recipientUserId: log.recipientUserId,
    deliveryId: log.deliveryId,
    channel: log.channel,
    provider: log.channel === "KAKAO_ALIMTALK" ? "KAKAO_ALIMTALK_STUB" : "STUB",
    templateCode: log.templateCode ?? meta.templateCode ?? "CLIENT_DOC_SHARE_V1",
    payloadSummaryJson,
    status: "SENT",
    sentAt: now,
  });

  if (log.deliveryId) {
    await updateDeliveryStatus(log.deliveryId, {
      deliveryStatus: log.channel === "IN_APP" ? "SENT" : "SENT",
      sentAt: now,
      failureReason: null,
    });
  }

  await prisma.retryJob.update({
    where: { id: retryJob.id },
    data: {
      status: "SUCCEEDED",
      resolvedAt: now,
      resolvedByUserId: user.id,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "EXTERNAL_MESSAGE_OPERATOR_REDELIVERED",
    entityType: "ExternalMessageLog",
    entityId: log.id,
    message: `Safe metadata-only re-delivery for ${log.channel} (case ${log.caseId})`,
    metadata: {
      newLogId: newLog.id,
      deliveryId: log.deliveryId,
      retryJobId: retryJob.id,
      metadataOnly: true,
      duplicateGuard: "passed",
    },
  });

  return {
    originalLogId: log.id,
    newLogId: newLog.id,
    deliveryId: log.deliveryId,
    status: "SENT",
    retryJobId: retryJob.id,
  };
}
