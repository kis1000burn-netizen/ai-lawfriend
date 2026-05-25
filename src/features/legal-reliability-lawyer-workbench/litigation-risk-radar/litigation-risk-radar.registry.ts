/**
 * Product Phase 48-B — Litigation Risk Radar Panel SSOT.
 */
import type { LitigationRiskRadarPanelResult } from "./litigation-risk-radar.schema";

export const LITIGATION_RISK_RADAR_PANEL_REGISTRY_MARKER_48B =
  "phase48b-litigation-risk-radar-registry" as const;

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG = "legal-reliability-lawyer-workbench-001" as const;

type Item = Omit<LitigationRiskRadarPanelResult["items"][number], "defined">;

export const LITIGATION_RISK_RADAR_PANEL_ITEMS: Item[] = [
  { itemId: "CLIENT_WEAKNESS", label: "Client weakness signal", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "OPPONENT_ATTACK", label: "Opponent attack preview", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "EVIDENCE_GAP", label: "Evidence gap", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "JUDGMENT_UNFAVORABLE", label: "Judgment unfavorable point", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "PROCEDURE_RISK", label: "Procedure risk", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "STATUTE_LIMITATION_RISK", label: "Statute/limitation risk", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "SUPPLEMENT_REQUEST_ACTION", label: "Supplement request action", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "COUNTER_THEORY_CANDIDATE", label: "Counter theory candidate (not final)", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "JUDGMENT_OPEN", label: "Open linked judgment", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "LAWYER_MEMO", label: "Lawyer memo", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
  { itemId: "CONFIRM_EDIT_EXCLUDE", label: "Confirm / edit / exclude", required: true, uiRoute: "/cases/{caseId}/lawyer-workbench?panel=radar" },
];
