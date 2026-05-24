/**
 * Phase 14-B — Command Center action AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";

export const LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE =
  "LITIGATION_COMMAND_CENTER" as const;

export const PHASE14B_LITIGATION_COMMAND_CENTER_AUDIT_MARKER =
  "PHASE14B_LITIGATION_COMMAND_CENTER_AUDIT" as const;

export async function auditCommandCenterTaskUpdated(params: {
  actorUserId: string;
  caseId: string;
  taskId: string;
  fromStatus: string;
  toStatus: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
    entityType: LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
    entityId: params.taskId,
    message: "소송 지휘실 — 업무 상태 변경",
    metadata: params,
  });
}

export async function auditCommandCenterDeadlineUpdated(params: {
  actorUserId: string;
  caseId: string;
  deadlineId: string;
  patch: Record<string, unknown>;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CMD_CENTER_DEADLINE_UPDATED",
    entityType: LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
    entityId: params.deadlineId,
    message: "소송 지휘실 — 기일·마감 변경",
    metadata: params,
  });
}

export async function auditCommandCenterSupplementSent(params: {
  actorUserId: string;
  caseId: string;
  supplementRequestId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT",
    entityType: LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
    entityId: params.supplementRequestId,
    message: "소송 지휘실 — 보완요청 발송(DRAFT→SENT)",
    metadata: params,
  });
}

export async function auditCommandCenterSupplementReviewStarted(params: {
  actorUserId: string;
  caseId: string;
  supplementRequestId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CMD_CENTER_SUPPLEMENT_REVIEW_STARTED",
    entityType: LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
    entityId: params.supplementRequestId,
    message: "소송 지휘실 — 보완요청 재검토 시작(CLIENT_RESPONDED→UNDER_REVIEW)",
    metadata: params,
  });
}

export async function auditCommandCenterDraftGenerated(params: {
  actorUserId: string;
  caseId: string;
  draftContextId: string;
  documentId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CMD_CENTER_DRAFT_GENERATED",
    entityType: LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
    entityId: params.draftContextId,
    message: "소송 지휘실 — 준비서면 컨텍스트에서 초안 생성",
    metadata: params,
  });
}
