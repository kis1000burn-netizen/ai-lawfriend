/**
 * Product Phase 37-D — Client portal adoption review service.
 */
import { CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG } from "../go-live-execution/go-live-execution-checklist.registry";
import { CLIENT_PORTAL_ADOPTION_METRICS } from "./client-portal-adoption-review.registry";
import { assembleClientPortalAdoptionReview } from "./client-portal-adoption-review.policy";
import type { ClientPortalAdoptionReviewResult } from "./client-portal-adoption-review.schema";

export const CLIENT_PORTAL_ADOPTION_SERVICE_MARKER_PHASE37D =
  "phase37d-client-portal-adoption-service" as const;

export function buildClientPortalAdoptionReview(input?: {
  adoptionScopeSlug?: string;
  definedMetricIds?: string[];
}): ClientPortalAdoptionReviewResult {
  const definedMetricIds = new Set(
    input?.definedMetricIds ??
      CLIENT_PORTAL_ADOPTION_METRICS.filter((metric) => metric.required).map(
        (metric) => metric.metricId,
      ),
  );

  return assembleClientPortalAdoptionReview({
    adoptionScopeSlug: input?.adoptionScopeSlug ?? CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG,
    definedMetricIds,
  });
}
