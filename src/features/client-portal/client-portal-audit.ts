/**
 * Phase 15-A — Client portal audit helpers.
 */
import { writeAuditLog } from "@/lib/audit-log";

export const CLIENT_PORTAL_AUDIT_ENTITY_TYPE = "CLIENT_PORTAL" as const;

export async function auditClientPortalAccess(params: {
  actorUserId: string;
  caseId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CLIENT_PORTAL_ACCESS",
    entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
    entityId: params.caseId,
    message: "의뢰인 포털 접근",
    metadata: params,
  });
}

export async function auditClientSubmissionSubmitted(params: {
  actorUserId: string;
  caseId: string;
  submissionId: string;
  supplementRequestId?: string | null;
  fileCount: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CLIENT_SUBMISSION_SUBMITTED",
    entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
    entityId: params.submissionId,
    message: "의뢰인 제출 자료·답변 제출",
    metadata: params,
  });
}

export async function auditClientSubmissionReviewed(params: {
  actorUserId: string;
  caseId: string;
  submissionId: string;
  toStatus: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CLIENT_SUBMISSION_REVIEWED",
    entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
    entityId: params.submissionId,
    message: "의뢰인 제출 자료 검토 처리",
    metadata: params,
  });
}

export async function auditCaseConversationMessage(params: {
  actorUserId: string;
  caseId: string;
  messageId: string;
  threadId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CASE_CONVERSATION_MESSAGE_SENT",
    entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
    entityId: params.messageId,
    message: "사건 단위 대화 메시지 전송",
    metadata: params,
  });
}

export async function auditClientPortalFileUpload(params: {
  actorUserId: string;
  caseId: string;
  uploadedFileId: string;
  submissionId?: string | null;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CLIENT_PORTAL_FILE_UPLOAD",
    entityType: CLIENT_PORTAL_AUDIT_ENTITY_TYPE,
    entityId: params.uploadedFileId,
    message: "의뢰인 포털 파일 업로드",
    metadata: params,
  });
}
