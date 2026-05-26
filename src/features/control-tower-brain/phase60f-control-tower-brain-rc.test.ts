import { describe, expect, it } from "vitest";
import {
  assertControlTowerBrainRcGateAllowed,
  evaluateControlTowerBrainRcGate,
  PHASE60F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE60F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase60f-control-tower-brain-rc.policy";
import {
  PHASE60F_CONTROL_TOWER_BRAIN_RC_BUNDLED_VERIFY_SCRIPTS,
  PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK,
  PHASE60F_CONTROL_TOWER_BRAIN_RC_MASTER_VERIFY_SCRIPT,
  PHASE60F_CONTROL_TOWER_BRAIN_RC_VERSION,
} from "./phase60f-control-tower-brain-rc-lock";

const allLockedInput = {
  phase60aSafetyLocked: true,
  phase60bErrorDetectionLocked: true,
  phase60cConflictDiagnosisLocked: true,
  phase60dPatchPlanLocked: true,
  phase60eSafeAutoFixLocked: true,
  evidenceChainComplete: true,
  masterVerifyPassed: true,
};

describe("Phase 60-F Control Tower Brain RC", () => {
  it("exposes consolidated RC boundaries", () => {
    expect(PHASE60F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "NO_UNAPPROVED_PRODUCTION_CODE_WRITE",
    );
    expect(PHASE60F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "CONTROL_TOWER_BRAIN_MASTER_VERIFY_REQUIRED",
    );
  });

  it("blocks RC without 60-E safe auto-fix lock", () => {
    expect(() =>
      assertControlTowerBrainRcGateAllowed({
        ...allLockedInput,
        phase60eSafeAutoFixLocked: false,
      }),
    ).toThrow("NO_CONTROL_TOWER_RC_WITHOUT_60E_SAFE_AUTO_FIX");
  });

  it("blocks RC without master verify", () => {
    const result = evaluateControlTowerBrainRcGate({
      ...allLockedInput,
      masterVerifyPassed: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.blockedBy).toBe("NO_CONTROL_TOWER_RC_WITHOUT_MASTER_VERIFY");
  });

  it("locks RC SSOT", () => {
    expect(PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE60F_CONTROL_TOWER_BRAIN_RC_VERSION).toBe("60-F.1");
    expect(PHASE60F_CONTROL_TOWER_BRAIN_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-control-tower-brain-rc",
    );
    expect(PHASE60F_CONTROL_TOWER_BRAIN_RC_BUNDLED_VERIFY_SCRIPTS).toHaveLength(5);
    expect(PHASE60F_RC_GATE_BOUNDARY_MARKERS).toHaveLength(7);
    expect(PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK.adminConsolePath).toBe(
      "/admin/control-tower/brain",
    );
  });
});
