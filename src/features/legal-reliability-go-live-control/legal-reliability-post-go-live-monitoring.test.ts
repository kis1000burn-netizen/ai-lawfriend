import { describe, expect, it } from "vitest";
import { buildPostGoLiveMonitoringEvidence } from "./legal-reliability-post-go-live-monitoring-evidence";
import {
  assertPostGoLiveMonitoringGateAllowed,
  evaluatePostGoLiveMonitoringGate,
} from "./legal-reliability-post-go-live-monitoring.policy";
import {
  LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_EVIDENCE_TAG,
  LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_VERSION,
} from "./legal-reliability-post-go-live-monitoring-rc-lock";
import { postGoLiveMonitoringEvidenceSchema } from "./legal-reliability-post-go-live-monitoring.schema";

const baseInput = {
  phase53aLocked: true,
  phase53bLocked: true,
  phase53cLocked: true,
  phase53dLocked: true,
  monitoringWindowStarted: true,
  monitoringWindowCompleted: true,
  actionLoopErrorSpikeDetected: false,
  actionOperationsErrorSpikeDetected: false,
  clientBoundaryViolationDetected: false,
  staffAdminEscalationDetected: false,
  lawyerReviewBypassDetected: false,
  auditLogGapDetected: false,
  autoCompletionSignalDetected: false,
  autoFilingSignalDetected: false,
  autoSubmissionSignalDetected: false,
  unreviewedEvidenceDownstreamSignalDetected: false,
  actionCandidateAuditPresent: true,
  lawyerDecisionAuditPresent: true,
  operationQueueAuditPresent: true,
  deniedAccessAuditPresent: true,
  featureFlagAuditPresent: true,
  actionLoopFlagCanDisable: true,
  actionOperationsFlagCanDisable: true,
  dashboardFlagCanDisable: true,
  writeFlagCanDisable: true,
  completionFlagCanDisable: true,
  readOnlyDegradeVerified: true,
  rollbackOwnerAvailable: true,
  incidentDetected: false,
  rcaRequired: false,
  rcaCompleted: true,
  operatorSignedOff: true,
};

const satisfiedEvidenceInput = {
  phase53aLocked: true,
  phase53bLocked: true,
  phase53cLocked: true,
  phase53dLocked: true,
  appBaseUrlMasked: "https://***.aibeopchin.app",
  productionTenantRef: "prod-tenant-001",
  windowId: "post-go-live-window-20260525",
  startedAt: "2026-05-25T00:00:00.000Z",
  endedAt: "2026-05-26T00:00:00.000Z",
  durationHours: 24,
  operatorUserId: "ops-monitor-1",
  rollbackOwnerUserId: "rollback-owner-1",
  actionLoopErrorSpikeDetected: false,
  actionOperationsErrorSpikeDetected: false,
  clientBoundaryViolationDetected: false,
  staffAdminEscalationDetected: false,
  lawyerReviewBypassDetected: false,
  auditLogGapDetected: false,
  autoCompletionSignalDetected: false,
  autoFilingSignalDetected: false,
  autoSubmissionSignalDetected: false,
  unreviewedEvidenceDownstreamSignalDetected: false,
  actionCandidateAuditPresent: true,
  lawyerDecisionAuditPresent: true,
  operationQueueAuditPresent: true,
  deniedAccessAuditPresent: true,
  featureFlagAuditPresent: true,
  auditEvidenceRefs: ["audit/post-go-live-window-summary.json"],
  actionLoopFlagCanDisable: true,
  actionOperationsFlagCanDisable: true,
  dashboardFlagCanDisable: true,
  writeFlagCanDisable: true,
  completionFlagCanDisable: true,
  readOnlyDegradeVerified: true,
  rollbackOwnerAvailable: true,
  incidentDetected: false,
  incidentRefs: [],
  rcaRequired: false,
  rcaCompleted: true,
  degradedModeActivated: false,
  rollbackExecuted: false,
  operatorSignedOff: true,
  signedOffByUserId: "ops-monitor-1",
  signedOffAt: "2026-05-26T00:00:00.000Z",
  closeoutNote: "T+24h post-go-live monitoring stable, rollback flags verified.",
};

