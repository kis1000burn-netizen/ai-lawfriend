/**
 * Product Phase 46-E — NeutralPackReviewWorkspace policy SSOT.
 */
import { NEUTRAL_PACK_REVIEW_WORKSPACE_ITEMS, NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG } from "./neutral-pack-review-workspace.registry";
import type { NeutralPackReviewWorkspaceResult } from "./neutral-pack-review-workspace.schema";
import { NEUTRAL_PACK_REVIEW_WORKSPACE_VERSION } from "./neutral-pack-review-workspace.schema";

export const NEUTRAL_PACK_REVIEW_WORKSPACE_POLICY_MARKER_46E =
  "phase46e-neutral-pack-review-workspace-policy" as const;

export const NEUTRAL_PACK_REVIEW_WORKSPACE_GATE_MARKER_46E =
  "phase46e-neutral-pack-review-workspace-gate" as const;

export const NEUTRAL_PACK_BOUNDARY_NO_DIRECT_COURT_ACCESS =
  "NO_DIRECT_COURT_ACCESS" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_MEDIATOR_PORTAL_BY_DEFAULT =
  "NO_MEDIATOR_PORTAL_BY_DEFAULT" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_OPPOSING_PARTY_AUTO_SHARE =
  "NO_OPPOSING_PARTY_AUTO_SHARE" as const;
export const NEUTRAL_PACK_BOUNDARY_LAWYER_CONTROLLED_EXPORT_ONLY =
  "LAWYER_CONTROLLED_EXPORT_ONLY" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK =
  "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_UNREVIEWED_AI_OUTPUT =
  "NO_UNREVIEWED_AI_OUTPUT" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_CLIENT_CONFIDENTIAL_MEMO =
  "NO_CLIENT_CONFIDENTIAL_MEMO" as const;

export function assembleNeutralPackReviewWorkspace(input: {
  neutralPackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): NeutralPackReviewWorkspaceResult {
  const items = NEUTRAL_PACK_REVIEW_WORKSPACE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: NEUTRAL_PACK_REVIEW_WORKSPACE_VERSION,
    neutralPackScopeSlug: input.neutralPackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    neutralPackReviewWorkspaceReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    sampleNeutralPack: {
      packId: "neutral-litigation-pack-sample-001",
      neutralPackScopeSlug: NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
      directCourtAccess: false as const,
      mediatorPortalByDefault: false as const,
      opposingPartyAutoShare: false as const,
      lawyerControlledExportOnly: true as const,
      internalStrategyInNeutralPack: false as const,
      unreviewedAiOutputIncluded: false as const,
      clientConfidentialMemoIncluded: false as const,
      lawyerReviewRequired: true as const,
      visibleSections: ["CASE_SUMMARY", "MEDIATION_PREP", "HEARING_PREP"],
    },
  };
}
