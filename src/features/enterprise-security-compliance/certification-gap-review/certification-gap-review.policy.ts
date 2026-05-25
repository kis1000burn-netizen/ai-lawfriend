/**
 * Product Phase 32-E — Certification readiness gap review policy SSOT.
 */
import { CERTIFICATION_GAP_ITEMS } from "./certification-gap-review.registry";
import type {
  CertificationGapStatus,
  CertificationReadinessGapReviewResult,
} from "./certification-gap-review.schema";
import { CERTIFICATION_GAP_REVIEW_VERSION } from "./certification-gap-review.schema";

export const CERTIFICATION_GAP_REVIEW_POLICY_MARKER_PHASE32E =
  "phase32e-certification-gap-review-policy" as const;

export const NO_CERTIFICATION_CLAIM_MARKER_PHASE32 =
  "phase32-no-certification-claim-boundary" as const;

export function assembleCertificationReadinessGapReview(input: {
  reviewScopeSlug: string;
  statusByGapId?: Record<string, CertificationGapStatus>;
  generatedAt?: string;
}): CertificationReadinessGapReviewResult {
  const gaps = CERTIFICATION_GAP_ITEMS.map((item) => ({
    gapId: item.gapId,
    label: item.label,
    framework: item.framework,
    required: item.required,
    status: input.statusByGapId?.[item.gapId] ?? item.defaultStatus,
  }));

  const metCount = gaps.filter((gap) => gap.status === "MET").length;
  const partialCount = gaps.filter((gap) => gap.status === "PARTIAL").length;
  const gapCount = gaps.filter((gap) => gap.status === "GAP").length;

  const required = gaps.filter((gap) => gap.required);
  const noRequiredGap = required.every((gap) => gap.status !== "GAP");

  return {
    version: CERTIFICATION_GAP_REVIEW_VERSION,
    reviewScopeSlug: input.reviewScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    gaps,
    metCount,
    partialCount,
    gapCount,
    certificationGapReviewReady: noRequiredGap,
  };
}
