/**
 * Product Phase 37-C — Admin / lawyer activation review SSOT.
 */
import type { AdminLawyerActivationReviewResult } from "./admin-lawyer-activation-review.schema";

export const ADMIN_LAWYER_ACTIVATION_REGISTRY_MARKER_PHASE37C =
  "phase37c-admin-lawyer-activation-registry" as const;

type AdminLawyerActivationMetric = Omit<
  AdminLawyerActivationReviewResult["metrics"][number],
  "defined"
>;

export const ADMIN_LAWYER_ACTIVATION_METRICS: AdminLawyerActivationMetric[] = [
  { metricId: "ADMIN_LOGIN_ACTIVATION", label: "Admin login activation rate", required: true },
  { metricId: "LAWYER_CASE_WORKFLOW", label: "Lawyer case workflow usage", required: true },
  { metricId: "DOCUMENT_REVIEW_USAGE", label: "Document review workflow usage", required: true },
  { metricId: "INTERVIEW_COMPLETION", label: "Interview completion tracking", required: true },
  { metricId: "ROLE_COVERAGE_GAP", label: "Role coverage gap review", required: true },
];
