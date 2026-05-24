/**
 * Phase 13-C — classification AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { LITIGATION_AUDIT_ENTITY_TYPE } from "./document-extraction-audit";

export const PHASE13C_DOCUMENT_CLASSIFICATION_AUDIT_MARKER =
  "PHASE13C_DOCUMENT_CLASSIFICATION_AUDIT" as const;

export async function auditLitigationClassifyStarted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CLASSIFY_STARTED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 문서 분류 시작",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
    },
  });
}

export async function auditLitigationClassifyCompleted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  documentType: string;
  confidence: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CLASSIFY_COMPLETED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 문서 분류 완료",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      documentType: params.documentType,
      confidence: params.confidence,
    },
  });
}

export async function auditLitigationClassifyFailed(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  errorMessage: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_CLASSIFY_FAILED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 문서 분류 실패",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      errorMessage: params.errorMessage,
    },
  });
}
