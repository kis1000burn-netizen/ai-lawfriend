/**
 * Product Phase 29-E — Executive report metric templates SSOT.
 */
import type { ExecutivePartnerSuccessReportResult } from "./executive-partner-report.schema";

export const EXECUTIVE_PARTNER_REPORT_REGISTRY_MARKER_PHASE29E =
  "phase29e-executive-partner-report-registry" as const;

export const EXECUTIVE_REPORT_AGGREGATE_ONLY_MARKER = "phase29e-aggregate-only-report" as const;

type MetricTemplate = Omit<
  ExecutivePartnerSuccessReportResult["metrics"][number],
  "value"
> & { defaultValue: number | string };

export const EXECUTIVE_REPORT_METRIC_TEMPLATES: MetricTemplate[] = [
  { metricKey: "cases_processed", label: "Cases processed this month", defaultValue: 0, unit: "count" },
  { metricKey: "ai_time_saved_hours", label: "Estimated AI time saved", defaultValue: 0, unit: "hours" },
  { metricKey: "client_response_rate", label: "Client response rate", defaultValue: 0, unit: "percent" },
  { metricKey: "deadline_completion_rate", label: "Deadline / supplement completion", defaultValue: 0, unit: "percent" },
  { metricKey: "documents_processed", label: "Documents / evidence processed", defaultValue: 0, unit: "count" },
  { metricKey: "active_users", label: "Active users", defaultValue: 0, unit: "count" },
  { metricKey: "support_issues", label: "Support issues (aggregated)", defaultValue: 0, unit: "count" },
];

export const EXECUTIVE_REPORT_DEFAULT_SUGGESTIONS = [
  "Review mobile portal adoption for client engagement",
  "Consider AI usage tier if document volume grows",
] as const;
