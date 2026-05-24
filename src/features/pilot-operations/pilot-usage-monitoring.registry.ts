/**
 * Product Phase 27-A — Pilot usage monitoring metrics SSOT.
 */
import type { PilotUsageMonitoringResult } from "./pilot-usage-monitoring.schema";

export const PILOT_USAGE_MONITORING_REGISTRY_MARKER_PHASE27A =
  "phase27a-pilot-usage-monitoring-registry" as const;

export const PILOT_USAGE_MONITORING_DEFAULT_TENANT = "pilot-lawfirm-001" as const;

type UsageMetric = Omit<PilotUsageMonitoringResult["metrics"][number], "observed" | "notes">;

export const PILOT_USAGE_MONITORING_METRICS: UsageMetric[] = [
  {
    metricId: "ACTIVE_TENANTS",
    label: "Active pilot tenants",
    required: true,
    adminPath: "/admin/tenants",
  },
  {
    metricId: "ACTIVE_CASES",
    label: "Active pilot cases",
    required: true,
    adminPath: "/admin/operations/monitoring",
  },
  {
    metricId: "AI_INTERVIEW_SESSIONS",
    label: "AI interview sessions",
    required: true,
  },
  {
    metricId: "DOCUMENT_GENERATIONS",
    label: "Document generations",
    required: true,
  },
  {
    metricId: "CLIENT_NOTIFICATIONS",
    label: "Client notifications sent",
    required: true,
  },
  {
    metricId: "BILLING_EVENTS",
    label: "Billing / usage ledger events",
    required: true,
    adminPath: "/admin/tenants",
  },
];
