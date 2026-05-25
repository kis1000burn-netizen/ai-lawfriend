import { describe, expect, it } from "vitest";
import {
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_BOUNDARY,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_EVIDENCE_TAG,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_MARKER_PHASE48,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_ONE_LINE_CRITERION,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SIX_BOUNDARIES,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SUB_PHASES,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SUB_VERIFY_SCRIPTS,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_VERSION,
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_WORKBENCH_ROUTE,
} from "./legal-reliability-lawyer-workbench-rc-lock";

describe("legal-reliability-lawyer-workbench-rc-lock (Phase 48-F)", () => {
  it("defines Phase 48 marker", () => {
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_MARKER_PHASE48).toBe(
      "phase48f-legal-reliability-lawyer-workbench-rc-gate",
    );
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_VERSION).toBe("48-F.1");
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_EVIDENCE_TAG).toContain("PHASE48F");
  });

  it("declares six boundaries", () => {
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SIX_BOUNDARIES).toContain("NO_AI_FINAL_STRATEGY");
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_BOUNDARY.judgmentClickthroughRequired).toBe(
      "JUDGMENT_CLICKTHROUGH_REQUIRED",
    );
  });

  it("lists 48-A through 48-F", () => {
    expect(Object.keys(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SUB_PHASES)).toHaveLength(6);
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("wires workbench route and master verify", () => {
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_WORKBENCH_ROUTE).toContain("lawyer-workbench");
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-reliability-lawyer-workbench-rc",
    );
    expect(LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_ONE_LINE_CRITERION).toContain("Lawyer Workbench UX");
  });
});
