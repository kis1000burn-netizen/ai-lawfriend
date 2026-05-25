/**
 * Product Phase 37-B — First 30 days adoption monitoring service.
 */
import { CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG } from "../go-live-execution/go-live-execution-checklist.registry";
import { FIRST_30_DAYS_MONITORING_ITEMS } from "./first-30-days-adoption-monitoring.registry";
import { assembleFirst30DaysAdoptionMonitoring } from "./first-30-days-adoption-monitoring.policy";
import type { First30DaysAdoptionMonitoringResult } from "./first-30-days-adoption-monitoring.schema";

export const FIRST_30_DAYS_ADOPTION_SERVICE_MARKER_PHASE37B =
  "phase37b-first-30-days-adoption-service" as const;

export function buildFirst30DaysAdoptionMonitoring(input?: {
  adoptionScopeSlug?: string;
  definedMonitoringIds?: string[];
}): First30DaysAdoptionMonitoringResult {
  const definedMonitoringIds = new Set(
    input?.definedMonitoringIds ??
      FIRST_30_DAYS_MONITORING_ITEMS.filter((item) => item.required).map(
        (item) => item.monitoringId,
      ),
  );

  return assembleFirst30DaysAdoptionMonitoring({
    adoptionScopeSlug: input?.adoptionScopeSlug ?? CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG,
    definedMonitoringIds,
  });
}
