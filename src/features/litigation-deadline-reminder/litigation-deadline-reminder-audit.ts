/**
 * Phase 15-E — Deadline reminder audit.
 */
import { writeAuditLog } from "@/lib/audit-log";

export const LITIGATION_DEADLINE_REMINDER_AUDIT_ENTITY_TYPE =
  "LITIGATION_DEADLINE_REMINDER" as const;

export async function auditManualDeadlineCreated(params: {
  actorUserId: string;
  caseId: string;
  deadlineId: string;
  title: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DEADLINE_MANUAL_CREATED",
    entityType: LITIGATION_DEADLINE_REMINDER_AUDIT_ENTITY_TYPE,
    entityId: params.deadlineId,
    message: "재판기일·마감 수동 등록",
    metadata: params,
  });
}

export async function auditDeadlineNotificationsScheduled(params: {
  actorUserId: string;
  caseId: string;
  deadlineId: string;
  createdCount: number;
  skippedCount: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DEADLINE_NOTIFY_SCHEDULED",
    entityType: LITIGATION_DEADLINE_REMINDER_AUDIT_ENTITY_TYPE,
    entityId: params.deadlineId,
    message: "기일 알림 예약 — 의뢰인·담당자",
    metadata: params,
  });
}

export async function auditDeadlineInAppReminderSent(params: {
  actorUserId: string;
  caseId: string;
  deadlineId: string;
  notificationId: string;
  recipientUserId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DEADLINE_IN_APP_SENT",
    entityType: LITIGATION_DEADLINE_REMINDER_AUDIT_ENTITY_TYPE,
    entityId: params.notificationId,
    message: "기일 앱 내 알림 발송",
    metadata: params,
  });
}
