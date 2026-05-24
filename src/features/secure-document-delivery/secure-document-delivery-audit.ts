/**
 * Phase 15-F — Secure document delivery audit.
 */
import { writeAuditLog } from "@/lib/audit-log";

export const SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE =
  "SECURE_DOCUMENT_DELIVERY" as const;

export async function auditSharedDocumentCreated(params: {
  actorUserId: string;
  caseId: string;
  shareId: string;
  documentId: string;
  recipientUserId: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CASE_SHARED_DOCUMENT_CREATED",
    entityType: SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE,
    entityId: params.shareId,
    message: "의뢰인 보안 문서 공유 생성",
    metadata: params,
  });
}

export async function auditDocumentDeliverySent(params: {
  actorUserId: string;
  caseId: string;
  shareId: string;
  deliveryId: string;
  channel: string;
  externalMessageLogId?: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CASE_DOCUMENT_DELIVERY_SENT",
    entityType: SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE,
    entityId: params.deliveryId,
    message: `문서 공유 알림 발송 (${params.channel})`,
    metadata: params,
  });
}

export async function auditDocumentDeliverySkipped(params: {
  actorUserId: string;
  caseId: string;
  shareId: string;
  deliveryId: string;
  channel: string;
  reason: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CASE_DOCUMENT_DELIVERY_SKIPPED",
    entityType: SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE,
    entityId: params.deliveryId,
    message: `문서 공유 알림 스킵 (${params.channel})`,
    metadata: params,
  });
}

export async function auditSharedDocumentViewed(params: {
  actorUserId: string;
  caseId: string;
  shareId: string;
  deliveryId?: string;
}) {
  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: "CASE_SHARED_DOCUMENT_VIEWED",
    entityType: SECURE_DOCUMENT_DELIVERY_AUDIT_ENTITY_TYPE,
    entityId: params.shareId,
    message: "의뢰인 보안 문서 열람",
    metadata: params,
  });
}
