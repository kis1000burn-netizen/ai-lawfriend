import { describe, expect, it } from "vitest";
import { buildHotfixGovernanceEvidence } from "./legal-reliability-hotfix-governance-evidence";
import {
  assertHotfixGovernanceAllowed,
  evaluateHotfixGovernanceGate,
  resolveAllowedHotfixTypeBySeverity,
} from "./legal-reliability-hotfix-governance.policy";
import {
  LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERSION,
} from "./legal-reliability-hotfix-governance-rc-lock";
import { hotfixGovernanceEvidenceSchema } from "./legal-reliability-hotfix-governance.schema";

const baseInput = {
  phase54bIncidentSeverityLocked: true,
  severityClassified: true,
  severity: "SEV_1" as const,
  hotfixType: "HOTFIX" as const,
  approvalPresent: true,
  rollbackOwnerAcknowledged: true,
  scopeLimited: true,
  affectedTenantsPresent: true,
  affectedFeaturesPresent: true,
  includesDatabaseMigration: false,
  extraMigrationApprovalPresent: false,
  rollbackPlanReady: true,
  rollbackRunbookPresent: true,
  rollbackOwnerAvailable: true,
  prePatchVerifyPassed: true,
  postPatchVerifyPassed: true,
  rollbackVerifyPassed: true,
  productionSmokeRequired: true,
  productionSmokePassed: true,
  customerImpactRecorded: true,
  customerCommunicationRequired: false,
  customerCommunicationRefPresent: false,
  auditLogRequired: true,
  auditLogWritten: true,
  auditEvidencePresent: true,
  closeoutReviewCompleted: true,
};

const satisfiedEvidenceInput = {
  phase54bIncidentSeverityLocked: true,
  incidentSeverityEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
  hotfixId: "hotfix-20260526-sev1-action-loop",
  severity: "SEV_1" as const,
  hotfixType: "HOTFIX" as const,
  riskAreas: ["AUTOMATION_RISK" as const, "ACTION_LOOP" as const],
  incidentRef: "incident-20260526-sev1-auto-mutation",
  patchSummary: "Block auto completion mutation in production Action Loop path",
  requestedByUserId: "eng-oncall-1",
  approvedByUserId: "engineering-lead-1",
  approvedByRole: "ENGINEERING_LEAD" as const,
  approvedAt: "2026-05-26T12:00:00.000Z",
  approvalReason: "SEV-1 automation risk requires controlled hotfix",
  rollbackOwnerUserId: "rollback-owner-1",
  rollbackOwnerAcknowledged: true,
  scopeLimited: true,
  affectedTenants: ["prod-tenant-001"],
  affectedFeatures: ["action-loop"],
  includesDatabaseMigration: false,
  includesFeatureFlagChange: true,
  includesClientVisibleChange: false,
  includesLegalReliabilityBoundaryChange: true,
  rollbackPlanReady: true,
  rollbackRunbookRef: "docs/operations/AIBEOPCHIN_LEGAL_RELIABILITY_ROLLBACK_READINESS_WINDOW_RUNBOOK.md",
  rollbackOwnerAvailable: true,
  rollbackTimeEstimateMinutes: 30,
  prePatchVerifyCommand: "npm run verify:aibeopchin-legal-reliability-incident-severity",
  postPatchVerifyCommand: "npm run verify:aibeopchin-legal-reliability-production-action-smoke",
  rollbackVerifyCommand: "npm run verify:aibeopchin-legal-reliability-post-go-live-monitoring",
  prePatchVerifyPassed: true,
  postPatchVerifyPassed: true,
  rollbackVerifyPassed: true,
  productionSmokeRequired: true,
  productionSmokePassed: true,
  customerImpactRecorded: true,
  customerVisible: true,
  customerCommunicationRequired: false,
  auditLogRequired: true,
  auditLogWritten: true,
  auditEvidenceRefs: ["audit/hotfix-20260526-sev1-action-loop.json"],
  closeoutReviewCompleted: true,
  closeoutReviewedByUserId: "ops-lead-1",
  closedAt: "2026-05-26T14:00:00.000Z",
  closeoutNote: "Hotfix verified and closed with production smoke PASS.",
};

