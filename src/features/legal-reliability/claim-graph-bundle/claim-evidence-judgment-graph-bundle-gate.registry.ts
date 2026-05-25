/**
 * Product Phase 47-D — ClaimEvidenceJudgmentGraphBundleGate SSOT.
 */
import type { ClaimEvidenceJudgmentGraphBundleGateResult } from "./claim-evidence-judgment-graph-bundle-gate.schema";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_REGISTRY_MARKER_47D =
  "phase47d-claim-evidence-judgment-graph-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type ClaimEvidenceJudgmentGraphBundleGateItem = Omit<ClaimEvidenceJudgmentGraphBundleGateResult["items"][number], "defined">;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEMS: ClaimEvidenceJudgmentGraphBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
