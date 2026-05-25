import { describe, expect, it } from "vitest";
import {
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_BOUNDARY,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_CLAIM_ISSUE_GATE_MARKER,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_EVIDENCE_TAG,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_MARKER_PHASE43F,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_MASTER_VERIFY_SCRIPT,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_ONE_LINE_CRITERION,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_PREREQUISITE_EVIDENCE_TAGS,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_SUB_PHASES,
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_VERSION,
} from "./claim-evidence-judgment-graph-rc-lock";

describe("claim-evidence-judgment-graph-rc-lock (Phase 43-F)", () => {
  it("defines Phase 43-F marker", () => {
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_MARKER_PHASE43F).toBe(
      "phase43f-claim-evidence-judgment-graph-rc-gate",
    );
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_VERSION).toBe("43-F.1");
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_EVIDENCE_TAG).toContain("PHASE43F");
  });

  it("lists 43-A through 43-F", () => {
    expect(Object.keys(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("requires 42-F prerequisite", () => {
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
    );
  });

  it("declares claim graph boundaries", () => {
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_BOUNDARY.noUnlinkedClaimGraph).toBe(
      "NO_UNLINKED_CLAIM_GRAPH",
    );
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_BOUNDARY.aiCandidateLinkNotFinal).toBe(
      "AI_CANDIDATE_LINK_NOT_FINAL",
    );
  });

  it("wires master verify and gate marker", () => {
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-claim-evidence-judgment-graph-rc",
    );
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_CLAIM_ISSUE_GATE_MARKER).toBe(
      "phase43a-claim-issue-graph-registry-gate",
    );
    expect(CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_ONE_LINE_CRITERION).toContain("graph");
  });
});
