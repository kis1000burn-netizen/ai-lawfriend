/**
 * Product Phase 27-A — Pilot usage monitoring policy SSOT.
 */
import { PILOT_USAGE_MONITORING_METRICS } from "./pilot-usage-monitoring.registry";
import type { PilotUsageMonitoringResult } from "./pilot-usage-monitoring.schema";
import { PILOT_USAGE_MONITORING_VERSION } from "./pilot-usage-monitoring.schema";

export const PILOT_USAGE_MONITORING_POLICY_MARKER_PHASE27A =
  "phase27a-pilot-usage-monitoring-policy" as const;

export function assemblePilotUsageMonitoring(input: {
  tenantSlug: string;
  observedMetricIds: Set<string>;
  generatedAt?: string;
}): PilotUsageMonitoringResult {
  const metrics = PILOT_USAGE_MONITORING_METRICS.map((metric) => {
    const observed = input.observedMetricIds.has(metric.metricId);
    return {
      ...metric,
      observed,
      notes: observed ? [] : [`not observed: ${metric.metricId}`],
    };
  });

  const required = metrics.filter((metric) => metric.required);
  const observedRequired = required.filter((metric) => metric.observed).length;
  const coverageRate =
    required.length === 0 ? 100 : Math.round((observedRequired / required.length) * 100);

  return {
    version: PILOT_USAGE_MONITORING_VERSION,
    tenantSlug: input.tenantSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    metrics,
    coverageRate,
    pilotUsageMonitoringReady: observedRequired === required.length,
  };
}
