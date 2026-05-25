/**
 * Product Phase 41-E — LawyerSentencingReviewWorkspace service.
 */
import {
  SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEMS,
} from "./lawyer-sentencing-review-workspace.registry";
import { assembleLawyerSentencingReviewWorkspace } from "./lawyer-sentencing-review-workspace.policy";
import type { LawyerSentencingReviewWorkspaceResult } from "./lawyer-sentencing-review-workspace.schema";

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_SERVICE_MARKER_41E =
  "phase41e-lawyer-sentencing-review-workspace-service" as const;

export function buildLawyerSentencingReviewWorkspace(input?: {
  sentencingAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerSentencingReviewWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerSentencingReviewWorkspace({
    sentencingAssessmentScopeSlug: input?.sentencingAssessmentScopeSlug ?? SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
