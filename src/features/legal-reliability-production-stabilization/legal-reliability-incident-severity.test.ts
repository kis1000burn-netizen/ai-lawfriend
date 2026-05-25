import { describe, expect, it } from "vitest";
import { buildIncidentSeverityEvidence } from "./legal-reliability-incident-severity-evidence";
import {
  assertIncidentSeverityGateAllowed,
  evaluateIncidentSeverityGate,
} from "./legal-reliability-incident-severity.policy";
import {
  LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG,
  LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERSION,
} from "./legal-reliability-incident-severity-rc-lock";
import { incidentSeverityEvidenceSchema } from "./legal-reliability-incident-severity.schema";

const baseInput = {
  phase54aBaselineLocked: true,
  hasSev0: true,
  hasSev1: true,
  hasSev2: true,
  hasSev3: true,
  hasSev4: true,
  hasCustomerImpactClassification: true,
  hasRoleBoundaryClassification: true,
  hasAutomationRiskClassification: true,
  hasActionLoopImpactClassification: true,
  hasQueueImpactClassification: true,
  hasLatencyDegradationClassification: true,
  escalationTargetsDefined: true,
  operatorResponseWindowsDefined: true,
  incidentAuditRequired: true,
  rollbackEvaluationReady: true,
  degradedModeReady: true,
  supportEscalationReady: true,
};

const responseWindow = {
  acknowledgeMinutes: 5,
  mitigationMinutes: 30,
  escalationMinutes: 15,
};

const satisfiedSeverityRules = [
  {
    severity: "SEV_0" as const,
    category: "ROLE_BOUNDARY" as const,
    description: "CLIENT internal strategy exposure or privilege leak",
    customerImpact: {
      customerVisible: true,
      clientPrivilegeRisk: true,
      lawyerWorkflowBlocked: false,
      operationsQueueBlocked: false,
      legalSubmissionRisk: false,
      auditIntegrityRisk: true,
    },
    responseWindow: { acknowledgeMinutes: 5, mitigationMinutes: 15, escalationMinutes: 5 },
    requiredEscalation: {
      operatorRequired: true,
      legalLeadRequired: true,
      engineeringLeadRequired: true,
      rollbackOwnerRequired: true,
    },
    requiredActions: {
      auditLogRequired: true,
      incidentReportRequired: true,
      rollbackEvaluationRequired: true,
      degradedModeEvaluationRequired: true,
      customerCommunicationRequired: true,
    },
  },
  {
    severity: "SEV_1" as const,
    category: "AUTOMATION_RISK" as const,
    description: "Auto filing, submission, or completion mutation",
    customerImpact: {
      customerVisible: true,
      clientPrivilegeRisk: false,
      lawyerWorkflowBlocked: false,
      operationsQueueBlocked: false,
      legalSubmissionRisk: true,
      auditIntegrityRisk: true,
    },
    responseWindow,
    requiredEscalation: {
      operatorRequired: true,
      legalLeadRequired: true,
      engineeringLeadRequired: true,
      rollbackOwnerRequired: true,
    },
    requiredActions: {
      auditLogRequired: true,
      incidentReportRequired: true,
      rollbackEvaluationRequired: true,
      degradedModeEvaluationRequired: true,
      customerCommunicationRequired: true,
    },
  },
  {
    severity: "SEV_2" as const,
    category: "ACTION_LOOP_FAILURE" as const,
    description: "Action Queue stop or approval chain failure",
    customerImpact: {
      customerVisible: true,
      clientPrivilegeRisk: false,
      lawyerWorkflowBlocked: true,
      operationsQueueBlocked: true,
      legalSubmissionRisk: false,
      auditIntegrityRisk: false,
    },
    responseWindow,
    requiredEscalation: {
      operatorRequired: true,
      legalLeadRequired: true,
      engineeringLeadRequired: true,
      rollbackOwnerRequired: false,
    },
    requiredActions: {
      auditLogRequired: true,
      incidentReportRequired: true,
      rollbackEvaluationRequired: true,
      degradedModeEvaluationRequired: true,
      customerCommunicationRequired: false,
    },
  },
  {
    severity: "SEV_3" as const,
    category: "OPERATIONS_QUEUE_FAILURE" as const,
    description: "Queue backlog spike or partial dashboard failure",
    customerImpact: {
      customerVisible: true,
      clientPrivilegeRisk: false,
      lawyerWorkflowBlocked: false,
      operationsQueueBlocked: true,
      legalSubmissionRisk: false,
      auditIntegrityRisk: false,
    },
    responseWindow,
    requiredEscalation: {
      operatorRequired: true,
      legalLeadRequired: false,
      engineeringLeadRequired: true,
      rollbackOwnerRequired: false,
    },
    requiredActions: {
      auditLogRequired: true,
      incidentReportRequired: true,
      rollbackEvaluationRequired: false,
      degradedModeEvaluationRequired: true,
      customerCommunicationRequired: false,
    },
  },
  {
    severity: "SEV_4" as const,
    category: "LATENCY_DEGRADATION" as const,
    description: "Cosmetic UI or non-blocking latency increase",
    customerImpact: {
      customerVisible: true,
      clientPrivilegeRisk: false,
      lawyerWorkflowBlocked: false,
      operationsQueueBlocked: false,
      legalSubmissionRisk: false,
      auditIntegrityRisk: false,
    },
    responseWindow: { acknowledgeMinutes: 60, mitigationMinutes: 240, escalationMinutes: 120 },
    requiredEscalation: {
      operatorRequired: true,
      legalLeadRequired: false,
      engineeringLeadRequired: false,
      rollbackOwnerRequired: false,
    },
    requiredActions: {
      auditLogRequired: true,
      incidentReportRequired: false,
      rollbackEvaluationRequired: false,
      degradedModeEvaluationRequired: false,
      customerCommunicationRequired: false,
    },
  },
];

