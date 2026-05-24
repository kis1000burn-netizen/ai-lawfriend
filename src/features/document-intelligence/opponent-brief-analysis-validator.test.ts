import { describe, expect, it } from "vitest";
import {
  FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS,
  OPPONENT_BRIEF_ANALYSIS_VERSION,
} from "./opponent-brief-analysis.schema";
import { validateOpponentBriefAnalysisResult } from "./opponent-brief-analysis-validator";

describe("opponent-brief-analysis-validator (Phase 13-E)", () => {
  const citation = {
    pageNumber: 1,
    snippet: "금전 수령 사실은 인정한다.",
    reason: "인정 표현 후보",
  };

  const validResult = {
    version: OPPONENT_BRIEF_ANALYSIS_VERSION,
    fileId: "file-1",
    caseId: "case-1",
    analysisStatus: "AI_ANALYZED" as const,
    documentType: "OPPONENT_ANSWER" as const,
    opponentPositionSummary: {
      oneLine: "상대방 답변서 입장 요약 후보",
      keyPoints: ["투자금 주장 후보"],
    },
    admissions: [
      {
        text: "금전 수령 사실은 인정한다.",
        confidence: 0.9,
        citation,
        reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
      },
    ],
    denials: [],
    defenses: [],
    newArguments: [],
    contradictionCandidates: [],
    rebuttalIssueCandidates: [],
    clientConfirmationQuestions: [],
    evidenceRequests: [],
    draftContext: {
      responseIssueCandidates: ["반박 쟁점 후보"],
      requiredEvidenceCandidates: ["계좌내역"],
      missingMaterialCandidates: [],
      preparatoryBriefContextNote: "준비서면 컨텍스트 후보",
      reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
    },
  };

  it("accepts valid opponent brief analysis", () => {
    const parsed = validateOpponentBriefAnalysisResult(validResult);
    expect(parsed.admissions).toHaveLength(1);
  });

  it("blocks forbidden keys", () => {
    expect(FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS).toContain(
      "opponentClaimIsWrong",
    );
    expect(FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS).toContain(
      "winningProbability",
    );

    expect(() =>
      validateOpponentBriefAnalysisResult({
        ...validResult,
        winningProbability: 0.9,
      }),
    ).toThrow(/13-E forbidden opponent brief field/);
  });

  it("requires NEEDS_LAWYER_REVIEW on items", () => {
    expect(() =>
      validateOpponentBriefAnalysisResult({
        ...validResult,
        admissions: [
          {
            ...validResult.admissions[0],
            reviewStatus: "LAWYER_CONFIRMED",
          },
        ],
      }),
    ).toThrow(/NEEDS_LAWYER_REVIEW/);
  });
});
