/**
 * Product Phase 47-D — ClaimEvidenceJudgmentGraphBundleGate policy SSOT.
 */
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEMS, LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG } from "./claim-evidence-judgment-graph-bundle-gate.registry";
import type { ClaimEvidenceJudgmentGraphBundleGateResult } from "./claim-evidence-judgment-graph-bundle-gate.schema";
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_VERSION } from "./claim-evidence-judgment-graph-bundle-gate.schema";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_POLICY_MARKER_47D =
  "phase47d-claim-evidence-judgment-graph-bundle-gate-policy" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_GATE_MARKER_47D =
  "phase47d-claim-evidence-judgment-graph-bundle-gate-gate" as const;

export const LEGAL_RELIABILITY_BUNDLED_PHASE_43F =
  "43-F" as const;

export function assembleClaimEvidenceJudgmentGraphBundleGate(input: {
  legalReliabilityScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): ClaimEvidenceJudgmentGraphBundleGateResult {
  const items = CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_VERSION,
    legalReliabilityScopeSlug: input.legalReliabilityScopeSlug,
    bundledPhase: "43-F",
    bundledVerifyScript: "verify:aibeopchin-claim-evidence-judgment-graph-rc",
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    claimEvidenceJudgmentGraphBundleGateReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
