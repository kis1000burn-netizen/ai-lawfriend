/**
 * Product Phase 40-E — LawyerJudgmentReviewWorkspace policy SSOT.
 */
import { LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEMS } from "./lawyer-judgment-review-workspace.registry";
import type { LawyerJudgmentReviewWorkspaceResult } from "./lawyer-judgment-review-workspace.schema";
import { LAWYER_JUDGMENT_REVIEW_WORKSPACE_VERSION } from "./lawyer-judgment-review-workspace.schema";

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_POLICY_MARKER_40E =
  "phase40e-lawyer-judgment-review-workspace-policy" as const;

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_GATE_MARKER_40E =
  "phase40e-lawyer-judgment-review-workspace-gate" as const;

export const JUDGMENT_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleLawyerJudgmentReviewWorkspace(input: {
  caseAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerJudgmentReviewWorkspaceResult {
  const items = LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_JUDGMENT_REVIEW_WORKSPACE_VERSION,
    caseAssessmentScopeSlug: input.caseAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerJudgmentReviewWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
