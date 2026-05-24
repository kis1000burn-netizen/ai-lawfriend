import { describe, expect, it } from "vitest";
import { analyzeLitigationDocumentContent } from "./document-analysis.engine";
import { analyzeOpponentBriefContent } from "./opponent-brief-analysis.engine";

describe("opponent-brief-analysis.engine (Phase 13-E)", () => {
  const pages = [
    {
      pageNumber: 1,
      text: "피고는 원고의 청구를 다투며 다음과 같이 답변한다.",
      confidence: 0.96,
    },
    {
      pageNumber: 2,
      text: "원고가 지급한 금원은 투자금에 해당하며 대여금이 아니다. 금전 수령 사실은 인정한다. 변제기 부존재를 주장한다.",
      confidence: 0.95,
    },
  ];

  it("extracts admissions, denials, defenses with citations from prior 13-D analysis", () => {
    const priorAnalysis = analyzeLitigationDocumentContent({
      fileId: "file-1",
      caseId: "case-1",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "피고답변서.pdf",
      pages,
    });

    const result = analyzeOpponentBriefContent({
      fileId: "file-1",
      caseId: "case-1",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "피고답변서.pdf",
      pages,
      priorAnalysis,
    });

    expect(result.analysisStatus).toBe("AI_ANALYZED");
    expect(result.admissions.length).toBeGreaterThan(0);
    expect(result.denials.length).toBeGreaterThan(0);
    expect(result.admissions[0]?.citation.pageNumber).toBeGreaterThan(0);
    expect(result.admissions[0]?.reviewStatus).toBe("NEEDS_LAWYER_REVIEW");
    expect(result.contradictionCandidates.length).toBeGreaterThan(0);
    expect(result.clientConfirmationQuestions.length).toBeGreaterThan(0);
    expect(result.draftContext.reviewStatus).toBe("NEEDS_LAWYER_REVIEW");
  });

  it("does not emit forbidden final judgment fields", () => {
    const priorAnalysis = analyzeLitigationDocumentContent({
      fileId: "f",
      caseId: "c",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "답변서.pdf",
      pages,
    });

    const result = analyzeOpponentBriefContent({
      fileId: "f",
      caseId: "c",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "답변서.pdf",
      pages,
      priorAnalysis,
    });

    expect(result).not.toHaveProperty("winningProbability");
    expect(result).not.toHaveProperty("opponentClaimIsWrong");
    expect(result).not.toHaveProperty("filingReady");
  });
});
