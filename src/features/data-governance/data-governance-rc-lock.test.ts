import { describe, expect, it } from "vitest";
import {
  DATA_GOVERNANCE_RC_EVIDENCE_TAG,
  DATA_GOVERNANCE_RC_LOCK_MARKER_PHASE19F,
  DATA_GOVERNANCE_RC_MASTER_VERIFY_SCRIPT,
  DATA_GOVERNANCE_RC_ONE_LINE_CRITERION,
  DATA_GOVERNANCE_RC_PHASE18_CROSS_LINK,
  DATA_GOVERNANCE_RC_SUB_PHASES,
  DATA_GOVERNANCE_RC_SUB_VERIFY_SCRIPTS,
  DATA_GOVERNANCE_RC_VERSION,
  DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE,
  DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE,
} from "./data-governance-rc-lock";

describe("data-governance-rc-lock (Phase 19-F)", () => {
  it("defines Phase 19-F marker, version, and master verify", () => {
    expect(DATA_GOVERNANCE_RC_LOCK_MARKER_PHASE19F).toContain("phase19f");
    expect(DATA_GOVERNANCE_RC_VERSION).toBe("19-F.1");
    expect(DATA_GOVERNANCE_RC_EVIDENCE_TAG).toContain("PHASE19F");
    expect(DATA_GOVERNANCE_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-data-governance-rc",
    );
  });

  it("lists 19-A through 19-F sub-phases", () => {
    expect(Object.keys(DATA_GOVERNANCE_RC_SUB_PHASES)).toEqual([
      "19-A",
      "19-B",
      "19-C",
      "19-D",
      "19-E",
      "19-F",
    ]);
  });

  it("wires five sub-phase verify scripts", () => {
    expect(DATA_GOVERNANCE_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
    expect(DATA_GOVERNANCE_RC_SUB_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-data-governance-phase19a",
    );
    expect(DATA_GOVERNANCE_RC_SUB_VERIFY_SCRIPTS[4]).toBe(
      "verify:aibeopchin-data-governance-phase19e",
    );
  });

  it("cross-links Phase 18 reliability and data governance console", () => {
    expect(DATA_GOVERNANCE_RC_PHASE18_CROSS_LINK.reliabilityMasterVerify).toBe(
      "verify:aibeopchin-reliability-rc",
    );
    expect(DATA_GOVERNANCE_RC_PHASE18_CROSS_LINK.dataGovernanceConsolePath).toBe(
      "/admin/operations/data-governance",
    );
  });

  it("defaults purge mode to dry-run with confirmation phrase", () => {
    expect(DATA_GOVERNANCE_PURGE_EXECUTION_DEFAULT_MODE).toBe("DRY_RUN");
    expect(DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE).toContain(
      "IRREVERSIBLE",
    );
    expect(DATA_GOVERNANCE_RC_ONE_LINE_CRITERION).toContain("dry-run");
  });
});
