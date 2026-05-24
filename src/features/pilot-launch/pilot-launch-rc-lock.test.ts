import { describe, expect, it } from "vitest";
import {
  PILOT_LAUNCH_RC_DOCS,
  PILOT_LAUNCH_RC_EVIDENCE_TAG,
  PILOT_LAUNCH_RC_EVIDENCE_TAGS,
  PILOT_LAUNCH_RC_LOCK_MARKER_PHASE26F,
  PILOT_LAUNCH_RC_MASTER_VERIFY_SCRIPT,
  PILOT_LAUNCH_RC_ONE_LINE_CRITERION,
  PILOT_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS,
  PILOT_LAUNCH_RC_PRODUCT_CROSS_LINK,
  PILOT_LAUNCH_RC_RUNBOOK_PATHS,
  PILOT_LAUNCH_RC_STAGING_SMOKE_MARKER,
  PILOT_LAUNCH_RC_SUB_PHASES,
  PILOT_LAUNCH_RC_SUB_VERIFY_SCRIPTS,
  PILOT_LAUNCH_RC_VERSION,
} from "./pilot-launch-rc-lock";

describe("pilot-launch-rc-lock (Phase 26-F)", () => {
  it("defines Phase 26-F marker and evidence tag", () => {
    expect(PILOT_LAUNCH_RC_LOCK_MARKER_PHASE26F).toBe("phase26f-pilot-launch-rc-gate");
    expect(PILOT_LAUNCH_RC_VERSION).toBe("26-F.1");
    expect(PILOT_LAUNCH_RC_EVIDENCE_TAG).toContain("PHASE26F");
  });

  it("lists 26-A through 26-F sub-phases", () => {
    expect(Object.keys(PILOT_LAUNCH_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(PILOT_LAUNCH_RC_MASTER_VERIFY_SCRIPT).toBe("verify:aibeopchin-pilot-launch-rc");
    expect(PILOT_LAUNCH_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 25-F and 16-D prerequisite evidence", () => {
    expect(PILOT_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-PHASE25F-RC",
    );
  });

  it("cross-links production launch and product RCs", () => {
    expect(PILOT_LAUNCH_RC_PRODUCT_CROSS_LINK.productionLaunchMasterVerify).toBe(
      "verify:aibeopchin-production-launch-rc",
    );
    expect(PILOT_LAUNCH_RC_STAGING_SMOKE_MARKER).toBe(
      "phase26a-staging-e2e-commercial-smoke-gate",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(PILOT_LAUNCH_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(PILOT_LAUNCH_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(PILOT_LAUNCH_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(PILOT_LAUNCH_RC_ONE_LINE_CRITERION).toContain("Product Phase 26 RC");
  });
});
