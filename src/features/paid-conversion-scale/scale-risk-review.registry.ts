/**
 * Product Phase 28-E — Scale risk review axes SSOT.
 */
import type { ScaleRiskReviewResult } from "./scale-risk-review.schema";

export const SCALE_RISK_REVIEW_REGISTRY_MARKER_PHASE28E =
  "phase28e-scale-risk-review-registry" as const;

export const SCALE_RISK_PASS_THRESHOLD = 80 as const;

type RiskAxis = Omit<ScaleRiskReviewResult["axes"][number], "score">;

export const SCALE_RISK_AXES: RiskAxis[] = [
  { axisId: "DATABASE_CAPACITY", label: "Database · connection pool", weight: 25 },
  { axisId: "MESSAGING_THROUGHPUT", label: "Messaging throughput · queue depth", weight: 20 },
  { axisId: "AI_INFERENCE", label: "AI inference · rate limits", weight: 20 },
  { axisId: "STORAGE_GROWTH", label: "Attachment storage growth", weight: 15 },
  { axisId: "OPERATIONS_ONCALL", label: "Ops on-call · incident capacity", weight: 20 },
];
