/**
 * Product Phase 50-F — Legal Reliability Action Operations RC lock SSOT.
 * @see docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md
 */
import { PHASE50A_LOCKED_BOUNDARIES } from "./phase50a-action-operations-queue.lock";
import { PHASE50B_LOCKED_BOUNDARIES } from "./phase50b-assignment-due-sla.lock";
import { PHASE50C_LOCKED_BOUNDARIES } from "./phase50c-client-response-evidence-intake.lock";
import { PHASE50D_LOCKED_BOUNDARIES } from "./phase50d-lawyer-completion-review.lock";
import { PHASE50E_LOCKED_BOUNDARIES } from "./phase50e-command-center-execution-dashboard.lock";

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_MARKER =
  "phase50f-legal-reliability-action-operations-rc-gate" as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAG =
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50F-RC" as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_VERSION = "50-F.1" as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-operations-rc" as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_ONE_LINE_CRITERION =
  "Phase 50-F bundles 50-A through 50-E Legal Reliability Action Operations into a single RC, ensuring approved actions can be tracked and reviewed in Command Center while blocking automatic completion, messaging, filing, and unreviewed evidence downstream use." as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_SUB_PHASE_VERIFY_SCRIPTS = [
  "verify:aibeopchin-legal-reliability-action-operations-phase50a",
  "verify:aibeopchin-legal-reliability-action-operations-phase50b",
  "verify:aibeopchin-legal-reliability-action-operations-phase50c",
  "verify:aibeopchin-legal-reliability-action-operations-phase50d",
  "verify:aibeopchin-legal-reliability-action-operations-phase50e",
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_PREREQ_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-action-loop-rc" as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_PREDEPLOY_GATE_CANDIDATE =
  "verify:aibeopchin-legal-reliability-action-operations-rc" as const;

/** RC-level boundary markers enforced across 50-A~50-E union. */
export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_CRITICAL_BOUNDARY_MARKERS = [
  "NO_DASHBOARD_AUTO_COMPLETION",
  "NO_DASHBOARD_AUTO_MESSAGING",
  "NO_DASHBOARD_AUTO_FILING",
  "NO_UNREVIEWED_EVIDENCE_DOWNSTREAM",
  "NO_AI_OPERATION_PRIORITY_OVERRIDE",
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_SUB_PHASES = {
  "50-A": "Action Operations Queue",
  "50-B": "Assignment / Due Date / SLA Tracking",
  "50-C": "Client Response & Evidence Intake Sync",
  "50-D": "Lawyer Completion Review",
  "50-E": "Command Center Execution Dashboard",
  "50-F": "Legal Reliability Action Operations RC",
} as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50A-QUEUE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50B-ASSIGNMENT-DUE-SLA",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50C-CLIENT-RESPONSE-EVIDENCE-INTAKE-SYNC",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50D-LAWYER-COMPLETION-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-ACTION-OPERATIONS-PHASE50E-COMMAND-CENTER-EXECUTION-DASHBOARD",
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAGS = [
  ...LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_PREREQ_EVIDENCE_TAGS,
  LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_EVIDENCE_TAG,
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCKED_BOUNDARIES = [
  ...new Set([
    ...PHASE50A_LOCKED_BOUNDARIES,
    ...PHASE50B_LOCKED_BOUNDARIES,
    ...PHASE50C_LOCKED_BOUNDARIES,
    ...PHASE50D_LOCKED_BOUNDARIES,
    ...PHASE50E_LOCKED_BOUNDARIES,
  ]),
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK = {
  phase: "50-F",
  name: "Legal Reliability Action Operations RC",
  status: "LOCKED",
  version: LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_VERSION,

  includes: [
    "50-A Action Operations Queue",
    "50-B Assignment / Due Date / SLA Tracking",
    "50-C Client Response & Evidence Intake Sync",
    "50-D Lawyer Completion Review",
    "50-E Command Center Execution Dashboard",
  ],

  requiredBoundaries: LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCKED_BOUNDARIES,

  criticalBoundaryMarkers: LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_CRITICAL_BOUNDARY_MARKERS,

  requiredVerifications: [
    LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_PREREQ_VERIFY_SCRIPT,
    ...LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_SUB_PHASE_VERIFY_SCRIPTS,
  ],

  autoOperationCompletionAllowed: false,
  autoMessagingAllowed: false,
  autoLegalFilingAllowed: false,
  dashboardAutoActionsAllowed: false,
  unreviewedEvidenceDownstreamAllowed: false,
  aiPriorityOverrideAllowed: false,
  clientVisibleOperationStrategyAllowed: false,
} as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_SPEC_PATHS = [
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_PHASE50_SPEC.md",
  "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_LOCK_SUMMARY.md",
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_RUNBOOK_PATHS = [
  "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_OPERATIONS_RUNBOOK.md",
] as const;

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_FINAL_JUDGMENT =
  "Approved Legal Reliability Actions can be tracked, assigned, responded to, reviewed, completed, and prioritized in Command Center. AI and Dashboard layers do not perform automatic completion, messaging, filing, or unreviewed evidence downstream use." as const;
