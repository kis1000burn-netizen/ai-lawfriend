/**
 * Product Phase 52-C — Action Loop Live Smoke lock SSOT.
 */
export const PHASE52C_ACTION_LOOP_LIVE_SMOKE_LOCK_MARKER =
  "phase52c-legal-reliability-action-loop-live-smoke-lock" as const;

export const PHASE52C_ACTION_LOOP_LIVE_SMOKE_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE52C-ACTION-LOOP-LIVE-SMOKE" as const;

export const PHASE52C_ONE_LINE_CRITERION =
  "Phase 52-C validates Risk Radar and Graph Gap ActionCandidate creation, lawyer approval, decision ledger, and SupplementRequest DRAFT linkage on staging." as const;

export const PHASE52C_SMOKE_STEPS = [
  "Risk Radar supplement candidate creation",
  "Lawyer approval and decision ledger",
  "SupplementRequest DRAFT with phase49a sourceMarker",
  "Graph Gap evidence request candidate creation",
  "Lawyer approval and phase49b sourceMarker",
] as const;

export const PHASE52C_FORBIDDEN_CONFIRMATIONS = [
  "NO_SUPPLEMENT_DRAFT_BEFORE_LAWYER_APPROVAL",
  "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
  "NO_AUTO_LEGAL_FILING",
  "NO_UNVERIFIED_EVIDENCE_LABELING",
] as const;

export const PHASE52C_LOCKED_BOUNDARIES = [
  "NO_GO_LIVE_WITH_AUTO_COMPLETION_OR_AUTO_FILING",
] as const;
