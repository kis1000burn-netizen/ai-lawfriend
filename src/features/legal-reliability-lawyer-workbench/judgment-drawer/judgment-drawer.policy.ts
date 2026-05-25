/**
 * Product Phase 48-D — Judgment Drawer / Precedent Viewer policy SSOT.
 */
import { JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./judgment-drawer.registry";
import type { JudgmentDrawerPrecedentViewerResult } from "./judgment-drawer.schema";
import { JUDGMENT_DRAWER_PRECEDENT_VIEWER_VERSION } from "./judgment-drawer.schema";

export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_POLICY_MARKER_48D = "phase48d-judgment-drawer-policy" as const;
export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_GATE_MARKER_48D = "phase48d-judgment-drawer-gate" as const;

export const JUDGMENTDRAWERPRECEDENTVIEWER_BOUNDARY_JUDGMENT_CLICKTHROUGH_REQUIRED = "JUDGMENT_CLICKTHROUGH_REQUIRED" as const;
export const JUDGMENTDRAWERPRECEDENTVIEWER_BOUNDARY_LAWYER_REVIEW_REQUIRED = "LAWYER_REVIEW_REQUIRED" as const;
export const JUDGMENTDRAWERPRECEDENTVIEWER_BOUNDARY_NO_UNEXPLAINED_WORKBENCH_ITEM = "NO_UNEXPLAINED_WORKBENCH_ITEM" as const;

export function assembleJudgmentDrawerPrecedentViewer(input: {
  workbenchScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): JudgmentDrawerPrecedentViewerResult {
  const items = JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: JUDGMENT_DRAWER_PRECEDENT_VIEWER_VERSION,
    workbenchScopeSlug: input.workbenchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    uiRoute: "/cases/{caseId}/lawyer-workbench?drawer=judgment",
    items,
    completionRate,
    judgmentDrawerPrecedentViewerReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
