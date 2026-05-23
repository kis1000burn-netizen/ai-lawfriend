import { describe, expect, it } from "vitest";

import {
  buildCaseIntelligenceGraphDraft,
  buildInterviewAnswerClaims,
  CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD,
  CASE_SUMMARY_PROVENANCE_MAP_MARKER,
} from "./case-summary-provenance-map";

describe("case-summary-provenance-map Phase 9-D", () => {
  it("exposes marker and output spec mapping", () => {
    expect(CASE_SUMMARY_PROVENANCE_MAP_MARKER).toBe(
      "PHASE9D_CASE_SUMMARY_PROVENANCE_MAP",
    );
    expect(CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD.case_overview).toBe("caseOverview");
    expect(CASE_SUMMARY_OUTPUT_SPEC_TO_API_FIELD.fact_summary).toBe("timeline");
  });

  it("builds claims from interview answers with sources", () => {
    const claims = buildInterviewAnswerClaims({
      caseId: "c1",
      answers: { case_background: "2025년 3월 임금 미지급" },
      gongbuhoLegalBasisRef: "GongbuhoPacket.WAGE_BACKPAY",
    });
    expect(claims.length).toBe(1);
    expect(claims[0]?.sources[0]?.kind).toBe("INTERVIEW_ANSWER");
    expect(claims[0]?.legalBasis?.[0]?.ref).toBe("GongbuhoPacket.WAGE_BACKPAY");
    expect(claims[0]?.lawyerReviewState).toBe("NOT_REVIEWED");
  });

  it("builds graph draft", () => {
    const draft = buildCaseIntelligenceGraphDraft({
      caseId: "c1",
      generatedAt: new Date().toISOString(),
      caseSummaryAiMode: "RULE_BASED",
      answers: { desired_result: "임금 지급" },
    });
    expect(draft.graphVersion).toBe("9-D.1");
    expect(draft.claims.length).toBeGreaterThan(0);
  });
});
