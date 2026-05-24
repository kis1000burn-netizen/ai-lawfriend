/**
 * Phase 13-H — Litigation Operations Integration AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { LITIGATION_AUDIT_ENTITY_TYPE } from "./document-extraction-audit";

export const PHASE13H_LITIGATION_OPERATIONS_AUDIT_MARKER =
  "PHASE13H_LITIGATION_OPERATIONS_AUDIT" as const;

export async function auditLitigationOpsSyncCompleted(params: {
  actorUserId: string;
  caseId: string;
  revision: number;
  deadlinesCreated: number;
  tasksCreated: number;
  supplementDraftsCreated: number;
  draftContextsCreated: number;
  reviewDecisionIds: string[];
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_OPS_SYNC_COMPLETED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.caseId,
    message: "Document Intelligence 운영 연동 동기화 완료",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      deadlinesCreated: params.deadlinesCreated,
      tasksCreated: params.tasksCreated,
      supplementDraftsCreated: params.supplementDraftsCreated,
      draftContextsCreated: params.draftContextsCreated,
      reviewDecisionIds: params.reviewDecisionIds,
    },
  });
}

export async function auditLitigationOpsDeadlineCreated(params: {
  actorUserId: string;
  caseId: string;
  deadlineId: string;
  reviewDecisionId: string;
  sourceItemId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_OPS_DEADLINE_CREATED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.deadlineId,
    message: "검토 확정 기한 → LitigationDeadline 생성",
    metadata: params,
  });
}

export async function auditLitigationOpsTaskCreated(params: {
  actorUserId: string;
  caseId: string;
  taskId: string;
  reviewDecisionId: string;
  sourceItemId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_OPS_TASK_CREATED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.taskId,
    message: "검토 확정 항목 → LitigationTask 생성",
    metadata: params,
  });
}

export async function auditLitigationOpsSupplementCreated(params: {
  actorUserId: string;
  caseId: string;
  supplementRequestId: string;
  reviewDecisionId: string;
  sourceItemId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_OPS_SUPPLEMENT_CREATED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.supplementRequestId,
    message: "검토 확정 항목 → SupplementRequest 초안 생성",
    metadata: params,
  });
}

export async function auditLitigationOpsDraftContextCreated(params: {
  actorUserId: string;
  caseId: string;
  draftContextId: string;
  reviewDecisionIds: string[];
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_OPS_DRAFT_CONTEXT_CREATED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.draftContextId,
    message: "검토 확정 항목 → 준비서면 draft context 생성",
    metadata: params,
  });
}
