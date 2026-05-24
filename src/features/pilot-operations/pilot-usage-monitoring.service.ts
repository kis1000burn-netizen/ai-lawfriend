/**
 * Product Phase 27-A — Pilot usage monitoring service.
 */
import { assemblePilotUsageMonitoring } from "./pilot-usage-monitoring.policy";
import {
  PILOT_USAGE_MONITORING_DEFAULT_TENANT,
  PILOT_USAGE_MONITORING_METRICS,
} from "./pilot-usage-monitoring.registry";
import type { PilotUsageMonitoringResult } from "./pilot-usage-monitoring.schema";

export const PILOT_USAGE_MONITORING_SERVICE_MARKER_PHASE27A =
  "phase27a-pilot-usage-monitoring-service" as const;

export function buildPilotUsageMonitoringSnapshot(input?: {
  tenantSlug?: string;
  observedMetricIds?: string[];
  assumePilotUsageObserved?: boolean;
}): PilotUsageMonitoringResult {
  const observedMetricIds = new Set(input?.observedMetricIds ?? []);

  if (input?.assumePilotUsageObserved !== false) {
    for (const metric of PILOT_USAGE_MONITORING_METRICS) {
      observedMetricIds.add(metric.metricId);
    }
  }

  return assemblePilotUsageMonitoring({
    tenantSlug: input?.tenantSlug ?? PILOT_USAGE_MONITORING_DEFAULT_TENANT,
    observedMetricIds,
  });
}
