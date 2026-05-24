import { describe, expect, it } from "vitest";
import {
  PAID_CONVERSION_SCALE_RC_CONTRACT_PACK_MARKER,
  PAID_CONVERSION_SCALE_RC_DOCS,
  PAID_CONVERSION_SCALE_RC_EVIDENCE_TAG,
  PAID_CONVERSION_SCALE_RC_EVIDENCE_TAGS,
  PAID_CONVERSION_SCALE_RC_LOCK_MARKER_PHASE28F,
  PAID_CONVERSION_SCALE_RC_MASTER_VERIFY_SCRIPT,
  PAID_CONVERSION_SCALE_RC_ONE_LINE_CRITERION,
  PAID_CONVERSION_SCALE_RC_PREREQUISITE_EVIDENCE_TAGS,
  PAID_CONVERSION_SCALE_RC_PRODUCT_CROSS_LINK,
  PAID_CONVERSION_SCALE_RC_RUNBOOK_PATHS,
  PAID_CONVERSION_SCALE_RC_SUB_PHASES,
  PAID_CONVERSION_SCALE_RC_SUB_VERIFY_SCRIPTS,
  PAID_CONVERSION_SCALE_RC_VERSION,
} from "./paid-conversion-scale-rc-lock";

describe("paid-conversion-scale-rc-lock (Phase 28-F)", () => {
  it("defines Phase 28-F marker and evidence tag", () => {
    expect(PAID_CONVERSION_SCALE_RC_LOCK_MARKER_PHASE28F).toBe(
      "phase28f-paid-conversion-scale-rc-gate",
    );
    expect(PAID_CONVERSION_SCALE_RC_VERSION).toBe("28-F.1");
    expect(PAID_CONVERSION_SCALE_RC_EVIDENCE_TAG).toContain("PHASE28F");
  });

  it("lists 28-A through 28-F sub-phases", () => {
    expect(Object.keys(PAID_CONVERSION_SCALE_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(PAID_CONVERSION_SCALE_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-paid-conversion-scale-rc",
    );
    expect(PAID_CONVERSION_SCALE_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 27-F and 26-F prerequisite evidence", () => {
    expect(PAID_CONVERSION_SCALE_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-PILOT-OPS-PHASE27F-RC",
    );
  });

  it("cross-links pilot operations RCs", () => {
    expect(PAID_CONVERSION_SCALE_RC_PRODUCT_CROSS_LINK.pilotOperationsMasterVerify).toBe(
      "verify:aibeopchin-pilot-operations-rc",
    );
    expect(PAID_CONVERSION_SCALE_RC_CONTRACT_PACK_MARKER).toBe(
      "phase28a-paid-conversion-contract-gate",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(PAID_CONVERSION_SCALE_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(PAID_CONVERSION_SCALE_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(PAID_CONVERSION_SCALE_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(PAID_CONVERSION_SCALE_RC_ONE_LINE_CRITERION).toContain("Product Phase 28 RC");
  });
});
