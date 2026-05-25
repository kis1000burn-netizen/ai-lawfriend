/**
 * Product Phase 54-B — Customer Impact / Incident Severity Tracking evidence builder SSOT.
 */
import { evaluateIncidentSeverityGate } from "./legal-reliability-incident-severity.policy";
import type { IncidentSeverityRule } from "./legal-reliability-incident-severity.schema";

export const LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_MARKER =
  "phase54b-legal-reliability-incident-severity-evidence" as const;

const ALL_SEVERITIES = ["SEV_0", "SEV_1", "SEV_2", "SEV_3", "SEV_4"] as const;

function hasSeverity(rules: IncidentSeverityRule[], severity: (typeof ALL_SEVERITIES)[number]) {
  return rules.some((rule) => rule.severity === severity);
}

function hasCategory(rules: IncidentSeverityRule[], category: IncidentSeverityRule["category"]) {
  return rules.some((rule) => rule.category === category);
}

function hasCustomerImpactOnRule(rule: IncidentSeverityRule) {
  const impact = rule.customerImpact;
  return (
    impact.customerVisible ||
    impact.clientPrivilegeRisk ||
    impact.lawyerWorkflowBlocked ||
    impact.operationsQueueBlocked ||
    impact.legalSubmissionRisk ||
    impact.auditIntegrityRisk
  );
}

function hasCustomerImpactClassification(rules: IncidentSeverityRule[]) {
  return ALL_SEVERITIES.every((severity) =>
    rules.some((rule) => rule.severity === severity && hasCustomerImpactOnRule(rule)),
  );
}

function hasResponseWindow(rule: IncidentSeverityRule) {
  return (
    rule.responseWindow.acknowledgeMinutes > 0 &&
    rule.responseWindow.mitigationMinutes > 0 &&
    rule.responseWindow.escalationMinutes > 0
  );
}

function operatorResponseWindowsDefined(rules: IncidentSeverityRule[]) {
  return ALL_SEVERITIES.every((severity) =>
    rules.some((rule) => rule.severity === severity && hasResponseWindow(rule)),
  );
}

function escalationTargetsDefined(matrix: {
  sev0EscalationTarget: string;
  sev1EscalationTarget: string;
  sev2EscalationTarget: string;
  sev3EscalationTarget: string;
  sev4EscalationTarget: string;
}) {
  return Object.values(matrix).every((target) => target.length > 0);
}

export function buildIncidentSeverityEvidence(input: {
  phase54aBaselineLocked: boolean;
  stabilizationBaselineEvidenceRef: string;

  severityRules: IncidentSeverityRule[];

  incidentExamples: Array<{
    exampleId: string;
    category: IncidentSeverityRule["category"];
    mappedSeverity: IncidentSeverityRule["severity"];
    description: string;
  }>;

  escalationMatrix: {
    sev0EscalationTarget: string;
    sev1EscalationTarget: string;
    sev2EscalationTarget: string;
    sev3EscalationTarget: string;
    sev4EscalationTarget: string;
  };

  operatorReadiness: {
    incidentAuditRequired: boolean;
    rollbackEvaluationReady: boolean;
    degradedModeReady: boolean;
    supportEscalationReady: boolean;
  };
}) {
  const gate = evaluateIncidentSeverityGate({
    phase54aBaselineLocked: input.phase54aBaselineLocked,

    hasSev0: hasSeverity(input.severityRules, "SEV_0"),
    hasSev1: hasSeverity(input.severityRules, "SEV_1"),
    hasSev2: hasSeverity(input.severityRules, "SEV_2"),
    hasSev3: hasSeverity(input.severityRules, "SEV_3"),
    hasSev4: hasSeverity(input.severityRules, "SEV_4"),

    hasCustomerImpactClassification: hasCustomerImpactClassification(input.severityRules),
    hasRoleBoundaryClassification: hasCategory(input.severityRules, "ROLE_BOUNDARY"),
    hasAutomationRiskClassification: hasCategory(input.severityRules, "AUTOMATION_RISK"),
    hasActionLoopImpactClassification: hasCategory(input.severityRules, "ACTION_LOOP_FAILURE"),
    hasQueueImpactClassification: hasCategory(input.severityRules, "OPERATIONS_QUEUE_FAILURE"),
    hasLatencyDegradationClassification: hasCategory(input.severityRules, "LATENCY_DEGRADATION"),

    escalationTargetsDefined: escalationTargetsDefined(input.escalationMatrix),
    operatorResponseWindowsDefined: operatorResponseWindowsDefined(input.severityRules),

    incidentAuditRequired: input.operatorReadiness.incidentAuditRequired,
    rollbackEvaluationReady: input.operatorReadiness.rollbackEvaluationReady,
    degradedModeReady: input.operatorReadiness.degradedModeReady,
    supportEscalationReady: input.operatorReadiness.supportEscalationReady,
  });

  return {
    phase: "54-B" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase54aBaselineLocked: input.phase54aBaselineLocked,
      stabilizationBaselineEvidenceRef: input.stabilizationBaselineEvidenceRef,
    },

    severityRules: input.severityRules,
    incidentExamples: input.incidentExamples,
    escalationMatrix: input.escalationMatrix,
    operatorReadiness: input.operatorReadiness,
    severityGate: gate,
  };
}
