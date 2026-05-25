import { describe, expect, it } from "vitest";
import {
  EVIDENCE_INTEGRITY_RC_BOUNDARY,
  EVIDENCE_INTEGRITY_RC_DOCS,
  EVIDENCE_INTEGRITY_RC_EVIDENCE_TAG,
  EVIDENCE_INTEGRITY_RC_EVIDENCE_TAGS,
  EVIDENCE_INTEGRITY_RC_FILE_HASH_GATE_MARKER,
  EVIDENCE_INTEGRITY_RC_LEGAL_RELIABILITY_NEXT_PHASES,
  EVIDENCE_INTEGRITY_RC_LOCK_MARKER_PHASE42F,
  EVIDENCE_INTEGRITY_RC_MASTER_VERIFY_SCRIPT,
  EVIDENCE_INTEGRITY_RC_ONE_LINE_CRITERION,
  EVIDENCE_INTEGRITY_RC_PREREQUISITE_EVIDENCE_TAGS,
  EVIDENCE_INTEGRITY_RC_PRODUCT_CROSS_LINK,
  EVIDENCE_INTEGRITY_RC_RUNBOOK_PATHS,
  EVIDENCE_INTEGRITY_RC_SUB_PHASES,
  EVIDENCE_INTEGRITY_RC_SUB_VERIFY_SCRIPTS,
  EVIDENCE_INTEGRITY_RC_VERSION,
} from "./evidence-integrity-rc-lock";

describe("evidence-integrity-rc-lock (Phase 42-F)", () => {
  it("defines Phase 42-F marker and evidence tag", () => {
    expect(EVIDENCE_INTEGRITY_RC_LOCK_MARKER_PHASE42F).toBe("phase42f-evidence-integrity-rc-gate");
    expect(EVIDENCE_INTEGRITY_RC_VERSION).toBe("42-F.1");
    expect(EVIDENCE_INTEGRITY_RC_EVIDENCE_TAG).toContain("PHASE42F");
  });

  it("lists 42-A through 42-F sub-phases", () => {
    expect(Object.keys(EVIDENCE_INTEGRITY_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("requires 41-F prerequisite evidence", () => {
    expect(EVIDENCE_INTEGRITY_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
    );
  });

  it("declares evidence integrity boundaries", () => {
    expect(EVIDENCE_INTEGRITY_RC_BOUNDARY.noAiExtractReplacesOriginal).toBe(
      "NO_AI_EXTRACT_REPLACES_ORIGINAL",
    );
    expect(EVIDENCE_INTEGRITY_RC_BOUNDARY.originalEvidenceTraceRequired).toBe(
      "ORIGINAL_EVIDENCE_TRACE_REQUIRED",
    );
  });

  it("points to legal reliability next phases", () => {
    expect(EVIDENCE_INTEGRITY_RC_LEGAL_RELIABILITY_NEXT_PHASES).toContain(
      "47 — Legal Reliability RC",
    );
  });

  it("wires master verify", () => {
    expect(EVIDENCE_INTEGRITY_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-evidence-integrity-rc",
    );
    expect(EVIDENCE_INTEGRITY_RC_FILE_HASH_GATE_MARKER).toBe(
      "phase42a-evidence-file-hash-original-preservation-gate",
    );
    expect(EVIDENCE_INTEGRITY_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(EVIDENCE_INTEGRITY_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(EVIDENCE_INTEGRITY_RC_ONE_LINE_CRITERION).toContain("증거");
  });
});
