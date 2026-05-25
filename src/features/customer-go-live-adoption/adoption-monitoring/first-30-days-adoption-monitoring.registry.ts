/**
 * Product Phase 37-B — First 30 days adoption monitoring SSOT.
 */
import type { First30DaysAdoptionMonitoringResult } from "./first-30-days-adoption-monitoring.schema";

export const FIRST_30_DAYS_ADOPTION_REGISTRY_MARKER_PHASE37B =
  "phase37b-first-30-days-adoption-registry" as const;

type First30DaysMonitoringItem = Omit<
  First30DaysAdoptionMonitoringResult["monitoringItems"][number],
  "defined"
>;

export const FIRST_30_DAYS_MONITORING_ITEMS: First30DaysMonitoringItem[] = [
  { monitoringId: "DAILY_HEALTH_CHECK", label: "Daily adoption health check", required: true },
  { monitoringId: "ACTIVE_USER_TREND", label: "Active user trend tracking", required: true },
  {
    monitoringId: "FEATURE_USAGE_BASELINE",
    label: "Feature usage baseline metrics",
    required: true,
  },
  {
    monitoringId: "TRAINING_EFFECTIVENESS",
    label: "Training effectiveness follow-up",
    required: true,
  },
  { monitoringId: "ADOPTION_RISK_FLAGS", label: "Adoption risk flag review", required: true },
];
