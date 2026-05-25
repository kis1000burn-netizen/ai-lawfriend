import { describe, expect, it } from "vitest";
import {
  assertLegalReliabilityActionLoopRcBoundary,
  assertSupplementDraftCreationAllowed,
} from "./legal-reliability-action-loop-rc.policy";
import {
  assertClientSafeActionRequestText,
  sanitizeClientSafeActionRequest,
} from "./legal-reliability-action-loop-client-sanitizer";
import {
  LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY,
  buildActionLoopSupplementItemSourceMarker,
} from "./legal-reliability-action-loop.registry";
import {
  LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK,
  LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_MARKER,
  LEGAL_RELIABILITY_ACTION_LOOP_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_ACTION_LOOP_RC_ONE_LINE_CRITERION,
  LEGAL_RELIABILITY_ACTION_LOOP_RC_VERSION,
} from "./legal-reliability-action-loop-rc-lock";

describe("legal-reliability-action-loop-rc-lock (Phase 49-C)", () => {
  it("locks both 49-A and 49-B action types in the RC registry", () => {
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK.actionTypes).toContain(
      "RISK_RADAR_SUPPLEMENT_REQUEST",
    );
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK.actionTypes).toContain(
      "GRAPH_GAP_EVIDENCE_REQUEST",
    );
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_LOCK_MARKER).toContain("phase49c");
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_VERSION).toBe("49-C.1");
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_EVIDENCE_TAG).toContain("PHASE49C");
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-action-loop-rc",
    );
    expect(LEGAL_RELIABILITY_ACTION_LOOP_RC_ONE_LINE_CRITERION).toContain("49-C");
  });

  it("requires lawyer approval for every action type", () => {
    for (const action of Object.values(LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes)) {
      expect(action.requiresLawyerApproval).toBe(true);
    }
  });

  it("blocks direct messaging from the action loop", () => {
    for (const action of Object.values(LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes)) {
      expect(action.directMessagingAllowed).toBe(false);
    }
  });

  it("blocks automatic legal filing from the action loop", () => {
    for (const action of Object.values(LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes)) {
      expect(action.autoLegalFilingAllowed).toBe(false);
    }
  });

  it("requires lawyer decision ledger for every action type", () => {
    for (const action of Object.values(LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes)) {
      expect(action.decisionLedgerRequired).toBe(true);
    }
  });

  it("requires client-safe sanitizer for every action type", () => {
    for (const action of Object.values(LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes)) {
      expect(action.sanitizerRequired).toBe(true);
    }
  });

  it("separates sourceMarkerPrefix by phase49a- and phase49b-", () => {
    expect(
      LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes.RISK_RADAR_SUPPLEMENT_REQUEST
        .sourceMarkerPrefix,
    ).toBe("phase49a-");
    expect(
      LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes.GRAPH_GAP_EVIDENCE_REQUEST
        .sourceMarkerPrefix,
    ).toBe("phase49b-");
    expect(
      buildActionLoopSupplementItemSourceMarker("phase49a-", "candidate-001"),
    ).toBe("phase49a-candidate-001");
  });

  it("requires lawyer approval and ledger before supplement draft creation", () => {
    expect(() =>
      assertSupplementDraftCreationAllowed({
        candidateStatus: "CANDIDATE",
        hasLawyerDecisionLedger: true,
        sanitizerBlocked: false,
        sourceMarker: "phase49a-candidate-001",
        directMessaging: false,
        autoLegalFiling: false,
        lawyerApproved: false,
      }),
    ).toThrow("NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL");

    expect(() =>
      assertSupplementDraftCreationAllowed({
        candidateStatus: "LAWYER_APPROVED",
        hasLawyerDecisionLedger: false,
        sanitizerBlocked: false,
        sourceMarker: "phase49b-candidate-001",
        directMessaging: false,
        autoLegalFiling: false,
        lawyerApproved: true,
      }),
    ).toThrow("LAWYER_DECISION_LEDGER_REQUIRED");
  });

  it("blocks RC boundary violations", () => {
    expect(() =>
      assertLegalReliabilityActionLoopRcBoundary({
        actionType: "RISK_RADAR_SUPPLEMENT_REQUEST",
        requiresLawyerApproval: false,
        hasLawyerDecisionLedger: true,
        clientVisibleByDefault: false,
        directMessagingRequested: false,
        autoLegalFilingRequested: false,
        supplementDraftCreationRequested: false,
        lawyerApproved: false,
      }),
    ).toThrow("NO_AI_AUTO_ACTION");
  });

  it("blocks strategy and unverified evidence labeling in unified sanitizer", () => {
    const strategy = sanitizeClientSafeActionRequest({
      title: "자료 요청",
      body: "상대방이 공격할 가능성이 있습니다.",
    });
    expect(strategy.blocked).toBe(true);
    expect(strategy.blockReason).toBe("CLIENT_VISIBLE_STRATEGY_TEXT");

    expect(() =>
      assertClientSafeActionRequestText("이 자료는 승소에 결정적입니다."),
    ).toThrow("NO_UNVERIFIED_EVIDENCE_LABELING");
  });
});
