/**
 * Product Phase 43-B — ClaimEvidenceEdgeEngine SSOT.
 */
import type { ClaimEvidenceEdgeEngineResult } from "./claim-evidence-edge-engine.schema";

export const CLAIM_EVIDENCE_EDGE_ENGINE_REGISTRY_MARKER_43B =
  "phase43b-claim-evidence-edge-engine-registry" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG = "claim-evidence-judgment-graph-001" as const;

type ClaimEvidenceEdgeEngineItem = Omit<ClaimEvidenceEdgeEngineResult["items"][number], "defined">;

export const CLAIM_EVIDENCE_EDGE_ENGINE_ITEMS: ClaimEvidenceEdgeEngineItem[] = [
  { itemId: "CLAIM_EVIDENCE_EDGE", label: "Claim to evidence edge", required: true },
  { itemId: "EVIDENCE_ISSUE_EDGE", label: "Evidence to issue edge", required: true },
  { itemId: "WEAK_EVIDENCE_RISK", label: "Weak evidence risk signal", required: true },
  { itemId: "EDGE_LAWYER_REVIEW", label: "Lawyer review of claim-evidence edges", required: true },
];
