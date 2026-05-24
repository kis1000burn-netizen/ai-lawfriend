/**
 * Product Phase 22-C — Tenant usage metering policy SSOT.
 */
import type { TenantPlanLimits } from "@/features/platform/tenant-entitlement/tenant-plan.schema";
import type {
  TenantCaseLlmUsageSummary,
  TenantUsageLimitComparison,
  TenantUsageSummary,
  TenantUsageTotals,
  TenantUsageWarning,
} from "./tenant-usage.schema";

export const TENANT_USAGE_POLICY_MARKER_PHASE22C =
  "phase22c-tenant-usage-policy" as const;

export const TENANT_USAGE_WARNING_THRESHOLD_PERCENT = 80;

export const TENANT_METERING_NOT_BILLING_LEDGER_MARKER =
  "phase22c-metering-not-billing-ledger" as const;

export function resolveTenantUsagePeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function resolveTenantUsageWindowBounds(periodKey: string): {
  start: Date;
  end: Date;
} {
  const [yearRaw, monthRaw] = periodKey.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { start, end };
}

function percentUsed(used: number, limit: number): number {
  if (limit <= 0) {
    return used > 0 ? 100 : 0;
  }
  return Math.round((used / limit) * 100);
}

function buildLimitComparison(input: {
  metric: string;
  used: number;
  limit: number;
}): TenantUsageLimitComparison {
  const pct = percentUsed(input.used, input.limit);
  return {
    metric: input.metric,
    used: input.used,
    limit: input.limit,
    percentUsed: pct,
    overLimit: input.used >= input.limit,
    warning: pct >= TENANT_USAGE_WARNING_THRESHOLD_PERCENT && input.used < input.limit,
  };
}

export function compareTenantUsageAgainstPlanLimits(input: {
  totals: TenantUsageTotals;
  limits: TenantPlanLimits;
  caseLlmUsage?: TenantCaseLlmUsageSummary[];
}): {
  limitComparisons: TenantUsageLimitComparison[];
  warnings: TenantUsageWarning[];
} {
  const limitComparisons: TenantUsageLimitComparison[] = [
    buildLimitComparison({
      metric: "monthlyAiTokenBudget",
      used: input.totals.aiTokensUsed,
      limit: input.limits.monthlyAiTokenBudget,
    }),
  ];

  for (const caseUsage of input.caseLlmUsage ?? []) {
    limitComparisons.push(
      buildLimitComparison({
        metric: `maxLlmCallsPerCase:${caseUsage.caseId}`,
        used: caseUsage.llmCallCount,
        limit: input.limits.maxLlmCallsPerCase,
      }),
    );
  }

  const warnings: TenantUsageWarning[] = [];
  for (const comparison of limitComparisons) {
    if (comparison.overLimit) {
      warnings.push({
        code: "TENANT_USAGE_OVER_LIMIT",
        metric: comparison.metric,
        message: `${comparison.metric} exceeded plan limit (${comparison.used}/${comparison.limit}).`,
        severity: "OVER_LIMIT",
        used: comparison.used,
        limit: comparison.limit,
      });
      continue;
    }
    if (comparison.warning) {
      warnings.push({
        code: "TENANT_USAGE_APPROACHING_LIMIT",
        metric: comparison.metric,
        message: `${comparison.metric} approaching plan limit (${comparison.percentUsed}%).`,
        severity: "WARNING",
        used: comparison.used,
        limit: comparison.limit,
      });
    }
  }

  return { limitComparisons, warnings };
}

export function buildTenantUsageSummary(input: {
  tenantId: string;
  periodKey: string;
  totals: TenantUsageTotals;
  limits: TenantPlanLimits;
  caseLlmUsage?: TenantCaseLlmUsageSummary[];
}): TenantUsageSummary {
  const { limitComparisons, warnings } = compareTenantUsageAgainstPlanLimits({
    totals: input.totals,
    limits: input.limits,
    caseLlmUsage: input.caseLlmUsage,
  });

  return {
    tenantId: input.tenantId,
    periodKey: input.periodKey,
    totals: input.totals,
    limitComparisons,
    warnings,
    billingLedgerSeparated: true,
  };
}

export function emptyTenantUsageTotals(): TenantUsageTotals {
  return {
    aiTokensUsed: 0,
    llmCallCount: 0,
    externalMessageCount: 0,
    documentProcessingCount: 0,
    fileUploadCount: 0,
    fileStorageBytesEstimate: 0,
    clientPortalActiveCount: 0,
  };
}

export function parseFileUploadBytesEstimate(metadata: unknown): number {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return 0;
  }
  const value = (metadata as Record<string, unknown>).bytesEstimate;
  return typeof value === "number" && value >= 0 ? Math.trunc(value) : 0;
}
