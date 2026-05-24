/**
 * Product Phase 29-D — Expansion opportunity tracker service.
 */
import { REVENUE_OPS_DEFAULT_TENANT_SLUG } from "../account-health/account-health.registry";
import { assembleExpansionOpportunityTracker } from "./expansion-opportunity.policy";
import { EXPANSION_OPPORTUNITIES } from "./expansion-opportunity.registry";
import type { ExpansionOpportunityTrackerResult } from "./expansion-opportunity.schema";

export const EXPANSION_OPPORTUNITY_SERVICE_MARKER_PHASE29D =
  "phase29d-expansion-opportunity-service" as const;

export function buildExpansionOpportunityTracker(input?: {
  tenantSlug?: string;
  signalStrengthById?: Record<string, number>;
}): ExpansionOpportunityTrackerResult {
  const signalStrengthById: Record<string, number> = {};

  for (const opp of EXPANSION_OPPORTUNITIES) {
    signalStrengthById[opp.opportunityId] =
      input?.signalStrengthById?.[opp.opportunityId] ?? 75;
  }

  return assembleExpansionOpportunityTracker({
    tenantSlug: input?.tenantSlug ?? REVENUE_OPS_DEFAULT_TENANT_SLUG,
    signalStrengthById,
  });
}
