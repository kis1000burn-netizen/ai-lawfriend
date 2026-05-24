/**
 * Phase 19-C — AuditLog export/display redaction (19-B delegate + export field policy).
 */
import { maskEmail } from "@/features/illegal-lending/illegal-lending-mask";
import {
  redactAuditLogMetadataForDisplay,
  redactAuditLogMetadataForExport,
} from "./data-redaction.service";

export const AUDIT_LOG_EXPORT_REDACTION_SERVICE_MARKER_PHASE19C =
  "phase19c-audit-log-export-redaction-service" as const;

export type AuditLogRedactableRow = {
  id?: string;
  message?: string | null;
  metadata?: unknown;
  actor?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  };
  actorUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  createdAt?: Date | string;
};

function redactExportMessage(message: string | null | undefined): string {
  if (!message?.trim()) return "";
  const trimmed = message.trim();
  if (trimmed.length <= 200) return trimmed;
  return `${trimmed.slice(0, 200)}…[REDACTED:EXPORT_TRUNCATED]`;
}

export function redactAuditLogMetadataForExportSurface(metadata: unknown): unknown {
  return redactAuditLogMetadataForExport(metadata);
}

export function redactAuditLogMetadataForDisplaySurface(metadata: unknown): unknown {
  return redactAuditLogMetadataForDisplay(metadata);
}

export function redactAuditLogRowForDisplay<T extends AuditLogRedactableRow>(row: T): T {
  return {
    ...row,
    message: row.message,
    metadata: row.metadata
      ? redactAuditLogMetadataForDisplaySurface(row.metadata)
      : row.metadata,
  };
}

export function redactAuditLogRowForExport<T extends AuditLogRedactableRow>(row: T): T {
  const actor = row.actor
    ? {
        ...row.actor,
        email: maskEmail(row.actor.email),
        name: row.actor.name ?? "",
      }
    : row.actor;

  return {
    ...row,
    message: redactExportMessage(row.message),
    metadata: row.metadata
      ? redactAuditLogMetadataForExportSurface(row.metadata)
      : row.metadata,
    actor,
  };
}
