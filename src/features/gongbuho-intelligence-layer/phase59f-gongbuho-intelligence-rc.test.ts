import { describe, expect, it } from "vitest";
import {
  assertGongbuhoIntelligenceRcGateAllowed,
  evaluateGongbuhoIntelligenceRcGate,
  PHASE59F_BOUNDARY_MARKERS,
  PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE59F_INHERITED_BOUNDARY_MARKERS,
  PHASE59F_INTELLIGENCE_GOVERNANCE_BOUNDARY_MARKERS,
  PHASE59F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase59f-gongbuho-intelligence-rc.policy";
import {
  PHASE59A_GONGBUHO_MEMORY_PACKET_EVIDENCE_TAG,
  PHASE59F_GONGBUHO_INTELLIGENCE_RC_BUNDLED_VERIFY_SCRIPTS,
  PHASE59F_GONGBUHO_INTELLIGENCE_RC_EVIDENCE_TAG,
  PHASE59F_GONGBUHO_INTELLIGENCE_RC_LOCK,
  PHASE59F_GONGBUHO_INTELLIGENCE_RC_MASTER_VERIFY_SCRIPT,
  PHASE59F_GONGBUHO_INTELLIGENCE_RC_VERSION,
} from "./phase59f-gongbuho-intelligence-rc-lock";

const allLockedInput = {
  phase59aMemoryPacketLocked: true,
  phase59bRealtimeSignalLocked: true,
  phase59cReasoningEngineLocked: true,
  phase59dLearningLoopLocked: true,
  phase59ePatternLibraryLocked: true,
  phase54StabilizationLocked: true,
  evidenceChainComplete: true,
  masterVerifyPassed: true,
};

describe("Phase 59-F Gongbuho Intelligence RC", () => {
  it("exposes consolidated RC boundaries", () => {
    expect(PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "NO_RAW_CLIENT_FACT_GLOBAL_LEARNING",
    );
    expect(PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "NO_AI_CANDIDATE_MEMORY_IN_STRONG_REASONING",
    );
    expect(PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "NO_UNAPPROVED_REAL_TIME_SIGNAL_IN_CONTEXT",
    );
    expect(PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toContain(
      "GONGBUHO_INTELLIGENCE_MASTER_VERIFY_REQUIRED",
    );
    expect(PHASE59F_CONSOLIDATED_RC_BOUNDARY_MARKERS).toHaveLength(12);
  });

  it("exposes intelligence governance boundaries", () => {
    expect(PHASE59F_INTELLIGENCE_GOVERNANCE_BOUNDARY_MARKERS).toContain(
      "AUDIT_EVERY_AI_LEARNING",
    );
    expect(PHASE59F_INTELLIGENCE_GOVERNANCE_BOUNDARY_MARKERS).toHaveLength(8);
  });

  it("inherits compiler and action loop boundaries", () => {
    expect(PHASE59F_INHERITED_BOUNDARY_MARKERS).toContain("LAWYER_DECISION_LEDGER_REQUIRED");
  });

  it("blocks RC without Phase 59-E pattern library lock", () => {
    expect(() =>
      assertGongbuhoIntelligenceRcGateAllowed({
        ...allLockedInput,
        phase59ePatternLibraryLocked: false,
      }),
    ).toThrow("NO_INTELLIGENCE_RC_WITHOUT_59E_PATTERN_LIBRARY_LOCK");
  });

  it("blocks RC without Phase 54 stabilization lock", () => {
    expect(() =>
      assertGongbuhoIntelligenceRcGateAllowed({
        ...allLockedInput,
        phase54StabilizationLocked: false,
      }),
    ).toThrow("NO_INTELLIGENCE_RC_WITHOUT_PHASE54_STABILIZATION_LOCK");
  });

  it("blocks RC when evidence chain is incomplete", () => {
    expect(() =>
      assertGongbuhoIntelligenceRcGateAllowed({
        ...allLockedInput,
        evidenceChainComplete: false,
      }),
    ).toThrow("NO_INTELLIGENCE_RC_WITH_BROKEN_EVIDENCE_CHAIN");
  });

  it("blocks RC when master verify has not passed", () => {
    expect(() =>
      assertGongbuhoIntelligenceRcGateAllowed({
        ...allLockedInput,
        masterVerifyPassed: false,
      }),
    ).toThrow("NO_INTELLIGENCE_RC_WITHOUT_MASTER_VERIFY");
  });

  it("allows RC only when all sub-phase locks and master verify pass", () => {
    const result = evaluateGongbuhoIntelligenceRcGate(allLockedInput);

    expect(result.allowed).toBe(true);
    expect(result.boundaryMarkers).toEqual(PHASE59F_BOUNDARY_MARKERS);
    expect(PHASE59F_RC_GATE_BOUNDARY_MARKERS).toHaveLength(8);
    expect(PHASE59F_GONGBUHO_INTELLIGENCE_RC_LOCK.status).toBe("COMPLETE_LOCKED");
    expect(PHASE59F_GONGBUHO_INTELLIGENCE_RC_VERSION).toBe("59-F.1");
    expect(PHASE59F_GONGBUHO_INTELLIGENCE_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-gongbuho-intelligence-rc",
    );
    expect(PHASE59F_GONGBUHO_INTELLIGENCE_RC_BUNDLED_VERIFY_SCRIPTS).toHaveLength(5);
    expect(PHASE59A_GONGBUHO_MEMORY_PACKET_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59A-MEMORY-PACKET-SCHEMA",
    );
    expect(PHASE59F_GONGBUHO_INTELLIGENCE_RC_EVIDENCE_TAG).toBe(
      "EVIDENCE-20260526-AIBEOPCHIN-GONGBUHO-INTELLIGENCE-PHASE59F-RC-LOCK",
    );
    expect(PHASE59F_GONGBUHO_INTELLIGENCE_RC_LOCK.platformStatus).toBe(
      "LEGAL_RELIABILITY_INTELLIGENCE_PLATFORM",
    );
  });
});
