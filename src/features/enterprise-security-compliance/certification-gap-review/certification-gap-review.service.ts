/**
 * Product Phase 32-E — Certification readiness gap review service.
 */
import { ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG } from "../security-control-inventory/security-control-inventory.registry";
import { assembleCertificationReadinessGapReview } from "./certification-gap-review.policy";
import type { CertificationReadinessGapReviewResult } from "./certification-gap-review.schema";

export const CERTIFICATION_GAP_REVIEW_SERVICE_MARKER_PHASE32E =
  "phase32e-certification-gap-review-service" as const;

export function buildCertificationReadinessGapReview(input?: {
  reviewScopeSlug?: string;
}): CertificationReadinessGapReviewResult {
  return assembleCertificationReadinessGapReview({
    reviewScopeSlug: input?.reviewScopeSlug ?? ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG,
  });
}
