import { describe, expect, it } from "vitest";
import {
  PILOT_OPERATIONS_RC_DOCS,
  PILOT_OPERATIONS_RC_EVIDENCE_TAG,
  PILOT_OPERATIONS_RC_EVIDENCE_TAGS,
  PILOT_OPERATIONS_RC_LOCK_MARKER_PHASE27F,
  PILOT_OPERATIONS_RC_MASTER_VERIFY_SCRIPT,
  PILOT_OPERATIONS_RC_ONE_LINE_CRITERION,
  PILOT_OPERATIONS_RC_PREREQUISITE_EVIDENCE_TAGS,
  PILOT_OPERATIONS_RC_PRODUCT_CROSS_LINK,
  PILOT_OPERATIONS_RC_RUNBOOK_PATHS,
  PILOT_OPERATIONS_RC_SUB_PHASES,
  PILOT_OPERATIONS_RC_SUB_VERIFY_SCRIPTS,
  PILOT_OPERATIONS_RC_USAGE_MONITORING_MARKER,
  PILOT_OPERATIONS_RC_VERSION,
} from "./pilot-operations-rc-lock";

describe("pilot-operations-rc-lock (Phase 27-F)", () => {
  it("defines Phase 27-F marker and evidence tag", () => {
    expect(PILOT_OPERATIONS_RC_LOCK_MARKER_PHASE27F).toBe("phase27f-pilot-operations-rc-gate");
    expect(PILOT_OPERATIONS_RC_VERSION).toBe("27-F.1");
    expect(PILOT_OPERATIONS_RC_EVIDENCE_TAG).toContain("PHASE27F");
  });

  it("lists 27-A through 27-F sub-phases", () => {
    expect(Object.keys(PILOT_OPERATIONS_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(PILOT_OPERATIONS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-pilot-operations-rc",
    );
    expect(PILOT_OPERATIONS_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 26-F and 25-F prerequisite evidence", () => {
    expect(PILOT_OPERATIONS_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-PILOT-PHASE26F-RC",
    );
  });

  it("cross-links pilot launch and ops RCs", () => {
    expect(PILOT_OPERATIONS_RC_PRODUCT_CROSS_LINK.pilotLaunchMasterVerify).toBe(
      "verify:aibeopchin-pilot-launch-rc",
    );
    expect(PILOT_OPERATIONS_RC_USAGE_MONITORING_MARKER).toBe(
      "phase27a-pilot-usage-monitoring-gate",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(PILOT_OPERATIONS_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(PILOT_OPERATIONS_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(PILOT_OPERATIONS_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(PILOT_OPERATIONS_RC_ONE_LINE_CRITERION).toContain("Product Phase 27 RC");
  });
});
