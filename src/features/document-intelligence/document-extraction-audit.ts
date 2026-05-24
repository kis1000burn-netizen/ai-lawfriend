/**
 * Phase 13-B — AuditLog actions for upload/extract lifecycle.
 */
import { writeAuditLog } from "@/lib/audit-log";

export const PHASE13B_DOCUMENT_EXTRACTION_AUDIT_MARKER =
  "PHASE13B_DOCUMENT_EXTRACTION_AUDIT" as const;

export const LITIGATION_AUDIT_ENTITY_TYPE = "LITIGATION_UPLOADED_FILE" as const;

export async function auditLitigationFileUpload(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_FILE_UPLOAD",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류·증거 파일 업로드",
    metadata: {
      caseId: params.caseId,
      originalFileName: params.originalFileName,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
    },
  });
}

export async function auditLitigationExtractStarted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EXTRACT_STARTED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 텍스트 추출 시작",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
    },
  });
}

export async function auditLitigationExtractCompleted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  pageCount: number;
  qualityScore: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EXTRACT_COMPLETED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 텍스트 추출 완료",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      pageCount: params.pageCount,
      qualityScore: params.qualityScore,
    },
  });
}

export async function auditLitigationExtractFailed(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  errorMessage: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EXTRACT_FAILED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 텍스트 추출 실패",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      errorMessage: params.errorMessage,
    },
  });
}

export async function auditLitigationExtractRetry(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  nextRevision: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EXTRACT_RETRY",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 텍스트 추출 재시도",
    metadata: {
      caseId: params.caseId,
      nextRevision: params.nextRevision,
    },
  });
}
