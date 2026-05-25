/**
 * Product Phase 41-E — LawyerSentencingReviewWorkspace SSOT.
 */
import type { LawyerSentencingReviewWorkspaceResult } from "./lawyer-sentencing-review-workspace.schema";

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_REGISTRY_MARKER_41E =
  "phase41e-lawyer-sentencing-review-workspace-registry" as const;

export const SENTENCING_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "sentencing-outcome-assessment-001" as const;

type LawyerSentencingReviewWorkspaceItem = Omit<LawyerSentencingReviewWorkspaceResult["items"][number], "defined">;

export const LAWYER_SENTENCING_REVIEW_WORKSPACE_ITEMS: LawyerSentencingReviewWorkspaceItem[] = [
  { itemId: "JUDGMENT_CARD_OPEN", label: "Sentencing judgment card open", required: true },
  { itemId: "ORIGINAL_AND_SENTENCE_VIEW", label: "Original text and sentence view", required: true },
  { itemId: "SENTENCING_REASON_VIEW", label: "Sentencing reason paragraph view", required: true },
  { itemId: "FACT_PARAGRAPH_VIEW", label: "Offense fact paragraph view", required: true },
  { itemId: "SIMILARITY_COMPARISON_VIEW", label: "Similarity and distinction view", required: true },
  { itemId: "SENTENCING_FACTOR_TABLE", label: "Sentencing factor comparison table", required: true },
  { itemId: "REVIEW_CONFIRM_REJECT", label: "Review confirm / correct / reject", required: true },
  { itemId: "LAWYER_MEMO_CAPTURE", label: "Lawyer memo capture", required: true },
];
