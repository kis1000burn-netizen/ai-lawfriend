import { describe, expect, it } from "vitest";
import { analyzeLitigationDocumentContent } from "./document-analysis.engine";

describe("document-analysis.engine (Phase 13-D)", () => {
  it("extracts opponent answer claims with citations", () => {
    const result = analyzeLitigationDocumentContent({
      fileId: "file-1",
      caseId: "case-1",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "피고답변서.pdf",
      pages: [
        {
          pageNumber: 1,
          text: "피고는 원고의 청구를 다투며 다음과 같이 답변한다.",
          confidence: 0.96,
        },
        {
          pageNumber: 2,
          text: "원고가 지급한 금원은 투자금에 해당하며 대여금이 아니다. 금전 수령 사실은 인정한다.",
          confidence: 0.95,
        },
      ],
    });

    expect(result.analysisStatus).toBe("AI_ANALYZED");
    expect(result.summary.oneLine).toContain("투자금");
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.claims[0]?.citation.pageNumber).toBeGreaterThan(0);
    expect(result.claims[0]?.reviewStatus).toBe("NEEDS_LAWYER_REVIEW");
    expect(result.riskSignals.some((r) => r.riskType === "CASE_THEORY_CONFLICT_CANDIDATE")).toBe(
      true,
    );
  });

  it("does not emit forbidden final judgment fields", () => {
    const result = analyzeLitigationDocumentContent({
      fileId: "f",
      caseId: "c",
      documentType: "COURT_CORRECTION_ORDER",
      originalFileName: "보정명령.pdf",
      pages: [
        {
          pageNumber: 1,
          text: "피고 주소를 보정할 것. 7일 이내 제출하라.",
          confidence: 0.9,
        },
      ],
    });

    expect(result).not.toHaveProperty("finalLegalConclusion");
    expect(result).not.toHaveProperty("winningProbability");
    expect(result.deadlineCandidates.length).toBeGreaterThan(0);
    expect(result.deadlineCandidates[0]?.text).not.toContain("deadlineFinalDueAt");
  });
});
