/**
 * Product Phase 54-B — Customer Impact / Incident Severity Tracking policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_POLICY_MARKER =
  "phase54b-legal-reliability-incident-severity-policy" as const;

export const PHASE_54B_BOUNDARY_MARKERS = [
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
] as const;

export function evaluateIncidentSeverityGate(input: {
  phase54aBaselineLocked: boolean;

  hasSev0: boolean;
  hasSev1: boolean;
  hasSev2: boolean;
  hasSev3: boolean;
  hasSev4: boolean;

  hasCustomerImpactClassification: boolean;
  hasRoleBoundaryClassification: boolean;
  hasAutomationRiskClassification: boolean;
  hasActionLoopImpactClassification: boolean;
  hasQueueImpactClassification: boolean;
  hasLatencyDegradationClassification: boolean;

  escalationTargetsDefined: boolean;
  operatorResponseWindowsDefined: boolean;

  incidentAuditRequired: boolean;
  rollbackEvaluationReady: boolean;
  degradedModeReady: boolean;
  supportEscalationReady: boolean;
}) {
  const blockedReasons: string[] = [];

  if (!input.phase54aBaselineLocked) {
    blockedReasons.push("PHASE_54A_BASELINE_REQUIRED");
  }

  if (
    !input.hasSev0 ||
    !input.hasSev1 ||
    !input.hasSev2 ||
    !input.hasSev3 ||
    !input.hasSev4
  ) {
    blockedReasons.push("ALL_SEVERITY_LEVELS_REQUIRED");
  }

  if (!input.hasCustomerImpactClassification) {
    blockedReasons.push("CUSTOMER_IMPACT_CLASSIFICATION_REQUIRED");
  }

  if (!input.hasRoleBoundaryClassification) {
    blockedReasons.push("ROLE_BOUNDARY_CLASSIFICATION_REQUIRED");
  }

  if (!input.hasAutomationRiskClassification) {
    blockedReasons.push("AUTOMATION_RISK_CLASSIFICATION_REQUIRED");
  }

  if (!input.hasActionLoopImpactClassification) {
    blockedReasons.push("ACTION_LOOP_IMPACT_CLASSIFICATION_REQUIRED");
  }

  if (!input.hasQueueImpactClassification) {
    blockedReasons.push("QUEUE_IMPACT_CLASSIFICATION_REQUIRED");
  }

  if (!input.hasLatencyDegradationClassification) {
    blockedReasons.push("LATENCY_DEGRADATION_CLASSIFICATION_REQUIRED");
  }

  if (!input.escalationTargetsDefined) {
    blockedReasons.push("ESCALATION_TARGET_REQUIRED");
  }

  if (!input.operatorResponseWindowsDefined) {
    blockedReasons.push("OPERATOR_RESPONSE_WINDOW_REQUIRED");
  }

  if (!input.incidentAuditRequired) {
    blockedReasons.push("INCIDENT_AUDIT_REQUIRED");
  }

  if (
    !input.rollbackEvaluationReady ||
    !input.degradedModeReady ||
    !input.supportEscalationReady
  ) {
    blockedReasons.push("STABILIZATION_RESPONSE_READINESS_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_54B_BOUNDARY_MARKERS,
  };
}

export function assertIncidentSeverityGateAllowed(
  input: Parameters<typeof evaluateIncidentSeverityGate>[0],
) {
  const result = evaluateIncidentSeverityGate(input);

  if (result.blockedReasons.includes("PHASE_54A_BASELINE_REQUIRED")) {
    throw new ValidationError("NO_INCIDENT_SEVERITY_WITHOUT_PHASE54A_BASELINE");
  }
  if (result.blockedReasons.includes("ALL_SEVERITY_LEVELS_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_CUSTOMER_IMPACT_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("CUSTOMER_IMPACT_CLASSIFICATION_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_CUSTOMER_IMPACT_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("ROLE_BOUNDARY_CLASSIFICATION_REQUIRED")) {
    throw new ForbiddenError("NO_SEVERITY_WITHOUT_ROLE_BOUNDARY_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("AUTOMATION_RISK_CLASSIFICATION_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_AUTOMATION_RISK_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("ACTION_LOOP_IMPACT_CLASSIFICATION_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_ACTION_LOOP_IMPACT_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("QUEUE_IMPACT_CLASSIFICATION_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_QUEUE_IMPACT_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("LATENCY_DEGRADATION_CLASSIFICATION_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_LATENCY_DEGRADATION_CLASSIFICATION");
  }
  if (result.blockedReasons.includes("ESCALATION_TARGET_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_ESCALATION_TARGET");
  }
  if (result.blockedReasons.includes("OPERATOR_RESPONSE_WINDOW_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_OPERATOR_RESPONSE_WINDOW");
  }
  if (result.blockedReasons.includes("INCIDENT_AUDIT_REQUIRED")) {
    throw new ValidationError("NO_SEVERITY_WITHOUT_INCIDENT_AUDIT_REQUIREMENT");
  }
  if (result.blockedReasons.includes("STABILIZATION_RESPONSE_READINESS_REQUIRED")) {
    throw new ValidationError("STABILIZATION_RESPONSE_READINESS_REQUIRED");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "INCIDENT_SEVERITY_GATE_BLOCKED");
  }

  return result;
}
