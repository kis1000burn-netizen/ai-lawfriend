import { describe, expect, it } from "vitest";
import {
  assertAllowedCandidateStatusTransition,
  assertNoClientVisibleStrategyText,
  sanitizeRiskRadarSignalForClientRequest,
} from "./phase49a-risk-radar-supplement-action.policy";
import {
  PHASE49A_LOCKED_BOUNDARIES,
  PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_EVIDENCE_TAG,
  PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_LOCK_MARKER,
  PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_VERIFY_SCRIPT,
} from "./phase49a-risk-radar-supplement-action.lock";
import { buildRiskRadarSignalFromWorkbenchSample } from "./phase49a-risk-radar-supplement-action.policy";

describe("phase49a-risk-radar-supplement-action (Phase 49-A)", () => {
  it("locks six boundaries and verify script", () => {
    expect(PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_LOCK_MARKER).toContain("phase49a");
    expect(PHASE49A_LOCKED_BOUNDARIES).toHaveLength(6);
    expect(PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-action-loop-phase49a",
    );
    expect(PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_EVIDENCE_TAG).toContain("PHASE49A");
  });

  it("sanitizes internal strategy text from client request candidate", () => {
    const signal = buildRiskRadarSignalFromWorkbenchSample({
      caseId: "case-001",
      signalId: "radar-signal-001",
    });
    const sanitized = sanitizeRiskRadarSignalForClientRequest(signal);
    expect(sanitized.prohibitedClientTextRemoved).toBe(true);
    expect(sanitized.proposedClientRequestBody).not.toContain("공격할 가능성");
    expect(() => assertNoClientVisibleStrategyText(sanitized.proposedClientRequestBody)).not.toThrow();
  });

  it("blocks forbidden transitions to SUPPLEMENT_SENT", () => {
    expect(() =>
      assertAllowedCandidateStatusTransition("CANDIDATE", "SUPPLEMENT_SENT"),
    ).toThrow("Forbidden candidate transition");
    expect(() =>
      assertAllowedCandidateStatusTransition("LAWYER_REJECTED", "SUPPLEMENT_DRAFT_CREATED"),
    ).toThrow("Forbidden candidate transition");
  });

  it("blocks strategy text in client request body", () => {
    expect(() =>
      assertNoClientVisibleStrategyText("상대방이 공격할 가능성이 있습니다."),
    ).toThrow("NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT");
  });
});
