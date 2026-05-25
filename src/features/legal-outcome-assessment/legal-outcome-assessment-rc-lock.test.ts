import { describe, expect, it } from "vitest";
import {
  LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY,
  LEGAL_OUTCOME_ASSESSMENT_RC_DOCS,
  LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG,
  LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAGS,
  LEGAL_OUTCOME_ASSESSMENT_RC_JUDGMENT_CORPUS_GATE_MARKER,
  LEGAL_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE40F,
  LEGAL_OUTCOME_ASSESSMENT_RC_MASTER_VERIFY_SCRIPT,
  LEGAL_OUTCOME_ASSESSMENT_RC_ONE_LINE_CRITERION,
  LEGAL_OUTCOME_ASSESSMENT_RC_PREREQUISITE_EVIDENCE_TAGS,
  LEGAL_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK,
  LEGAL_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS,
  LEGAL_OUTCOME_ASSESSMENT_RC_SUB_PHASES,
  LEGAL_OUTCOME_ASSESSMENT_RC_SUB_VERIFY_SCRIPTS,
  LEGAL_OUTCOME_ASSESSMENT_RC_VERSION,
} from "./legal-outcome-assessment-rc-lock";

describe("legal-outcome-assessment-rc-lock (Phase 40-F)", () => {
  it("defines Phase 40-F marker and evidence tag", () => {
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_LOCK_MARKER_PHASE40F).toBe(
      "phase40f-judgment-grounded-outcome-assessment-rc-gate",
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_VERSION).toBe("40-F.2");
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAG).toContain("PHASE40F");
  });

  it("lists 40-A through 40-F sub-phases", () => {
    expect(Object.keys(LEGAL_OUTCOME_ASSESSMENT_RC_SUB_PHASES)).toHaveLength(6);
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_SUB_PHASES["40-A"]).toContain("Judgment Corpus");
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-legal-outcome-assessment-rc",
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 39-F and legal-track prerequisite evidence", () => {
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-STRATEGIC-ACCOUNT-EXPANSION-PHASE39F-RC",
    );
  });

  it("cross-links strategic account expansion RC", () => {
    expect(
      LEGAL_OUTCOME_ASSESSMENT_RC_PRODUCT_CROSS_LINK.strategicAccountExpansionMasterVerify,
    ).toBe("verify:aibeopchin-strategic-account-expansion-rc");
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_JUDGMENT_CORPUS_GATE_MARKER).toBe(
      "phase40a-judgment-corpus-source-registry-gate",
    );
  });

  it("declares judgment-grounded outcome assessment boundaries", () => {
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY.noJudgmentlessLegalAssessment).toBe(
      "NO_JUDGMENTLESS_LEGAL_ASSESSMENT",
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY.noUncitedPrecedentClaim).toBe(
      "NO_UNCITED_PRECEDENT_CLAIM",
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY.noClientVisibleJudgmentPrediction).toBe(
      "NO_CLIENT_VISIBLE_JUDGMENT_PREDICTION",
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY.lawyerReviewRequired).toBe(
      "LAWYER_REVIEW_REQUIRED",
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_BOUNDARY.officialOrLicensedSourceRequired).toBe(
      "OFFICIAL_OR_LICENSED_SOURCE_REQUIRED",
    );
  });

  it("lists runbooks and evidence tags", () => {
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(LEGAL_OUTCOME_ASSESSMENT_RC_ONE_LINE_CRITERION).toContain("판결문");
  });
});
