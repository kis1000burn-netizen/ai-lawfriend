/**
 * Product Phase 41-E — LawyerSentencingReviewWorkspace policy SSOT.
 */
import { LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEMS } from "./lawyer-sentencing-review-workspace.registry";
import type { LawyerSentencingReviewWorkspaceResult } from "./lawyer-sentencing-review-workspace.schema";
import { LAWYER_SENTENCING_REVIEW_WORKSPACE_VERSION } from "./lawyer-sentencing-review-workspace.schema";

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_POLICY_MARKER_41E =
  "phase41e-lawyer-sentencing-review-workspace-policy" as const;

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_GATE_MARKER_41E =
  "phase41e-lawyer-sentencing-review-workspace-gate" as const;

export const SENTENCING_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const SENTENCING_WORKSPACE_BOUNDARY_NO_CLIENT_VISIBLE =
  "NO_CLIENT_VISIBLE_SENTENCING_PROBABILITY" as const;

export function assembleLawyerSentencingReviewWorkspace(input: {
  sentencingAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerSentencingReviewWorkspaceResult {
  const items = LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_SENTENCING_REVIEW_WORKSPACE_VERSION,
    sentencingAssessmentScopeSlug: input.sentencingAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerSentencingReviewWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    clientVisibleBeforeReview: false,
  };
}
