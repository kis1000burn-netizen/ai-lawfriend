import { describe, expect, it } from "vitest";
import { buildSupportEscalationEvidence } from "./legal-reliability-support-escalation-evidence";
import {
  assertSupportEscalationAllowed,
  evaluateSupportEscalationGate,
} from "./legal-reliability-support-escalation.policy";
import {
  LEGAL_RELIABILITY_SUPPORT_ESCALATION_EVIDENCE_TAG,
  LEGAL_RELIABILITY_SUPPORT_ESCALATION_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_SUPPORT_ESCALATION_VERSION,
} from "./legal-reliability-support-escalation-rc-lock";
import { supportEscalationEvidenceSchema } from "./legal-reliability-support-escalation.schema";

const baseInput = {
  phase54aBaselineLocked: true,
  phase54bIncidentSeverityLocked: true,
  phase54cHotfixGovernanceLocked: true,
  phase54dDegradedModeLocked: true,
  severityOwnersDefined: true,
  backupOwnersDefined: true,
  responseWindowsDefined: true,
  operatorOwnerAvailable: true,
  engineeringLeadAvailable: true,
  legalOpsLeadAvailable: true,
  customerSupportOwnerAvailable: true,
  rollbackOwnerAvailable: true,
  adminApproverAvailable: true,
  customerSafeTemplateReady: true,
  unsafeTemplateDetected: false,
  statusPageReady: true,
  customerTicketFlowReady: true,
  supportAuditRequired: true,
  incidentRefRequired: true,
  customerTicketRefRequired: true,
  escalationLogRequired: true,
  customerMessageLogRequired: true,
  closeoutReviewRequired: true,
  auditLogWritten: true,
  auditEvidencePresent: true,
  sev0DrillCompleted: true,
  degradedModeEscalationDrillCompleted: true,
  hotfixEscalationDrillCompleted: true,
  customerMessageDrillCompleted: true,
  rollbackOwnerContactVerified: true,
  supportReadinessReviewed: true,
};

const responseWindows = [
  {
    severity: "SEV_0" as const,
    acknowledgeWithinMinutes: 5,
    mitigateWithinMinutes: 15,
    escalateWithinMinutes: 5,
    customerMessageRequired: true,
  },
  {
    severity: "SEV_1" as const,
    acknowledgeWithinMinutes: 10,
    mitigateWithinMinutes: 30,
    escalateWithinMinutes: 15,
    customerMessageRequired: true,
  },
  {
    severity: "SEV_2" as const,
    acknowledgeWithinMinutes: 30,
    mitigateWithinMinutes: 120,
    escalateWithinMinutes: 60,
    customerMessageRequired: true,
  },
  {
    severity: "SEV_3" as const,
    acknowledgeWithinMinutes: 120,
    mitigateWithinMinutes: 480,
    escalateWithinMinutes: 240,
    customerMessageRequired: false,
  },
  {
    severity: "SEV_4" as const,
    acknowledgeWithinMinutes: 480,
    mitigateWithinMinutes: 1440,
    escalateWithinMinutes: 480,
    customerMessageRequired: false,
  },
];

const ownerAssignments = [
  {
    role: "OPERATOR" as const,
    ownerUserId: "ops-lead-1",
    backupOwnerUserId: "ops-lead-2",
    channel: "OPS_CONSOLE" as const,
    available: true,
  },
  {
    role: "ENGINEERING_LEAD" as const,
    ownerUserId: "engineering-lead-1",
    backupOwnerUserId: "engineering-lead-2",
    channel: "CHAT" as const,
    available: true,
  },
  {
    role: "LEGAL_OPS_LEAD" as const,
    ownerUserId: "legal-ops-lead-1",
    backupOwnerUserId: "legal-ops-lead-2",
    channel: "EMAIL" as const,
    available: true,
  },
  {
    role: "CUSTOMER_SUPPORT_OWNER" as const,
    ownerUserId: "support-owner-1",
    backupOwnerUserId: "support-owner-2",
    channel: "CUSTOMER_TICKET" as const,
    available: true,
  },
  {
    role: "ROLLBACK_OWNER" as const,
    ownerUserId: "rollback-owner-1",
    backupOwnerUserId: "rollback-owner-2",
    channel: "PHONE" as const,
    available: true,
  },
  {
    role: "ADMIN_APPROVER" as const,
    ownerUserId: "admin-approver-1",
    backupOwnerUserId: "admin-approver-2",
    channel: "EMAIL" as const,
    available: true,
  },
];

const safeTemplates = [
  {
    templateKey: "sev0-customer-safe-message",
    severity: "SEV_0" as const,
    customerVisible: true,
    approvedByLegalOps: true,
    approvedBySupportOwner: true,
    containsInternalStrategy: false,
    containsRiskRadarDetail: false,
    containsGraphGapDetail: false,
    containsPrivilegedReviewNote: false,
    containsUnreviewedEvidenceJudgment: false,
  },
];

