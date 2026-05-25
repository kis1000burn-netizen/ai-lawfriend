/**
 * Product Phase 45-B — JudgmentClaimLinkExplainabilityEngine service.
 */
import {
  JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
  JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEMS,
} from "./judgment-claim-link-explainability-engine.registry";
import { assembleJudgmentClaimLinkExplainabilityEngine } from "./judgment-claim-link-explainability-engine.policy";
import type { JudgmentClaimLinkExplainabilityEngineResult } from "./judgment-claim-link-explainability-engine.schema";

export const JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_SERVICE_MARKER_45B =
  "phase45b-judgment-claim-link-explainability-engine-service" as const;

export function buildJudgmentClaimLinkExplainabilityEngine(input?: {
  explainabilityScopeSlug?: string;
  definedItemIds?: string[];
}): JudgmentClaimLinkExplainabilityEngineResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleJudgmentClaimLinkExplainabilityEngine({
    explainabilityScopeSlug:
      input?.explainabilityScopeSlug ?? JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
