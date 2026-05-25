/**
 * Product Phase 48-B — Litigation Risk Radar Panel policy SSOT.
 */
import { LITIGATION_RISK_RADAR_PANEL_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./litigation-risk-radar.registry";
import type { LitigationRiskRadarPanelResult } from "./litigation-risk-radar.schema";
import { LITIGATION_RISK_RADAR_PANEL_VERSION } from "./litigation-risk-radar.schema";

export const LITIGATION_RISK_RADAR_PANEL_POLICY_MARKER_48B = "phase48b-litigation-risk-radar-policy" as const;
export const LITIGATION_RISK_RADAR_PANEL_GATE_MARKER_48B = "phase48b-litigation-risk-radar-gate" as const;

export const LITIGATIONRISKRADARPANEL_BOUNDARY_NO_AI_FINAL_STRATEGY = "NO_AI_FINAL_STRATEGY" as const;
export const LITIGATIONRISKRADARPANEL_BOUNDARY_LAWYER_REVIEW_REQUIRED = "LAWYER_REVIEW_REQUIRED" as const;
export const LITIGATIONRISKRADARPANEL_BOUNDARY_JUDGMENT_CLICKTHROUGH_REQUIRED = "JUDGMENT_CLICKTHROUGH_REQUIRED" as const;

export function assembleLitigationRiskRadarPanel(input: {
  workbenchScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LitigationRiskRadarPanelResult {
  const items = LITIGATION_RISK_RADAR_PANEL_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LITIGATION_RISK_RADAR_PANEL_VERSION,
    workbenchScopeSlug: input.workbenchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar",
    items,
    completionRate,
    litigationRiskRadarPanelReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
