import { describe, expect, it } from "vitest";
import {
  IMPLEMENTATION_READINESS_RC_BOUNDARY,
  IMPLEMENTATION_READINESS_RC_DOCS,
  IMPLEMENTATION_READINESS_RC_EVIDENCE_TAG,
  IMPLEMENTATION_READINESS_RC_EVIDENCE_TAGS,
  IMPLEMENTATION_READINESS_RC_LOCK_MARKER_PHASE36F,
  IMPLEMENTATION_READINESS_RC_MASTER_VERIFY_SCRIPT,
  IMPLEMENTATION_READINESS_RC_ONE_LINE_CRITERION,
  IMPLEMENTATION_READINESS_RC_PREREQUISITE_EVIDENCE_TAGS,
  IMPLEMENTATION_READINESS_RC_PRODUCT_CROSS_LINK,
  IMPLEMENTATION_READINESS_RC_PROJECT_PLAN_GATE_MARKER,
  IMPLEMENTATION_READINESS_RC_RUNBOOK_PATHS,
  IMPLEMENTATION_READINESS_RC_SUB_PHASES,
  IMPLEMENTATION_READINESS_RC_SUB_VERIFY_SCRIPTS,
  IMPLEMENTATION_READINESS_RC_VERSION,
} from "./implementation-readiness-rc-lock";

describe("implementation-readiness-rc-lock (Phase 36-F)", () => {
  it("defines Phase 36-F marker and evidence tag", () => {
    expect(IMPLEMENTATION_READINESS_RC_LOCK_MARKER_PHASE36F).toBe(
      "phase36f-implementation-readiness-rc-gate",
    );
    expect(IMPLEMENTATION_READINESS_RC_VERSION).toBe("36-F.1");
    expect(IMPLEMENTATION_READINESS_RC_EVIDENCE_TAG).toContain("PHASE36F");
  });

  it("lists 36-A through 36-F sub-phases", () => {
    expect(Object.keys(IMPLEMENTATION_READINESS_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(IMPLEMENTATION_READINESS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-implementation-readiness-rc",
    );
    expect(IMPLEMENTATION_READINESS_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 35-F prerequisite evidence", () => {
    expect(IMPLEMENTATION_READINESS_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-CONTRACTING-LEGAL-OPS-PHASE35F-RC",
    );
  });

  it("cross-links contracting legal ops RC", () => {
    expect(IMPLEMENTATION_READINESS_RC_PRODUCT_CROSS_LINK.contractingLegalOpsMasterVerify).toBe(
      "verify:aibeopchin-contracting-legal-ops-rc",
    );
    expect(IMPLEMENTATION_READINESS_RC_PROJECT_PLAN_GATE_MARKER).toBe(
      "phase36a-implementation-project-plan-gate",
    );
  });

  it("declares implementation policy-only boundary", () => {
    expect(IMPLEMENTATION_READINESS_RC_BOUNDARY.noAutoTenantProvisioning).toBe(
      "NO_AUTO_TENANT_PROVISIONING",
    );
    expect(IMPLEMENTATION_READINESS_RC_BOUNDARY.noAutoGoLive).toBe("NO_AUTO_GO_LIVE");
  });

  it("lists runbooks and evidence tags", () => {
    expect(IMPLEMENTATION_READINESS_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(IMPLEMENTATION_READINESS_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(IMPLEMENTATION_READINESS_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(IMPLEMENTATION_READINESS_RC_ONE_LINE_CRITERION).toContain("Implementation Readiness RC");
  });
});
