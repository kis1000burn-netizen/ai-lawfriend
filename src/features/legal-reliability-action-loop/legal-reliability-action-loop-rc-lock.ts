/**
 * Product Phase 49-C — Legal Reliability Action Loop RC lock SSOT.
 * @see docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_SUMMARY.md
 */
import { LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY } from "./legal-reliability-action-loop.registry";

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_MARKER =
  "phase49c-legal-reliability-action-loop-rc-gate" as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-LOOP-PHASE49C-RC" as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_VERSION = "49-C.1" as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-loop-rc" as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_ONE_LINE_CRITERION =
  "Phase 49-C bundles 49-A Risk Radar supplement actions and 49-B Graph Gap evidence request actions into a single lawyer-approved Legal Reliability Action Loop RC, ensuring that no client request, messaging, legal filing, or draft-context conversion occurs before lawyer approval and decision ledger recording." as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK = {
  phase: "49-C",
  name: "Legal Reliability Action Loop RC",
  status: "LOCKED",
  version: LEGAL_RELIABILITY_ACTION_LOOP_RC_VERSION,

  includes: [
    "49-A Risk Radar → Supplement Request Action",
    "49-B Graph Gap → Evidence Request Action",
  ],

  actionTypes: ["RISK_RADAR_SUPPLEMENT_REQUEST", "GRAPH_GAP_EVIDENCE_REQUEST"],

  requiredBoundaries: LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.lockedBoundaries,

  requiredVerifications: [
    "verify:aibeopchin-legal-reliability-action-loop-phase49a",
    "verify:aibeopchin-legal-reliability-action-loop-phase49b",
    "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48b",
    "verify:aibeopchin-legal-reliability-lawyer-workbench-phase48c",
  ],

  directMessagingAllowed: false,
  autoLegalFilingAllowed: false,
  clientVisibleStrategyGraphAllowed: false,
  supplementDraftRequiresLawyerApproval: true,
  decisionLedgerRequired: true,
  sanitizerRequired: true,
} as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_SUB_PHASES = {
  "49-A": "Risk Radar → Supplement Request Action",
  "49-B": "Graph Gap → Evidence Request Action",
  "49-C": "Legal Reliability Action Loop RC",
} as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49B-GRAPH-GAP-EVIDENCE-REQUEST-ACTION",
] as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAGS = [
  ...LEGAL_RELIABILITY_ACTION_LOOP_RC_PREREQ_EVIDENCE_TAGS,
  LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAG,
] as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_RISK_RADAR_SUPPLEMENT_ACTION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_RUNBOOK.md",
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_RUNBOOK.md",
] as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_SPEC_PATHS = [
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SPEC.md",
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SPEC.md",
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_SUMMARY.md",
] as const;

export const LEGAL_RELIABILITY_ACTION_LOOP_RC_FINAL_JUDGMENT =
  "Legal Reliability Action Loop Phase 49-A/B is now RC-locked as a lawyer-approved action conversion layer. AI may propose action candidates, but only a lawyer-approved decision ledger can create a SupplementRequest DRAFT." as const;
