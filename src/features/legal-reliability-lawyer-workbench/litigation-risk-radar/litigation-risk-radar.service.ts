/**
 * Product Phase 48-B — Litigation Risk Radar Panel service.
 */
import { LITIGATION_RISK_RADAR_PANEL_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./litigation-risk-radar.registry";
import { assembleLitigationRiskRadarPanel } from "./litigation-risk-radar.policy";
import type { LitigationRiskRadarPanelResult } from "./litigation-risk-radar.schema";

export const LITIGATION_RISK_RADAR_PANEL_SERVICE_MARKER_48B = "phase48b-litigation-risk-radar-service" as const;

export function buildLitigationRiskRadarPanel(input?: {
  workbenchScopeSlug?: string;
  definedItemIds?: string[];
}): LitigationRiskRadarPanelResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LITIGATION_RISK_RADAR_PANEL_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLitigationRiskRadarPanel({
    workbenchScopeSlug: input?.workbenchScopeSlug ?? LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
