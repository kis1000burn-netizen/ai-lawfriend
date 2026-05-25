import { describe, expect, it } from "vitest";
import { buildProductionStabilizationRcEvidence } from "./legal-reliability-production-stabilization-rc-evidence";
import {
  assertProductionStabilizationRcGateAllowed,
  evaluateProductionStabilizationRcGate,
} from "./legal-reliability-production-stabilization-rc.policy";
import {
  LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_COMMERCIAL_OPERATION_STATUS,
  LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_VERSION,
} from "./legal-reliability-production-stabilization-rc-lock";
import { productionStabilizationRcEvidenceSchema } from "./legal-reliability-production-stabilization-rc.schema";

const baseInput = {
  phase54aBaselineLocked: true,
  phase54bIncidentSeverityLocked: true,
  phase54cHotfixGovernanceLocked: true,
  phase54dDegradedModeLocked: true,
  phase54eSupportEscalationLocked: true,
  evidenceChainComplete: true,
  stabilizationBaselineVerifyPassed: true,
  incidentSeverityVerifyPassed: true,
  hotfixGovernanceVerifyPassed: true,
  degradedModeVerifyPassed: true,
  supportEscalationVerifyPassed: true,
  baselineDefined: true,
  severityPolicyDefined: true,
  hotfixGovernanceDefined: true,
  degradedModeReady: true,
  customerSafeMessagesReady: true,
  supportEscalationReady: true,
  supportAuditReady: true,
  rollbackReadinessVerified: true,
  readOnlyDegradeVerified: true,
  tenantIsolationReady: true,
  featurePartialDisableReady: true,
  writeDisableReady: true,
  completionDisableReady: true,
  implementationEvidenceUpdated: true,
  navigatorUpdated: true,
  deployPrecheckUpdated: true,
  operationsIndexUpdated: true,
  roadmapUpdated: true,
  rcSummaryUpdated: true,
  stabilizationSpecUpdated: true,
};

const satisfiedEvidenceInput = {
  ...baseInput,
  chainComplete: true,
  baselineEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE",
  incidentSeverityEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
  hotfixGovernanceEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE",
  degradedModeEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE",
  supportEscalationEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54E-SUPPORT-OPS-ESCALATION",
  implementationEvidenceRef: "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  navigatorRef: "tools/aibeopchin_navigator.py",
};

describe("Phase 54-F Production Stabilization RC", () => {
  it("blocks RC without Phase 54-A baseline lock", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      phase54aBaselineLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54A_BASELINE_LOCK_REQUIRED");
    expect(() =>
      assertProductionStabilizationRcGateAllowed({
        ...baseInput,
        phase54aBaselineLocked: false,
      }),
    ).toThrow("NO_STABILIZATION_RC_WITHOUT_54A_BASELINE_LOCK");
  });

  it("blocks RC without Phase 54-B incident severity lock", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      phase54bIncidentSeverityLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54B_INCIDENT_SEVERITY_LOCK_REQUIRED");
  });

  it("blocks RC without Phase 54-C hotfix governance lock", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      phase54cHotfixGovernanceLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54C_HOTFIX_GOVERNANCE_LOCK_REQUIRED");
  });

  it("blocks RC without Phase 54-D degraded mode lock", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      phase54dDegradedModeLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54D_DEGRADED_MODE_LOCK_REQUIRED");
  });

  it("blocks RC without Phase 54-E support escalation lock", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      phase54eSupportEscalationLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54E_SUPPORT_ESCALATION_LOCK_REQUIRED");
  });

  it("blocks RC when evidence chain is incomplete", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      evidenceChainComplete: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PRODUCTION_STABILIZATION_EVIDENCE_CHAIN_INCOMPLETE");
    expect(() =>
      assertProductionStabilizationRcGateAllowed({
        ...baseInput,
        evidenceChainComplete: false,
      }),
    ).toThrow("NO_STABILIZATION_RC_WITH_BROKEN_EVIDENCE_CHAIN");
  });

  it("blocks RC when a sub-verify fails", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      hotfixGovernanceVerifyPassed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54_SUB_VERIFY_NOT_PASSED");
  });

  it("blocks RC without customer-safe operation readiness", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      baselineDefined: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CUSTOMER_SAFE_OPERATION_NOT_READY");
  });

  it("blocks RC without rollback readiness", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      rollbackReadinessVerified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLLBACK_AND_DEGRADE_READINESS_REQUIRED");
  });

  it("blocks RC without read-only degrade readiness", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      readOnlyDegradeVerified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLLBACK_AND_DEGRADE_READINESS_REQUIRED");
  });

  it("blocks RC without support escalation readiness", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      supportEscalationReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SUPPORT_ESCALATION_NOT_READY");
    expect(() =>
      assertProductionStabilizationRcGateAllowed({
        ...baseInput,
        supportAuditReady: false,
      }),
    ).toThrow("NO_STABILIZATION_RC_WITHOUT_SUPPORT_ESCALATION_READY");
  });

  it("blocks RC when governance docs are not updated", () => {
    const result = evaluateProductionStabilizationRcGate({
      ...baseInput,
      rcSummaryUpdated: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("GOVERNANCE_DOCS_NOT_UPDATED");
  });

  it("allows RC only when all stabilization evidence is ready", () => {
    const result = evaluateProductionStabilizationRcGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildProductionStabilizationRcEvidence(satisfiedEvidenceInput);
    const parsed = productionStabilizationRcEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.rcGate.allowed).toBe(true);
    expect(parsed.masterVerify.productionStabilizationRcVerifyPassed).toBe(true);
    expect(LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_VERSION).toBe("54-F.1");
    expect(LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-production-stabilization-rc",
    );
    expect(LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_RC_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54F-PRODUCTION-STABILIZATION-RC",
    );
    expect(LEGAL_RELIABILITY_PRODUCTION_STABILIZATION_COMMERCIAL_OPERATION_STATUS).toBe(
      "COMMERCIALLY_STABLE_OPERATION",
    );
  });
});
