/**
 * Product Phase 29-C — Renewal / churn risk monitor service.
 */
import { REVENUE_OPS_DEFAULT_TENANT_SLUG } from "../account-health/account-health.registry";
import { assembleRenewalChurnRiskMonitor } from "./renewal-churn-risk.policy";
import type { RenewalChurnRiskResult } from "./renewal-churn-risk.schema";

export const RENEWAL_CHURN_RISK_SERVICE_MARKER_PHASE29C =
  "phase29c-renewal-churn-risk-service" as const;

export function buildRenewalChurnRiskMonitor(input?: {
  tenantSlug?: string;
  activeSignalIds?: string[];
  renewalDate?: string;
}): RenewalChurnRiskResult {
  return assembleRenewalChurnRiskMonitor({
    tenantSlug: input?.tenantSlug ?? REVENUE_OPS_DEFAULT_TENANT_SLUG,
    activeSignalIds: new Set(input?.activeSignalIds ?? []),
    renewalDate: input?.renewalDate,
  });
}
