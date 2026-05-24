/**
 * Product Phase 22-C — Tenant usage event repository · aggregation queries.
 */
import type { TenantUsageEventKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RecordTenantUsageEventInput } from "./tenant-usage.schema";
import {
  emptyTenantUsageTotals,
  parseFileUploadBytesEstimate,
  resolveTenantUsagePeriodKey,
} from "./tenant-usage.policy";
import type { TenantCaseLlmUsageSummary, TenantUsageTotals } from "./tenant-usage.schema";

export const TENANT_METERING_REPOSITORY_MARKER_PHASE22C =
  "phase22c-tenant-metering-repository" as const;

export async function createTenantUsageEvent(input: RecordTenantUsageEventInput) {
  const recordedAt = input.recordedAt ?? new Date();
  const periodKey = resolveTenantUsagePeriodKey(recordedAt);

  return prisma.tenantUsageEvent.create({
    data: {
      tenantId: input.tenantId,
      periodKey,
      kind: input.kind,
      quantity: input.quantity,
      unit: input.unit,
      caseId: input.caseId,
      metadata: input.metadata,
      recordedAt,
    },
  });
}

export async function aggregateTenantUsageTotals(
  tenantId: string,
  periodKey: string,
): Promise<TenantUsageTotals> {
  const grouped = await prisma.tenantUsageEvent.groupBy({
    by: ["kind"],
    where: { tenantId, periodKey },
    _sum: { quantity: true },
  });

  const totals = emptyTenantUsageTotals();
  for (const row of grouped) {
    const amount = row._sum.quantity ?? 0;
    switch (row.kind as TenantUsageEventKind) {
      case "AI_TOKEN_USAGE":
        totals.aiTokensUsed += amount;
        break;
      case "LLM_CALL":
        totals.llmCallCount += amount;
        break;
      case "EXTERNAL_MESSAGE":
        totals.externalMessageCount += amount;
        break;
      case "DOCUMENT_PROCESSING":
        totals.documentProcessingCount += amount;
        break;
      case "FILE_UPLOAD":
        totals.fileUploadCount += amount;
        break;
      case "CLIENT_PORTAL_ACTIVE":
        totals.clientPortalActiveCount += amount;
        break;
      default:
        break;
    }
  }

  const fileUploadEvents = await prisma.tenantUsageEvent.findMany({
    where: { tenantId, periodKey, kind: "FILE_UPLOAD" },
    select: { metadata: true },
  });
  totals.fileStorageBytesEstimate = fileUploadEvents.reduce(
    (sum, event) => sum + parseFileUploadBytesEstimate(event.metadata),
    0,
  );

  return totals;
}

export async function aggregateTenantCaseLlmUsage(
  tenantId: string,
  periodKey: string,
): Promise<TenantCaseLlmUsageSummary[]> {
  const rows = await prisma.tenantUsageEvent.groupBy({
    by: ["caseId"],
    where: {
      tenantId,
      periodKey,
      kind: "LLM_CALL",
      caseId: { not: null },
    },
    _sum: { quantity: true },
  });

  return rows
    .filter((row): row is typeof row & { caseId: string } => row.caseId !== null)
    .map((row) => ({
      caseId: row.caseId,
      llmCallCount: row._sum.quantity ?? 0,
    }));
}

export async function listRecentTenantUsageEvents(input: {
  tenantId: string;
  periodKey?: string;
  limit?: number;
}) {
  return prisma.tenantUsageEvent.findMany({
    where: {
      tenantId: input.tenantId,
      periodKey: input.periodKey,
    },
    orderBy: { recordedAt: "desc" },
    take: input.limit ?? 50,
  });
}
