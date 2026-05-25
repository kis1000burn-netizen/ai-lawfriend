/**
 * Product Phase 45-B — JudgmentClaimLinkExplainabilityEngine SSOT.
 */
import type { JudgmentClaimLinkExplainabilityEngineResult } from "./judgment-claim-link-explainability-engine.schema";

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_REGISTRY_MARKER_45B =
  "phase45b-judgment-claim-link-explainability-engine-registry" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG = "judicial-transparency-explainability-001" as const;

type JudgmentClaimLinkExplainabilityEngineItem = Omit<JudgmentClaimLinkExplainabilityEngineResult["items"][number], "defined">;

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEMS: JudgmentClaimLinkExplainabilityEngineItem[] = [
  { itemId: "JUDGMENT_REFERENCE_TRACE", label: "Referenced judgment trace", required: true },
  { itemId: "LINKED_CLAIM_TRACE", label: "Linked claim trace per output", required: true },
  { itemId: "HIDDEN_OMISSION_GUARD", label: "Hidden source omission guard", required: true },
  { itemId: "JUDGMENT_CLAIM_LAWYER_REVIEW", label: "Lawyer review of judgment/claim links", required: true },
];
