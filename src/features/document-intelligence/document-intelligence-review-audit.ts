/**
 * Phase 13-G — Lawyer Review Gate AuditLog.
 */
import { writeAuditLog } from "@/lib/audit-log";
import { LITIGATION_AUDIT_ENTITY_TYPE } from "./document-extraction-audit";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_AUDIT_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_AUDIT" as const;

export async function auditDocumentIntelligenceReviewConfirmed(params: {
  actorUserId: string;
  caseId: string;
  itemId: string;
  itemCategory: string;
  sourcePhase: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_REVIEW_CONFIRMED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.itemId,
    message: "서류·증거 분석 항목 확인",
    metadata: {
      caseId: params.caseId,
      itemCategory: params.itemCategory,
      sourcePhase: params.sourcePhase,
    },
  });
}

export async function auditDocumentIntelligenceReviewEdited(params: {
  actorUserId: string;
  caseId: string;
  itemId: string;
  itemCategory: string;
  sourcePhase: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_REVIEW_EDITED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.itemId,
    message: "서류·증거 분석 항목 수정 확정",
    metadata: {
      caseId: params.caseId,
      itemCategory: params.itemCategory,
      sourcePhase: params.sourcePhase,
    },
  });
}

export async function auditDocumentIntelligenceReviewRejected(params: {
  actorUserId: string;
  caseId: string;
  itemId: string;
  itemCategory: string;
  sourcePhase: string;
  rejectionReason: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_REVIEW_REJECTED",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.itemId,
    message: "서류·증거 분석 항목 기각",
    metadata: {
      caseId: params.caseId,
      itemCategory: params.itemCategory,
      sourcePhase: params.sourcePhase,
      rejectionReason: params.rejectionReason,
    },
  });
}

export async function auditDocumentIntelligenceReviewClientConfirmation(params: {
  actorUserId: string;
  caseId: string;
  itemId: string;
  itemCategory: string;
  sourcePhase: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "LITIGATION_DOC_INTEL_REVIEW_NEEDS_CLIENT_CONFIRMATION",
    entityType: LITIGATION_AUDIT_ENTITY_TYPE,
    entityId: params.itemId,
    message: "서류·증거 분석 — 의뢰인 확인 요청",
    metadata: {
      caseId: params.caseId,
      itemCategory: params.itemCategory,
      sourcePhase: params.sourcePhase,
    },
  });
}
