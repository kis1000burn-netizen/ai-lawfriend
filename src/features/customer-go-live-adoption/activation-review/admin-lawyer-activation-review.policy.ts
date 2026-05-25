/**
 * Product Phase 37-C — Admin / lawyer activation review policy SSOT.
 */
import { ADMIN_LAWYER_ACTIVATION_METRICS } from "./admin-lawyer-activation-review.registry";
import type { AdminLawyerActivationReviewResult } from "./admin-lawyer-activation-review.schema";
import { ADMIN_LAWYER_ACTIVATION_VERSION } from "./admin-lawyer-activation-review.schema";

export const ADMIN_LAWYER_ACTIVATION_POLICY_MARKER_PHASE37C =
  "phase37c-admin-lawyer-activation-policy" as const;

export function assembleAdminLawyerActivationReview(input: {
  adoptionScopeSlug: string;
  definedMetricIds: Set<string>;
  generatedAt?: string;
}): AdminLawyerActivationReviewResult {
  const metrics = ADMIN_LAWYER_ACTIVATION_METRICS.map((metric) => ({
    ...metric,
    defined: input.definedMetricIds.has(metric.metricId),
  }));

  const required = metrics.filter((metric) => metric.required);
  const definedRequired = required.filter((metric) => metric.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ADMIN_LAWYER_ACTIVATION_VERSION,
    adoptionScopeSlug: input.adoptionScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    metrics,
    completionRate,
    adminLawyerActivationReviewReady: definedRequired === required.length,
  };
}
