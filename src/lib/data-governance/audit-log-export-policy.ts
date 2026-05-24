/**
 * Phase 19-C — AuditLog export scope · permission · download audit policy.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { isPlatformAdmin } from "@/features/cases/case.permissions";
import type { AuditLogListQueryInput } from "@/features/audit-logs/audit-log.validators";
import { clampAuditLogQueryDateFrom } from "./audit-log-retention-policy";

export const AUDIT_LOG_EXPORT_POLICY_MARKER_PHASE19C =
  "phase19c-audit-log-export-policy" as const;

/** Who may export — platform ADMIN+ only (matches assertAdminOnly). */
export const AUDIT_LOG_EXPORT_ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export const AUDIT_LOG_EXPORT_MAX_ROWS = 5000 as const;

/** Max date span per single XLSX export request. */
export const AUDIT_LOG_EXPORT_MAX_DATE_RANGE_DAYS = 365 as const;

export const AUDIT_LOG_EXPORT_FORMAT = "xlsx" as const;

export const AUDIT_LOG_EXPORT_AUDIT_ACTION = "AUDIT_LOG_XLSX_EXPORTED" as const;

export const AUDIT_LOG_EXPORT_ENTITY_TYPE = "AuditLogExport" as const;

export const AUDIT_LOG_EXPORT_COLUMNS = [
  "createdAt",
  "actorId",
  "actorName",
  "actorEmail",
  "actorRole",
  "action",
  "entityType",
  "entityId",
  "message",
  "metadata",
] as const;

export type AuditLogExportQuery = Omit<AuditLogListQueryInput, "page" | "pageSize">;

export function assertAuditLogExportAllowed(user: SessionUser): void {
  if (!isPlatformAdmin(user.role)) {
    throw new ForbiddenError(
      "Audit log export requires ADMIN role.",
    );
  }
}

export function assertAuditLogViewAllowed(user: SessionUser): void {
  assertAuditLogExportAllowed(user);
}

function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function normalizeAuditLogExportQuery(
  query: AuditLogExportQuery,
  reference: Date = new Date(),
): AuditLogExportQuery & { dateFrom: string; dateTo: string } {
  const dateTo = parseDate(
    query.dateTo || undefined,
    reference,
  );
  const defaultFrom = new Date(
    dateTo.getTime() - AUDIT_LOG_EXPORT_MAX_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000,
  );
  let dateFrom = parseDate(query.dateFrom || undefined, defaultFrom);

  const maxSpanMs = AUDIT_LOG_EXPORT_MAX_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000;
  if (dateTo.getTime() - dateFrom.getTime() > maxSpanMs) {
    dateFrom = new Date(dateTo.getTime() - maxSpanMs);
  }

  if (dateFrom.getTime() > dateTo.getTime()) {
    throw new ValidationError("Export dateFrom must be before dateTo.");
  }

  const clampedFrom = clampAuditLogQueryDateFrom(
    dateFrom.toISOString().slice(0, 10),
    reference,
  );

  return {
    ...query,
    dateFrom: clampedFrom ?? dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
  };
}

export function buildAuditLogExportAuditMetadata(input: {
  rowCount: number;
  filters: AuditLogExportQuery;
  exportFormat?: typeof AUDIT_LOG_EXPORT_FORMAT;
}): Record<string, unknown> {
  return {
    exportFormat: input.exportFormat ?? AUDIT_LOG_EXPORT_FORMAT,
    rowCount: input.rowCount,
    filters: {
      actorUserId: input.filters.actorUserId || null,
      action: input.filters.action || null,
      entityType: input.filters.entityType || null,
      entityId: input.filters.entityId || null,
      search: input.filters.search || null,
      dateFrom: input.filters.dateFrom || null,
      dateTo: input.filters.dateTo || null,
    },
    redactionApplied: true,
    metadataOnly: true,
  };
}
