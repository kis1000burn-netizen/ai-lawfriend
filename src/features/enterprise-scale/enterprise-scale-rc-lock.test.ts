import { describe, expect, it } from "vitest";
import {
  ENTERPRISE_SCALE_RC_DEPLOYMENT_MARKER,
  ENTERPRISE_SCALE_RC_DOCS,
  ENTERPRISE_SCALE_RC_EVIDENCE_TAG,
  ENTERPRISE_SCALE_RC_EVIDENCE_TAGS,
  ENTERPRISE_SCALE_RC_LOCK_MARKER_PHASE30F,
  ENTERPRISE_SCALE_RC_MASTER_VERIFY_SCRIPT,
  ENTERPRISE_SCALE_RC_ONE_LINE_CRITERION,
  ENTERPRISE_SCALE_RC_PREREQUISITE_EVIDENCE_TAGS,
  ENTERPRISE_SCALE_RC_PRODUCT_CROSS_LINK,
  ENTERPRISE_SCALE_RC_RUNBOOK_PATHS,
  ENTERPRISE_SCALE_RC_SUB_PHASES,
  ENTERPRISE_SCALE_RC_SUB_VERIFY_SCRIPTS,
  ENTERPRISE_SCALE_RC_VERSION,
} from "./enterprise-scale-rc-lock";

describe("enterprise-scale-rc-lock (Phase 30-F)", () => {
  it("defines Phase 30-F marker and evidence tag", () => {
    expect(ENTERPRISE_SCALE_RC_LOCK_MARKER_PHASE30F).toBe("phase30f-enterprise-scale-rc-gate");
    expect(ENTERPRISE_SCALE_RC_VERSION).toBe("30-F.1");
    expect(ENTERPRISE_SCALE_RC_EVIDENCE_TAG).toContain("PHASE30F");
  });

  it("lists 30-A through 30-F sub-phases", () => {
    expect(Object.keys(ENTERPRISE_SCALE_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(ENTERPRISE_SCALE_RC_MASTER_VERIFY_SCRIPT).toBe("verify:aibeopchin-enterprise-scale-rc");
    expect(ENTERPRISE_SCALE_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 29-F and 22-F prerequisite evidence", () => {
    expect(ENTERPRISE_SCALE_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-REVENUE-OPS-PHASE29F-RC",
    );
  });

  it("cross-links revenue ops and monitoring RCs", () => {
    expect(ENTERPRISE_SCALE_RC_PRODUCT_CROSS_LINK.revenueOpsMasterVerify).toBe(
      "verify:aibeopchin-revenue-ops-rc",
    );
    expect(ENTERPRISE_SCALE_RC_DEPLOYMENT_MARKER).toBe("phase30a-enterprise-deployment-gate");
  });

  it("lists runbooks and evidence tags", () => {
    expect(ENTERPRISE_SCALE_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(ENTERPRISE_SCALE_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(ENTERPRISE_SCALE_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(ENTERPRISE_SCALE_RC_ONE_LINE_CRITERION).toContain("Product Phase 30 RC");
  });
});
