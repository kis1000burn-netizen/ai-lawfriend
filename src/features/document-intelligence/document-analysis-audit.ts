/**
 * Phase 13-D — analysis AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { LITIGATION_AUDIT_ENTITY_TYPE } from "./document-extraction-audit";

export const PHASE13D_DOCUMENT_ANALYSIS_AUDIT_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_AUDIT" as const;

export async function auditLitigationAnalyzeStarted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_ANALYZE_STARTED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 내용 분석 시작",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
    },
  });
}

export async function auditLitigationAnalyzeCompleted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  claimCount: number;
  riskSignalCount: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_ANALYZE_COMPLETED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 내용 분석 완료",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      claimCount: params.claimCount,
      riskSignalCount: params.riskSignalCount,
    },
  });
}

export async function auditLitigationAnalyzeFailed(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  errorMessage: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_ANALYZE_FAILED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "소송 서류 내용 분석 실패",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      errorMessage: params.errorMessage,
    },
  });
}
