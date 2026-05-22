import { writeAuditLog } from "@/lib/audit-log";
import type { GongbuhoAuditEvent } from "@/lib/gongbuho/gongbuho-audit-events";
import { AUDIT_LOG_EVENTS } from "@/lib/gongbuho/gongbuho-audit-events";

const auditLogEventSet = new Set<string>(AUDIT_LOG_EVENTS);

/**
 * `AuditLog.action` 에 Phase 4-F 공부호 운영 이벤트 문자열(SSOT `gongbuho-audit-events`)을 저장한다.
 */
export async function writeGongbuhoAuditLog(params: {
  actorUserId: string;
  event: GongbuhoAuditEvent;
  entityType: string;
  entityId: string;
  message?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!auditLogEventSet.has(params.event)) {
    throw new Error(`writeGongbuhoAuditLog: not an AuditLog-class event (${params.event})`);
  }

  await writeAuditLog({
    actorUserId: params.actorUserId,
    action: params.event,
    entityType: params.entityType,
    entityId: params.entityId,
    message: params.message,
    metadata: params.metadata,
  });
}
