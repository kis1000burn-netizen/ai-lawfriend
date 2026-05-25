/**
 * Product Phase 42-E — LawyerEvidenceIntegrityReviewWorkspace policy SSOT.
 */
import { LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEMS } from "./lawyer-evidence-integrity-review-workspace.registry";
import type { LawyerEvidenceIntegrityReviewWorkspaceResult } from "./lawyer-evidence-integrity-review-workspace.schema";
import { LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_VERSION } from "./lawyer-evidence-integrity-review-workspace.schema";

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_POLICY_MARKER_42E =
  "phase42e-lawyer-evidence-integrity-review-workspace-policy" as const;

export const LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_GATE_MARKER_42E =
  "phase42e-lawyer-evidence-integrity-review-workspace-gate" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const EVIDENCE_INTEGRITY_BOUNDARY_ORIGINAL_TRACE_REQUIRED =
  "ORIGINAL_EVIDENCE_TRACE_REQUIRED" as const;

export function assembleLawyerEvidenceIntegrityReviewWorkspace(input: {
  evidenceIntegrityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerEvidenceIntegrityReviewWorkspaceResult {
  const items = LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_VERSION,
    evidenceIntegrityScopeSlug: input.evidenceIntegrityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerEvidenceIntegrityReviewWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
