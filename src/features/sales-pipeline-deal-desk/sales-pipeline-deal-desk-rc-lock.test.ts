import { describe, expect, it } from "vitest";
import {
  SALES_PIPELINE_DEAL_DESK_RC_BOUNDARY,
  SALES_PIPELINE_DEAL_DESK_RC_DOCS,
  SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAG,
  SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAGS,
  SALES_PIPELINE_DEAL_DESK_RC_LOCK_MARKER_PHASE34F,
  SALES_PIPELINE_DEAL_DESK_RC_MASTER_VERIFY_SCRIPT,
  SALES_PIPELINE_DEAL_DESK_RC_ONE_LINE_CRITERION,
  SALES_PIPELINE_DEAL_DESK_RC_PIPELINE_MARKER,
  SALES_PIPELINE_DEAL_DESK_RC_PREREQUISITE_EVIDENCE_TAGS,
  SALES_PIPELINE_DEAL_DESK_RC_PRODUCT_CROSS_LINK,
  SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK_PATHS,
  SALES_PIPELINE_DEAL_DESK_RC_SUB_PHASES,
  SALES_PIPELINE_DEAL_DESK_RC_SUB_VERIFY_SCRIPTS,
  SALES_PIPELINE_DEAL_DESK_RC_VERSION,
} from "./sales-pipeline-deal-desk-rc-lock";

describe("sales-pipeline-deal-desk-rc-lock (Phase 34-F)", () => {
  it("defines Phase 34-F marker and evidence tag", () => {
    expect(SALES_PIPELINE_DEAL_DESK_RC_LOCK_MARKER_PHASE34F).toBe(
      "phase34f-sales-pipeline-deal-desk-rc-gate",
    );
    expect(SALES_PIPELINE_DEAL_DESK_RC_VERSION).toBe("34-F.1");
    expect(SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAG).toContain("PHASE34F");
  });

  it("lists 34-A through 34-F sub-phases", () => {
    expect(Object.keys(SALES_PIPELINE_DEAL_DESK_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(SALES_PIPELINE_DEAL_DESK_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-sales-pipeline-deal-desk-rc",
    );
    expect(SALES_PIPELINE_DEAL_DESK_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 33-F prerequisite evidence", () => {
    expect(SALES_PIPELINE_DEAL_DESK_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-PUBLIC-TRUST-MARKETING-PHASE33F-RC",
    );
  });

  it("cross-links public trust marketing RC", () => {
    expect(SALES_PIPELINE_DEAL_DESK_RC_PRODUCT_CROSS_LINK.publicTrustMarketingMasterVerify).toBe(
      "verify:aibeopchin-public-trust-marketing-rc",
    );
    expect(SALES_PIPELINE_DEAL_DESK_RC_PIPELINE_MARKER).toBe("phase34a-sales-pipeline-gate");
  });

  it("declares deal desk policy-only boundary", () => {
    expect(SALES_PIPELINE_DEAL_DESK_RC_BOUNDARY.noAutoInvoice).toBe("NO_AUTO_INVOICE");
    expect(SALES_PIPELINE_DEAL_DESK_RC_BOUNDARY.noAutoContract).toBe("NO_AUTO_CONTRACT");
  });

  it("lists runbooks and evidence tags", () => {
    expect(SALES_PIPELINE_DEAL_DESK_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(SALES_PIPELINE_DEAL_DESK_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(SALES_PIPELINE_DEAL_DESK_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(SALES_PIPELINE_DEAL_DESK_RC_ONE_LINE_CRITERION).toContain("Deal Desk");
  });
});
