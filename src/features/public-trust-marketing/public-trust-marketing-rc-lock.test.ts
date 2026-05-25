import { describe, expect, it } from "vitest";
import {
  PUBLIC_TRUST_MARKETING_RC_BOUNDARY,
  PUBLIC_TRUST_MARKETING_RC_DOCS,
  PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAG,
  PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAGS,
  PUBLIC_TRUST_MARKETING_RC_LOCK_MARKER_PHASE33F,
  PUBLIC_TRUST_MARKETING_RC_MASTER_VERIFY_SCRIPT,
  PUBLIC_TRUST_MARKETING_RC_ONE_LINE_CRITERION,
  PUBLIC_TRUST_MARKETING_RC_PREREQUISITE_EVIDENCE_TAGS,
  PUBLIC_TRUST_MARKETING_RC_PRODUCT_CROSS_LINK,
  PUBLIC_TRUST_MARKETING_RC_RUNBOOK_PATHS,
  PUBLIC_TRUST_MARKETING_RC_SUB_PHASES,
  PUBLIC_TRUST_MARKETING_RC_SUB_VERIFY_SCRIPTS,
  PUBLIC_TRUST_MARKETING_RC_TRUST_CENTER_MARKER,
  PUBLIC_TRUST_MARKETING_RC_VERSION,
} from "./public-trust-marketing-rc-lock";

describe("public-trust-marketing-rc-lock (Phase 33-F)", () => {
  it("defines Phase 33-F marker and evidence tag", () => {
    expect(PUBLIC_TRUST_MARKETING_RC_LOCK_MARKER_PHASE33F).toBe(
      "phase33f-public-trust-marketing-rc-gate",
    );
    expect(PUBLIC_TRUST_MARKETING_RC_VERSION).toBe("33-F.1");
    expect(PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAG).toContain("PHASE33F");
  });

  it("lists 33-A through 33-F sub-phases", () => {
    expect(Object.keys(PUBLIC_TRUST_MARKETING_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(PUBLIC_TRUST_MARKETING_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-public-trust-marketing-rc",
    );
    expect(PUBLIC_TRUST_MARKETING_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 32-F prerequisite evidence", () => {
    expect(PUBLIC_TRUST_MARKETING_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
    );
  });

  it("cross-links enterprise security compliance RC", () => {
    expect(
      PUBLIC_TRUST_MARKETING_RC_PRODUCT_CROSS_LINK.enterpriseSecurityComplianceMasterVerify,
    ).toBe("verify:aibeopchin-enterprise-security-rc");
    expect(PUBLIC_TRUST_MARKETING_RC_TRUST_CENTER_MARKER).toBe(
      "phase33a-trust-center-content-gate",
    );
  });

  it("declares no unverified marketing claim boundary", () => {
    expect(PUBLIC_TRUST_MARKETING_RC_BOUNDARY.noUnverifiedMarketingClaim).toBe(
      "phase33-no-unverified-marketing-claim-boundary",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(PUBLIC_TRUST_MARKETING_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(PUBLIC_TRUST_MARKETING_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(PUBLIC_TRUST_MARKETING_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(PUBLIC_TRUST_MARKETING_RC_ONE_LINE_CRITERION).toContain("Public Trust / Marketing Launch RC");
  });
});
