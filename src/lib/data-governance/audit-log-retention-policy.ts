/**
 * Phase 19-C — AuditLog retention policy (19-A tier aligned · no purge jobs yet).
 */
import { getDataRetentionPolicyEntry } from "./data-retention-policy.registry";

export const AUDIT_LOG_RETENTION_POLICY_MARKER_PHASE19C =
  "phase19c-audit-log-retention-policy" as const;

/** Purge jobs deferred until Phase 19-F RC (same constitution as 19-A). */
export const AUDIT_LOG_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19C = true as const;

export const AUDIT_LOG_SOURCE_PRISMA_MODEL = "AuditLog" as const;

const retentionEntry = getDataRetentionPolicyEntry(AUDIT_LOG_SOURCE_PRISMA_MODEL);

export const AUDIT_LOG_DEFAULT_RETENTION_DAYS =
  retentionEntry?.defaultRetentionDays ?? 730;

export const AUDIT_LOG_RETENTION_DISPOSITION =
  retentionEntry?.disposition ?? "PURGE_AFTER_RETENTION";

export function computeAuditLogRetentionCutoffDate(
  from: Date = new Date(),
  retentionDays: number = AUDIT_LOG_DEFAULT_RETENTION_DAYS,
): Date {
  return new Date(from.getTime() - retentionDays * 24 * 60 * 60 * 1000);
}

/** Logs older than retention window are eligible for future purge (19-F). */
export function isAuditLogEligibleForRetentionPurge(
  createdAt: Date,
  reference: Date = new Date(),
): boolean {
  if (AUDIT_LOG_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19C) {
    return false;
  }
  const cutoff = computeAuditLogRetentionCutoffDate(reference);
  return createdAt.getTime() < cutoff.getTime();
}

/** Active retention window — logs within policy period (still in DB). */
export function isAuditLogWithinRetentionWindow(
  createdAt: Date,
  reference: Date = new Date(),
): boolean {
  const cutoff = computeAuditLogRetentionCutoffDate(reference);
  return createdAt.getTime() >= cutoff.getTime();
}

export function clampAuditLogQueryDateFrom(
  dateFrom: string | undefined,
  reference: Date = new Date(),
): string | undefined {
  if (!dateFrom) {
    return undefined;
  }
  const parsed = new Date(dateFrom);
  if (Number.isNaN(parsed.getTime())) {
    return dateFrom;
  }
  const cutoff = computeAuditLogRetentionCutoffDate(reference);
  if (parsed.getTime() < cutoff.getTime()) {
    return cutoff.toISOString().slice(0, 10);
  }
  return dateFrom;
}

export function getAuditLogRetentionQueryFloorDate(
  reference: Date = new Date(),
): Date {
  return computeAuditLogRetentionCutoffDate(reference);
}
