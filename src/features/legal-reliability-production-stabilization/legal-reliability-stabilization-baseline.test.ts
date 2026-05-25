import { describe, expect, it } from "vitest";
import { buildStabilizationBaselineEvidence } from "./legal-reliability-stabilization-baseline-evidence";
import {
  assertStabilizationBaselineGateAllowed,
  evaluateMetricBandOrder,
  evaluateStabilizationBaselineGate,
  isThresholdReady,
} from "./legal-reliability-stabilization-baseline.policy";
import {
  LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_TAG,
  LEGAL_RELIABILITY_STABILIZATION_BASELINE_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_STABILIZATION_BASELINE_VERSION,
} from "./legal-reliability-stabilization-baseline-rc-lock";
import { stabilizationBaselineEvidenceSchema } from "./legal-reliability-stabilization-baseline.schema";

const percentBand = { normal: 0.5, warning: 1.0, critical: 2.0, unit: "percent" };
const msBand = { normal: 800, warning: 1500, critical: 3000, unit: "ms" };
const countBand = { normal: 5, warning: 15, critical: 30, unit: "count" };
const rateBand = { normal: 99.5, warning: 98.0, critical: 95.0, unit: "percent" };

const baseInput = {
  phase53fCompleteLocked: true,
  productionGoLiveControlRcVerifyPassed: true,
  errorRateThresholdsReady: true,
  latencyThresholdsReady: true,
  actionLoopSuccessThresholdsReady: true,
  operationsQueueBacklogThresholdsReady: true,
  auditLogCoverageThresholdsReady: true,
  clientInternalAccessDeniedObserved: true,
  clientInternalAccessAllowedObserved: false,
  staffAdminEscalationDeniedObserved: true,
  lawyerReviewBypassDeniedObserved: true,
  deniedAccessAuditRefsPresent: true,
  actionLoopCanDisable: true,
  actionOperationsCanDisable: true,
  dashboardCanDisable: true,
  writeCanDisable: true,
  completionCanDisable: true,
  readOnlyDegradeCanActivate: true,
  rollbackRunbookPresent: true,
  monitoringDashboardRefPresent: true,
  auditLogQueryRefPresent: true,
  operationsQueueSnapshotRefPresent: true,
  roleDenialSnapshotRefPresent: true,
  featureFlagSnapshotRefPresent: true,
  operatorSignedOff: true,
};

const satisfiedEvidenceInput = {
  phase53fCompleteLocked: true,
  phase53fEvidenceRef:
    "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE53F-PRODUCTION-GO-LIVE-CONTROL-RC",
  productionGoLiveControlRcVerifyPassed: true,
  windowId: "stabilization-baseline-window-20260526",
  startedAt: "2026-05-26T00:00:00.000Z",
  endedAt: "2026-05-27T00:00:00.000Z",
  durationHours: 24,
  productionTenantRef: "prod-tenant-001",
  sampleSize: 1200,
  errorRate: {
    actionLoopApiErrorRate: percentBand,
    actionOperationsApiErrorRate: percentBand,
    dashboardErrorRate: percentBand,
    clientPortalErrorRate: percentBand,
  },
  latency: {
    lawyerWorkbenchP95Ms: msBand,
    actionOperationsQueueP95Ms: msBand,
    clientPortalP95Ms: msBand,
    actionCandidateCreateP95Ms: msBand,
  },
  actionLoop: {
    candidateCreationSuccessRate: rateBand,
    lawyerApprovalToDraftSuccessRate: rateBand,
    decisionLedgerWriteSuccessRate: rateBand,
    supplementRequestDraftOnlyRate: rateBand,
  },
  operationsQueue: {
    openQueueBacklogCount: countBand,
    overdueActionCount: countBand,
    assignmentMissingCount: countBand,
    slaWarningCount: countBand,
  },
  auditCoverage: {
    actionCandidateAuditCoverageRate: rateBand,
    lawyerDecisionAuditCoverageRate: rateBand,
    operationQueueAuditCoverageRate: rateBand,
    deniedAccessAuditCoverageRate: rateBand,
    featureFlagAuditCoverageRate: rateBand,
  },
  clientInternalAccessDeniedObserved: true,
  clientInternalAccessAllowedObserved: false,
  staffAdminEscalationDeniedObserved: true,
  lawyerReviewBypassDeniedObserved: true,
  deniedAccessAuditRefs: ["audit/client-internal-deny-baseline.json"],
  actionLoopCanDisable: true,
  actionOperationsCanDisable: true,
  dashboardCanDisable: true,
  writeCanDisable: true,
  completionCanDisable: true,
  readOnlyDegradeCanActivate: true,
  monitoringDashboardRef: "dashboards/stabilization-baseline-20260526",
  auditLogQueryRef: "audit/queries/stabilization-baseline-20260526",
  operationsQueueSnapshotRef: "snapshots/operations-queue-baseline-20260526.json",
  roleDenialSnapshotRef: "snapshots/role-denial-baseline-20260526.json",
  featureFlagSnapshotRef: "snapshots/feature-flag-baseline-20260526.json",
  operatorSignedOff: true,
  signedOffByUserId: "ops-baseline-1",
  signedOffAt: "2026-05-27T00:00:00.000Z",
  signoffNote: "Production stabilization baseline locked for tenant prod-tenant-001.",
};

