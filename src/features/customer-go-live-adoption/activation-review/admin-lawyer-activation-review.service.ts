/**
 * Product Phase 37-C — Admin / lawyer activation review service.
 */
import { CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG } from "../go-live-execution/go-live-execution-checklist.registry";
import { ADMIN_LAWYER_ACTIVATION_METRICS } from "./admin-lawyer-activation-review.registry";
import { assembleAdminLawyerActivationReview } from "./admin-lawyer-activation-review.policy";
import type { AdminLawyerActivationReviewResult } from "./admin-lawyer-activation-review.schema";

export const ADMIN_LAWYER_ACTIVATION_SERVICE_MARKER_PHASE37C =
  "phase37c-admin-lawyer-activation-service" as const;

export function buildAdminLawyerActivationReview(input?: {
  adoptionScopeSlug?: string;
  definedMetricIds?: string[];
}): AdminLawyerActivationReviewResult {
  const definedMetricIds = new Set(
    input?.definedMetricIds ??
      ADMIN_LAWYER_ACTIVATION_METRICS.filter((metric) => metric.required).map(
        (metric) => metric.metricId,
      ),
  );

  return assembleAdminLawyerActivationReview({
    adoptionScopeSlug: input?.adoptionScopeSlug ?? CUSTOMER_GO_LIVE_ADOPTION_DEFAULT_SCOPE_SLUG,
    definedMetricIds,
  });
}
