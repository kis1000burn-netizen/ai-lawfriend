/**
 * Phase 15-E — Court schedule & client reminder service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import {
  canRunLitigationCommandCenterActions,
} from "@/features/document-intelligence/litigation-command-center.policy";
import { assertCanAccessClientPortalCase, assertClientPortalUser } from "@/features/client-portal/client-portal.policy";
import {
  auditDeadlineInAppReminderSent,
  auditDeadlineNotificationsScheduled,
  auditManualDeadlineCreated,
} from "./litigation-deadline-reminder-audit";
import {
  computeReminderScheduledAt,
  createManualDeadlineBodySchema,
  formatClientDeadlineDisplayLine,
  LITIGATION_DEADLINE_REMINDER_VERSION,
  scheduleDeadlineNotificationsBodySchema,
  clientPortalDeadlinesResponseSchema,
  type ClientPortalDeadline,
} from "./litigation-deadline-reminder.schema";
import {
  countDeadlineNotificationsByStatus,
  createDeadlineNotification,
  createManualLitigationDeadline,
  findCaseRecipients,
  findDeadlineByIdForCase,
  findExistingNotificationKey,
  getOrCreateClientNotificationPreference,
  listClientVisibleDeadlines,
} from "./litigation-deadline-reminder.repository";
import type {
  LitigationDeadlineNotificationChannel,
  UserRole,
} from "@prisma/client";
import { randomUUID } from "node:crypto";

export const PHASE15E_LITIGATION_DEADLINE_REMINDER_SERVICE_MARKER =
  "PHASE15E_LITIGATION_DEADLINE_REMINDER_SERVICE" as const;

function assertCanManageDeadlines(access: Awaited<ReturnType<typeof getCaseAccessContext>>) {
  if (!canRunLitigationCommandCenterActions(access)) {
    throw new ForbiddenError("기일 등록·알림 예약 권한이 없습니다.");
  }
}

function channelAllowedForRole(
  channel: LitigationDeadlineNotificationChannel,
  role: UserRole,
  prefs: {
    kakaoOptIn: boolean;
    emailOptIn: boolean;
    litigationDeadlineReminderEnabled: boolean;
  },
): { allowed: boolean; reason?: string } {
  if (role === "USER") {
    if (!prefs.litigationDeadlineReminderEnabled) {
      return { allowed: false, reason: "의뢰인 기일 알림 수신 거부" };
    }
    if (channel === "KAKAO_ALIMTALK" && !prefs.kakaoOptIn) {
      return { allowed: false, reason: "카카오 알림톡 미동의" };
    }
    if (channel === "EMAIL" && !prefs.emailOptIn) {
      return { allowed: false, reason: "이메일 알림 미동의" };
    }
    return { allowed: true };
  }

  if (channel === "IN_APP") {
    return { allowed: true };
  }

  return { allowed: false, reason: "외부 채널은 의뢰인 전용" };
}

async function dispatchInAppIfDue(
  actorUserId: string,
  notification: {
    id: string;
    caseId: string;
    deadlineId: string;
    recipientUserId: string;
    scheduledAt: Date;
  },
) {
  const now = new Date();
  if (notification.scheduledAt > now) {
    return;
  }

  await auditDeadlineInAppReminderSent({
    actorUserId,
    caseId: notification.caseId,
    deadlineId: notification.deadlineId,
    notificationId: notification.id,
    recipientUserId: notification.recipientUserId,
  });

  const { prisma } = await import("@/lib/prisma");
  await prisma.litigationDeadlineNotification.update({
    where: { id: notification.id },
    data: { status: "SENT", sentAt: now },
  });
}

export async function createManualDeadlineService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanManageDeadlines(access);

  const input = createManualDeadlineBodySchema.parse(body);
  const dueAt = new Date(input.dueAt);
  if (Number.isNaN(dueAt.getTime())) {
    throw new ValidationError("유효한 기일 일시가 필요합니다.");
  }

  const deadline = await createManualLitigationDeadline({
    caseId,
    title: input.title,
    description: input.description,
    dueAt,
    courtName: input.courtName ?? null,
    hearingKind: input.hearingKind ?? null,
    clientVisible: input.clientVisible,
    createdByUserId: currentUser.id,
    sourceItemId: `15d-manual-${randomUUID()}`,
  });

  await auditManualDeadlineCreated({
    actorUserId: currentUser.id,
    caseId,
    deadlineId: deadline.id,
    title: deadline.title,
  });

  return { deadlineId: deadline.id, status: deadline.status };
}

export async function scheduleDeadlineClientNotificationsService(
  currentUser: SessionUser,
  caseId: string,
  deadlineId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanManageDeadlines(access);

  const input = scheduleDeadlineNotificationsBodySchema.parse(body ?? {});
  const deadline = await findDeadlineByIdForCase(caseId, deadlineId);
  if (!deadline) {
    throw new NotFoundError("기일을 찾을 수 없습니다.");
  }
  if (!deadline.dueAt) {
    throw new ValidationError("확정된 기일 일시가 있어야 알림을 예약할 수 있습니다.");
  }
  if (deadline.status !== "OPEN") {
    throw new ValidationError("종료된 기일에는 알림을 예약할 수 없습니다.");
  }

  const caseRow = await findCaseRecipients(caseId);
  if (!caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const recipients: Array<{ userId: string; role: UserRole }> = [];
  if (input.notifyClient) {
    recipients.push({ userId: caseRow.ownerUserId, role: "USER" });
  }
  if (input.notifyLawyer && caseRow.assignedLawyerUserId) {
    recipients.push({ userId: caseRow.assignedLawyerUserId, role: "LAWYER" });
  }
  if (input.notifyStaff && caseRow.assignedStaffUserId) {
    recipients.push({ userId: caseRow.assignedStaffUserId, role: "STAFF" });
  }

  let createdCount = 0;
  let skippedCount = 0;
  const createdIds: string[] = [];

  for (const recipient of recipients) {
    const prefs =
      recipient.role === "USER"
        ? await getOrCreateClientNotificationPreference(recipient.userId)
        : {
            kakaoOptIn: false,
            emailOptIn: true,
            litigationDeadlineReminderEnabled: true,
          };

    for (const offset of input.offsets) {
      const scheduledAt = computeReminderScheduledAt(deadline.dueAt, offset);
      if (scheduledAt <= new Date()) {
        skippedCount += 1;
        continue;
      }

      for (const channel of input.channels) {
        const existing = await findExistingNotificationKey({
          deadlineId,
          recipientUserId: recipient.userId,
          channel,
          reminderOffset: offset,
        });
        if (existing) {
          skippedCount += 1;
          continue;
        }

        const gate = channelAllowedForRole(channel, recipient.role, prefs);
        const row = await createDeadlineNotification({
          caseId,
          deadlineId,
          recipientUserId: recipient.userId,
          recipientRole: recipient.role,
          channel,
          reminderOffset: offset,
          scheduledAt,
          status: gate.allowed ? "SCHEDULED" : "SKIPPED_NO_CONSENT",
          failureReason: gate.reason ?? null,
          createdByUserId: currentUser.id,
        });
        createdIds.push(row.id);
        if (gate.allowed) {
          createdCount += 1;
          if (channel === "IN_APP") {
            await dispatchInAppIfDue(currentUser.id, row);
          } else if (channel === "EMAIL" || channel === "KAKAO_ALIMTALK") {
            const { notifyCourtDeadlineReminder } = await import(
              "@/features/client-portal/client-portal-notification.service"
            );
            if (row.scheduledAt <= new Date()) {
              await notifyCourtDeadlineReminder({
                caseId,
                deadlineId,
                notificationId: row.id,
                recipientUserId: recipient.userId,
                deadlineLabel: deadline.title,
                auditActorUserId: currentUser.id,
              });
            }
          }
        } else {
          skippedCount += 1;
        }
      }
    }
  }

  await auditDeadlineNotificationsScheduled({
    actorUserId: currentUser.id,
    caseId,
    deadlineId,
    createdCount,
    skippedCount,
  });

  const summary = await countDeadlineNotificationsByStatus(deadlineId);

  return {
    deadlineId,
    createdCount,
    skippedCount,
    notificationIds: createdIds,
    ...summary,
  };
}

export async function getClientPortalDeadlinesService(
  currentUser: SessionUser,
  caseId: string,
) {
  assertClientPortalUser(currentUser);
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanAccessClientPortalCase(currentUser, access);

  const rows = await listClientVisibleDeadlines(caseId);
  const caseRow = await findCaseRecipients(caseId);
  const caseCourtName = caseRow?.courtName ?? null;
  const now = new Date();

  const deadlines: ClientPortalDeadline[] = rows.map((row, index) =>
    toClientPortalDeadlineFromRow(row, caseCourtName, index === 0),
  );

  const next =
    deadlines.find((d) => d.dueAt && new Date(d.dueAt) >= now) ?? deadlines[0] ?? null;

  return clientPortalDeadlinesResponseSchema.parse({
    caseId,
    version: LITIGATION_DEADLINE_REMINDER_VERSION,
    nextDeadline: next,
    deadlines,
    notice:
      "기일 전 준비자료가 필요한 경우 변호사가 별도 요청할 수 있습니다.",
  });
}

export async function getDeadlineNotificationSummaryForCommandCenter(
  deadlineId: string,
) {
  return countDeadlineNotificationsByStatus(deadlineId);
}

function toClientPortalDeadlineFromRow(
  row: Awaited<ReturnType<typeof listClientVisibleDeadlines>>[number],
  caseCourtName: string | null | undefined,
  isNext: boolean,
): ClientPortalDeadline {
  return {
    id: row.id,
    title: row.title,
    dueAt: row.dueAt?.toISOString() ?? null,
    courtName: row.courtName ?? caseCourtName ?? null,
    hearingKind: row.hearingKind,
    displayLine: formatClientDeadlineDisplayLine({
      dueAt: row.dueAt,
      courtName: row.courtName ?? caseCourtName,
      hearingKind: row.hearingKind,
      title: row.title,
    }),
    isNext,
  };
}

export async function getNextClientVisibleDeadlineForPortalSummary(caseId: string) {
  const rows = await listClientVisibleDeadlines(caseId);
  const now = new Date();
  const upcoming = rows.filter((row) => row.dueAt && row.dueAt >= now);
  const next = upcoming[0] ?? rows[0];
  if (!next) return null;

  const caseRow = await findCaseRecipients(caseId);
  return toClientPortalDeadlineFromRow(next, caseRow?.courtName, true);
}
