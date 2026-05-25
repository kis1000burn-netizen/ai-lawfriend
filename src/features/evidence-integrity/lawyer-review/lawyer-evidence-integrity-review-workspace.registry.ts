/**
 * Product Phase 42-E — LawyerEvidenceIntegrityReviewWorkspace SSOT.
 */
import type { LawyerEvidenceIntegrityReviewWorkspaceResult } from "./lawyer-evidence-integrity-review-workspace.schema";

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_REGISTRY_MARKER_42E =
  "phase42e-lawyer-evidence-integrity-review-workspace-registry" as const;

export const EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG = "evidence-integrity-001" as const;

type LawyerEvidenceIntegrityReviewWorkspaceItem = Omit<LawyerEvidenceIntegrityReviewWorkspaceResult["items"][number], "defined">;

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEMS: LawyerEvidenceIntegrityReviewWorkspaceItem[] = [
  { itemId: "ORIGINAL_VIEW_ACTION", label: "Open original evidence file", required: true },
  { itemId: "EXTRACT_TO_SOURCE_NAV", label: "Navigate extract to source anchor", required: true },
  { itemId: "CUSTODY_LOG_VIEW", label: "View chain of custody log", required: true },
  { itemId: "REVIEW_CONFIRM_ACTION", label: "Review confirm action", required: true },
  { itemId: "REVIEW_REJECT_ACTION", label: "Review reject action", required: true },
  { itemId: "LAWYER_MEMO_CAPTURE", label: "Lawyer memo capture", required: true },
];
