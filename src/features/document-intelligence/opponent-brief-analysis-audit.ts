/**
 * Phase 13-E — opponent brief analysis AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { LITIGATION_AUDIT_ENTITY_TYPE } from "./document-extraction-audit";

export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_AUDIT_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS_AUDIT" as const;

export async function auditLitigationOpponentBriefAnalyzeStarted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_OPPONENT_BRIEF_ANALYZE_STARTED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "상대방 서면 분석 시작",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
    },
  });
}

export async function auditLitigationOpponentBriefAnalyzeCompleted(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  admissionCount: number;
  denialCount: number;
  defenseCount: number;
  clientConfirmationQuestionCount: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_OPPONENT_BRIEF_ANALYZE_COMPLETED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "상대방 서면 분석 완료",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      admissionCount: params.admissionCount,
      denialCount: params.denialCount,
      defenseCount: params.defenseCount,
      clientConfirmationQuestionCount: params.clientConfirmationQuestionCount,
    },
  });
}

export async function auditLitigationOpponentBriefAnalyzeFailed(params: {
  actorUserId: string;
  fileId: string;
  caseId: string;
  revision: number;
  errorMessage: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_OPPONENT_BRIEF_ANALYZE_FAILED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.fileId,
    message: "상대방 서면 분석 실패",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      errorMessage: params.errorMessage,
    },
  });
}
