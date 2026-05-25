/**
 * Product Phase 45-E — CourtReadyPackItemExplainabilityWorkspace policy SSOT.
 */
import { COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEMS, JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG } from "./court-ready-pack-item-explainability-workspace.registry";
import type { CourtReadyPackItemExplainabilityWorkspaceResult } from "./court-ready-pack-item-explainability-workspace.schema";
import { COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_VERSION } from "./court-ready-pack-item-explainability-workspace.schema";

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_POLICY_MARKER_45E =
  "phase45e-court-ready-pack-item-explainability-workspace-policy" as const;

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_GATE_MARKER_45E =
  "phase45e-court-ready-pack-item-explainability-workspace-gate" as const;

export const EXPLAINABILITY_BOUNDARY_NO_UNEXPLAINED_AI_OUTPUT =
  "NO_UNEXPLAINED_AI_OUTPUT" as const;
export const EXPLAINABILITY_BOUNDARY_NO_CLIENT_VISIBLE_WITHOUT_LAWYER_REVIEW =
  "NO_CLIENT_VISIBLE_EXPLAINABILITY_WITHOUT_LAWYER_REVIEW" as const;
export const EXPLAINABILITY_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;


export function assembleCourtReadyPackItemExplainabilityWorkspace(input: {
  explainabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): CourtReadyPackItemExplainabilityWorkspaceResult {
  const items = COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_VERSION,
    explainabilityScopeSlug: input.explainabilityScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    courtReadyPackItemExplainabilityWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    sampleExplainabilityTrace: {
      traceId: "explainability-trace-sample-001",
      explainabilityScopeSlug: JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
      evidenceUsed: [{ evidenceId: "evidence-001", label: "Contract and chat log" }],
      judgmentsReferenced: [{ judgmentId: "judgment-001", label: "Similar breach judgment" }],
      excludedMaterials: [{ materialId: "memo-internal-001", reason: "Internal strategy memo" }],
      linkedClaims: [{ claimId: "claim-001", label: "Contract breach claim" }],
      similarityDifferenceAnalysis: {
        similarityNotes: "Similar contractual breach pattern",
        differenceNotes: "Different damage amount scale",
      },
      uncertaintySignals: [{ signalId: "unc-001", level: "MEDIUM" as const, note: "Witness credibility unclear" }],
      lawyerCorrectionHistory: [],
      finalReviewer: { reviewerId: "lawyer-pending", status: "NEEDS_REVIEW" as const },
      courtReadyPackItemRefs: ["CASE_SUMMARY", "ISSUE_TABLE"],
      unexplainedOutputAllowed: false as const,
      lawyerReviewRequired: true as const,
    },
  };
}