const satisfiedEvidenceInput = {
  phase54aBaselineLocked: true,
  phase54bIncidentSeverityLocked: true,
  phase54cHotfixGovernanceLocked: true,
  phase54dDegradedModeLocked: true,
  baselineEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE",
  incidentSeverityEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54B-INCIDENT-SEVERITY",
  hotfixGovernanceEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54C-HOTFIX-GOVERNANCE",
  degradedModeEvidenceRef:
    "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54D-DEGRADED-MODE",
  responseWindows,
  ownerAssignments,
  severityOwnersDefined: true,
  backupOwnersDefined: true,
  safeTemplates,
  customerSafeTemplateReady: true,
  statusPageReady: true,
  customerTicketFlowReady: true,
  supportAuditRequired: true,
  incidentRefRequired: true,
  customerTicketRefRequired: true,
  escalationLogRequired: true,
  customerMessageLogRequired: true,
  closeoutReviewRequired: true,
  auditLogWritten: true,
  auditEvidenceRefs: ["audit/support-escalation-readiness-20260526.json"],
  sev0DrillCompleted: true,
  degradedModeEscalationDrillCompleted: true,
  hotfixEscalationDrillCompleted: true,
  customerMessageDrillCompleted: true,
  rollbackOwnerContactVerified: true,
  supportReadinessReviewed: true,
  reviewedByUserId: "ops-lead-1",
  reviewedAt: "2026-05-26T20:00:00.000Z",
  reviewNote: "Support escalation readiness locked for production stabilization.",
};

describe("Phase 54-E Support / Ops Escalation Readiness", () => {
  it("blocks support escalation without Phase 54-A through 54-D locks", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      phase54dDegradedModeLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_54A_54D_LOCK_REQUIRED");
    expect(() =>
      assertSupportEscalationAllowed(
        evaluateSupportEscalationGate({
          ...baseInput,
          phase54aBaselineLocked: false,
        }),
      ),
    ).toThrow("NO_SUPPORT_ESCALATION_WITHOUT_54A_54D_LOCK");
  });

  it("blocks support escalation without severity owner", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      severityOwnersDefined: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SEVERITY_OWNER_AND_BACKUP_REQUIRED");
  });

  it("blocks support escalation without backup owner", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      backupOwnersDefined: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SEVERITY_OWNER_AND_BACKUP_REQUIRED");
  });

  it("blocks support escalation without response window", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      responseWindowsDefined: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("RESPONSE_WINDOW_REQUIRED");
  });

  it("blocks support escalation without operator owner", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      operatorOwnerAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATOR_OWNER_REQUIRED");
  });

  it("blocks support escalation without engineering lead", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      engineeringLeadAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ENGINEERING_LEAD_REQUIRED");
    expect(() => assertSupportEscalationAllowed(result)).toThrow(
      "NO_ESCALATION_WITHOUT_ENGINEERING_OWNER",
    );
  });

  it("blocks support escalation without legal ops lead", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      legalOpsLeadAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("LEGAL_OPS_LEAD_REQUIRED");
  });

  it("blocks support escalation without customer support owner", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      customerSupportOwnerAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CUSTOMER_SUPPORT_OWNER_REQUIRED");
  });

  it("blocks support escalation without rollback owner", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      rollbackOwnerAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLLBACK_OWNER_REQUIRED");
  });

  it("blocks support escalation without admin approver", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      adminApproverAvailable: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ADMIN_APPROVER_REQUIRED");
  });

  it("blocks support escalation without customer-safe template", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      customerSafeTemplateReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CUSTOMER_SAFE_COMMUNICATION_REQUIRED");
  });

  it("blocks unsafe customer message template", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      unsafeTemplateDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("CUSTOMER_SAFE_COMMUNICATION_REQUIRED");
    expect(() => assertSupportEscalationAllowed(result)).toThrow(
      "NO_CUSTOMER_MESSAGE_WITHOUT_SAFE_TEMPLATE",
    );
  });

  it("blocks support escalation without support audit evidence", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      auditLogWritten: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SUPPORT_AUDIT_REQUIREMENT_NOT_MET");
    expect(() => assertSupportEscalationAllowed(result)).toThrow(
      "NO_SUPPORT_ACTION_WITHOUT_AUDIT_LOG",
    );
  });

  it("blocks support escalation without readiness drills", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      sev0DrillCompleted: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SUPPORT_READINESS_DRILL_REQUIRED");
  });

  it("blocks support escalation without support readiness review", () => {
    const result = evaluateSupportEscalationGate({
      ...baseInput,
      supportReadinessReviewed: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("SUPPORT_READINESS_REVIEW_REQUIRED");
    expect(() => assertSupportEscalationAllowed(result)).toThrow(
      "NO_INCIDENT_CLOSEOUT_WITHOUT_SUPPORT_REVIEW",
    );
  });

  it("allows support escalation only when all readiness evidence is present", () => {
    const result = evaluateSupportEscalationGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildSupportEscalationEvidence(satisfiedEvidenceInput);
    const parsed = supportEscalationEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.supportGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_SUPPORT_ESCALATION_VERSION).toBe("54-E.1");
    expect(LEGAL_RELIABILITY_SUPPORT_ESCALATION_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-support-escalation",
    );
    expect(LEGAL_RELIABILITY_SUPPORT_ESCALATION_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54E-SUPPORT-OPS-ESCALATION",
    );
  });
});
