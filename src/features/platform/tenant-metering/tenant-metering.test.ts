import { describe, expect, it } from "vitest";
import {
  buildTenantUsageSummary,
  compareTenantUsageAgainstPlanLimits,
  emptyTenantUsageTotals,
  resolveTenantUsagePeriodKey,
  resolveTenantUsageWindowBounds,
  TENANT_METERING_NOT_BILLING_LEDGER_MARKER,
  TENANT_USAGE_WARNING_THRESHOLD_PERCENT,
} from "./tenant-usage.policy";
import { getTenantPlanTierDefinition } from "@/features/platform/tenant-entitlement/tenant-plan.registry";

describe("tenant-usage.policy (Phase 22-C)", () => {
  it("resolves monthly usage window as UTC YYYY-MM", () => {
    expect(resolveTenantUsagePeriodKey(new Date("2026-05-15T12:00:00Z"))).toBe("2026-05");
    const bounds = resolveTenantUsageWindowBounds("2026-05");
    expect(bounds.start.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(bounds.end.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("compares usage totals against 22-B plan limits", () => {
    const limits = getTenantPlanTierDefinition("FREE").limits;
    const totals = {
      ...emptyTenantUsageTotals(),
      aiTokensUsed: limits.monthlyAiTokenBudget,
      externalMessageCount: 3,
    };

    const { limitComparisons, warnings } = compareTenantUsageAgainstPlanLimits({
      totals,
      limits,
      caseLlmUsage: [{ caseId: "case-1", llmCallCount: limits.maxLlmCallsPerCase }],
    });

    const aiComparison = limitComparisons.find((item) => item.metric === "monthlyAiTokenBudget");
    expect(aiComparison?.overLimit).toBe(true);
    expect(warnings.some((warning) => warning.severity === "OVER_LIMIT")).toBe(true);
  });

  it("emits approaching-limit warnings before hard over-limit", () => {
    const limits = getTenantPlanTierDefinition("STARTER").limits;
    const warningThreshold = Math.ceil(
      (limits.monthlyAiTokenBudget * TENANT_USAGE_WARNING_THRESHOLD_PERCENT) / 100,
    );
    const totals = {
      ...emptyTenantUsageTotals(),
      aiTokensUsed: warningThreshold,
    };

    const summary = buildTenantUsageSummary({
      tenantId: "tenant-1",
      periodKey: "2026-05",
      totals,
      limits,
    });

    expect(summary.warnings.some((warning) => warning.code === "TENANT_USAGE_APPROACHING_LIMIT")).toBe(
      true,
    );
    expect(summary.billingLedgerSeparated).toBe(true);
    expect(TENANT_METERING_NOT_BILLING_LEDGER_MARKER).toBe(
      "phase22c-metering-not-billing-ledger",
    );
  });

  it("tracks all metering dimensions in totals shape", () => {
    const totals = emptyTenantUsageTotals();
    expect(Object.keys(totals)).toEqual([
      "aiTokensUsed",
      "llmCallCount",
      "externalMessageCount",
      "documentProcessingCount",
      "fileUploadCount",
      "fileStorageBytesEstimate",
      "clientPortalActiveCount",
    ]);
  });
});
