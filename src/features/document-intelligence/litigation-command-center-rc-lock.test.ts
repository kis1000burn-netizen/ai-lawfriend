import { describe, expect, it } from "vitest";
import {
  LITIGATION_COMMAND_CENTER_RC_AUDIT_ACTIONS,
  LITIGATION_COMMAND_CENTER_RC_DEPENDENCY_MIGRATION_DIRS,
  LITIGATION_COMMAND_CENTER_RC_LOCK_MARKER_PHASE14E,
  LITIGATION_COMMAND_CENTER_RC_PHASE_VERIFY_SCRIPTS,
  LITIGATION_COMMAND_CENTER_RC_PREDEPLOY_EVIDENCE_TAG,
  LITIGATION_COMMAND_CENTER_RC_UI_SMOKE_TESTIDS,
  LITIGATION_COMMAND_CENTER_RC_VITEST_TARGET,
} from "./litigation-command-center-rc-lock";

describe("litigation-command-center-rc-lock (Phase 14-E)", () => {
  it("defines RC marker and evidence tag", () => {
    expect(LITIGATION_COMMAND_CENTER_RC_LOCK_MARKER_PHASE14E).toBe(
      "phase14e-litigation-command-center-rc-predeploy-closure",
    );
    expect(LITIGATION_COMMAND_CENTER_RC_PREDEPLOY_EVIDENCE_TAG).toContain("PHASE14E");
  });

  it("lists 14-A through 14-D verify scripts in order", () => {
    expect(LITIGATION_COMMAND_CENTER_RC_PHASE_VERIFY_SCRIPTS).toHaveLength(4);
    expect(LITIGATION_COMMAND_CENTER_RC_PHASE_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-legal-document-intelligence-phase14a",
    );
    expect(LITIGATION_COMMAND_CENTER_RC_PHASE_VERIFY_SCRIPTS[3]).toBe(
      "verify:aibeopchin-legal-document-intelligence-phase14d",
    );
  });

  it("depends on 13-H ops migration only", () => {
    expect(LITIGATION_COMMAND_CENTER_RC_DEPENDENCY_MIGRATION_DIRS).toContain(
      "20260524220000_litigation_operations_integration_phase13h",
    );
  });

  it("defines audit actions and UI smoke testids", () => {
    expect(LITIGATION_COMMAND_CENTER_RC_AUDIT_ACTIONS).toContain(
      "LITIGATION_CMD_CENTER_DRAFT_GENERATED",
    );
    expect(LITIGATION_COMMAND_CENTER_RC_UI_SMOKE_TESTIDS).toContain(
      "lawyer-command-center-preview",
    );
    expect(LITIGATION_COMMAND_CENTER_RC_VITEST_TARGET).toContain(
      "litigation-command-center",
    );
  });
});
