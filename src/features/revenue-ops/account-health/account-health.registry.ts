/**
 * Product Phase 29-A — Account health metric weights SSOT.
 */
import type { RevenueAccountHealthResult } from "./account-health.schema";

export const ACCOUNT_HEALTH_REGISTRY_MARKER_PHASE29A = "phase29a-account-health-registry" as const;

export const REVENUE_OPS_DEFAULT_TENANT_SLUG = "pilot-lawfirm-001" as const;

type HealthMetric = Omit<RevenueAccountHealthResult["metrics"][number], "score">;

export const ACCOUNT_HEALTH_METRICS: HealthMetric[] = [
  { metricId: "USAGE_VOLUME", label: "Tenant usage volume", weight: 12 },
  { metricId: "ACTIVE_USERS", label: "Active users", weight: 10 },
  { metricId: "CASES_CREATED", label: "Cases created", weight: 10 },
  { metricId: "CLIENT_PORTAL_USAGE", label: "Client portal usage rate", weight: 8 },
  { metricId: "AI_FEATURE_USAGE", label: "AI feature usage rate", weight: 10 },
  { metricId: "MESSAGING_SUCCESS_RATE", label: "External messaging success rate", weight: 8 },
  { metricId: "SUPPORT_REQUESTS", label: "Support request volume (inverse)", weight: 8 },
  { metricId: "INCIDENT_FREQUENCY", label: "Incident frequency (inverse)", weight: 8 },
  { metricId: "SLA_VIOLATIONS", label: "SLA violations (inverse)", weight: 8 },
  { metricId: "SATISFACTION", label: "Satisfaction score", weight: 10 },
  { metricId: "RENEWAL_PROXIMITY", label: "Renewal proximity readiness", weight: 8 },
];

export const ACCOUNT_HEALTH_HEALTHY_THRESHOLD = 80 as const;
export const ACCOUNT_HEALTH_WATCH_THRESHOLD = 60 as const;
