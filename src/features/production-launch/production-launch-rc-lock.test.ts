import { describe, expect, it } from "vitest";
import {
  PRODUCTION_LAUNCH_RC_DOCS,
  PRODUCTION_LAUNCH_RC_EVIDENCE_TAG,
  PRODUCTION_LAUNCH_RC_EVIDENCE_TAGS,
  PRODUCTION_LAUNCH_RC_GO_NO_GO_MARKER,
  PRODUCTION_LAUNCH_RC_LOCK_MARKER_PHASE25F,
  PRODUCTION_LAUNCH_RC_MASTER_VERIFY_SCRIPT,
  PRODUCTION_LAUNCH_RC_ONE_LINE_CRITERION,
  PRODUCTION_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS,
  PRODUCTION_LAUNCH_RC_PRODUCT_CROSS_LINK,
  PRODUCTION_LAUNCH_RC_RUNBOOK_PATHS,
  PRODUCTION_LAUNCH_RC_SUB_PHASES,
  PRODUCTION_LAUNCH_RC_SUB_VERIFY_SCRIPTS,
  PRODUCTION_LAUNCH_RC_VERSION,
} from "./production-launch-rc-lock";

describe("production-launch-rc-lock (Phase 25-F)", () => {
  it("defines Phase 25-F marker and evidence tag", () => {
    expect(PRODUCTION_LAUNCH_RC_LOCK_MARKER_PHASE25F).toBe("phase25f-production-launch-rc-gate");
    expect(PRODUCTION_LAUNCH_RC_VERSION).toBe("25-F.1");
    expect(PRODUCTION_LAUNCH_RC_EVIDENCE_TAG).toContain("PHASE25F");
  });

  it("lists 25-A through 25-F sub-phases", () => {
    expect(Object.keys(PRODUCTION_LAUNCH_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(PRODUCTION_LAUNCH_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-production-launch-rc",
    );
    expect(PRODUCTION_LAUNCH_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 24-F and 16-D prerequisite evidence", () => {
    expect(PRODUCTION_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC",
    );
  });

  it("cross-links go/no-go and product RCs", () => {
    expect(PRODUCTION_LAUNCH_RC_PRODUCT_CROSS_LINK.goNoGoLaunchVerify).toBe(
      "verify:aibeopchin-production-go-no-go-launch-rc",
    );
    expect(PRODUCTION_LAUNCH_RC_GO_NO_GO_MARKER).toBe("phase25a-go-no-go-gate");
  });

  it("lists runbooks and evidence tags", () => {
    expect(PRODUCTION_LAUNCH_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(PRODUCTION_LAUNCH_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(PRODUCTION_LAUNCH_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(PRODUCTION_LAUNCH_RC_ONE_LINE_CRITERION).toContain("Product Phase 25 RC");
  });
});
