/**
 * Product Phase 44-E — LawyerCourtReadyReviewWorkspace service.
 */
import {
  COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
  LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEMS,
} from "./lawyer-court-ready-review-workspace.registry";
import { assembleLawyerCourtReadyReviewWorkspace } from "./lawyer-court-ready-review-workspace.policy";
import type { LawyerCourtReadyReviewWorkspaceResult } from "./lawyer-court-ready-review-workspace.schema";

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_SERVICE_MARKER_44E =
  "phase44e-lawyer-court-ready-review-workspace-service" as const;

export function buildLawyerCourtReadyReviewWorkspace(input?: {
  casePackScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerCourtReadyReviewWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerCourtReadyReviewWorkspace({
    casePackScopeSlug: input?.casePackScopeSlug ?? COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
