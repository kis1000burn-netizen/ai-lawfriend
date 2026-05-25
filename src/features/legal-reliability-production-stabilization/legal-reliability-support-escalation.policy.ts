/**
 * Product Phase 54-E — Support / Ops Escalation Readiness policy SSOT.
 */
import { ForbiddenError, ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_SUPPORT_ESCALATION_POLICY_MARKER =
  "phase54e-legal-reliability-support-escalation-policy" as const;

export const PHASE_54E_BOUNDARY_MARKERS = [
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
] as const;

export function evaluateSupportEscalationGate(input: {
  phase54aBaselineLocked: boolean;
  phase54bIncidentSeverityLocked: boolean;
  phase54cHotfixGovernanceLocked: boolean;
  phase54dDegradedModeLocked: boolean;

  severityOwnersDefined: boolean;
  backupOwnersDefined: boolean;
  responseWindowsDefined: boolean;

  operatorOwnerAvailable: boolean;
  engineeringLeadAvailable: boolean;
  legalOpsLeadAvailable: boolean;
  customerSupportOwnerAvailable: boolean;
  rollbackOwnerAvailable: boolean;
  adminApproverAvailable: boolean;

  customerSafeTemplateReady: boolean;
  unsafeTemplateDetected: boolean;
  statusPageReady: boolean;
  customerTicketFlowReady: boolean;

  supportAuditRequired: boolean;
  incidentRefRequired: boolean;
  customerTicketRefRequired: boolean;
  escalationLogRequired: boolean;
  customerMessageLogRequired: boolean;
  closeoutReviewRequired: boolean;
  auditLogWritten: boolean;
  auditEvidencePresent: boolean;

  sev0DrillCompleted: boolean;
  degradedModeEscalationDrillCompleted: boolean;
  hotfixEscalationDrillCompleted: boolean;
  customerMessageDrillCompleted: boolean;
  rollbackOwnerContactVerified: boolean;

  supportReadinessReviewed: boolean;
}) {
  const blockedReasons: string[] = [];

  if (
    !input.phase54aBaselineLocked ||
    !input.phase54bIncidentSeverityLocked ||
    !input.phase54cHotfixGovernanceLocked ||
    !input.phase54dDegradedModeLocked
  ) {
    blockedReasons.push("PHASE_54A_54D_LOCK_REQUIRED");
  }

  if (!input.severityOwnersDefined || !input.backupOwnersDefined) {
    blockedReasons.push("SEVERITY_OWNER_AND_BACKUP_REQUIRED");
  }

  if (!input.responseWindowsDefined) {
    blockedReasons.push("RESPONSE_WINDOW_REQUIRED");
  }

  if (!input.operatorOwnerAvailable) {
    blockedReasons.push("OPERATOR_OWNER_REQUIRED");
  }

  if (!input.engineeringLeadAvailable) {
    blockedReasons.push("ENGINEERING_LEAD_REQUIRED");
  }

  if (!input.legalOpsLeadAvailable) {
    blockedReasons.push("LEGAL_OPS_LEAD_REQUIRED");
  }

  if (!input.customerSupportOwnerAvailable) {
    blockedReasons.push("CUSTOMER_SUPPORT_OWNER_REQUIRED");
  }

  if (!input.rollbackOwnerAvailable) {
    blockedReasons.push("ROLLBACK_OWNER_REQUIRED");
  }

  if (!input.adminApproverAvailable) {
    blockedReasons.push("ADMIN_APPROVER_REQUIRED");
  }

  if (
    !input.customerSafeTemplateReady ||
    input.unsafeTemplateDetected ||
    !input.statusPageReady ||
    !input.customerTicketFlowReady
  ) {
    blockedReasons.push("CUSTOMER_SAFE_COMMUNICATION_REQUIRED");
  }

  if (
    !input.supportAuditRequired ||
    !input.incidentRefRequired ||
    !input.customerTicketRefRequired ||
    !input.escalationLogRequired ||
    !input.customerMessageLogRequired ||
    !input.closeoutReviewRequired ||
    !input.auditLogWritten ||
    !input.auditEvidencePresent
  ) {
    blockedReasons.push("SUPPORT_AUDIT_REQUIREMENT_NOT_MET");
  }

  if (
    !input.sev0DrillCompleted ||
    !input.degradedModeEscalationDrillCompleted ||
    !input.hotfixEscalationDrillCompleted ||
    !input.customerMessageDrillCompleted ||
    !input.rollbackOwnerContactVerified
  ) {
    blockedReasons.push("SUPPORT_READINESS_DRILL_REQUIRED");
  }

  if (!input.supportReadinessReviewed) {
    blockedReasons.push("SUPPORT_READINESS_REVIEW_REQUIRED");
  }

  return {
    allowed: blockedReasons.length === 0,
    blockedReasons,
    boundaryMarkers: PHASE_54E_BOUNDARY_MARKERS,
  };
}

export function assertSupportEscalationAllowed(
  result: ReturnType<typeof evaluateSupportEscalationGate>,
) {
  if (result.blockedReasons.includes("PHASE_54A_54D_LOCK_REQUIRED")) {
    throw new ValidationError("NO_SUPPORT_ESCALATION_WITHOUT_54A_54D_LOCK");
  }
  if (result.blockedReasons.includes("SEVERITY_OWNER_AND_BACKUP_REQUIRED")) {
    throw new ValidationError("NO_ESCALATION_WITHOUT_SEVERITY_OWNER");
  }
  if (result.blockedReasons.includes("RESPONSE_WINDOW_REQUIRED")) {
    throw new ValidationError("NO_ESCALATION_WITHOUT_RESPONSE_WINDOW");
  }
  if (result.blockedReasons.includes("ENGINEERING_LEAD_REQUIRED")) {
    throw new ValidationError("NO_ESCALATION_WITHOUT_ENGINEERING_OWNER");
  }
  if (result.blockedReasons.includes("LEGAL_OPS_LEAD_REQUIRED")) {
    throw new ValidationError("NO_ESCALATION_WITHOUT_LEGAL_OPS_OWNER");
  }
  if (result.blockedReasons.includes("CUSTOMER_SUPPORT_OWNER_REQUIRED")) {
    throw new ValidationError("NO_ESCALATION_WITHOUT_CUSTOMER_SUPPORT_OWNER");
  }
  if (result.blockedReasons.includes("CUSTOMER_SAFE_COMMUNICATION_REQUIRED")) {
    throw new ForbiddenError("NO_CUSTOMER_MESSAGE_WITHOUT_SAFE_TEMPLATE");
  }
  if (result.blockedReasons.includes("SUPPORT_AUDIT_REQUIREMENT_NOT_MET")) {
    throw new ValidationError("NO_SUPPORT_ACTION_WITHOUT_AUDIT_LOG");
  }
  if (result.blockedReasons.includes("SUPPORT_READINESS_REVIEW_REQUIRED")) {
    throw new ValidationError("NO_INCIDENT_CLOSEOUT_WITHOUT_SUPPORT_REVIEW");
  }

  if (!result.allowed) {
    throw new ValidationError(result.blockedReasons[0] ?? "SUPPORT_ESCALATION_GATE_BLOCKED");
  }

  return result;
}
