/**
 * Product Phase 54-C — Hotfix / Emergency Patch Governance RC lock SSOT.
 */
import { LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG } from "./legal-reliability-incident-severity-rc-lock";
import { LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_TAG } from "./legal-reliability-stabilization-baseline-rc-lock";
import { PHASE_54C_BOUNDARY_MARKERS } from "./legal-reliability-hotfix-governance.policy";

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_LOCK_MARKER =
  "phase54c-legal-reliability-hotfix-governance-gate" as const;

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE" as const;

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERSION = "54-C.1" as const;

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-hotfix-governance" as const;

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_ONE_LINE_CRITERION =
  "Phase 54-C controls hotfix and emergency patch approval, scope, migration approval, rollback, post-patch verification, customer impact record, and closeout according to SEV-0 through SEV-4 incident severity." as const;

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_FINAL_JUDGMENT =
  "Hotfixes are fast but not uncontrolled. Emergency changes are allowed only when severity, approval chain, scope, rollback, verification, audit, customer impact, and closeout are locked." as const;

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_LOCK = {
  phase: "54-C",
  name: "Hotfix / Emergency Patch Governance",
  version: LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard: LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_ONE_LINE_CRITERION,

  requires: {
    phase54aMonitoringBaseline: "COMPLETE_LOCKED",
    phase54bIncidentSeverity: "COMPLETE_LOCKED",
    phase54bMasterVerify: "npm run verify:aibeopchin-legal-reliability-incident-severity",
  },

  lockedBoundaries: PHASE_54C_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY",
    "NO_HOTFIX_WITHOUT_SEVERITY_CLASSIFICATION",
    "NO_HOTFIX_WITHOUT_APPROVAL_CHAIN",
    "NO_HOTFIX_WITHOUT_SCOPE_LIMIT",
    "NO_HOTFIX_WITHOUT_ROLLBACK_PLAN",
    "NO_HOTFIX_WITHOUT_POST_PATCH_VERIFY",
    "NO_HOTFIX_WITHOUT_CUSTOMER_IMPACT_RECORD",
    "NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG",
    "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL",
    "NO_HOTFIX_WITHOUT_CLOSEOUT_REVIEW",
  ] as const,

  verify: LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERIFY_SCRIPT,

  finalJudgment: LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_FINAL_JUDGMENT,

  prereqEvidenceTags: [
    LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_TAG,
    LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG,
  ],

  evidenceRefs: [
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_CHECKLIST.md",
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_RUNBOOK.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
