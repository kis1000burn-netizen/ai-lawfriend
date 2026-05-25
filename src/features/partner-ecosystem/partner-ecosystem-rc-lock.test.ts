import { describe, expect, it } from "vitest";
import {
  PARTNER_ECOSYSTEM_RC_DOCS,
  PARTNER_ECOSYSTEM_RC_EVIDENCE_TAG,
  PARTNER_ECOSYSTEM_RC_EVIDENCE_TAGS,
  PARTNER_ECOSYSTEM_RC_LOCK_MARKER_PHASE31F,
  PARTNER_ECOSYSTEM_RC_MASTER_VERIFY_SCRIPT,
  PARTNER_ECOSYSTEM_RC_ONE_LINE_CRITERION,
  PARTNER_ECOSYSTEM_RC_PREREQUISITE_EVIDENCE_TAGS,
  PARTNER_ECOSYSTEM_RC_PRODUCT_CROSS_LINK,
  PARTNER_ECOSYSTEM_RC_PROGRAM_MARKER,
  PARTNER_ECOSYSTEM_RC_RUNBOOK_PATHS,
  PARTNER_ECOSYSTEM_RC_SUB_PHASES,
  PARTNER_ECOSYSTEM_RC_SUB_VERIFY_SCRIPTS,
  PARTNER_ECOSYSTEM_RC_VERSION,
} from "./partner-ecosystem-rc-lock";

describe("partner-ecosystem-rc-lock (Phase 31-F)", () => {
  it("defines Phase 31-F marker and evidence tag", () => {
    expect(PARTNER_ECOSYSTEM_RC_LOCK_MARKER_PHASE31F).toBe("phase31f-partner-ecosystem-rc-gate");
    expect(PARTNER_ECOSYSTEM_RC_VERSION).toBe("31-F.1");
    expect(PARTNER_ECOSYSTEM_RC_EVIDENCE_TAG).toContain("PHASE31F");
  });

  it("lists 31-A through 31-F sub-phases", () => {
    expect(Object.keys(PARTNER_ECOSYSTEM_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(PARTNER_ECOSYSTEM_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-partner-ecosystem-rc",
    );
    expect(PARTNER_ECOSYSTEM_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 30-F and 29-F prerequisite evidence", () => {
    expect(PARTNER_ECOSYSTEM_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-ENTERPRISE-SCALE-PHASE30F-RC",
    );
  });

  it("cross-links enterprise scale and revenue ops RCs", () => {
    expect(PARTNER_ECOSYSTEM_RC_PRODUCT_CROSS_LINK.enterpriseScaleMasterVerify).toBe(
      "verify:aibeopchin-enterprise-scale-rc",
    );
    expect(PARTNER_ECOSYSTEM_RC_PROGRAM_MARKER).toBe("phase31a-partner-program-gate");
  });

  it("lists runbooks and evidence tags", () => {
    expect(PARTNER_ECOSYSTEM_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(PARTNER_ECOSYSTEM_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(PARTNER_ECOSYSTEM_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(PARTNER_ECOSYSTEM_RC_ONE_LINE_CRITERION).toContain("Product Phase 31 RC");
  });
});
