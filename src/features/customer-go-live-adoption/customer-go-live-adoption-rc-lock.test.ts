import { describe, expect, it } from "vitest";
import {
  CUSTOMER_GO_LIVE_ADOPTION_RC_BOUNDARY,
  CUSTOMER_GO_LIVE_ADOPTION_RC_DOCS,
  CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAG,
  CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAGS,
  CUSTOMER_GO_LIVE_ADOPTION_RC_EXECUTION_GATE_MARKER,
  CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_MARKER_PHASE37F,
  CUSTOMER_GO_LIVE_ADOPTION_RC_MASTER_VERIFY_SCRIPT,
  CUSTOMER_GO_LIVE_ADOPTION_RC_ONE_LINE_CRITERION,
  CUSTOMER_GO_LIVE_ADOPTION_RC_PREREQUISITE_EVIDENCE_TAGS,
  CUSTOMER_GO_LIVE_ADOPTION_RC_PRODUCT_CROSS_LINK,
  CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK_PATHS,
  CUSTOMER_GO_LIVE_ADOPTION_RC_SUB_PHASES,
  CUSTOMER_GO_LIVE_ADOPTION_RC_SUB_VERIFY_SCRIPTS,
  CUSTOMER_GO_LIVE_ADOPTION_RC_VERSION,
} from "./customer-go-live-adoption-rc-lock";

describe("customer-go-live-adoption-rc-lock (Phase 37-F)", () => {
  it("defines Phase 37-F marker and evidence tag", () => {
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_LOCK_MARKER_PHASE37F).toBe(
      "phase37f-customer-go-live-adoption-rc-gate",
    );
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_VERSION).toBe("37-F.1");
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAG).toContain("PHASE37F");
  });

  it("lists 37-A through 37-F sub-phases", () => {
    expect(Object.keys(CUSTOMER_GO_LIVE_ADOPTION_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-customer-go-live-adoption-rc",
    );
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 36-F prerequisite evidence", () => {
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-IMPLEMENTATION-READINESS-PHASE36F-RC",
    );
  });

  it("cross-links implementation readiness RC", () => {
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_PRODUCT_CROSS_LINK.implementationReadinessMasterVerify).toBe(
      "verify:aibeopchin-implementation-readiness-rc",
    );
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_EXECUTION_GATE_MARKER).toBe(
      "phase37a-go-live-execution-checklist-gate",
    );
  });

  it("declares adoption tracking policy-only boundary", () => {
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_BOUNDARY.noAutoAdoptionSuccessClaim).toBe(
      "NO_AUTO_ADOPTION_SUCCESS_CLAIM",
    );
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_BOUNDARY.noAutoIssueResolution).toBe(
      "NO_AUTO_ISSUE_RESOLUTION",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(CUSTOMER_GO_LIVE_ADOPTION_RC_ONE_LINE_CRITERION).toContain("고객 정착");
  });
});
