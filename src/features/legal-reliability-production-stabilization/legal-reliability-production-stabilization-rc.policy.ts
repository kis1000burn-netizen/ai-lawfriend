/**
 * Product Phase 54-F — Production Stabilization RC policy SSOT.
 */
import { ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_POLICY_MARKER =
  "phase54f-legal-reliability-production-stabilization-rc-policy" as const;

export const PHASE_54F_BOUNDARY_MARKERS = [
  "NO_STABILIZATION_RC_WITHOUT_54A_BASELINE_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54B_SEVERITY_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54C_HOTFIX_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54D_DEGRADED_MODE_LOCK",
  "NO_STABILIZATION_RC_WITHOUT_54E_SUPPORT_LOCK",
  "NO_STABILIZATION_RC_WITH_BROKEN_EVIDENCE_CHAIN",
  "NO_STABILIZATION_RC_WITHOUT_CUSTOMER_SAFE_OPERATION",
  "NO_STABILIZATION_RC_WITHOUT_ROLLBACK_AND_DEGRADE_READINESS",
  "NO_STABILIZATION_RC_WITHOUT_SUPPORT_ESCALATION_READY",
  "NO_STABILIZATION_RC_WITHOUT_MASTER_VERIFY",
] as const;

export function evaluateProductionStabilizationRcGate(input: {
  phase54aBaselineLocked: boolean;
  phase54bIncidentSeverityLocked: boolean;
  phase54cHotfixGovernanceLocked: boolean;
  phase54dDegradedModeLocked: boolean;
  phase54eSupportEscalationLocked: boolean;

  evidenceChainComplete: boolean;

  stabilizationBaselineVerifyPassed: boolean;
  incidentSeverityVerifyPassed: boolean;
  hotfixGovernanceVerifyPassed: boolean;
  degradedModeVerifyPassed: boolean;
  supportEscalationVerifyPassed: boolean;

  baselineDefined: boolean;
  severityPolicyDefined: boolean;
  hotfixGovernanceDefined: boolean;
  degradedModeReady: boolean;
  customerSafeMessagesReady: boolean;
  supportEscalationReady: boolean;
  supportAuditReady: boolean;

  rollbackReadinessVerified: boolean;
  readOnlyDegradeVerified: boolean;
  tenantIsolationReady: boolean;
  featurePartialDisableReady: boolean;
  writeDisableReady: boolean;
  completionDisableReady: boolean;

  implementationEvidenceUpdated: boolean;
  navigatorUpdated: boolean;
  deployPrecheckUpdated: boolean;
  operationsIndexUpdated: boolean;
  roadmapUpdated: boolean;
  rcSummaryUpdated: boolean;
  stabilizationSpecUpdated: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase54aBaselineLocked) {
    blockedReasons.push("PHASE_54A_BASELINE_LOCK_REQUIRED");
  }

  if (!input.phase54bIncidentSeverityLocked) {
    blockedReasons.push("PHASE_54B_INCIDENT_SEVERITY_LOCK_REQUIRED");
  }

  if (!input.phase54cHotfixGovernanceLocked) {
    blockedReasons.push("PHASE_54C_HOTFIX_GOVERNANCE_LOCK_REQUIRED");
  }

  if (!input.phase54dDegradedModeLocked) {
    blockedReasons.push("PHASE_54D_DEGRADED_MODE_LOCK_REQUIRED");
  }

  if (!input.phase54eSupportEscalationLocked) {
    blockedReasons.push("PHASE_54E_SUPPORT_ESCALATION_LOCK_REQUIRED");
  }

  if (!input.evidenceChainComplete) {
    blockedReasons.push("PRODUCTION_STABILIZATION_EVIDENCE_CHAIN_INCOMPLETE");
  }

  if (
    !input.stabilizationBaselineVerifyPassed ||
    !input.incidentSeverityVerifyPassed ||
    !input.hotfixGovernanceVerifyPassed ||
    !input.degradedModeVerifyPassed ||
    !input.supportEscalationVerifyPassed
  ) {
    blockedReasons.push("PHASE_54_SUB_VERIFY_NOT_PASSED");
  }

  if (
    !input.baselineDefined ||
    !input.severityPolicyDefined ||
    !input.hotfixGovernanceDefined ||
    !input.degradedModeReady ||
    !input.customerSafeMessagesReady
  ) {
    blockedReasons.push("CUSTOMER_SAFE_OPERATION_NOT_READY");
  }

  if (!input.supportEscalationReady || !input.supportAuditReady) {
    blockedReasons.push("SUPPORT_ESCALATION_NOT_READY");
  }

  if (
    !input.rollbackReadinessVerified ||
    !input.readOnlyDegradeVerified ||
    !input.tenantIsolationReady ||
    !input.featurePartialDisableReady ||
    !input.writeDisableReady ||
    !input.completionDisableReady
  ) {
    blockedReasons.push("ROLLBACK_AND_DEGRADE_READINESS_REQUIRED");
  }

  if (
    !input.implementationEvidenceUpdated ||
    !input.navigatorUpdated ||
    !input.deployPrecheckUpdated ||
    !input.operationsIndexUpdated ||
    !input.roadmapUpdated ||
    !input.rcSummaryUpdated ||
    !input.stabilizationSpecUpdated
  ) {
    blockedReasons.push("GOVERNANCE_DOCS_NOT_UPDATED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_54F_BOUNDARY_MARKERS,
  };
}

export function assertProductionStabilizationRcGateAllowed(
  input: Parameters<typeof evaluateProductionStabilizationRcGate>[0],
) {
  const result = evaluateProductionStabilizationRcGate(input);

  if (result.blockedReasons.includes("PHASE_54A_BASELINE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_54A_BASELINE_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_54B_INCIDENT_SEVERITY_LOCK_REQUIRED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_54B_SEVERITY_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_54C_HOTFIX_GOVERNANCE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_54C_HOTFIX_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_54D_DEGRADED_MODE_LOCK_REQUIRED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_54D_DEGRADED_MODE_LOCK");
  }
  if (result.blockedReasons.includes("PHASE_54E_SUPPORT_ESCALATION_LOCK_REQUIRED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_54E_SUPPORT_LOCK");
  }
  if (result.blockedReasons.includes("PRODUCTION_STABILIZATION_EVIDENCE_CHAIN_INCOMPLETE")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITH_BROKEN_EVIDENCE_CHAIN");
  }
  if (result.blockedReasons.includes("PHASE_54_SUB_VERIFY_NOT_PASSED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_MASTER_VERIFY");
  }
  if (result.blockedReasons.includes("CUSTOMER_SAFE_OPERATION_NOT_READY")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_CUSTOMER_SAFE_OPERATION");
  }
  if (result.blockedReasons.includes("SUPPORT_ESCALATION_NOT_READY")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_SUPPORT_ESCALATION_READY");
  }
  if (result.blockedReasons.includes("ROLLBACK_AND_DEGRADE_READINESS_REQUIRED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_ROLLBACK_AND_DEGRADE_READINESS");
  }
  if (result.blockedReasons.includes("GOVERNANCE_DOCS_NOT_UPDATED")) {
    throw new ValidationError("NO_STABILIZATION_RC_WITHOUT_MASTER_VERIFY");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "PRODUCTION_STABILIZATION_RC_BLOCKED");
  }

  return result;
}
