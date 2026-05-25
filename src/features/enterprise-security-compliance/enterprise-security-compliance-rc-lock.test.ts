import { describe, expect, it } from "vitest";
import {
  ENTERPRISE_SECURITY_COMPLIANCE_RC_BOUNDARY,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_DOCS,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAG,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAGS,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_INVENTORY_MARKER,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_MARKER_PHASE32F,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_MASTER_VERIFY_SCRIPT,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_ONE_LINE_CRITERION,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_PREREQUISITE_EVIDENCE_TAGS,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_PRODUCT_CROSS_LINK,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK_PATHS,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_SUB_PHASES,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_SUB_VERIFY_SCRIPTS,
  ENTERPRISE_SECURITY_COMPLIANCE_RC_VERSION,
} from "./enterprise-security-compliance-rc-lock";

describe("enterprise-security-compliance-rc-lock (Phase 32-F)", () => {
  it("defines Phase 32-F marker and evidence tag", () => {
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_LOCK_MARKER_PHASE32F).toBe(
      "phase32f-enterprise-security-compliance-rc-gate",
    );
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_VERSION).toBe("32-F.1");
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAG).toContain("PHASE32F");
  });

  it("lists 32-A through 32-F sub-phases", () => {
    expect(Object.keys(ENTERPRISE_SECURITY_COMPLIANCE_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-enterprise-security-rc",
    );
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 31-F and 19-F prerequisite evidence", () => {
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-PARTNER-ECOSYSTEM-PHASE31F-RC",
    );
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC",
    );
  });

  it("cross-links partner ecosystem and data governance RCs", () => {
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_PRODUCT_CROSS_LINK.partnerEcosystemMasterVerify).toBe(
      "verify:aibeopchin-partner-ecosystem-rc",
    );
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_INVENTORY_MARKER).toBe(
      "phase32a-security-control-inventory-gate",
    );
  });

  it("declares no certification claim boundary", () => {
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_BOUNDARY.noCertificationClaim).toBe(
      "phase32-no-certification-claim-boundary",
    );
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_BOUNDARY.notClaimed).toContain("ISO27001");
  });

  it("lists runbooks and evidence tags", () => {
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(ENTERPRISE_SECURITY_COMPLIANCE_RC_ONE_LINE_CRITERION).toContain(
      "Enterprise Security / Compliance RC",
    );
  });
});
