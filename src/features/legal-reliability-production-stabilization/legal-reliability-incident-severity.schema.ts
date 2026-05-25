/**
 * Product Phase 54-B — Customer Impact / Incident Severity Tracking schema SSOT.
 */
import { z } from "zod";

export const incidentSeverityStatusSchema = z.enum([
  "NOT_STARTED",
  "DRAFTING",
  "READY_FOR_SIGNOFF",
  "BLOCKED",
  "LOCKED",
]);

export const incidentSeverityBoundarySchema = z.enum([
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
]);

export const incidentSeveritySchema = z.enum([
  "SEV_0",
  "SEV_1",
  "SEV_2",
  "SEV_3",
  "SEV_4",
]);

export const incidentCategorySchema = z.enum([
  "ROLE_BOUNDARY",
  "AUTOMATION_RISK",
  "ACTION_LOOP_FAILURE",
  "OPERATIONS_QUEUE_FAILURE",
  "LATENCY_DEGRADATION",
  "AUDIT_LOG_GAP",
  "FEATURE_FLAG_FAILURE",
  "CLIENT_VISIBLE_UI",
  "ROLLBACK_REQUIRED",
]);

export const incidentResponseWindowSchema = z.object({
  acknowledgeMinutes: z.number().int().positive(),
  mitigationMinutes: z.number().int().positive(),
  escalationMinutes: z.number().int().positive(),
});

export const incidentSeverityRuleSchema = z.object({
  severity: incidentSeveritySchema,
  category: incidentCategorySchema,

  description: z.string().min(1),

  customerImpact: z.object({
    customerVisible: z.boolean(),
    clientPrivilegeRisk: z.boolean(),
    lawyerWorkflowBlocked: z.boolean(),
    operationsQueueBlocked: z.boolean(),
    legalSubmissionRisk: z.boolean(),
    auditIntegrityRisk: z.boolean(),
  }),

  responseWindow: incidentResponseWindowSchema,

  requiredEscalation: z.object({
    operatorRequired: z.boolean(),
    legalLeadRequired: z.boolean(),
    engineeringLeadRequired: z.boolean(),
    rollbackOwnerRequired: z.boolean(),
  }),

  requiredActions: z.object({
    auditLogRequired: z.boolean(),
    incidentReportRequired: z.boolean(),
    rollbackEvaluationRequired: z.boolean(),
    degradedModeEvaluationRequired: z.boolean(),
    customerCommunicationRequired: z.boolean(),
  }),
});

export const incidentSeverityEvidenceSchema = z.object({
  phase: z.literal("54-B"),
  status: incidentSeverityStatusSchema,

  dependency: z.object({
    phase54aBaselineLocked: z.boolean(),
    stabilizationBaselineEvidenceRef: z.string().min(1),
  }),

  severityRules: z.array(incidentSeverityRuleSchema).min(5),

  incidentExamples: z.array(
    z.object({
      exampleId: z.string().min(1),
      category: incidentCategorySchema,
      mappedSeverity: incidentSeveritySchema,
      description: z.string().min(1),
    }),
  ),

  escalationMatrix: z.object({
    sev0EscalationTarget: z.string().min(1),
    sev1EscalationTarget: z.string().min(1),
    sev2EscalationTarget: z.string().min(1),
    sev3EscalationTarget: z.string().min(1),
    sev4EscalationTarget: z.string().min(1),
  }),

  operatorReadiness: z.object({
    incidentAuditRequired: z.boolean(),
    rollbackEvaluationReady: z.boolean(),
    degradedModeReady: z.boolean(),
    supportEscalationReady: z.boolean(),
  }),

  severityGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(incidentSeverityBoundarySchema),
  }),
});

export type IncidentSeverityEvidence = z.infer<typeof incidentSeverityEvidenceSchema>;
export type IncidentSeverityRule = z.infer<typeof incidentSeverityRuleSchema>;
