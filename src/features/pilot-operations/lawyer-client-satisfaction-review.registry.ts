/**
 * Product Phase 27-C — Lawyer / client satisfaction review axes SSOT.
 */
import type { LawyerClientSatisfactionReviewResult } from "./lawyer-client-satisfaction-review.schema";

export const LAWYER_CLIENT_SATISFACTION_REVIEW_REGISTRY_MARKER_PHASE27C =
  "phase27c-lawyer-client-satisfaction-review-registry" as const;

export const SATISFACTION_REVIEW_PASS_THRESHOLD = 75 as const;

type ReviewAxis = Omit<LawyerClientSatisfactionReviewResult["axes"][number], "score">;

export const SATISFACTION_REVIEW_AXES: ReviewAxis[] = [
  { axisId: "LAWYER_WORKFLOW", label: "Lawyer workflow · workbench", weight: 25 },
  { axisId: "CLIENT_PORTAL", label: "Client portal · mobile", weight: 20 },
  { axisId: "AI_QUALITY", label: "AI quality · case pack", weight: 20 },
  { axisId: "RESPONSE_TIME", label: "Response time · CS SLA", weight: 15 },
  { axisId: "OVERALL_NPS", label: "Overall NPS", weight: 20 },
];
