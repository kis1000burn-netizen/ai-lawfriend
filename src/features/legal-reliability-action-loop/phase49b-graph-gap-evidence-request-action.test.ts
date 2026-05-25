import { describe, expect, it } from "vitest";
import {
  assertNoUnverifiedEvidenceLabeling,
  buildClaimGraphGapSignalFromWorkbenchSample,
  sanitizeGraphGapForClientEvidenceRequest,
} from "./phase49b-graph-gap-evidence-request-action.policy";
import {
  PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_EVIDENCE_TAG,
  PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_LOCK_MARKER,
  PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_VERIFY_SCRIPT,
  PHASE49B_LOCKED_BOUNDARIES,
} from "./phase49b-graph-gap-evidence-request-action.lock";

describe("phase49b-graph-gap-evidence-request-action (Phase 49-B)", () => {
  it("locks six boundaries including NO_UNVERIFIED_EVIDENCE_LABELING", () => {
    expect(PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_LOCK_MARKER).toContain("phase49b");
    expect(PHASE49B_LOCKED_BOUNDARIES).toHaveLength(6);
    expect(PHASE49B_LOCKED_BOUNDARIES).toContain("NO_UNVERIFIED_EVIDENCE_LABELING");
    expect(PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-action-loop-phase49b",
    );
    expect(PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_EVIDENCE_TAG).toContain("PHASE49B");
  });

  it("sanitizes graph gap into client-safe evidence request candidate", () => {
    const gap = buildClaimGraphGapSignalFromWorkbenchSample({
      caseId: "case-001",
      gapId: "graph-gap-001",
    });
    const sanitized = sanitizeGraphGapForClientEvidenceRequest(gap);
    expect(sanitized.proposedClientRequestBody).not.toContain("입증 공백");
    expect(() => assertNoUnverifiedEvidenceLabeling(sanitized.proposedClientRequestBody)).not.toThrow();
  });

  it("blocks unverified evidence labeling", () => {
    expect(() => assertNoUnverifiedEvidenceLabeling("이 자료는 승소에 결정적입니다.")).toThrow(
      "NO_UNVERIFIED_EVIDENCE_LABELING",
    );
  });
});