describe("Phase 53-E Post-Go-Live Monitoring & Rollback Readiness Window", () => {
  it("blocks monitoring closeout without Phase 53-A, 53-B, 53-C, and 53-D lock", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      phase53dLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53A_53B_53C_53D_LOCK_REQUIRED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        phase53dLocked: false,
      }),
    ).toThrow("NO_POST_GO_LIVE_MONITORING_WITHOUT_53A_53B_53C_53D_LOCK");
  });

  it("blocks monitoring closeout when monitoring window has not started", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      monitoringWindowStarted: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("POST_GO_LIVE_MONITORING_WINDOW_REQUIRED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        monitoringWindowStarted: false,
      }),
    ).toThrow("NO_GO_LIVE_CLOSEOUT_WITHOUT_MONITORING_WINDOW");
  });

  it("blocks monitoring closeout when monitoring window is not completed", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      monitoringWindowCompleted: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("POST_GO_LIVE_MONITORING_WINDOW_REQUIRED");
  });

  it("blocks monitoring closeout when Action Loop error spike is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      actionLoopErrorSpikeDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_LOOP_ERROR_SPIKE_DETECTED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        actionLoopErrorSpikeDetected: true,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_ACTION_LOOP_ERROR_SPIKE");
  });

  it("blocks monitoring closeout when Action Operations error spike is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      actionOperationsErrorSpikeDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_OPERATIONS_ERROR_SPIKE_DETECTED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        actionOperationsErrorSpikeDetected: true,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_ACTION_OPERATIONS_ERROR_SPIKE");
  });

  it("blocks monitoring closeout when CLIENT boundary violation is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      clientBoundaryViolationDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_OR_REVIEW_BOUNDARY_VIOLATION_DETECTED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        clientBoundaryViolationDetected: true,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_CLIENT_BOUNDARY_VIOLATION");
  });

  it("blocks monitoring closeout when STAFF escalation or LAWYER review bypass is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      staffAdminEscalationDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_OR_REVIEW_BOUNDARY_VIOLATION_DETECTED");

    const lawyerBypass = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      lawyerReviewBypassDetected: true,
    });

    expect(lawyerBypass.allowed).toBe(false);
    expect(lawyerBypass.blockedReasons).toContain("ROLE_OR_REVIEW_BOUNDARY_VIOLATION_DETECTED");
  });

  it("blocks monitoring closeout when AuditLog gap is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      auditLogGapDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUDIT_LOG_COVERAGE_GAP_DETECTED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        actionCandidateAuditPresent: false,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_AUDIT_LOG_GAP");
  });

  it("blocks monitoring closeout when auto completion, filing, or submission signal is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      autoCompletionSignalDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL_DETECTED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        autoFilingSignalDetected: true,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_AUTO_COMPLETION_OR_AUTO_FILING_SIGNAL");
  });

  it("blocks monitoring closeout when unreviewed evidence downstream signal is detected", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      unreviewedEvidenceDownstreamSignalDetected: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL_DETECTED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        unreviewedEvidenceDownstreamSignalDetected: true,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM_SIGNAL");
  });

  it("blocks monitoring closeout when rollback or read-only degrade is not verified", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      readOnlyDegradeVerified: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLLBACK_OR_READ_ONLY_DEGRADE_NOT_READY");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        actionLoopFlagCanDisable: false,
      }),
    ).toThrow("NO_CLOSEOUT_WITH_ROLLBACK_FLAG_UNVERIFIED");
  });

  it("blocks monitoring closeout when incident requires RCA and RCA is not completed", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      incidentDetected: true,
      rcaRequired: true,
      rcaCompleted: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("INCIDENT_RCA_REQUIRED_BEFORE_CLOSEOUT");
  });

  it("blocks monitoring closeout when operator sign-off is missing", () => {
    const result = evaluatePostGoLiveMonitoringGate({
      ...baseInput,
      operatorSignedOff: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATOR_SIGNOFF_REQUIRED");
    expect(() =>
      assertPostGoLiveMonitoringGateAllowed({
        ...baseInput,
        operatorSignedOff: false,
      }),
    ).toThrow("NO_CLOSEOUT_WITHOUT_OPERATOR_SIGNOFF");
  });

  it("allows monitoring closeout only when all observation, rollback, and audit conditions are satisfied", () => {
    const result = evaluatePostGoLiveMonitoringGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(10);

    const evidence = buildPostGoLiveMonitoringEvidence(satisfiedEvidenceInput);
    const parsed = postGoLiveMonitoringEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.goLiveGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_VERSION).toBe("53-E.1");
    expect(LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-post-go-live-monitoring",
    );
    expect(LEGAL_RELIABILITY_POST_GO_LIVE_MONITORING_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53E-POST-GO-LIVE-MONITORING-ROLLBACK-READINESS",
    );
  });
});
