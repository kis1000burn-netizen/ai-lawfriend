/**
 * Product Phase 37-B — First 30 days adoption monitoring policy SSOT.
 */
import { FIRST_30_DAYS_MONITORING_ITEMS } from "./first-30-days-adoption-monitoring.registry";
import type { First30DaysAdoptionMonitoringResult } from "./first-30-days-adoption-monitoring.schema";
import { FIRST_30_DAYS_ADOPTION_VERSION } from "./first-30-days-adoption-monitoring.schema";

export const FIRST_30_DAYS_ADOPTION_POLICY_MARKER_PHASE37B =
  "phase37b-first-30-days-adoption-policy" as const;

export function assembleFirst30DaysAdoptionMonitoring(input: {
  adoptionScopeSlug: string;
  definedMonitoringIds: Set<string>;
  generatedAt?: string;
}): First30DaysAdoptionMonitoringResult {
  const monitoringItems = FIRST_30_DAYS_MONITORING_ITEMS.map((item) => ({
    ...item,
    defined: input.definedMonitoringIds.has(item.monitoringId),
  }));

  const required = monitoringItems.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: FIRST_30_DAYS_ADOPTION_VERSION,
    adoptionScopeSlug: input.adoptionScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    monitoringItems,
    completionRate,
    first30DaysAdoptionMonitoringReady: definedRequired === required.length,
  };
}
