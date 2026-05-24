/**
 * Product Phase 29-E — Executive / partner success report service.
 */
import { REVENUE_OPS_DEFAULT_TENANT_SLUG } from "../account-health/account-health.registry";
import { assembleExecutivePartnerSuccessReport } from "./executive-partner-report.policy";
import type { ExecutivePartnerSuccessReportResult } from "./executive-partner-report.schema";

export const EXECUTIVE_PARTNER_REPORT_SERVICE_MARKER_PHASE29E =
  "phase29e-executive-partner-report-service" as const;

export function buildExecutivePartnerSuccessReport(input?: {
  tenantSlug?: string;
  reportPeriod?: string;
  metricValues?: Record<string, number | string>;
}): ExecutivePartnerSuccessReportResult {
  return assembleExecutivePartnerSuccessReport({
    tenantSlug: input?.tenantSlug ?? REVENUE_OPS_DEFAULT_TENANT_SLUG,
    reportPeriod: input?.reportPeriod ?? "2026-05",
    metricValues: input?.metricValues ?? {
      cases_processed: 12,
      ai_time_saved_hours: 24,
      client_response_rate: 87,
      deadline_completion_rate: 92,
      documents_processed: 45,
      active_users: 8,
      support_issues: 2,
    },
  });
}
