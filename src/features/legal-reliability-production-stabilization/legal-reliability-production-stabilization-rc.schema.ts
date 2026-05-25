/**
 * Product Phase 54-F — Production Stabilization RC schema SSOT.
 */
import { z } from "zod";

export const productionStabilizationRcStatusSchema = z.enum([
  "NOT_READY",
  "READY_FOR_RC",
  "BLOCKED",
  "LOCKED",
]);

export const productionStabilizationRcBoundarySchema = z.enum([
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
]);

export const productionStabilizationRcEvidenceSchema = z.object({
  phase: z.literal("54-F"),
  status: productionStabilizationRcStatusSchema,

  phaseLocks: z.object({
    phase54aBaselineLocked: z.boolean(),
    phase54bIncidentSeverityLocked: z.boolean(),
    phase54cHotfixGovernanceLocked: z.boolean(),
    phase54dDegradedModeLocked: z.boolean(),
    phase54eSupportEscalationLocked: z.boolean(),
  }),

  evidenceChain: z.object({
    baselineEvidenceRef: z.string().min(1),
    incidentSeverityEvidenceRef: z.string().min(1),
    hotfixGovernanceEvidenceRef: z.string().min(1),
    degradedModeEvidenceRef: z.string().min(1),
    supportEscalationEvidenceRef: z.string().min(1),
    implementationEvidenceRef: z.string().min(1),
    navigatorRef: z.string().min(1),
    chainComplete: z.boolean(),
  }),

  masterVerify: z.object({
    stabilizationBaselineVerifyPassed: z.boolean(),
    incidentSeverityVerifyPassed: z.boolean(),
    hotfixGovernanceVerifyPassed: z.boolean(),
    degradedModeVerifyPassed: z.boolean(),
    supportEscalationVerifyPassed: z.boolean(),
    productionStabilizationRcVerifyPassed: z.boolean(),
  }),

  customerSafeOperation: z.object({
    baselineDefined: z.boolean(),
    severityPolicyDefined: z.boolean(),
    hotfixGovernanceDefined: z.boolean(),
    degradedModeReady: z.boolean(),
    customerSafeMessagesReady: z.boolean(),
    supportEscalationReady: z.boolean(),
    supportAuditReady: z.boolean(),
  }),

  safetyReadiness: z.object({
    rollbackReadinessVerified: z.boolean(),
    readOnlyDegradeVerified: z.boolean(),
    tenantIsolationReady: z.boolean(),
    featurePartialDisableReady: z.boolean(),
    writeDisableReady: z.boolean(),
    completionDisableReady: z.boolean(),
  }),

  governanceDocs: z.object({
    implementationEvidenceUpdated: z.boolean(),
    navigatorUpdated: z.boolean(),
    deployPrecheckUpdated: z.boolean(),
    operationsIndexUpdated: z.boolean(),
    roadmapUpdated: z.boolean(),
    rcSummaryUpdated: z.boolean(),
    stabilizationSpecUpdated: z.boolean(),
  }),

  rcGate: z.object({
    allowed: z.boolean(),
    blockedReasons: z.array(z.string()),
    boundaryMarkers: z.array(productionStabilizationRcBoundarySchema),
  }),
});

export type ProductionStabilizationRcEvidence =
  z.infer<typeof productionStabilizationRcEvidenceSchema>;