describe("Phase 54-C Hotfix / Emergency Patch Governance", () => {
  it("blocks hotfix without Phase 54-B incident severity lock", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      phase54bIncidentSeverityLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54B_INCIDENT_SEVERITY_REQUIRED");
    expect(() =>
      assertHotfixGovernanceAllowed(
        evaluateHotfixGovernanceGate({
          ...baseInput,
          phase54bIncidentSeverityLocked: false,
        }),
      ),
    ).toThrow("NO_HOTFIX_WITHOUT_54B_INCIDENT_SEVERITY");
  });

  it("blocks hotfix without severity classification", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      severityClassified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SEVERITY_CLASSIFICATION_REQUIRED");
  });

  it("blocks SEV-4 emergency patch", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      severity: "SEV_4",
      hotfixType: "EMERGENCY_PATCH",
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_TYPE_NOT_ALLOWED_FOR_SEVERITY");
  });

  it("blocks hotfix without approval chain", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      approvalPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_APPROVAL_CHAIN_REQUIRED");
    expect(() =>
      assertHotfixGovernanceAllowed(result),
    ).toThrow("NO_HOTFIX_WITHOUT_APPROVAL_CHAIN");
  });

  it("blocks hotfix without rollback owner acknowledgement", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      rollbackOwnerAcknowledged: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_APPROVAL_CHAIN_REQUIRED");
  });

  it("blocks hotfix without scope limit", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      scopeLimited: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_SCOPE_LIMIT_REQUIRED");
  });

  it("blocks hotfix without affected tenant or feature scope", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      affectedTenantsPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_SCOPE_LIMIT_REQUIRED");
  });

  it("requires extra approval for migration hotfix", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      includesDatabaseMigration: true,
      extraMigrationApprovalPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("MIGRATION_HOTFIX_EXTRA_APPROVAL_REQUIRED");
    expect(() => assertHotfixGovernanceAllowed(result)).toThrow(
      "NO_MIGRATION_HOTFIX_WITHOUT_EXTRA_APPROVAL",
    );
  });

  it("blocks hotfix without rollback plan", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      rollbackPlanReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_ROLLBACK_PLAN_REQUIRED");
  });

  it("blocks hotfix when pre/post/rollback verify fails", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      postPatchVerifyPassed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_VERIFY_REQUIRED");
  });

  it("blocks hotfix when production smoke is required but fails", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      productionSmokePassed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PRODUCTION_SMOKE_REQUIRED_FOR_HOTFIX");
  });

  it("blocks hotfix without customer impact record", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      customerImpactRecorded: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CUSTOMER_IMPACT_RECORD_REQUIRED");
  });

  it("blocks hotfix without audit log evidence", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      auditLogWritten: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_AUDIT_LOG_REQUIRED");
    expect(() => assertHotfixGovernanceAllowed(result)).toThrow(
      "NO_EMERGENCY_PATCH_WITHOUT_AUDIT_LOG",
    );
  });

  it("blocks hotfix without closeout review", () => {
    const result = evaluateHotfixGovernanceGate({
      ...baseInput,
      closeoutReviewCompleted: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("HOTFIX_CLOSEOUT_REVIEW_REQUIRED");
  });

  it("allows rollback-only for SEV-0 and hotfix when all governance evidence is ready", () => {
    expect(resolveAllowedHotfixTypeBySeverity("SEV_0")).toContain("ROLLBACK_ONLY");

    const result = evaluateHotfixGovernanceGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildHotfixGovernanceEvidence(satisfiedEvidenceInput);
    const parsed = hotfixGovernanceEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.hotfixGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERSION).toBe("54-C.1");
    expect(LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-hotfix-governance",
    );
    expect(LEGAL_RELIABILITY_HOTFIX_GOVERNANCE_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE",
    );
  });
});
