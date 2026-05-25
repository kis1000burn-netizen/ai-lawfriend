/**
 * Product Phase 43-B — ClaimEvidenceEdgeEngine service.
 */
import {
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
  CLAIM_EVIDENCE_EDGE_ENGINE_ITEMS,
} from "./claim-evidence-edge-engine.registry";
import { assembleClaimEvidenceEdgeEngine } from "./claim-evidence-edge-engine.policy";
import type { ClaimEvidenceEdgeEngineResult } from "./claim-evidence-edge-engine.schema";

export const CLAIM_EVIDENCE_EDGE_ENGINE_SERVICE_MARKER_43B =
  "phase43b-claim-evidence-edge-engine-service" as const;

export function buildClaimEvidenceEdgeEngine(input?: {
  caseGraphScopeSlug?: string;
  definedItemIds?: string[];
}): ClaimEvidenceEdgeEngineResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      CLAIM_EVIDENCE_EDGE_ENGINE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleClaimEvidenceEdgeEngine({
    caseGraphScopeSlug: input?.caseGraphScopeSlug ?? CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
