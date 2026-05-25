import { describe, expect, it } from "vitest";
import { buildDegradedModeEvidence } from "./legal-reliability-degraded-mode-evidence";
import {
  assertDegradedModeAllowed,
  evaluateDegradedModeGate,
  resolveRecommendedDegradedModesBySeverity,
} from "./legal-reliability-degraded-mode.policy";
import {
  LEGAL_RELIABILITY_DEGRADED_MODE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_DEGRADED_MODE_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_DEGRADED_MODE_VERSION,
} from "./legal-reliability-degraded-mode-rc-lock";
import { degradedModeEvidenceSchema } from "./legal-reliability-degraded-mode.schema";

const baseInput = {
  phase54bIncidentSeverityLocked: true,
  phase54cHotfixGovernanceLocked: true,
  incidentRefPresent: true,
  severityTriggerPresent: true,
  operatorApproved: true,
  modeTypesPresent: true,
  scopeLimited: true,
  affectedTenantsPresent: true,
  affectedFeaturesPresent: true,
  globalDisable: false,
  clientSafeMessageRequired: true,
  clientSafeMessagePresent: true,
  containsInternalStrategy: false,
  containsUnsafeIncidentDetails: false,
  readOnlyFallbackAvailable: true,
  writeDisableControlVerified: true,
  completionDisableControlVerified: true,
  auditLogRequired: true,
  auditLogWritten: true,
  auditEvidencePresent: true,
  errorRateBackToBaseline: true,
  latencyBackToBaseline: true,
  roleBoundaryClean: true,
  auditLogCoverageRestored: true,
  hotfixOrRollbackCompleted: true,
  operatorRecoveryApprovalRequired: true,
  exitReviewCompleted: true,
};

const satisfiedEvidenceInput = {
  phase54bIncidentSeverityLocked: true,
  phase54cHotfixGovernanceLocked: true,
  incidentSeverityEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
  hotfixGovernanceEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE",
  incidentRef: "incident-20260526-sev1-auto-mutation",
  severity: "SEV_1" as const,
  triggerReason: "Automation risk requires partial disable before hotfix deploy",
  triggeredAt: "2026-05-26T10:00:00.000Z",
  operatorApproved: true,
  approvedByUserId: "ops-lead-1",
  approvedAt: "2026-05-26T10:05:00.000Z",
  approvalReason: "SEV-1 automation risk requires customer-safe degraded mode",
  modeTypes: [
    "ACTION_LOOP_DISABLED" as const,
    "OPERATIONS_WRITE_DISABLED" as const,
    "COMPLETION_DISABLED" as const,
  ],
  scopeLimited: true,
  affectedTenants: ["prod-tenant-001"],
  affectedFeatures: ["action-loop", "action-operations"],
  globalDisable: false,
  tenantIsolationApplied: false,
  actionLoopEnabled: false,
  actionOperationsEnabled: false,
  dashboardEnabled: true,
  writeEnabled: false,
  completionEnabled: false,
  clientPortalReadOnly: true,
  internalAdminOnlyOverride: true,
  clientSafeMessageRequired: true,
  clientSafeMessageRef: "messages/degraded-mode-client-safe-20260526.md",
  containsInternalStrategy: false,
  containsIncidentDetailsBeyondSafeDisclosure: false,
  auditLogRequired: true,
  auditLogWritten: true,
  auditEvidenceRefs: ["audit/degraded-mode-20260526-sev1.json"],
  errorRateBackToBaseline: true,
  latencyBackToBaseline: true,
  roleBoundaryClean: true,
  auditLogCoverageRestored: true,
  hotfixOrRollbackCompleted: true,
  operatorRecoveryApprovalRequired: true,
  exitReviewCompleted: true,
  reviewedByUserId: "ops-lead-1",
  reviewedAt: "2026-05-26T18:00:00.000Z",
  recoveryNote: "Degraded mode exited after hotfix verify and baseline recovery.",
};

describe("Phase 54-D Customer-safe Rollout Window / Degraded Mode", () => {
  it("blocks degraded mode without Phase 54-B and 54-C lock", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      phase54bIncidentSeverityLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54B_54C_LOCK_REQUIRED");
    expect(() =>
      assertDegradedModeAllowed(
        evaluateDegradedModeGate({
          ...baseInput,
          phase54cHotfixGovernanceLocked: false,
        }),
      ),
    ).toThrow("NO_DEGRADED_MODE_WITHOUT_54B_54C_LOCK");
  });

  it("blocks degraded mode without incident or severity trigger", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      incidentRefPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SEVERITY_TRIGGER_REQUIRED");
  });

  it("blocks degraded mode without operator approval", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      operatorApproved: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATOR_APPROVAL_REQUIRED");
    expect(() => assertDegradedModeAllowed(result)).toThrow(
      "NO_DEGRADE_WITHOUT_OPERATOR_APPROVAL",
    );
  });

  it("blocks degraded mode without mode type", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      modeTypesPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("DEGRADED_MODE_TYPE_REQUIRED");
  });

  it("blocks degraded mode without scope limit", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      scopeLimited: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("TENANT_OR_FEATURE_SCOPE_REQUIRED");
  });

  it("blocks degraded mode when global disable is true", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      globalDisable: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("TENANT_OR_FEATURE_SCOPE_REQUIRED");
  });

  it("blocks degraded mode without client safe message", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      clientSafeMessagePresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_SAFE_MESSAGE_REQUIRED");
  });

  it("blocks unsafe client message containing internal strategy", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      containsInternalStrategy: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CLIENT_MESSAGE_SAFETY_FAILED");
    expect(() => assertDegradedModeAllowed(result)).toThrow(
      "NO_DEGRADE_WITHOUT_CLIENT_SAFE_MESSAGE",
    );
  });

  it("blocks degraded mode without read-only fallback", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      readOnlyFallbackAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("READ_ONLY_FALLBACK_REQUIRED");
  });

  it("blocks degraded mode without write disable control", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      writeDisableControlVerified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("WRITE_COMPLETION_DISABLE_CONTROL_REQUIRED");
  });

  it("blocks degraded mode without completion disable control", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      completionDisableControlVerified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("WRITE_COMPLETION_DISABLE_CONTROL_REQUIRED");
  });

  it("blocks degraded mode without AuditLog evidence", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      auditLogWritten: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("DEGRADED_MODE_AUDIT_LOG_REQUIRED");
    expect(() => assertDegradedModeAllowed(result)).toThrow("NO_DEGRADE_WITHOUT_AUDIT_LOG");
  });

  it("blocks degraded mode without recovery criteria", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      errorRateBackToBaseline: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("RECOVERY_CRITERIA_REQUIRED");
  });

  it("blocks degraded mode without exit review", () => {
    const result = evaluateDegradedModeGate({
      ...baseInput,
      exitReviewCompleted: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("EXIT_REVIEW_REQUIRED");
  });

  it("recommends full safe mode for SEV-0 and allows degraded mode when all safety evidence is ready", () => {
    expect(resolveRecommendedDegradedModesBySeverity("SEV_0")).toContain("FULL_SAFE_MODE");

    const result = evaluateDegradedModeGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildDegradedModeEvidence(satisfiedEvidenceInput);
    const parsed = degradedModeEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.degradedModeGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_DEGRADED_MODE_VERSION).toBe("54-D.1");
    expect(LEGAL_RELIABILITY_DEGRADED_MODE_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-degraded-mode",
    );
    expect(LEGAL_RELIABILITY_DEGRADED_MODE_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE",
    );
  });
});
