import { describe, expect, it } from "vitest";
import { validateDocumentAnalysisResult } from "./document-analysis-validator";

describe("document-analysis-validator (Phase 13-D)", () => {
  const base = {
    version: "13-D.1" as const,
    fileId: "file-1",
    caseId: "case-1",
    analysisStatus: "AI_ANALYZED" as const,
    documentType: "OPPONENT_ANSWER" as const,
    summary: {
      oneLine: "피고는 금전 수령 사실은 인정하나 투자금이라고 주장합니다.",
      keyPoints: ["금전 수령 사실 인정"],
    },
    claims: [
      {
        claimType: "OPPONENT_ASSERTION" as const,
        text: "해당 금원은 대여금이 아니라 투자금이었다.",
        confidence: 0.92,
        citation: {
          pageNumber: 2,
          snippet: "원고가 지급한 금원은 투자금에 해당하며",
          reason: "상대방 핵심 주장 근거",
        },
        reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
      },
    ],
    facts: [],
    requests: [],
    evidenceRefs: [],
    deadlineCandidates: [],
    legalIssueCandidates: [],
    riskSignals: [
      {
        riskType: "CASE_THEORY_CONFLICT_CANDIDATE" as const,
        description: "기존 의뢰인 진술과 충돌 가능성",
        confidence: 0.81,
        reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
      },
    ],
  };

  it("accepts valid analysis result", () => {
    const result = validateDocumentAnalysisResult(base);
    expect(result.claims[0]?.reviewStatus).toBe("NEEDS_LAWYER_REVIEW");
  });

  it("rejects finalLegalConclusion", () => {
    expect(() =>
      validateDocumentAnalysisResult({
        ...base,
        finalLegalConclusion: "승소 가능",
      }),
    ).toThrow("forbidden");
  });

  it("rejects winningProbability nested", () => {
    expect(() =>
      validateDocumentAnalysisResult({
        ...base,
        claims: [{ ...base.claims[0], winningProbability: 0.9 }],
      }),
    ).toThrow("forbidden");
  });
});
