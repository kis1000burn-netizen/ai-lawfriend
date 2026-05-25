/**
 * Product Phase 44-E — LawyerCourtReadyReviewWorkspace policy SSOT.
 */
import { LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEMS, COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG } from "./lawyer-court-ready-review-workspace.registry";
import type { LawyerCourtReadyReviewWorkspaceResult } from "./lawyer-court-ready-review-workspace.schema";
import { LAWYER_COURT_READY_REVIEW_WORKSPACE_VERSION } from "./lawyer-court-ready-review-workspace.schema";

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_POLICY_MARKER_44E =
  "phase44e-lawyer-court-ready-review-workspace-policy" as const;

export const LAWYER_COURT_READY_REVIEW_WORKSPACE_GATE_MARKER_44E =
  "phase44e-lawyer-court-ready-review-workspace-gate" as const;

export const COURT_READY_BOUNDARY_NO_AUTOMATIC_COURT_SUBMISSION =
  "NO_AUTOMATIC_COURT_SUBMISSION" as const;
export const COURT_READY_BOUNDARY_NO_E_FILING_AUTO_UPLOAD =
  "NO_E_FILING_AUTO_UPLOAD" as const;
export const COURT_READY_BOUNDARY_NO_COURT_READY_BEFORE_LAWYER_REVIEW =
  "NO_COURT_READY_BEFORE_LAWYER_REVIEW" as const;
export const COURT_READY_BOUNDARY_NO_INTERNAL_STRATEGY_GRAPH_IN_DEFAULT_PACK =
  "NO_INTERNAL_STRATEGY_GRAPH_IN_DEFAULT_PACK" as const;
export const COURT_READY_BOUNDARY_NO_SENSITIVE_CLIENT_COUNSELING_AUTO_INCLUDE =
  "NO_SENSITIVE_CLIENT_COUNSELING_AUTO_INCLUDE" as const;


export function assembleLawyerCourtReadyReviewWorkspace(input: {
  casePackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerCourtReadyReviewWorkspaceResult {
  const items = LAWYER_COURT_READY_REVIEW_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_COURT_READY_REVIEW_WORKSPACE_VERSION,
    casePackScopeSlug: input.casePackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerCourtReadyReviewWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    samplePack: {
      packId: "court-ready-pack-sample-001",
      casePackScopeSlug: COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
      sections: ["CASE_SUMMARY", "ISSUE_TABLE", "EVIDENCE_LIST", "JUDGMENT_PROCEDURE"],
      courtReadyMarked: false as const,
      automaticCourtSubmission: false as const,
      eFilingAutoUpload: false as const,
      internalStrategyGraphIncluded: false as const,
      sensitiveClientCounselingIncluded: false as const,
      lawyerReviewRequired: true as const,
      lawyerReviewStatus: "NEEDS_REVIEW" as const,
    },
  };
}
