/**
 * Product Phase 54-E — Support / Ops Escalation Readiness schema SSOT.
 */
import { z } from "zod";

export const supportEscalationStatusSchema = z.enum([
  "NOT_STARTED",
  "READY",
  "BLOCKED",
  "ACTIVE",
  "LOCKED",
]);

export const supportEscalationBoundarySchema = z.enum([
  "NO_SUPPORT_ESCALATION_WITHOUT_54A_54D_LOCK",
  "NO_ESCALATION_WITHOUT_SEVERITY_OWNER",
  "NO_ESCALATION_WITHOUT_RESPONSE_WINDOW",
  "NO_ESCALATION_WITHOUT_ENGINEERING_OWNER",
  "NO_ESCALATION_WITHOUT_LEGAL_OPS_OWNER",
  "NO_ESCALATION_WITHOUT_CUSTOMER_SUPPORT_OWNER",
  "NO_CUSTOMER_MESSAGE_WITHOUT_SAFE_TEMPLATE",
  "NO_SUPPORT_ACTION_WITHOUT_AUDIT_LOG",
  "NO_INCIDENT_CLOSEOUT_WITHOUT_SUPPORT_REVIEW",
  "NO_STABILIZATION_RC_WITHOUT_SUPPORT_READY",
]);

export const supportSeveritySchema = z.enum([
  "SEV_0",
  "SEV_1",
  "SEV_2",
  "SEV_3",
  "SEV_4",
]);

export const supportEscalationRoleSchema = z.enum([
  "OPERATOR",
  "ENGINEERING_LEAD",
  "LEGAL_OPS_LEAD",
  "CUSTOMER_SUPPORT_OWNER",
  "ROLLBACK_OWNER",
  "ADMIN_APPROVER",
]);

export const supportEscalationChannelSchema = z.enum([
  "OPS_CONSOLE",
  "EMAIL",
  "CHAT",
  "PHONE",
  "CUSTOMER_TICKET",
  "STATUS_PAGE",
]);

export const supportResponseWindowSchema = z.object({
  severity: supportSeveritySchema,
  acknowledgeWithinMinutes: z.number().int().positive(),
  mitigateWithinMinutes: z.number().int().positive(),
  escalateWithinMinutes: z.number().int().positive(),
  customerMessageRequired: z.boolean(),
});

export const supportOwnerAssignmentSchema = z.object({
  role: supportEscalationRoleSchema,
  ownerUserId: z.string().min(1),
  backupOwnerUserId: z.string().min(1),
  channel: supportEscalationChannelSchema,
  available: z.boolean(),
});

export const customerSafeMessageTemplateSchema = z.object({
  templateKey: z.string().min(1),
  severity: supportSeveritySchema,
  customerVisible: z.boolean(),
  approvedByLegalOps: z.boolean(),
  approvedBySupportOwner: z.boolean(),
  containsInternalStrategy: z.boolean(),
  containsRiskRadarDetail: z.boolean(),
  containsGraphGapDetail: z.boolean(),
  containsPrivilegedReviewNote: z.boolean(),
  containsUnreviewedEvidenceJudgment: z.boolean(),
});

export const supportAuditRequirementSchema = z.object({
  supportAuditRequired: z.boolean(),
  incidentRefRequired: z.boolean(),
  customerTicketRefRequired: z.boolean(),
  escalationLogRequired: z.boolean(),
  customerMessageLogRequired: z.boolean(),
  closeoutReviewRequired: z.boolean(),
});

export const supportEscalationEvidenceSchema = z.object({
  phase: z.literal("54-E"),
  status: supportEscalationStatusSchema,

  dependency: z.object({
    phase54aBaselineLocked: z.boolean(),
    phase54bIncidentSeverityLocked: z.boolean(),
    phase54cHotfixGovernanceLocked: z.boolean(),
    phase54dDegradedModeLocked: z.boolean(),
    baselineEvidenceRef: z.string().min(1),
    incidentSeverityEvidenceRef: z.string().min(1),
    hotfixGovernanceEvidenceRef: z.string().min(1),
    degradedModeEvidenceRef: z.string().min(1),
  }),

  escalationMatrix: z.object({
    responseWindows: z.array(supportResponseWindowSchema).min(5),
    ownerAssignments: z.array(supportOwnerAssignmentSchema).min(6),
    severityOwnersDefined: z.boolean(),
    backupOwnersDefined: z.boolean(),
  }),

  customerCommunication: z.object({
    safeTemplates: z.array(customerSafeMessageTemplateSchema).min(1),
    customerSafeTemplateReady: z.boolean(),
    unsafeTemplateDetected: z.boolean(),
    statusPageReady: z.boolean(),
    customerTicketFlowReady: z.boolean(),
  }),

  supportAudit: supportAuditRequirementSchema.extend({
    auditLogWritten: z.boolean(),
    auditEvidenceRefs: z.array(z.string()).min(1),
  }),

  readinessDrill: z.object({
    sev0DrillCompleted: z.boolean(),
    degradedModeEscalationDrillCompleted: z.boolean(),
    hotfixEscalationDrillCompleted: z.boolean(),
    customerMessageDrillCompleted: z.boolean(),
    rollbackOwnerContactVerified: z.boolean(),
  }),

  closeout: z.object({
    supportReadinessReviewed: z.boolean(),
    reviewedByUserId: z.string().min(1).optional(),
    reviewedAt: z.string().datetime().optional(),
    reviewNote: z.string().min(1).optional(),
  }),

  supportGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(supportEscalationBoundarySchema),
  }),
});

export type SupportEscalationEvidence = z.infer<typeof supportEscalationEvidenceSchema>;
