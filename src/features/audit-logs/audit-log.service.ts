import ExcelJS from "exceljs";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit-log";
import type {
  AuditLogListQueryInput,
  AuditLogSummaryQueryInput,
} from "@/features/audit-logs/audit-log.validators";
import {
  findAuditLogById,
  findAuditLogs,
  findAuditLogsForExport,
  getAuditLogActionChart,
  getAuditLogDailyTrend,
  getAuditLogAdvancedSignals,
  getAuditLogDashboardSignals,
  getAuditLogHourlyDistribution,
  getAuditLogSummary,
  getAuditLogTopActors,
} from "@/features/audit-logs/audit-log.repository";
import { clampAuditLogQueryDateFrom } from "@/lib/data-governance/audit-log-retention-policy";
import {
  assertAuditLogExportAllowed,
  assertAuditLogViewAllowed,
  AUDIT_LOG_EXPORT_AUDIT_ACTION,
  AUDIT_LOG_EXPORT_ENTITY_TYPE,
  buildAuditLogExportAuditMetadata,
  normalizeAuditLogExportQuery,
} from "@/lib/data-governance/audit-log-export-policy";
import {
  redactAuditLogRowForDisplay,
  redactAuditLogRowForExport,
} from "@/lib/data-governance/audit-log-export-redaction.service";

function withRetentionClampedQuery<T extends { dateFrom?: string }>(
  query: T,
): T {
  const dateFrom = clampAuditLogQueryDateFrom(query.dateFrom);
  if (dateFrom === query.dateFrom) {
    return query;
  }
  return { ...query, dateFrom };
}

export async function listAuditLogsService(
  currentUser: SessionUser,
  query: AuditLogListQueryInput
) {
  assertAuditLogViewAllowed(currentUser);

  const scopedQuery = withRetentionClampedQuery(query);
  const { items, total } = await findAuditLogs(scopedQuery);

  const redactedItems = items.map((item) => redactAuditLogRowForDisplay(item));

  const totalPages =
    total === 0 ? 0 : Math.ceil(total / scopedQuery.pageSize);

  return {
    items: redactedItems,
    pagination: {
      page: scopedQuery.page,
      pageSize: scopedQuery.pageSize,
      total,
      totalPages,
    },
  };
}

export async function getAuditLogDetailService(
  currentUser: SessionUser,
  id: string
) {
  assertAuditLogViewAllowed(currentUser);

  const item = await findAuditLogById(id);

  if (!item) {
    throw new NotFoundError("감사로그를 찾을 수 없습니다.");
  }

  return redactAuditLogRowForDisplay(item);
}

export async function getAuditLogSummaryService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogSummary(withRetentionClampedQuery(query));
}

export async function getAuditLogActionChartService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogActionChart(withRetentionClampedQuery(query));
}

export async function getAuditLogDailyTrendService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogDailyTrend(withRetentionClampedQuery(query));
}

export async function getAuditLogTopActorsService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogTopActors(withRetentionClampedQuery(query));
}

export async function getAuditLogHourlyDistributionService(
  currentUser: SessionUser,
  query: AuditLogSummaryQueryInput
) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogHourlyDistribution(withRetentionClampedQuery(query));
}

export async function getAuditLogDashboardSignalsService(currentUser: SessionUser) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogDashboardSignals();
}

export async function getAuditLogAdvancedSignalsService(currentUser: SessionUser) {
  assertAuditLogViewAllowed(currentUser);
  return getAuditLogAdvancedSignals();
}

export async function exportAuditLogsXlsxService(
  currentUser: SessionUser,
  query: Omit<AuditLogListQueryInput, "page" | "pageSize">
) {
  assertAuditLogExportAllowed(currentUser);

  const exportQuery = normalizeAuditLogExportQuery(query);
  const rows = await findAuditLogsForExport(exportQuery);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AI법친";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Audit Logs", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = [
    { header: "시각", key: "createdAt", width: 24 },
    { header: "행위자 ID", key: "actorId", width: 28 },
    { header: "행위자 이름", key: "actorName", width: 20 },
    { header: "행위자 이메일", key: "actorEmail", width: 28 },
    { header: "행위자 역할", key: "actorRole", width: 14 },
    { header: "액션", key: "action", width: 28 },
    { header: "엔티티 타입", key: "entityType", width: 20 },
    { header: "엔티티 ID", key: "entityId", width: 32 },
    { header: "메시지", key: "message", width: 36 },
    { header: "메타데이터", key: "metadata", width: 60 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle" };

  for (const item of rows) {
    const redacted = redactAuditLogRowForExport(item);
    worksheet.addRow({
      createdAt: redacted.createdAt instanceof Date
        ? redacted.createdAt.toISOString()
        : String(redacted.createdAt ?? ""),
      actorId: redacted.actor?.id ?? item.actor.id,
      actorName: redacted.actor?.name ?? "",
      actorEmail: redacted.actor?.email ?? "",
      actorRole: redacted.actor?.role ?? item.actor.role,
      action: redacted.action ?? item.action,
      entityType: redacted.entityType ?? item.entityType,
      entityId: redacted.entityId ?? item.entityId,
      message: redacted.message ?? "",
      metadata: redacted.metadata
        ? JSON.stringify(redacted.metadata, null, 2)
        : "",
    });
  }

  worksheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: AUDIT_LOG_EXPORT_AUDIT_ACTION,
    entityType: AUDIT_LOG_EXPORT_ENTITY_TYPE,
    entityId: `export-${new Date().toISOString()}`,
    message: `Audit log XLSX export (${rows.length} rows)`,
    metadata: buildAuditLogExportAuditMetadata({
      rowCount: rows.length,
      filters: exportQuery,
    }),
  });

  return Buffer.from(buffer);
}
