/**
 * Product Phase 43-B — ClaimEvidenceEdgeEngine policy SSOT.
 */
import { CLAIM_EVIDENCE_EDGE_ENGINE_ITEMS } from "./claim-evidence-edge-engine.registry";
import type { ClaimEvidenceEdgeEngineResult } from "./claim-evidence-edge-engine.schema";
import { CLAIM_EVIDENCE_EDGE_ENGINE_VERSION } from "./claim-evidence-edge-engine.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG } from "./claim-evidence-edge-engine.registry";

export const CLAIM_EVIDENCE_EDGE_ENGINE_POLICY_MARKER_43B =
  "phase43b-claim-evidence-edge-engine-policy" as const;

export const CLAIM_EVIDENCE_EDGE_ENGINE_GATE_MARKER_43B =
  "phase43b-claim-evidence-edge-engine-gate" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const CLAIM_GRAPH_BOUNDARY_NO_UNLINKED_CLAIM =
  "NO_UNLINKED_CLAIM_GRAPH" as const;

export function assembleClaimEvidenceEdgeEngine(input: {
  caseGraphScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ClaimEvidenceEdgeEngineResult {
  const items = CLAIM_EVIDENCE_EDGE_ENGINE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CLAIM_EVIDENCE_EDGE_ENGINE_VERSION,
    caseGraphScopeSlug: input.caseGraphScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    claimEvidenceEdgeEngineReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
