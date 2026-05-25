/**
 * Product Phase 54-B — Customer Impact / Incident Severity Tracking RC lock SSOT.
 */
import { LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_TAG } from "./legal-reliability-stabilization-baseline-rc-lock";
import { PHASE_54B_BOUNDARY_MARKERS } from "./legal-reliability-incident-severity.policy";

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_LOCK_MARKER =
  "phase54b-legal-reliability-incident-severity-gate" as const;

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY" as const;

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERSION = "54-B.1" as const;

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-reliability-incident-severity" as const;

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_ONE_LINE_CRITERION =
  "Phase 54-B classifies customer-impacting incidents as SEV-0 through SEV-4 using role boundary, automation risk, Action Loop, Operations Queue, and latency degradation signals anchored to the Phase 54-A stabilization baseline." as const;

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_FINAL_JUDGMENT =
  "Production stabilization does not judge incidents by intuition. It locks severity by customer impact, privilege exposure, automation risk, operational blockage, and audit integrity." as const;

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_LOCK = {
  phase: "54-B",
  name: "Customer Impact / Incident Severity Tracking",
  version: LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERSION,
  status: "COMPLETE_LOCKED",

  oneLineStandard: LEGAL_RELIABILITY_INCIDENT_SEVERITY_ONE_LINE_CRITERION,

  requires: {
    phase54aStabilizationBaseline: "COMPLETE_LOCKED",
    phase54aMasterVerify: "npm run verify:aibeopchin-legal-reliability-stabilization-baseline",
  },

  severityLevels: ["SEV_0", "SEV_1", "SEV_2", "SEV_3", "SEV_4"],

  incidentCategories: [
    "ROLE_BOUNDARY",
    "AUTOMATION_RISK",
    "ACTION_LOOP_FAILURE",
    "OPERATIONS_QUEUE_FAILURE",
    "LATENCY_DEGRADATION",
    "AUDIT_LOG_GAP",
    "FEATURE_FLAG_FAILURE",
    "CLIENT_VISIBLE_UI",
    "ROLLBACK_REQUIRED",
  ],

  lockedBoundaries: PHASE_54B_BOUNDARY_MARKERS,

  criticalBoundaryMarkers: [
    "NO_INCIDENT_SEVERITY_WITHOUT_PHASE54A_BASELINE",
    "NO_SEVERITY_WITHOUT_CUSTOMER_IMPACT_CLASSIFICATION",
    "NO_SEVERITY_WITHOUT_ROLE_BOUNDARY_CLASSIFICATION",
    "NO_SEVERITY_WITHOUT_AUTOMATION_RISK_CLASSIFICATION",
    "NO_SEVERITY_WITHOUT_ACTION_LOOP_IMPACT_CLASSIFICATION",
    "NO_SEVERITY_WITHOUT_QUEUE_IMPACT_CLASSIFICATION",
    "NO_SEVERITY_WITHOUT_LATENCY_DEGRADATION_CLASSIFICATION",
    "NO_SEVERITY_WITHOUT_ESCALATION_TARGET",
    "NO_SEVERITY_WITHOUT_OPERATOR_RESPONSE_WINDOW",
    "NO_SEVERITY_WITHOUT_INCIDENT_AUDIT_REQUIREMENT",
  ] as const,

  verify: LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERIFY_SCRIPT,

  finalJudgment: LEGAL_RELIABILITY_INCIDENT_SEVERITY_FINAL_JUDGMENT,

  prereqEvidenceTags: [LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_TAG],

  evidenceRefs: [
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_CHECKLIST.md",
    "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_INCIDENT_SEVERITY_RUNBOOK.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
