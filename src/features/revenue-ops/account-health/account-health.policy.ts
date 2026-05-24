/**
 * Product Phase 29-A — Revenue account health score policy SSOT.
 */
import {
  ACCOUNT_HEALTH_HEALTHY_THRESHOLD,
  ACCOUNT_HEALTH_METRICS,
  ACCOUNT_HEALTH_WATCH_THRESHOLD,
} from "./account-health.registry";
import type { RevenueAccountHealthResult } from "./account-health.schema";
import { ACCOUNT_HEALTH_VERSION } from "./account-health.schema";

export const ACCOUNT_HEALTH_POLICY_MARKER_PHASE29A = "phase29a-account-health-policy" as const;

export function assembleRevenueAccountHealthScore(input: {
  tenantSlug: string;
  metricScores: Record<string, number>;
  generatedAt?: string;
}): RevenueAccountHealthResult {
  const metrics = ACCOUNT_HEALTH_METRICS.map((metric) => ({
    ...metric,
    score: input.metricScores[metric.metricId] ?? 0,
  }));

  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const accountHealthScore =
    totalWeight === 0
      ? 0
      : Math.round(metrics.reduce((sum, m) => sum + m.score * m.weight, 0) / totalWeight);

  let healthBand: RevenueAccountHealthResult["healthBand"] = "AT_RISK";
  if (accountHealthScore >= ACCOUNT_HEALTH_HEALTHY_THRESHOLD) {
    healthBand = "HEALTHY";
  } else if (accountHealthScore >= ACCOUNT_HEALTH_WATCH_THRESHOLD) {
    healthBand = "WATCH";
  }

  return {
    version: ACCOUNT_HEALTH_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    metrics,
    accountHealthScore,
    healthBand,
  };
}
