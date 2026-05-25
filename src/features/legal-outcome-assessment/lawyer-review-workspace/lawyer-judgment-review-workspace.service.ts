/**
 * Product Phase 40-E — LawyerJudgmentReviewWorkspace service.
 */
import {
  JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEMS,
} from "./lawyer-judgment-review-workspace.registry";
import { assembleLawyerJudgmentReviewWorkspace } from "./lawyer-judgment-review-workspace.policy";
import type { LawyerJudgmentReviewWorkspaceResult } from "./lawyer-judgment-review-workspace.schema";

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_SERVICE_MARKER_40E =
  "phase40e-lawyer-judgment-review-workspace-service" as const;

export function buildLawyerJudgmentReviewWorkspace(input?: {
  caseAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerJudgmentReviewWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerJudgmentReviewWorkspace({
    caseAssessmentScopeSlug: input?.caseAssessmentScopeSlug ?? JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
