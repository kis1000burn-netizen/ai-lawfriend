/**
 * Product Phase 35-B — Legal review workflow SSOT.
 */
import type { LegalReviewWorkflowResult } from "./legal-review-workflow.schema";

export const LEGAL_REVIEW_WORKFLOW_REGISTRY_MARKER_PHASE35B =
  "phase35b-legal-review-workflow-registry" as const;

type LegalReviewStep = Omit<LegalReviewWorkflowResult["steps"][number], "defined">;

export const LEGAL_REVIEW_STEPS: LegalReviewStep[] = [
  { stepId: "INTAKE_TRIAGE", label: "Deal intake triage", required: true },
  { stepId: "CONTRACT_REVIEW", label: "Contract terms review", required: true },
  { stepId: "SECURITY_REVIEW", label: "Security addendum review", required: true },
  { stepId: "PRIVACY_REVIEW", label: "Privacy / DPA review", required: true },
  { stepId: "FINAL_LEGAL_SIGNOFF", label: "Final legal signoff checkpoint", required: true },
];
