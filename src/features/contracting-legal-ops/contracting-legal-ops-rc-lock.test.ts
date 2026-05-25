import { describe, expect, it } from "vitest";
import {
  CONTRACTING_LEGAL_OPS_RC_BOUNDARY,
  CONTRACTING_LEGAL_OPS_RC_DOCS,
  CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAG,
  CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAGS,
  CONTRACTING_LEGAL_OPS_RC_LOCK_MARKER_PHASE35F,
  CONTRACTING_LEGAL_OPS_RC_MASTER_VERIFY_SCRIPT,
  CONTRACTING_LEGAL_OPS_RC_ONE_LINE_CRITERION,
  CONTRACTING_LEGAL_OPS_RC_PREREQUISITE_EVIDENCE_TAGS,
  CONTRACTING_LEGAL_OPS_RC_PRODUCT_CROSS_LINK,
  CONTRACTING_LEGAL_OPS_RC_RUNBOOK_PATHS,
  CONTRACTING_LEGAL_OPS_RC_SUB_PHASES,
  CONTRACTING_LEGAL_OPS_RC_SUB_VERIFY_SCRIPTS,
  CONTRACTING_LEGAL_OPS_RC_TEMPLATE_GATE_MARKER,
  CONTRACTING_LEGAL_OPS_RC_VERSION,
} from "./contracting-legal-ops-rc-lock";

describe("contracting-legal-ops-rc-lock (Phase 35-F)", () => {
  it("defines Phase 35-F marker and evidence tag", () => {
    expect(CONTRACTING_LEGAL_OPS_RC_LOCK_MARKER_PHASE35F).toBe(
      "phase35f-contracting-legal-ops-rc-gate",
    );
    expect(CONTRACTING_LEGAL_OPS_RC_VERSION).toBe("35-F.1");
    expect(CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAG).toContain("PHASE35F");
  });

  it("lists 35-A through 35-F sub-phases", () => {
    expect(Object.keys(CONTRACTING_LEGAL_OPS_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(CONTRACTING_LEGAL_OPS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-contracting-legal-ops-rc",
    );
    expect(CONTRACTING_LEGAL_OPS_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 34-F prerequisite evidence", () => {
    expect(CONTRACTING_LEGAL_OPS_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-SALES-PIPELINE-DEAL-DESK-PHASE34F-RC",
    );
  });

  it("cross-links sales pipeline deal desk RC", () => {
    expect(CONTRACTING_LEGAL_OPS_RC_PRODUCT_CROSS_LINK.salesPipelineDealDeskMasterVerify).toBe(
      "verify:aibeopchin-sales-pipeline-deal-desk-rc",
    );
    expect(CONTRACTING_LEGAL_OPS_RC_TEMPLATE_GATE_MARKER).toBe("phase35a-contract-template-gate");
  });

  it("declares contracting policy-only boundary", () => {
    expect(CONTRACTING_LEGAL_OPS_RC_BOUNDARY.noAutoContractExecution).toBe(
      "NO_AUTO_CONTRACT_EXECUTION",
    );
    expect(CONTRACTING_LEGAL_OPS_RC_BOUNDARY.noAutoSignature).toBe("NO_AUTO_SIGNATURE");
  });

  it("lists runbooks and evidence tags", () => {
    expect(CONTRACTING_LEGAL_OPS_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(CONTRACTING_LEGAL_OPS_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(CONTRACTING_LEGAL_OPS_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(CONTRACTING_LEGAL_OPS_RC_ONE_LINE_CRITERION).toContain("Contracting / Legal Ops RC");
  });
});
