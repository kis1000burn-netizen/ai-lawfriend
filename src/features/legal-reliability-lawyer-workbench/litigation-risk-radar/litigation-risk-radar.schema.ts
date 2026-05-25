/**
 * Product Phase 48-B — Litigation Risk Radar Panel schema SSOT.
 */
import { z } from "zod";

export const LITIGATION_RISK_RADAR_PANEL_VERSION = "48-B.1" as const;

export const LITIGATION_RISK_RADAR_PANEL_ITEM_IDS = ["CLIENT_WEAKNESS", "OPPONENT_ATTACK", "EVIDENCE_GAP", "JUDGMENT_UNFAVORABLE", "PROCEDURE_RISK", "STATUTE_LIMITATION_RISK", "SUPPLEMENT_REQUEST_ACTION", "COUNTER_THEORY_CANDIDATE", "JUDGMENT_OPEN", "LAWYER_MEMO", "CONFIRM_EDIT_EXCLUDE"] as const;

export const litigationRiskRadarPanelItemIdSchema = z.enum(LITIGATION_RISK_RADAR_PANEL_ITEM_IDS);

export const litigationRiskRadarPanelItemSchema = z.object({
  itemId: litigationRiskRadarPanelItemIdSchema,
  label: z.string(),
  required: z.boolean(),
  defined: z.boolean(),
  uiRoute: z.string().optional(),
});

export const litigationRiskRadarPanelResultSchema = z.object({
  version: z.literal(LITIGATION_RISK_RADAR_PANEL_VERSION),
  workbenchScopeSlug: z.string(),
  generatedAt: z.string(),
  uiRoute: z.string(),
  items: z.array(litigationRiskRadarPanelItemSchema),
  completionRate: z.number(),
  litigationRiskRadarPanelReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type LitigationRiskRadarPanelResult = z.infer<typeof litigationRiskRadarPanelResultSchema>;
