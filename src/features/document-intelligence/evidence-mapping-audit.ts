/**
 * Phase 13-F — evidence mapping AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { LITIGATION_AUDIT_ENTITY_TYPE } from "./document-extraction-audit";

export const PHASE13F_EVIDENCE_MAPPING_AUDIT_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_AUDIT" as const;

export async function auditLitigationEvidenceMappingStarted(params: {
  actorUserId: string;
  caseId: string;
  revision: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EVIDENCE_MAPPING_STARTED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.caseId,
    message: "사건 증거 매핑 시작",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
    },
  });
}

export async function auditLitigationEvidenceMappingCompleted(params: {
  actorUserId: string;
  caseId: string;
  revision: number;
  linkCount: number;
  contradictionCount: number;
  missingEvidenceCount: number;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EVIDENCE_MAPPING_COMPLETED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.caseId,
    message: "사건 증거 매핑 완료",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      linkCount: params.linkCount,
      contradictionCount: params.contradictionCount,
      missingEvidenceCount: params.missingEvidenceCount,
    },
  });
}

export async function auditLitigationEvidenceMappingFailed(params: {
  actorUserId: string;
  caseId: string;
  revision: number;
  errorMessage: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EVIDENCE_MAPPING_FAILED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.caseId,
    message: "사건 증거 매핑 실패",
    metadata: {
      caseId: params.caseId,
      revision: params.revision,
      errorMessage: params.errorMessage,
    },
  });
}

export async function auditLitigationEvidenceMappingItemReviewed(params: {
  actorUserId: string;
  caseId: string;
  mappingId: string;
  itemId: string;
  itemKind: string;
  reviewStatus: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_EVIDENCE_MAPPING_ITEM_REVIEWED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.mappingId,
    message: "증거 매핑 항목 검토",
    metadata: {
      caseId: params.caseId,
      itemId: params.itemId,
      itemKind: params.itemKind,
      reviewStatus: params.reviewStatus,
    },
  });
}
