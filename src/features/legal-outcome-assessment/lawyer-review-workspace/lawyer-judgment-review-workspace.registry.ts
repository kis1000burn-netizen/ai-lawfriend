/**
 * Product Phase 40-E — LawyerJudgmentReviewWorkspace SSOT.
 */
import type { LawyerJudgmentReviewWorkspaceResult } from "./lawyer-judgment-review-workspace.schema";

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_REGISTRY_MARKER_40E =
  "phase40e-lawyer-judgment-review-workspace-registry" as const;

export const JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "judgment-grounded-outcome-assessment-001" as const;

type LawyerJudgmentReviewWorkspaceItem = Omit<LawyerJudgmentReviewWorkspaceResult["items"][number], "defined">;

export const LAWYER_JUDGMENT_REVIEW_WORKSPACE_ITEMS: LawyerJudgmentReviewWorkspaceItem[] = [
  { itemId: "JUDGMENT_DRAWER_OPEN", label: "Judgment drawer open action", required: true },
  { itemId: "ORIGINAL_TEXT_VIEW", label: "Original judgment text view", required: true },
  { itemId: "RELEVANT_PARAGRAPH_VIEW", label: "Relevant paragraph view", required: true },
  { itemId: "APPLICATION_ANALYSIS_VIEW", label: "Application analysis view", required: true },
  { itemId: "REVIEW_CONFIRM_ACTION", label: "Review confirm action", required: true },
  { itemId: "REVIEW_CORRECT_ACTION", label: "Review correct action", required: true },
  { itemId: "REVIEW_REJECT_ACTION", label: "Review reject action", required: true },
  { itemId: "LAWYER_MEMO_CAPTURE", label: "Lawyer memo capture", required: true },
];
