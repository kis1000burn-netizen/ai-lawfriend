/**
 * Product Phase 39-D — Executive sponsor review SSOT.
 */
import type { ExecutiveSponsorReviewResult } from "./executive-sponsor-review.schema";

export const EXECUTIVE_SPONSOR_REVIEW_REGISTRY_MARKER_PHASE39D =
  "phase39d-executive-sponsor-review-registry" as const;

type ExecutiveSponsorReviewItem = Omit<ExecutiveSponsorReviewResult["items"][number], "defined">;

export const EXECUTIVE_SPONSOR_REVIEW_ITEMS: ExecutiveSponsorReviewItem[] = [
  { itemId: "SPONSOR_ASSIGNMENT", label: "Executive sponsor assignment", required: true },
  { itemId: "EXECUTIVE_ALIGNMENT", label: "Executive alignment session", required: true },
  { itemId: "QUARTERLY_SPONSOR_TOUCH", label: "Quarterly sponsor touchpoint", required: true },
  { itemId: "ESCALATION_PATH", label: "Executive escalation path", required: true },
  { itemId: "SPONSOR_SIGNOFF", label: "Sponsor signoff checkpoint", required: true },
];
