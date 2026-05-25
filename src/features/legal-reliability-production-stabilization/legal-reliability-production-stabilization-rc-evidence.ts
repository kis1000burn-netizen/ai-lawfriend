/**
 * Product Phase 54-F — Production Stabilization RC evidence builder SSOT.
 */
import { evaluateProductionStabilizationRcGate } from "./legal-reliability-production-stabilization-rc.policy";

export const LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_EVIDENCE_MARKER =
  "phase54f-legal-reliability-production-stabilization-rc-evidence" as const;

export function buildProductionStabilizationRcEvidence(input: {
  phase54aBaselineLocked: boolean;
  phase54bIncidentSeverityLocked: boolean;
  phase54cHotfixGovernanceLocked: boolean;
  phase54dDegradedModeLocked: boolean;
  phase54eSupportEscalationLocked: boolean;

  baselineEvidenceRef: string;
  incidentSeverityEvidenceRef: string;
  hotfixGovernanceEvidenceRef: string;
  degradedModeEvidenceRef: string;
  supportEscalationEvidenceRef: string;
  implementationEvidenceRef: string;
  navigatorRef: string;
  chainComplete: boolean;

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
  const gate = evaluateProductionStabilizationRcGate({
    phase54aBaselineLocked: input.phase54aBaselineLocked,
    phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
    phase54cHotfixGovernanceLocked: input.phase54cHotfixGovernanceLocked,
    phase54dDegradedModeLocked: input.phase54dDegradedModeLocked,
    phase54eSupportEscalationLocked: input.phase54eSupportEscalationLocked,

    evidenceChainComplete: input.chainComplete,

    stabilizationBaselineVerifyPassed: input.stabilizationBaselineVerifyPassed,
    incidentSeverityVerifyPassed: input.incidentSeverityVerifyPassed,
    hotfixGovernanceVerifyPassed: input.hotfixGovernanceVerifyPassed,
    degradedModeVerifyPassed: input.degradedModeVerifyPassed,
    supportEscalationVerifyPassed: input.supportEscalationVerifyPassed,

    baselineDefined: input.baselineDefined,
    severityPolicyDefined: input.severityPolicyDefined,
    hotfixGovernanceDefined: input.hotfixGovernanceDefined,
    degradedModeReady: input.degradedModeReady,
    customerSafeMessagesReady: input.customerSafeMessagesReady,
    supportEscalationReady: input.supportEscalationReady,
    supportAuditReady: input.supportAuditReady,

    rollbackReadinessVerified: input.rollbackReadinessVerified,
    readOnlyDegradeVerified: input.readOnlyDegradeVerified,
    tenantIsolationReady: input.tenantIsolationReady,
    featurePartialDisableReady: input.featurePartialDisableReady,
    writeDisableReady: input.writeDisableReady,
    completionDisableReady: input.completionDisableReady,

    implementationEvidenceUpdated: input.implementationEvidenceUpdated,
    navigatorUpdated: input.navigatorUpdated,
    deployPrecheckUpdated: input.deployPrecheckUpdated,
    operationsIndexUpdated: input.operationsIndexUpdated,
    roadmapUpdated: input.roadmapUpdated,
    rcSummaryUpdated: input.rcSummaryUpdated,
    stabilizationSpecUpdated: input.stabilizationSpecUpdated,
  });

  return {
    phase: "54-F" as const,
    status: gate.allowed ? ("LOCKED" as const) : ("BLOCKED" as const),

    phaseLocks: {
      phase54aBaselineLocked: input.phase54aBaselineLocked,
      phase54bIncidentSeverityLocked: input.phase54bIncidentSeverityLocked,
      phase54cHotfixGovernanceLocked: input.phase54cHotfixGovernanceLocked,
      phase54dDegradedModeLocked: input.phase54dDegradedModeLocked,
      phase54eSupportEscalationLocked: input.phase54eSupportEscalationLocked,
    },

    evidenceChain: {
      baselineEvidenceRef: input.baselineEvidenceRef,
      incidentSeverityEvidenceRef: input.incidentSeverityEvidenceRef,
      hotfixGovernanceEvidenceRef: input.hotfixGovernanceEvidenceRef,
      degradedModeEvidenceRef: input.degradedModeEvidenceRef,
      supportEscalationEvidenceRef: input.supportEscalationEvidenceRef,
      implementationEvidenceRef: input.implementationEvidenceRef,
      navigatorRef: input.navigatorRef,
      chainComplete: input.chainComplete,
    },

    masterVerify: {
      stabilizationBaselineVerifyPassed: input.stabilizationBaselineVerifyPassed,
      incidentSeverityVerifyPassed: input.incidentSeverityVerifyPassed,
      hotfixGovernanceVerifyPassed: input.hotfixGovernanceVerifyPassed,
      degradedModeVerifyPassed: input.degradedModeVerifyPassed,
      supportEscalationVerifyPassed: input.supportEscalationVerifyPassed,
      productionStabilizationRcVerifyPassed: gate.allowed,
    },

    customerSafeOperation: {
      baselineDefined: input.baselineDefined,
      severityPolicyDefined: input.severityPolicyDefined,
      hotfixGovernanceDefined: input.hotfixGovernanceDefined,
      degradedModeReady: input.degradedModeReady,
      customerSafeMessagesReady: input.customerSafeMessagesReady,
      supportEscalationReady: input.supportEscalationReady,
      supportAuditReady: input.supportAuditReady,
    },

    safetyReadiness: {
      rollbackReadinessVerified: input.rollbackReadinessVerified,
      readOnlyDegradeVerified: input.readOnlyDegradeVerified,
      tenantIsolationReady: input.tenantIsolationReady,
      featurePartialDisableReady: input.featurePartialDisableReady,
      writeDisableReady: input.writeDisableReady,
      completionDisableReady: input.completionDisableReady,
    },

    governanceDocs: {
      implementationEvidenceUpdated: input.implementationEvidenceUpdated,
      navigatorUpdated: input.navigatorUpdated,
      deployPrecheckUpdated: input.deployPrecheckUpdated,
      operationsIndexUpdated: input.operationsIndexUpdated,
      roadmapUpdated: input.roadmapUpdated,
      rcSummaryUpdated: input.rcSummaryUpdated,
      stabilizationSpecUpdated: input.stabilizationSpecUpdated,
    },

    rcGate: gate,
  };
}
