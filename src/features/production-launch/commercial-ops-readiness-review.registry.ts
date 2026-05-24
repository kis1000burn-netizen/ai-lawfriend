/**
 * Product Phase 25-E — Commercial ops readiness axes SSOT.
 */
import type { CommercialOpsReadinessReviewResult } from "./commercial-ops-readiness-review.schema";

export const COMMERCIAL_OPS_READINESS_REVIEW_REGISTRY_MARKER_PHASE25E =
  "phase25e-commercial-ops-readiness-review-registry" as const;

export const COMMERCIAL_OPS_READINESS_PASS_THRESHOLD = 85 as const;

type ReadinessAxis = Omit<CommercialOpsReadinessReviewResult["axes"][number], "score">;

export const COMMERCIAL_OPS_READINESS_AXES: ReadinessAxis[] = [
  {
    axisId: "tenant-commercial",
    label: "Tenant / Plan / Metering (22-F)",
    weight: 20,
    evidenceTag: "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
  },
  {
    axisId: "messaging-live",
    label: "Real Messaging · secure delivery (20-F)",
    weight: 20,
    evidenceTag: "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
  },
  {
    axisId: "ai-quality",
    label: "AI Quality / Case Pack (23-F)",
    weight: 15,
    evidenceTag: "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC",
  },
  {
    axisId: "litigation-ops",
    label: "Litigation Operations (24-F)",
    weight: 15,
    evidenceTag: "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
  },
  {
    axisId: "reliability-governance",
    label: "Reliability · Data Governance (18-F · 19-F)",
    weight: 15,
    evidenceTag: "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC",
  },
  {
    axisId: "operator-training",
    label: "Operator training · admin playbook (25-C)",
    weight: 15,
  },
];
