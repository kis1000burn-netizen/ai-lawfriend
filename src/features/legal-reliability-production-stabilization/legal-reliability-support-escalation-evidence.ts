/**
 * Product Phase 54-E — Support / Ops Escalation Readiness evidence builder SSOT.
 */
import { evaluateSupportEscalationGate } from "./legal-reliability-support-escalation.policy";

export const LEGAL_RELIABILITY_SUPPORT_ESCALATION_EVIDENCE_MARKER =
  "phase54e-legal-reliability-support-escalation-evidence" as const;

type Severity = "SEV_0" | "SEV_1" | "SEV_2" | "SEV_3" | "SEV_4";

type OwnerRole =
  | "OPERATOR"
  | "ENGINEERING_LEAD"
  | "LEGAL_OPS_LEAD"
  | "CUSTOMER_SUPPORT_OWNER"
  | "ROLLBACK_OWNER"
  | "ADMIN_APPROVER";

export function buildSupportEscalationEvidence(input: {
  phase54aBaselineLocked: boolean;
  phase54bIncidentSeverityLocked: boolean;
  phase54cHotfixGovernanceLocked: boolean;
  phase54dDegradedModeLocked: boolean;
  baselineEvidenceRef: string;
  incidentSeverityEvidenceRef: string;
  hotfixGovernanceEvidenceRef: string;
  degradedModeEvidenceRef: string;

  responseWindows: Array<{
    severity: Severity;
    acknowledgeWithinMinutes: number;
    mitigateWithinMinutes: number;
    escalateWithinMinutes: number;
    customerMessageRequired: boolean;
  }>;

  ownerAssignments: Array<{
    role: OwnerRole;
    ownerUserId: string;
    backupOwnerUserId: string;
    channel:
      | "OPS_CONSOLE"
      | "EMAIL"
      | "CHAT"
      | "PHONE"
      | "CUSTOMER_TICKET"
      | "STATUS_PAGE";
    available: boolean;
  }>;

  severityOwnersDefined: boolean;
  backupOwnersDefined: boolean;

  safeTemplates: Array<{
    templateKey: string;
    severity: Severity;
    customerVisible: boolean;
    approvedByLegalOps: boolean;
    approvedBySupportOwner: boolean;
    containsInternalStrategy: boolean;
    containsRiskRadarDetail: boolean;
    containsGraphGapDetail: boolean;
    containsPrivilegedReviewNote: boolean;
    containsUnreviewedEvidenceJudgment: boolean;
  }>;

  customerSafeTemplateReady: boolean;
  statusPageReady: boolean;
  customerTicketFlowReady: boolean;

  supportAuditRequired: boolean;
  incidentRefRequired: boolean;
  customerTicketRefRequired: boolean;
  escalationLogRequired: boolean;
  customerMessageLogRequired: boolean;
  closeoutReviewRequired: boolean;
  auditLogWritten: boolean;
  auditEvidenceRefs: string[];

  sev0DrillCompleted: boolean;
  degradedModeEscalationDrillCompleted: boolean;
  hotfixEscalationDrillCompleted: boolean;
  customerMessageDrillCompleted: boolean;
  rollbackOwnerContactVerified: boolean;

  supportReadinessReviewed: boolean;
  reviewedByUserId?: string;
  reviewedAt?: string;
  reviewNote?: string;
}) {
  const ownerAvailable = (role: OwnerRole) =>
    input.ownerAssignments.some(
      (assignment) => assignment.role === role && assignment.available,
    );

  const unsafeTemplateDetected = input.safeTemplates.some(
    (template) =>
      template.containsInternalStrategy ||
      template.containsRiskRadarDetail ||
      template.containsGraphGapDetail ||
      template.containsPrivilegedReviewNote ||
      template.containsUnreviewedEvidenceJudgment ||
      !template.approvedByLegalOps ||
      !template.approvedBySupportOwner,
  );

  const gate = evaluateSupportEscalationGate({
    phase54aBaselineLocked: input.phase54aBaselineLocked,
    phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
    phase54cHotfixGovernanceLocked: input.phase54cHotfixGovernanceLocked,
    phase54dDegradedModeLocked: input.phase54dDegradedModeLocked,

    severityOwnersDefined: input.severityOwnersDefined,
    backupOwnersDefined: input.backupOwnersDefined,
    responseWindowsDefined: input.responseWindows.length >= 5,

    operatorOwnerAvailable: ownerAvailable("OPERATOR"),
    engineeringLeadAvailable: ownerAvailable("ENGINEERING_LEAD"),
    legalOpsLeadAvailable: ownerAvailable("LEGAL_OPS_LEAD"),
    customerSupportOwnerAvailable: ownerAvailable("CUSTOMER_SUPPORT_OWNER"),
    rollbackOwnerAvailable: ownerAvailable("ROLLBACK_OWNER"),
    adminApproverAvailable: ownerAvailable("ADMIN_APPROVER"),

    customerSafeTemplateReady: input.customerSafeTemplateReady,
    unsafeTemplateDetected,
    statusPageReady: input.statusPageReady,
    customerTicketFlowReady: input.customerTicketFlowReady,

    supportAuditRequired: input.supportAuditRequired,
    incidentRefRequired: input.incidentRefRequired,
    customerTicketRefRequired: input.customerTicketRefRequired,
    escalationLogRequired: input.escalationLogRequired,
    customerMessageLogRequired: input.customerMessageLogRequired,
    closeoutReviewRequired: input.closeoutReviewRequired,
    auditLogWritten: input.auditLogWritten,
    auditEvidencePresent: input.auditEvidenceRefs.length > 0,

    sev0DrillCompleted: input.sev0DrillCompleted,
    degradedModeEscalationDrillCompleted: input.degradedModeEscalationDrillCompleted,
    hotfixEscalationDrillCompleted: input.hotfixEscalationDrillCompleted,
    customerMessageDrillCompleted: input.customerMessageDrillCompleted,
    rollbackOwnerContactVerified: input.rollbackOwnerContactVerified,

    supportReadinessReviewed: input.supportReadinessReviewed,
  });

  return {
    phase: "54-E" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase54aBaselineLocked: input.phase54aBaselineLocked,
      phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
      phase54cHotfixGovernanceLocked: input.phase54cHotfixGovernanceLocked,
      phase54dDegradedModeLocked: input.phase54dDegradedModeLocked,
      baselineEvidenceRef: input.baselineEvidenceRef,
      incidentSeverityEvidenceRef: input.incidentSeverityEvidenceRef,
      hotfixGovernanceEvidenceRef: input.hotfixGovernanceEvidenceRef,
      degradedModeEvidenceRef: input.degradedModeEvidenceRef,
    },

    escalationMatrix: {
      responseWindows: input.responseWindows,
      ownerAssignments: input.ownerAssignments,
      severityOwnersDefined: input.severityOwnersDefined,
      backupOwnersDefined: input.backupOwnersDefined,
    },

    customerCommunication: {
      safeTemplates: input.safeTemplates,
      customerSafeTemplateReady: input.customerSafeTemplateReady,
      unsafeTemplateDetected,
      statusPageReady: input.statusPageReady,
      customerTicketFlowReady: input.customerTicketFlowReady,
    },

    supportAudit: {
      supportAuditRequired: input.supportAuditRequired,
      incidentRefRequired: input.incidentRefRequired,
      customerTicketRefRequired: input.customerTicketRefRequired,
      escalationLogRequired: input.escalationLogRequired,
      customerMessageLogRequired: input.customerMessageLogRequired,
      closeoutReviewRequired: input.closeoutReviewRequired,
      auditLogWritten: input.auditLogWritten,
      auditEvidenceRefs: input.auditEvidenceRefs,
    },

    readinessDrill: {
      sev0DrillCompleted: input.sev0DrillCompleted,
      degradedModeEscalationDrillCompleted: input.degradedModeEscalationDrillCompleted,
      hotfixEscalationDrillCompleted: input.hotfixEscalationDrillCompleted,
      customerMessageDrillCompleted: input.customerMessageDrillCompleted,
      rollbackOwnerContactVerified: input.rollbackOwnerContactVerified,
    },

    closeout: {
      supportReadinessReviewed: input.supportReadinessReviewed,
      reviewedByUserId: input.reviewedByUserId,
      reviewedAt: input.reviewedAt,
      reviewNote: input.reviewNote,
    },

    supportGate: gate,
  };
}
