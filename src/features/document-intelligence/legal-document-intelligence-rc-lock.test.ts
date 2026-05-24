import { describe, expect, it } from "vitest";
import {
  LEGAL_DOCUMENT_INTELLIGENCE_RC_AUDIT_ACTIONS,
  LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_MARKER_PHASE13I,
  LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS,
  LEGAL_DOCUMENT_INTELLIGENCE_RC_PHASE_VERIFY_SCRIPTS,
  LEGAL_DOCUMENT_INTELLIGENCE_RC_PREDEPLOY_EVIDENCE_TAG,
  LEGAL_DOCUMENT_INTELLIGENCE_RC_UI_SMOKE_TESTIDS,
} from "./legal-document-intelligence-rc-lock";

describe("legal-document-intelligence-rc-lock (Phase 13-I)", () => {
  it("defines RC marker and evidence tag", () => {
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_LOCK_MARKER_PHASE13I).toBe(
      "phase13i-legal-document-intelligence-rc-predeploy-closure",
    );
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_PREDEPLOY_EVIDENCE_TAG).toContain("PHASE13I");
  });

  it("lists 13-A through 13-H verify scripts in order", () => {
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_PHASE_VERIFY_SCRIPTS).toHaveLength(8);
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_PHASE_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-legal-document-intelligence",
    );
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_PHASE_VERIFY_SCRIPTS[7]).toBe(
      "verify:aibeopchin-legal-document-intelligence-phase13h",
    );
  });

  it("lists migration dirs in ascending chronological order", () => {
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS).toHaveLength(7);
    for (let i = 1; i < LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS.length; i++) {
      expect(
        LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS[i] >
          LEGAL_DOCUMENT_INTELLIGENCE_RC_MIGRATION_DIRS[i - 1],
      ).toBe(true);
    }
  });

  it("defines audit actions and UI smoke testids", () => {
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_AUDIT_ACTIONS).toContain(
      "LITIGATION_DOC_INTEL_OPS_SYNC_COMPLETED",
    );
    expect(LEGAL_DOCUMENT_INTELLIGENCE_RC_UI_SMOKE_TESTIDS).toContain("doc-intel-ops-sync");
  });
});
