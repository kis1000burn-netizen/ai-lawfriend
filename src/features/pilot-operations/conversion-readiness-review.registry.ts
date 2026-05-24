/**
 * Product Phase 27-E — Conversion readiness review axes SSOT.
 */
import type { ConversionReadinessReviewResult } from "./conversion-readiness-review.schema";

export const CONVERSION_READINESS_REVIEW_REGISTRY_MARKER_PHASE27E =
  "phase27e-conversion-readiness-review-registry" as const;

export const CONVERSION_READINESS_PASS_THRESHOLD = 85 as const;

type ReadinessAxis = Omit<ConversionReadinessReviewResult["axes"][number], "score">;

export const CONVERSION_READINESS_AXES: ReadinessAxis[] = [
  {
    axisId: "USAGE_BASELINE",
    label: "Pilot usage monitoring (27-A)",
    weight: 20,
  },
  {
    axisId: "SATISFACTION",
    label: "Lawyer / client satisfaction (27-C)",
    weight: 25,
  },
  {
    axisId: "SUPPORT_STABILITY",
    label: "Issue triage · hotfix loop (27-D)",
    weight: 20,
  },
  {
    axisId: "BILLING_READINESS",
    label: "Commercial billing · tenant RC",
    weight: 20,
  },
  {
    axisId: "LEGAL_SIGNOFF",
    label: "Legal / terms final review (26-C)",
    weight: 15,
  },
];
