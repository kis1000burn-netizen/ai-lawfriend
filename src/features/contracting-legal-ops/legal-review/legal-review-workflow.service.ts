/**
 * Product Phase 35-B — Legal review workflow service.
 */
import { CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG } from "../contract-template/contract-template-pack.registry";
import { LEGAL_REVIEW_STEPS } from "./legal-review-workflow.registry";
import { assembleLegalReviewWorkflow } from "./legal-review-workflow.policy";
import type { LegalReviewWorkflowResult } from "./legal-review-workflow.schema";

export const LEGAL_REVIEW_WORKFLOW_SERVICE_MARKER_PHASE35B =
  "phase35b-legal-review-workflow-service" as const;

export function buildLegalReviewWorkflow(input?: {
  contractingScopeSlug?: string;
  definedStepIds?: string[];
}): LegalReviewWorkflowResult {
  const definedStepIds = new Set(
    input?.definedStepIds ??
      LEGAL_REVIEW_STEPS.filter((step) => step.required).map((step) => step.stepId),
  );

  return assembleLegalReviewWorkflow({
    contractingScopeSlug: input?.contractingScopeSlug ?? CONTRACTING_LEGAL_OPS_DEFAULT_SCOPE_SLUG,
    definedStepIds,
  });
}
