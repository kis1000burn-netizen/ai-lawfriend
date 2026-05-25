/**
 * Product Phase 54-C — Hotfix / Emergency Patch Governance evidence builder SSOT.
 */
import { evaluateHotfixGovernanceGate } from "./legal-reliability-hotfix-governance.policy";

export const LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_EVIDENCE_MARKER =
  "phase54c-legal-reliability-hotfix-governance-evidence" as const;

export function buildHotfixGovernanceEvidence(input: {
  phase54bIncidentSeverityLocked: boolean;
  incidentSeverityEvidenceRef: string;

  hotfixId: string;
  severity: "SEV_0" | "SEV_1" | "SEV_2" | "SEV_3" | "SEV_4";
  hotfixType:
    | "EMERGENCY_PATCH"
    | "HOTFIX"
    | "STANDARD_PATCH"
    | "CONFIG_ONLY"
    | "ROLLBACK_ONLY";
  riskAreas: Array<
    | "ROLE_BOUNDARY"
    | "AUTOMATION_RISK"
    | "ACTION_LOOP"
    | "OPERATIONS_QUEUE"
    | "AUDIT_LOG"
    | "FEATURE_FLAG"
    | "LATENCY"
    | "CLIENT_UI"
    | "DATABASE_MIGRATION"
  >;
  incidentRef: string;
  patchSummary: string;

  requestedByUserId: string;
  approvedByUserId: string;
  approvedByRole: "ADMIN" | "ENGINEERING_LEAD" | "LEGAL_OPS_LEAD" | "OWNER";
  approvedAt: string;
  approvalReason: string;
  rollbackOwnerUserId: string;
  rollbackOwnerAcknowledged: boolean;
  extraMigrationApprovalUserId?: string;

  scopeLimited: boolean;
  affectedTenants: string[];
  affectedFeatures: string[];
  includesDatabaseMigration: boolean;
  includesFeatureFlagChange: boolean;
  includesClientVisibleChange: boolean;
  includesLegalReliabilityBoundaryChange: boolean;

  rollbackPlanReady: boolean;
  rollbackRunbookRef: string;
  rollbackOwnerAvailable: boolean;
  rollbackTimeEstimateMinutes: number;

  prePatchVerifyCommand: string;
  postPatchVerifyCommand: string;
  rollbackVerifyCommand: string;
  prePatchVerifyPassed: boolean;
  postPatchVerifyPassed: boolean;
  rollbackVerifyPassed: boolean;
  productionSmokeRequired: boolean;
  productionSmokePassed: boolean;

  customerImpactRecorded: boolean;
  customerVisible: boolean;
  customerCommunicationRequired: boolean;
  customerCommunicationRef?: string;

  auditLogRequired: boolean;
  auditLogWritten: boolean;
  auditEvidenceRefs: string[];

  closeoutReviewCompleted: boolean;
  closeoutReviewedByUserId?: string;
  closedAt?: string;
  closeoutNote?: string;
}) {
  const gate = evaluateHotfixGovernanceGate({
    phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,

    severityClassified: Boolean(input.severity),
    severity: input.severity,
    hotfixType: input.hotfixType,

    approvalPresent:
      Boolean(input.requestedByUserId) &&
      Boolean(input.approvedByUserId) &&
      Boolean(input.approvedByRole) &&
      Boolean(input.approvedAt) &&
      Boolean(input.approvalReason),
    rollbackOwnerAcknowledged: input.rollbackOwnerAcknowledged,

    scopeLimited: input.scopeLimited,
    affectedTenantsPresent: input.affectedTenants.length > 0,
    affectedFeaturesPresent: input.affectedFeatures.length > 0,

    includesDatabaseMigration: input.includesDatabaseMigration,
    extraMigrationApprovalPresent: Boolean(input.extraMigrationApprovalUserId),

    rollbackPlanReady: input.rollbackPlanReady,
    rollbackRunbookPresent: Boolean(input.rollbackRunbookRef),
    rollbackOwnerAvailable: input.rollbackOwnerAvailable,

    prePatchVerifyPassed: input.prePatchVerifyPassed,
    postPatchVerifyPassed: input.postPatchVerifyPassed,
    rollbackVerifyPassed: input.rollbackVerifyPassed,
    productionSmokeRequired: input.productionSmokeRequired,
    productionSmokePassed: input.productionSmokePassed,

    customerImpactRecorded: input.customerImpactRecorded,
    customerCommunicationRequired: input.customerCommunicationRequired,
    customerCommunicationRefPresent: Boolean(input.customerCommunicationRef),

    auditLogRequired: input.auditLogRequired,
    auditLogWritten: input.auditLogWritten,
    auditEvidencePresent: input.auditEvidenceRefs.length > 0,

    closeoutReviewCompleted: input.closeoutReviewCompleted,
  });

  return {
    phase: "54-C" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    dependency: {
      phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
      incidentSeverityEvidenceRef: input.incidentSeverityEvidenceRef,
    },

    hotfixRequest: {
      hotfixId: input.hotfixId,
      severity: input.severity,
      hotfixType: input.hotfixType,
      riskAreas: input.riskAreas,
      incidentRef: input.incidentRef,
      patchSummary: input.patchSummary,
    },

    approval: {
      requestedByUserId: input.requestedByUserId,
      approvedByUserId: input.approvedByUserId,
      approvedByRole: input.approvedByRole,
      approvedAt: input.approvedAt,
      approvalReason: input.approvalReason,
      rollbackOwnerUserId: input.rollbackOwnerUserId,
      rollbackOwnerAcknowledged: input.rollbackOwnerAcknowledged,
      extraMigrationApprovalUserId: input.extraMigrationApprovalUserId,
    },

    scope: {
      scopeLimited: input.scopeLimited,
      affectedTenants: input.affectedTenants,
      affectedFeatures: input.affectedFeatures,
      includesDatabaseMigration: input.includesDatabaseMigration,
      includesFeatureFlagChange: input.includesFeatureFlagChange,
      includesClientVisibleChange: input.includesClientVisibleChange,
      includesLegalReliabilityBoundaryChange:
        input.includesLegalReliabilityBoundaryChange,
    },

    rollbackPlan: {
      rollbackPlanReady: input.rollbackPlanReady,
      rollbackRunbookRef: input.rollbackRunbookRef,
      rollbackOwnerAvailable: input.rollbackOwnerAvailable,
      rollbackTimeEstimateMinutes: input.rollbackTimeEstimateMinutes,
    },

    verification: {
      prePatchVerifyCommand: input.prePatchVerifyCommand,
      postPatchVerifyCommand: input.postPatchVerifyCommand,
      rollbackVerifyCommand: input.rollbackVerifyCommand,
      prePatchVerifyPassed: input.prePatchVerifyPassed,
      postPatchVerifyPassed: input.postPatchVerifyPassed,
      rollbackVerifyPassed: input.rollbackVerifyPassed,
      productionSmokeRequired: input.productionSmokeRequired,
      productionSmokePassed: input.productionSmokePassed,
    },

    customerImpact: {
      customerImpactRecorded: input.customerImpactRecorded,
      customerVisible: input.customerVisible,
      customerCommunicationRequired: input.customerCommunicationRequired,
      customerCommunicationRef: input.customerCommunicationRef,
      incidentRef: input.incidentRef,
      severity: input.severity,
    },

    auditEvidence: {
      auditLogRequired: input.auditLogRequired,
      auditLogWritten: input.auditLogWritten,
      auditEvidenceRefs: input.auditEvidenceRefs,
    },

    closeout: {
      closeoutReviewCompleted: input.closeoutReviewCompleted,
      closeoutReviewedByUserId: input.closeoutReviewedByUserId,
      closedAt: input.closedAt,
      closeoutNote: input.closeoutNote,
    },

    hotfixGate: gate,
  };
}
