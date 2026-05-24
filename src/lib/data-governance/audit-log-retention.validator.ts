/**
 * Phase 19-C — AuditLog retention & export policy validator.
 */
import { getDataRetentionPolicyEntry } from "./data-retention-policy.registry";
import {
  AUDIT_LOG_DEFAULT_RETENTION_DAYS,
  AUDIT_LOG_RETENTION_DISPOSITION,
  AUDIT_LOG_SOURCE_PRISMA_MODEL,
} from "./audit-log-retention-policy";
import {
  AUDIT_LOG_EXPORT_AUDIT_ACTION,
  AUDIT_LOG_EXPORT_MAX_ROWS,
  AUDIT_LOG_EXPORT_POLICY_MARKER_PHASE19C,
} from "./audit-log-export-policy";

export const AUDIT_LOG_RETENTION_VALIDATOR_MARKER_PHASE19C =
  "phase19c-audit-log-retention-validator" as const;

export type AuditLogRetentionValidationResult = {
  ok: boolean;
  violations: string[];
};

export function validateAuditLogRetentionExportPolicy(): AuditLogRetentionValidationResult {
  const violations: string[] = [];
  const entry = getDataRetentionPolicyEntry(AUDIT_LOG_SOURCE_PRISMA_MODEL);

  if (!entry) {
    violations.push("AuditLog missing from 19-A retention registry.");
  } else {
    if (entry.defaultRetentionDays !== AUDIT_LOG_DEFAULT_RETENTION_DAYS) {
      violations.push("Retention days drift from 19-A registry.");
    }
    if (!entry.exportRedactionRequired) {
      violations.push("AuditLog must require exportRedaction in 19-A.");
    }
    if (entry.disposition !== AUDIT_LOG_RETENTION_DISPOSITION) {
      violations.push("Retention disposition drift from 19-A.");
    }
  }

  if (AUDIT_LOG_EXPORT_MAX_ROWS <= 0) {
    violations.push("Export max rows must be positive.");
  }

  if (!AUDIT_LOG_EXPORT_AUDIT_ACTION.includes("EXPORT")) {
    violations.push("Export audit action must identify export events.");
  }

  if (!AUDIT_LOG_EXPORT_POLICY_MARKER_PHASE19C.includes("phase19c")) {
    violations.push("Export policy marker missing.");
  }

  return { ok: violations.length === 0, violations };
}

export function assertAuditLogRetentionExportPolicyValid(): void {
  const result = validateAuditLogRetentionExportPolicy();
  if (result.ok) return;
  throw new Error(`AuditLog retention/export policy invalid: ${result.violations.join("; ")}`);
}
