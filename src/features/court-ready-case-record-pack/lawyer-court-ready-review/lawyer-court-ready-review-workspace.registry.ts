/**
 * Product Phase 44-E — LawyerCourtReadyReviewWorkspace SSOT.
 */
import type { LawyerCourtReadyReviewWorkspaceResult } from "./lawyer-court-ready-review-workspace.schema";

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_REGISTRY_MARKER_44E =
  "phase44e-lawyer-court-ready-review-workspace-registry" as const;

export const COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG = "court-ready-case-record-pack-001" as const;

type LawyerCourtReadyReviewWorkspaceItem = Omit<LawyerCourtReadyReviewWorkspaceResult["items"][number], "defined">;

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEMS: LawyerCourtReadyReviewWorkspaceItem[] = [
  { itemId: "PACK_SECTION_REVIEW", label: "Review all pack sections", required: true },
  { itemId: "COURT_READY_MARK_GATE", label: "Court-ready mark gate", required: true },
  { itemId: "EXCLUDE_STRATEGY_GRAPH", label: "Exclude internal strategy graph by default", required: true },
  { itemId: "EXCLUDE_SENSITIVE_COUNSELING", label: "Exclude sensitive client counseling by default", required: true },
  { itemId: "NO_AUTO_SUBMIT_ACK", label: "No automatic court submission acknowledgment", required: true },
];
