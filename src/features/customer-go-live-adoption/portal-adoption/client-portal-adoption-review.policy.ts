/**
 * Product Phase 37-D — Client portal adoption review policy SSOT.
 */
import { CLIENT_PORTAL_ADOPTION_METRICS } from "./client-portal-adoption-review.registry";
import type { ClientPortalAdoptionReviewResult } from "./client-portal-adoption-review.schema";
import { CLIENT_PORTAL_ADOPTION_VERSION } from "./client-portal-adoption-review.schema";

export const CLIENT_PORTAL_ADOPTION_POLICY_MARKER_PHASE37D =
  "phase37d-client-portal-adoption-policy" as const;

export function assembleClientPortalAdoptionReview(input: {
  adoptionScopeSlug: string;
  definedMetricIds: Set<string>;
  generatedAt?: string;
}): ClientPortalAdoptionReviewResult {
  const metrics = CLIENT_PORTAL_ADOPTION_METRICS.map((metric) => ({
    ...metric,
    defined: input.definedMetricIds.has(metric.metricId),
  }));

  const required = metrics.filter((metric) => metric.required);
  const definedRequired = required.filter((metric) => metric.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CLIENT_PORTAL_ADOPTION_VERSION,
    adoptionScopeSlug: input.adoptionScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    metrics,
    completionRate,
    clientPortalAdoptionReviewReady: definedRequired === required.length,
  };
}
