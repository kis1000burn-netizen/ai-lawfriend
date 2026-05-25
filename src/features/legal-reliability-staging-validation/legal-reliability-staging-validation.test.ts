import { describe, expect, it } from "vitest";
import {
  assertStagingLiveValidationRcBoundary,
  assertStagingRoleLiveSmokeBoundary,
} from "./legal-reliability-staging-validation.policy";
import {
  LEGAL_RELIABILITY_STAGING_EVIDENCE_CHECKLIST_MARKER,
  LEGAL_RELIABILITY_STAGING_EVIDENCE_LOCK_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_CRITICAL_BOUNDARY_MARKERS,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_FINAL_JUDGMENT,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_MARKER,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_ONE_LINE_CRITERION,
  LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_VERSION,
} from "./legal-reliability-staging-validation-rc-lock";
import {
  LEGAL_RELIABILITY_STAGING_ACTION_LOOP_SMOKE_STEPS,
  LEGAL_RELIABILITY_STAGING_VALIDATION_SUB_PHASES,
} from "./legal-reliability-staging-validation.schema";

describe("legal-reliability-staging-validation (Phase 52)", () => {
  it("locks all 52-A through 52-E sub-phases", () => {
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK.includes).toHaveLength(5);
    expect(Object.keys(LEGAL_RELIABILITY_STAGING_VALIDATION_SUB_PHASES)).toHaveLength(6);
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK_MARKER).toContain("phase52f");
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_VERSION).toBe("52-F.1");
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_EVIDENCE_TAG).toContain("PHASE52");
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-staging-live-validation-rc",
    );
    expect(LEGAL_RELIABILITY_STAGING_EVIDENCE_LOCK_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-staging-evidence-lock",
    );
    expect(LEGAL_RELIABILITY_STAGING_EVIDENCE_CHECKLIST_MARKER).toContain("phase52");
  });

  it("requires Action Loop live smoke steps", () => {
    expect(LEGAL_RELIABILITY_STAGING_ACTION_LOOP_SMOKE_STEPS).toContain(
      "SupplementRequest DRAFT with phase49a sourceMarker",
    );
  });

  it("blocks go-live without staging evidence", () => {
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK.goLiveWithoutStagingEvidenceAllowed).toBe(
      false,
    );
    expect(
      LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK.goLiveWithAutoCompletionOrAutoFilingAllowed,
    ).toBe(false);
  });

  it("requires critical RC boundaries", () => {
    for (const marker of LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_CRITICAL_BOUNDARY_MARKERS) {
      expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_LOCK.requiredBoundaries).toContain(marker);
    }
  });

  it("blocks RC boundary violations via policy", () => {
    expect(() =>
      assertStagingLiveValidationRcBoundary({ goLiveWithoutStagingEvidence: true }),
    ).toThrow("NO_GO_LIVE_WITHOUT_STAGING_EVIDENCE");

    expect(() =>
      assertStagingLiveValidationRcBoundary({ goLiveWithClientInternalAccess: true }),
    ).toThrow("NO_GO_LIVE_WITH_CLIENT_INTERNAL_ACCESS");

    expect(() =>
      assertStagingLiveValidationRcBoundary({ goLiveWithUnreviewedEvidenceDownstream: true }),
    ).toThrow("NO_GO_LIVE_WITH_UNREVIEWED_EVIDENCE_DOWNSTREAM");
  });

  it("blocks CLIENT role live smoke violations", () => {
    expect(() =>
      assertStagingRoleLiveSmokeBoundary({
        actorRole: "CLIENT",
        capability: "dashboardRead",
        allowed: true,
      }),
    ).toThrow("CLIENT_ROLE_ACTION_OPERATION_DASHBOARD_FORBIDDEN");
  });

  it("states the go-live final judgment", () => {
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_ONE_LINE_CRITERION).toContain("Phase 52");
    expect(LEGAL_RELIABILITY_STAGING_LIVE_VALIDATION_RC_FINAL_JUDGMENT).toContain(
      "staging live validation",
    );
  });
});
