/**
 * Phase 15-E — Deadline reminder repository.
 */
import { prisma } from "@/lib/prisma";
import type {
  LitigationDeadlineNotificationChannel,
  LitigationDeadlineReminderOffset,
  LitigationDeadlineNotificationStatus,
  UserRole,
} from "@prisma/client";

export async function findDeadlineByIdForCase(caseId: string, deadlineId: string) {
  return prisma.litigationDeadline.findFirst({
    where: { id: deadlineId, caseId },
    include: {
      notifications: true,
    },
  });
}

export async function createManualLitigationDeadline(input: {
  caseId: string;
  title: string;
  description?: string | null;
  dueAt: Date;
  courtName?: string | null;
  hearingKind?: string | null;
  clientVisible: boolean;
  createdByUserId: string;
  sourceItemId: string;
}) {
  return prisma.litigationDeadline.create({
    data: {
      caseId: input.caseId,
      title: input.title,
      description: input.description ?? null,
      dueAt: input.dueAt,
      courtName: input.courtName ?? null,
      hearingKind: input.hearingKind ?? null,
      clientVisible: input.clientVisible,
      sourceItemId: input.sourceItemId,
      sourcePhase: "PHASE_15D",
      createdByUserId: input.createdByUserId,
    },
  });
}

export async function listClientVisibleDeadlines(caseId: string) {
  return prisma.litigationDeadline.findMany({
    where: {
      caseId,
      clientVisible: true,
      status: "OPEN",
      dueAt: { not: null },
    },
    orderBy: { dueAt: "asc" },
  });
}

export async function getOrCreateClientNotificationPreference(userId: string) {
  return prisma.clientNotificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function findExistingNotificationKey(input: {
  deadlineId: string;
  recipientUserId: string;
  channel: LitigationDeadlineNotificationChannel;
  reminderOffset: LitigationDeadlineReminderOffset;
}) {
  return prisma.litigationDeadlineNotification.findUnique({
    where: {
      deadlineId_recipientUserId_channel_reminderOffset: {
        deadlineId: input.deadlineId,
        recipientUserId: input.recipientUserId,
        channel: input.channel,
        reminderOffset: input.reminderOffset,
      },
    },
  });
}

export async function createDeadlineNotification(input: {
  caseId: string;
  deadlineId: string;
  recipientUserId: string;
  recipientRole: UserRole;
  channel: LitigationDeadlineNotificationChannel;
  reminderOffset: LitigationDeadlineReminderOffset;
  scheduledAt: Date;
  status: LitigationDeadlineNotificationStatus;
  failureReason?: string | null;
  createdByUserId: string;
}) {
  return prisma.litigationDeadlineNotification.create({
    data: {
      caseId: input.caseId,
      deadlineId: input.deadlineId,
      recipientUserId: input.recipientUserId,
      recipientRole: input.recipientRole,
      channel: input.channel,
      reminderOffset: input.reminderOffset,
      scheduledAt: input.scheduledAt,
      status: input.status,
      failureReason: input.failureReason ?? null,
      createdByUserId: input.createdByUserId,
    },
  });
}

export async function countDeadlineNotificationsByStatus(deadlineId: string) {
  const rows = await prisma.litigationDeadlineNotification.groupBy({
    by: ["status", "channel"],
    where: { deadlineId },
    _count: { _all: true },
  });

  let scheduledCount = 0;
  let sentCount = 0;
  let kakaoPendingCount = 0;

  for (const row of rows) {
    if (row.status === "SCHEDULED") {
      scheduledCount += row._count._all;
      if (row.channel === "KAKAO_ALIMTALK") {
        kakaoPendingCount += row._count._all;
      }
    }
    if (row.status === "SENT") {
      sentCount += row._count._all;
    }
  }

  return {
    notificationScheduledCount: scheduledCount,
    notificationSentCount: sentCount,
    kakaoPendingCount,
  };
}

export async function listDeadlineNotificationsForCase(caseId: string, deadlineId: string) {
  return prisma.litigationDeadlineNotification.findMany({
    where: { caseId, deadlineId },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
  });
}

export async function findCaseRecipients(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      ownerUserId: true,
      assignedLawyerUserId: true,
      assignedStaffUserId: true,
      courtName: true,
    },
  });
}
