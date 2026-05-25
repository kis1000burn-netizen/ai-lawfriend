import { describe, expect, it } from "vitest";
import {
  STRATEGIC_ACCOUNT_EXPANSION_RC_ACCOUNT_PLAN_GATE_MARKER,
  STRATEGIC_ACCOUNT_EXPANSION_RC_BOUNDARY,
  STRATEGIC_ACCOUNT_EXPANSION_RC_DOCS,
  STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAG,
  STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAGS,
  STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_MARKER_PHASE39F,
  STRATEGIC_ACCOUNT_EXPANSION_RC_MASTER_VERIFY_SCRIPT,
  STRATEGIC_ACCOUNT_EXPANSION_RC_ONE_LINE_CRITERION,
  STRATEGIC_ACCOUNT_EXPANSION_RC_PREREQUISITE_EVIDENCE_TAGS,
  STRATEGIC_ACCOUNT_EXPANSION_RC_PRODUCT_CROSS_LINK,
  STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK_PATHS,
  STRATEGIC_ACCOUNT_EXPANSION_RC_SUB_PHASES,
  STRATEGIC_ACCOUNT_EXPANSION_RC_SUB_VERIFY_SCRIPTS,
  STRATEGIC_ACCOUNT_EXPANSION_RC_VERSION,
} from "./strategic-account-expansion-rc-lock";

describe("strategic-account-expansion-rc-lock (Phase 39-F)", () => {
  it("defines Phase 39-F marker and evidence tag", () => {
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_LOCK_MARKER_PHASE39F).toBe(
      "phase39f-strategic-account-expansion-rc-gate",
    );
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_VERSION).toBe("39-F.1");
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAG).toContain("PHASE39F");
  });

  it("lists 39-A through 39-F sub-phases", () => {
    expect(Object.keys(STRATEGIC_ACCOUNT_EXPANSION_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-strategic-account-expansion-rc",
    );
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 38-F prerequisite evidence", () => {
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-LONG-TERM-CUSTOMER-SUCCESS-PHASE38F-RC",
    );
  });

  it("cross-links long-term customer success RC", () => {
    expect(
      STRATEGIC_ACCOUNT_EXPANSION_RC_PRODUCT_CROSS_LINK.longTermCustomerSuccessMasterVerify,
    ).toBe("verify:aibeopchin-long-term-customer-success-rc");
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_ACCOUNT_PLAN_GATE_MARKER).toBe(
      "phase39a-strategic-account-plan-gate",
    );
  });

  it("declares strategic account expansion policy-only boundary", () => {
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_BOUNDARY.noAutoExpansionExecution).toBe(
      "NO_AUTO_EXPANSION_EXECUTION",
    );
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_BOUNDARY.noAutoMultiBranchProvisioning).toBe(
      "NO_AUTO_MULTI_BRANCH_PROVISIONING",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(STRATEGIC_ACCOUNT_EXPANSION_RC_ONE_LINE_CRITERION).toContain(
      "Strategic Account Expansion RC",
    );
  });
});