describe("Phase 54-B Customer Impact / Incident Severity Tracking", () => {
  it("blocks severity without Phase 54-A baseline", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      phase54aBaselineLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54A_BASELINE_REQUIRED");
    expect(() =>
      assertIncidentSeverityGateAllowed({
        ...baseInput,
        phase54aBaselineLocked: false,
      }),
    ).toThrow("NO_INCIDENT_SEVERITY_WITHOUT_PHASE54A_BASELINE");
  });

  it("blocks severity without SEV-0", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasSev0: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ALL_SEVERITY_LEVELS_REQUIRED");
  });

  it("blocks severity without SEV-1", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasSev1: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ALL_SEVERITY_LEVELS_REQUIRED");
  });

  it("blocks severity without role boundary classification", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasRoleBoundaryClassification: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_BOUNDARY_CLASSIFICATION_REQUIRED");
    expect(() =>
      assertIncidentSeverityGateAllowed({
        ...baseInput,
        hasRoleBoundaryClassification: false,
      }),
    ).toThrow("NO_SEVERITY_WITHOUT_ROLE_BOUNDARY_CLASSIFICATION");
  });

  it("blocks severity without automation risk classification", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasAutomationRiskClassification: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUTOMATION_RISK_CLASSIFICATION_REQUIRED");
  });

  it("blocks severity without Action Loop impact classification", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasActionLoopImpactClassification: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_LOOP_IMPACT_CLASSIFICATION_REQUIRED");
  });

  it("blocks severity without queue impact classification", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasQueueImpactClassification: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("QUEUE_IMPACT_CLASSIFICATION_REQUIRED");
  });

  it("blocks severity without latency degradation classification", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      hasLatencyDegradationClassification: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("LATENCY_DEGRADATION_CLASSIFICATION_REQUIRED");
  });

  it("blocks severity without escalation target", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      escalationTargetsDefined: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ESCALATION_TARGET_REQUIRED");
    expect(() =>
      assertIncidentSeverityGateAllowed({
        ...baseInput,
        escalationTargetsDefined: false,
      }),
    ).toThrow("NO_SEVERITY_WITHOUT_ESCALATION_TARGET");
  });

  it("blocks severity without operator response window", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      operatorResponseWindowsDefined: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATOR_RESPONSE_WINDOW_REQUIRED");
  });

  it("blocks severity without incident audit requirement", () => {
    const result = evaluateIncidentSeverityGate({
      ...baseInput,
      incidentAuditRequired: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("INCIDENT_AUDIT_REQUIRED");
    expect(() =>
      assertIncidentSeverityGateAllowed({
        ...baseInput,
        incidentAuditRequired: false,
      }),
    ).toThrow("NO_SEVERITY_WITHOUT_INCIDENT_AUDIT_REQUIREMENT");
  });

  it("allows severity only when all incident severity evidence is ready", () => {
    const result = evaluateIncidentSeverityGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildIncidentSeverityEvidence({
      phase54aBaselineLocked: true,
      stabilizationBaselineEvidenceRef:
        "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE",
      severityRules: satisfiedSeverityRules,
      incidentExamples: [
        {
          exampleId: "incident-sev0-client-internal-exposure",
          category: "ROLE_BOUNDARY",
          mappedSeverity: "SEV_0",
          description: "CLIENT accessed internal legal strategy route",
        },
      ],
      escalationMatrix: {
        sev0EscalationTarget: "legal-lead+engineering-lead+rollback-owner",
        sev1EscalationTarget: "legal-lead+engineering-lead",
        sev2EscalationTarget: "operator+engineering-lead",
        sev3EscalationTarget: "operator+engineering-oncall",
        sev4EscalationTarget: "operator",
      },
      operatorReadiness: {
        incidentAuditRequired: true,
        rollbackEvaluationReady: true,
        degradedModeReady: true,
        supportEscalationReady: true,
      },
    });

    const parsed = incidentSeverityEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.severityGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERSION).toBe("54-B.1");
    expect(LEGAL_RELIABILITY_INCIDENT_SEVERITY_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-incident-severity",
    );
    expect(LEGAL_RELIABILITY_INCIDENT_SEVERITY_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
    );
  });
});
