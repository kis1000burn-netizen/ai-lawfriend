/**
 * Product Phase 35-B — Legal review workflow policy SSOT.
 */
import { LEGAL_REVIEW_STEPS } from "./legal-review-workflow.registry";
import type { LegalReviewWorkflowResult } from "./legal-review-workflow.schema";
import { LEGAL_REVIEW_WORKFLOW_VERSION } from "./legal-review-workflow.schema";

export const LEGAL_REVIEW_WORKFLOW_POLICY_MARKER_PHASE35B =
  "phase35b-legal-review-workflow-policy" as const;

export function assembleLegalReviewWorkflow(input: {
  contractingScopeSlug: string;
  definedStepIds: Set<string>;
  generatedAt?: string;
}): LegalReviewWorkflowResult {
  const steps = LEGAL_REVIEW_STEPS.map((step) => ({
    ...step,
    defined: input.definedStepIds.has(step.stepId),
  }));

  const required = steps.filter((step) => step.required);
  const definedRequired = required.filter((step) => step.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LEGAL_REVIEW_WORKFLOW_VERSION,
    contractingScopeSlug: input.contractingScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    steps,
    completionRate,
    legalReviewWorkflowReady: definedRequired === required.length,
  };
}
