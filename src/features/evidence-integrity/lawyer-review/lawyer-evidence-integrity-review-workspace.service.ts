/**
 * Product Phase 42-E — LawyerEvidenceIntegrityReviewWorkspace service.
 */
import {
  EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
  LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEMS,
} from "./lawyer-evidence-integrity-review-workspace.registry";
import { assembleLawyerEvidenceIntegrityReviewWorkspace } from "./lawyer-evidence-integrity-review-workspace.policy";
import type { LawyerEvidenceIntegrityReviewWorkspaceResult } from "./lawyer-evidence-integrity-review-workspace.schema";

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_SERVICE_MARKER_42E =
  "phase42e-lawyer-evidence-integrity-review-workspace-service" as const;

export function buildLawyerEvidenceIntegrityReviewWorkspace(input?: {
  evidenceIntegrityScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerEvidenceIntegrityReviewWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerEvidenceIntegrityReviewWorkspace({
    evidenceIntegrityScopeSlug: input?.evidenceIntegrityScopeSlug ?? EVIDENCE_INTEGRITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
