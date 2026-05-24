/**
 * Product Phase 29-A — Revenue account health score service.
 */
import { assembleRevenueAccountHealthScore } from "./account-health.policy";
import {
  ACCOUNT_HEALTH_METRICS,
  REVENUE_OPS_DEFAULT_TENANT_SLUG,
} from "./account-health.registry";
import type { RevenueAccountHealthResult } from "./account-health.schema";

export const ACCOUNT_HEALTH_SCORE_SERVICE_MARKER_PHASE29A =
  "phase29a-account-health-score-service" as const;

export function buildRevenueAccountHealthScore(input?: {
  tenantSlug?: string;
  metricScores?: Record<string, number>;
  assumeHealthyTenant?: boolean;
}): RevenueAccountHealthResult {
  const metricScores: Record<string, number> = {};

  for (const metric of ACCOUNT_HEALTH_METRICS) {
    if (input?.metricScores?.[metric.metricId] != null) {
      metricScores[metric.metricId] = input.metricScores[metric.metricId]!;
    } else if (input?.assumeHealthyTenant !== false) {
      metricScores[metric.metricId] = 85;
    } else {
      metricScores[metric.metricId] = 40;
    }
  }

  return assembleRevenueAccountHealthScore({
    tenantSlug: input?.tenantSlug ?? REVENUE_OPS_DEFAULT_TENANT_SLUG,
    metricScores,
  });
}
