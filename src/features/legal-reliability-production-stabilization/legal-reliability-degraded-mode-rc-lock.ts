/**
 * Product Phase 54-D — Customer-safe Rollout Window / Degraded Mode RC lock SSOT.
 */
import { LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_EVIDENCE_TAG } from "./legal-reliability-hotfix-governance-rc-lock";
import { LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG } from "./legal-reliability-incident-severity-rc-lock";
import { PHASE_54D_BOUNDARY_MARKERS } from "./legal-reliability-degraded-mode.policy";

export const LEGAL_RELIABILITY_DEGRADED_MODE_LOCK_MARKER =
  "phase54d-legal-reliability-degraded-mode-gate" as const;

export const LEGAL_RELIABILITY_DEGRADED_MODE_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE" as const;

export const LEGAL_RELIABILITY_DEGRADED_MODE_VERSION = "54-D.1" as const;

export const LEGAL_RELIABILITY_DEGRADED_MODE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-degraded-mode" as const;

export const LEGAL_RELIABILITY_DEGRADED_MODE_ONE_LINE_CRITERION =
  "Phase 54-D defines customer-safe degraded mode and partial disable controls by tenant, feature, write, completion, and dashboard scope without requiring full service shutdown." as const;

export const LEGAL_RELIABILITY_DEGRADED_MODE_FINAL_JUDGMENT =
  "Customer-safe operation requires safe partial disable. Incidents must be contained by tenant, feature, write/completion/dashboard control, audit, recovery criteria, and exit review." as const;

export const LEGAL_RELIABILITY_DEGRADED_MODE_LOCK = {
  phase: "54-D",
  name: "Customer-safe Rollout Window / Degraded Mode",
  version: LEGAL_RELIABILITY_DEGRADED_MODE_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard: LEGAL_RELIABILITY_DEGRADED_MODE_ONE_LINE_CRITERION,

  requires: {
    phase54bIncidentSeverity: "COMPLETE_LOCKED",
    phase54cHotfixGovernance: "COMPLETE_LOCKED",
    phase54cMasterVerify: "npm run verify:aibeopchin-legal-reliability-hotfix-governance",
  },

  degradedModes: [
    "READ_ONLY",
    "ACTION_LOOP_DISABLED",
    "OPERATIONS_WRITE_DISABLED",
    "COMPLETION_DISABLED",
    "DASHBOARD_READ_ONLY",
    "TENANT_ISOLATED",
    "FEATURE_PARTIAL_DISABLED",
    "FULL_SAFE_MODE",
  ],

  lockedBoundaries: PHASE_54D_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK",
    "NO_DEGRADE_WITHOUT_SEVERITY_TRIGGER",
    "NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL",
    "NO_DEGRADE_WITHOUT_TENANT_OR_FEATURE_SCOPE",
    "NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE",
    "NO_DEGRADE_WITHOUT_READ_ONLY_FALLBACK",
    "NO_DEGRADE_WITHOUT_WRITE_COMPLETION_DISABLE_CONTROL",
    "NO_DEGRADE_WITHOUT_AUDIT_LOG",
    "NO_DEGRADE_WITHOUT_RECOVERY_CRITERIA",
    "NO_DEGRADE_WITHOUT_EXIT_REVIEW",
  ] as const,

  verify: LEGAL_RELIABILITY_DEGRADED_MODE_VERIFY_SCRIPT,

  finalJudgment: LEGAL_RELIABILITY_DEGRADED_MODE_FINAL_JUDGMENT,

  prereqEvidenceTags: [
    LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG,
    LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_EVIDENCE_TAG,
  ],

  evidenceRefs: [
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_CHECKLIST.md",
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_DEGRADED_MODE_RUNBOOK.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
