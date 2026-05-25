/**
 * Product Phase 48-E — Court-ready Pack Builder UX policy SSOT.
 */
import { COURT_READY_PACK_BUILDER_UX_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./court-ready-pack-builder.registry";
import type { CourtReadyPackBuilderUxResult } from "./court-ready-pack-builder.schema";
import { COURT_READY_PACK_BUILDER_UX_VERSION } from "./court-ready-pack-builder.schema";

export const COURT_READY_PACK_BUILDER_UX_POLICY_MARKER_48E = "phase48e-court-ready-pack-builder-policy" as const;
export const COURT_READY_PACK_BUILDER_UX_GATE_MARKER_48E = "phase48e-court-ready-pack-builder-gate" as const;

export const COURTREADYPACKBUILDERUX_BOUNDARY_NO_COURT_AUTO_SUBMISSION = "NO_COURT_AUTO_SUBMISSION" as const;
export const COURTREADYPACKBUILDERUX_BOUNDARY_LAWYER_REVIEW_REQUIRED = "LAWYER_REVIEW_REQUIRED" as const;
export const COURTREADYPACKBUILDERUX_BOUNDARY_NO_CLIENT_VISIBLE_STRATEGY_GRAPH = "NO_CLIENT_VISIBLE_STRATEGY_GRAPH" as const;

export function assembleCourtReadyPackBuilderUx(input: {
  workbenchScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): CourtReadyPackBuilderUxResult {
  const items = COURT_READY_PACK_BUILDER_UX_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: COURT_READY_PACK_BUILDER_UX_VERSION,
    workbenchScopeSlug: input.workbenchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    uiRoute: "/cases/{caseId}/lawyer-workbench?panel=court-ready",
    items,
    completionRate,
    courtReadyPackBuilderUxReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
