import { describe, expect, it } from "vitest";
import {
  LONG_TERM_CUSTOMER_SUCCESS_RC_BOUNDARY,
  LONG_TERM_CUSTOMER_SUCCESS_RC_DOCS,
  LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAG,
  LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAGS,
  LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_MARKER_PHASE38F,
  LONG_TERM_CUSTOMER_SUCCESS_RC_MASTER_VERIFY_SCRIPT,
  LONG_TERM_CUSTOMER_SUCCESS_RC_NINETY_DAY_GATE_MARKER,
  LONG_TERM_CUSTOMER_SUCCESS_RC_ONE_LINE_CRITERION,
  LONG_TERM_CUSTOMER_SUCCESS_RC_PREREQUISITE_EVIDENCE_TAGS,
  LONG_TERM_CUSTOMER_SUCCESS_RC_PRODUCT_CROSS_LINK,
  LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK_PATHS,
  LONG_TERM_CUSTOMER_SUCCESS_RC_SUB_PHASES,
  LONG_TERM_CUSTOMER_SUCCESS_RC_SUB_VERIFY_SCRIPTS,
  LONG_TERM_CUSTOMER_SUCCESS_RC_VERSION,
} from "./long-term-customer-success-rc-lock";

describe("long-term-customer-success-rc-lock (Phase 38-F)", () => {
  it("defines Phase 38-F marker and evidence tag", () => {
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_LOCK_MARKER_PHASE38F).toBe(
      "phase38f-long-term-customer-success-rc-gate",
    );
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_VERSION).toBe("38-F.1");
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAG).toContain("PHASE38F");
  });

  it("lists 38-A through 38-F sub-phases", () => {
    expect(Object.keys(LONG_TERM_CUSTOMER_SUCCESS_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-long-term-customer-success-rc",
    );
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 37-F prerequisite evidence", () => {
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-CUSTOMER-GO-LIVE-ADOPTION-PHASE37F-RC",
    );
  });

  it("cross-links customer go-live adoption RC", () => {
    expect(
      LONG_TERM_CUSTOMER_SUCCESS_RC_PRODUCT_CROSS_LINK.customerGoLiveAdoptionMasterVerify,
    ).toBe("verify:aibeopchin-customer-go-live-adoption-rc");
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_NINETY_DAY_GATE_MARKER).toBe(
      "phase38a-90-day-success-plan-gate",
    );
  });

  it("declares customer success policy-only boundary", () => {
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_BOUNDARY.noAutoRenewal).toBe("NO_AUTO_RENEWAL");
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_BOUNDARY.noAutoUpsell).toBe("NO_AUTO_UPSELL");
  });

  it("lists runbooks and evidence tags", () => {
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(LONG_TERM_CUSTOMER_SUCCESS_RC_ONE_LINE_CRITERION).toContain("Customer Success");
  });
});
