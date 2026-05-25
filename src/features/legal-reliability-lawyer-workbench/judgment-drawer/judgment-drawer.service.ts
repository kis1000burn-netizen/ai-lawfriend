/**
 * Product Phase 48-D — Judgment Drawer / Precedent Viewer service.
 */
import { JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./judgment-drawer.registry";
import { assembleJudgmentDrawerPrecedentViewer } from "./judgment-drawer.policy";
import type { JudgmentDrawerPrecedentViewerResult } from "./judgment-drawer.schema";

export const JUDGMENT_DRAWER_PRECEDENT_VIEWER_SERVICE_MARKER_48D = "phase48d-judgment-drawer-service" as const;

export function buildJudgmentDrawerPrecedentViewer(input?: {
  workbenchScopeSlug?: string;
  definedItemIds?: string[];
}): JudgmentDrawerPrecedentViewerResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      JUDGMENT_DRAWER_PRECEDENT_VIEWER_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleJudgmentDrawerPrecedentViewer({
    workbenchScopeSlug: input?.workbenchScopeSlug ?? LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
