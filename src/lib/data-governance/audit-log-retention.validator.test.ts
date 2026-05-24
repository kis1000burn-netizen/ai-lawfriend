import { describe, expect, it } from "vitest";
import {
  AUDIT_LOG_DEFAULT_RETENTION_DAYS,
  computeAuditLogRetentionCutoffDate,
  isAuditLogEligibleForRetentionPurge,
  isAuditLogWithinRetentionWindow,
} from "./audit-log-retention-policy";
import {
  AUDIT_LOG_EXPORT_MAX_DATE_RANGE_DAYS,
  buildAuditLogExportAuditMetadata,
  normalizeAuditLogExportQuery,
} from "./audit-log-export-policy";
import {
  redactAuditLogRowForExport,
  redactAuditLogMetadataForExportSurface,
} from "./audit-log-export-redaction.service";
import {
  assertAuditLogRetentionExportPolicyValid,
  validateAuditLogRetentionExportPolicy,
} from "./audit-log-retention.validator";

describe("audit-log retention & export (Phase 19-C)", () => {
  it("validates policy alignment with 19-A", () => {
    const result = validateAuditLogRetentionExportPolicy();
    expect(result.ok).toBe(true);
    expect(() => assertAuditLogRetentionExportPolicyValid()).not.toThrow();
  });

  it("uses 730-day retention from 19-A registry", () => {
    expect(AUDIT_LOG_DEFAULT_RETENTION_DAYS).toBe(730);
    const cutoff = computeAuditLogRetentionCutoffDate(new Date("2026-05-24T00:00:00.000Z"));
    expect(cutoff.toISOString().slice(0, 10)).toBe("2024-05-24");
  });

  it("blocks purge eligibility while Phase 19-F locked", () => {
    const old = new Date("2020-01-01T00:00:00.000Z");
    expect(isAuditLogEligibleForRetentionPurge(old)).toBe(false);
    expect(isAuditLogWithinRetentionWindow(new Date())).toBe(true);
  });

  it("normalizes export query date range", () => {
    const normalized = normalizeAuditLogExportQuery(
      { dateFrom: "", dateTo: "2026-05-24" },
      new Date("2026-05-24T12:00:00.000Z"),
    );
    expect(normalized.dateTo).toBe("2026-05-24");
    expect(normalized.dateFrom).toBeTruthy();
    const from = new Date(normalized.dateFrom);
    const to = new Date(normalized.dateTo);
    const spanDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
    expect(spanDays).toBeLessThanOrEqual(AUDIT_LOG_EXPORT_MAX_DATE_RANGE_DAYS);
  });

  it("redacts export metadata and masks actor email", () => {
    const row = redactAuditLogRowForExport({
      id: "a1",
      message: "x".repeat(300),
      metadata: { documentBody: "secret", operation: "AI_CORE_TEST" },
      actor: {
        id: "u1",
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    expect(row.metadata).toMatchObject({
      documentBody: expect.stringContaining("REDACTED"),
      operation: "AI_CORE_TEST",
    });
    expect(row.message).toContain("REDACTED:EXPORT_TRUNCATED");
    expect(row.actor?.email).not.toBe("admin@example.com");
  });

  it("builds export audit metadata for download history", () => {
    const meta = buildAuditLogExportAuditMetadata({
      rowCount: 42,
      filters: { dateFrom: "2026-01-01", dateTo: "2026-05-24" },
    });
    expect(meta.rowCount).toBe(42);
    expect(meta.metadataOnly).toBe(true);
    expect(meta.redactionApplied).toBe(true);
    expect(meta.exportFormat).toBe("xlsx");
  });

  it("redacts forbidden keys via 19-B export surface", () => {
    const out = redactAuditLogMetadataForExportSurface({
      prompt: "full prompt text",
      caseId: "case-1",
    }) as Record<string, unknown>;
    expect(out.prompt).toContain("REDACTED");
    expect(out.caseId).toBe("case-1");
  });
});