describe("Phase 54-A Production Stabilization Monitoring Baseline", () => {
  it("blocks baseline without Phase 53-F complete lock", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      phase53fCompleteLocked: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("PHASE_53F_COMPLETE_LOCK_REQUIRED");
    expect(() =>
      assertStabilizationBaselineGateAllowed({
        ...baseInput,
        productionGoLiveControlRcVerifyPassed: false,
      }),
    ).toThrow("NO_BASELINE_WITHOUT_PHASE53_COMPLETE_LOCK");
  });

  it("blocks baseline without error rate threshold", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      errorRateThresholdsReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ERROR_RATE_THRESHOLD_REQUIRED");
    expect(() =>
      assertStabilizationBaselineGateAllowed({
        ...baseInput,
        errorRateThresholdsReady: false,
      }),
    ).toThrow("NO_BASELINE_WITHOUT_ERROR_RATE_THRESHOLD");
  });

  it("blocks baseline without latency threshold", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      latencyThresholdsReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("LATENCY_THRESHOLD_REQUIRED");
  });

  it("blocks baseline without Action Loop success threshold", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      actionLoopSuccessThresholdsReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ACTION_LOOP_SUCCESS_THRESHOLD_REQUIRED");
  });

  it("blocks baseline without Operations queue backlog threshold", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      operationsQueueBacklogThresholdsReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATIONS_QUEUE_BACKLOG_THRESHOLD_REQUIRED");
  });

  it("blocks baseline without AuditLog coverage threshold", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      auditLogCoverageThresholdsReady: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("AUDIT_LOG_COVERAGE_THRESHOLD_REQUIRED");
  });

  it("blocks baseline without CLIENT denied pattern", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      clientInternalAccessDeniedObserved: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_DENIAL_PATTERN_REQUIRED");
  });

  it("blocks baseline if CLIENT internal access was allowed", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      clientInternalAccessAllowedObserved: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_DENIAL_PATTERN_REQUIRED");
    expect(() =>
      assertStabilizationBaselineGateAllowed({
        ...baseInput,
        clientInternalAccessAllowedObserved: true,
      }),
    ).toThrow("NO_BASELINE_WITHOUT_ROLE_DENIAL_PATTERN");
  });

  it("blocks baseline without STAFF escalation or LAWYER bypass denial pattern", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      staffAdminEscalationDeniedObserved: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("ROLE_DENIAL_PATTERN_REQUIRED");
  });

  it("blocks baseline without degrade readiness signal", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      readOnlyDegradeCanActivate: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("DEGRADE_READINESS_SIGNAL_REQUIRED");
    expect(() =>
      assertStabilizationBaselineGateAllowed({
        ...baseInput,
        readOnlyDegradeCanActivate: false,
      }),
    ).toThrow("NO_BASELINE_WITHOUT_DEGRADE_READINESS_SIGNAL");
  });

  it("blocks baseline without baseline observation refs", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      monitoringDashboardRefPresent: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("BASELINE_OBSERVATION_REFS_REQUIRED");
  });

  it("blocks baseline without operator sign-off", () => {
    const result = evaluateStabilizationBaselineGate({
      ...baseInput,
      operatorSignedOff: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockedReasons).toContain("OPERATOR_BASELINE_SIGNOFF_REQUIRED");
    expect(() =>
      assertStabilizationBaselineGateAllowed({
        ...baseInput,
        operatorSignedOff: false,
      }),
    ).toThrow("NO_BASELINE_WITHOUT_OPERATOR_BASELINE_SIGNOFF");
  });

  it("allows baseline only when all stabilization baseline evidence is ready", () => {
    const result = evaluateStabilizationBaselineGate(baseInput);

    expect(result.allowed).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.boundaryMarkers).toHaveLength(9);
    expect(isThresholdReady({ normal: 1, warning: 2, critical: 3 })).toBe(true);
    expect(evaluateMetricBandOrder({ normal: 1, warning: 2, critical: 3, higherIsWorse: true })).toBe(
      true,
    );

    const evidence = buildStabilizationBaselineEvidence(satisfiedEvidenceInput);
    const parsed = stabilizationBaselineEvidenceSchema.parse(evidence);

    expect(parsed.status).toBe("LOCKED");
    expect(parsed.baselineGate.allowed).toBe(true);
    expect(LEGAL_RELIABILITY_STABILIZATION_BASELINE_VERSION).toBe("54-A.1");
    expect(LEGAL_RELIABILITY_STABILIZATION_BASELINE_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-stabilization-baseline",
    );
    expect(LEGAL_RELIABILITY_STABILIZATION_BASELINE_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE54A-PRODUCTION-STABILIZATION-MONITORING-BASELINE",
    );
  });
});
