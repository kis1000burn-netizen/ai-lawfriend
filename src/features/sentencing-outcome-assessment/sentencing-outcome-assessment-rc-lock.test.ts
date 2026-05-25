import { describe, expect, it } from "vitest";
import {
  SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY,
  SENTENCING_OUTCOME_ASSESSMENT_RC_DOCS,
  SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG,
  SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAGS,
  SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE41F,
  SENTENCING_OUTCOME_ASSESSMENT_RC_MASTER_VERIFY_SCRIPT,
  SENTENCING_OUTCOME_ASSESSMENT_RC_ONE_LINE_CRITERION,
  SENTENCING_OUTCOME_ASSESSMENT_RC_PREREQUISITE_EVIDENCE_TAGS,
  SENTENCING_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK,
  SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS,
  SENTENCING_OUTCOME_ASSESSMENT_RC_SENTENCING_CORPUS_GATE_MARKER,
  SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_PHASES,
  SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_VERIFY_SCRIPTS,
  SENTENCING_OUTCOME_ASSESSMENT_RC_VERSION,
} from "./sentencing-outcome-assessment-rc-lock";

describe("sentencing-outcome-assessment-rc-lock (Phase 41-F)", () => {
  it("defines Phase 41-F marker and evidence tag", () => {
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE41F).toBe(
      "phase41f-sentencing-outcome-assessment-rc-gate",
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_VERSION).toBe("41-F.1");
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG).toContain("PHASE41F");
  });

  it("lists 41-A through 41-F sub-phases", () => {
    expect(Object.keys(SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_PHASES)).toHaveLength(6);
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_PHASES["41-C"]).toContain("Sentencing Outcome");
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-sentencing-outcome-assessment-rc",
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 40-F prerequisite evidence", () => {
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
    );
  });

  it("cross-links judgment-grounded outcome assessment RC", () => {
    expect(
      SENTENCING_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK.judgmentGroundedOutcomeAssessmentMasterVerify,
    ).toBe("verify:aibeopchin-legal-outcome-assessment-rc");
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_SENTENCING_CORPUS_GATE_MARKER).toBe(
      "phase41a-criminal-judgment-sentencing-corpus-registry-gate",
    );
  });

  it("declares sentencing outcome assessment boundaries", () => {
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY.noAutomatedSentencingPrediction).toBe(
      "NO_AUTOMATED_SENTENCING_PREDICTION",
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY.noSentenceGuarantee).toBe(
      "NO_SENTENCE_GUARANTEE",
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY.noClientVisibleSentencingProbability).toBe(
      "NO_CLIENT_VISIBLE_SENTENCING_PROBABILITY",
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY.judgmentReferencesRequired).toBe(
      "JUDGMENT_REFERENCES_REQUIRED",
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_BOUNDARY.sentencingReasonRequired).toBe(
      "SENTENCING_REASON_REQUIRED",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(SENTENCING_OUTCOME_ASSESSMENT_RC_ONE_LINE_CRITERION).toContain("양형");
  });
});
