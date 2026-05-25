/**
 * Product Phase 45-E — CourtReadyPackItemExplainabilityWorkspace service.
 */
import {
  JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
  COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEMS,
} from "./court-ready-pack-item-explainability-workspace.registry";
import { assembleCourtReadyPackItemExplainabilityWorkspace } from "./court-ready-pack-item-explainability-workspace.policy";
import type { CourtReadyPackItemExplainabilityWorkspaceResult } from "./court-ready-pack-item-explainability-workspace.schema";

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_SERVICE_MARKER_45E =
  "phase45e-court-ready-pack-item-explainability-workspace-service" as const;

export function buildCourtReadyPackItemExplainabilityWorkspace(input?: {
  explainabilityScopeSlug?: string;
  definedItemIds?: string[];
}): CourtReadyPackItemExplainabilityWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleCourtReadyPackItemExplainabilityWorkspace({
    explainabilityScopeSlug:
      input?.explainabilityScopeSlug ?? JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
