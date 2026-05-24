/**
 * Product Phase 29-E — Executive / partner success report policy SSOT.
 */
import {
  EXECUTIVE_REPORT_DEFAULT_SUGGESTIONS,
  EXECUTIVE_REPORT_METRIC_TEMPLATES,
} from "./executive-partner-report.registry";
import type { ExecutivePartnerSuccessReportResult } from "./executive-partner-report.schema";
import { EXECUTIVE_PARTNER_REPORT_VERSION } from "./executive-partner-report.schema";

export const EXECUTIVE_PARTNER_REPORT_POLICY_MARKER_PHASE29E =
  "phase29e-executive-partner-report-policy" as const;

export function assembleExecutivePartnerSuccessReport(input: {
  tenantSlug: string;
  reportPeriod: string;
  metricValues?: Record<string, number | string>;
  improvementSuggestions?: string[];
  generatedAt?: string;
}): ExecutivePartnerSuccessReportResult {
  const metrics = EXECUTIVE_REPORT_METRIC_TEMPLATES.map((template) => ({
    metricKey: template.metricKey,
    label: template.label,
    unit: template.unit,
    value: input.metricValues?.[template.metricKey] ?? template.defaultValue,
  }));

  return {
    version: EXECUTIVE_PARTNER_REPORT_VERSION,
    tenantSlug: input.tenantSlug,
    reportPeriod: input.reportPeriod,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    metrics,
    improvementSuggestions: input.improvementSuggestions ?? [...EXECUTIVE_REPORT_DEFAULT_SUGGESTIONS],
    aggregateOnly: true,
    piiRedacted: true,
    executiveReportReady: metrics.length >= 5,
  };
}
