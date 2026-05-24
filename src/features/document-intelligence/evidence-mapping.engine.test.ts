import { describe, expect, it } from "vitest";
import { analyzeLitigationDocumentContent } from "./document-analysis.engine";
import { analyzeOpponentBriefContent } from "./opponent-brief-analysis.engine";
import { buildEvidenceMappingEngineContext } from "./evidence-mapping.context";
import { runEvidenceMappingEngine } from "./evidence-mapping.engine";
import type { loadEvidenceMappingCaseContext } from "./evidence-mapping.repository";

type EvidenceMappingCaseContext = Awaited<ReturnType<typeof loadEvidenceMappingCaseContext>>;

describe("evidence-mapping.engine (Phase 13-F)", () => {
  const pages = [
    {
      pageNumber: 1,
      text: "2024.03.01 계좌이체 3,000만원 입금 내역",
      confidence: 0.95,
    },
    {
      pageNumber: 2,
      text: "원고가 지급한 금원은 투자금에 해당하며 대여금이 아니다. 금전 수령 사실은 인정한다.",
      confidence: 0.95,
    },
  ];

  it("maps claims to evidence candidates with sourceRefs", () => {
    const priorAnalysis = analyzeLitigationDocumentContent({
      fileId: "file-evidence",
      caseId: "case-1",
      documentType: "FINANCIAL_EVIDENCE",
      originalFileName: "계좌거래내역.pdf",
      pages: [pages[0]!],
    });

    const opponentAnalysis = analyzeOpponentBriefContent({
      fileId: "file-answer",
      caseId: "case-1",
      documentType: "OPPONENT_ANSWER",
      originalFileName: "피고답변서.pdf",
      pages: [pages[1]!],
      priorAnalysis: analyzeLitigationDocumentContent({
        fileId: "file-answer",
        caseId: "case-1",
        documentType: "OPPONENT_ANSWER",
        originalFileName: "피고답변서.pdf",
        pages: [pages[1]!],
      }),
    });

    const ctx = buildEvidenceMappingEngineContext({
      caseRow: {
        id: "case-1",
        title: "대여금 반환",
        description: "의뢰인은 대여금이라고 주장",
        category: "CIVIL",
        opponentName: "피고",
      },
      litigationFiles: [
        {
          id: "file-evidence",
          originalFileName: "계좌거래내역.pdf",
          extractions: [
            {
              pagesJson: [{ pageNumber: 1, text: pages[0]!.text, confidence: 0.95 }],
            },
          ],
          classifications: [
            {
              documentType: "FINANCIAL_EVIDENCE",
            },
          ],
          analyses: [
            {
              analysisStatus: "AI_ANALYZED",
              analysisJson: priorAnalysis,
            },
          ],
          opponentBriefAnalyses: [],
        },
        {
          id: "file-answer",
          originalFileName: "피고답변서.pdf",
          extractions: [
            {
              pagesJson: [{ pageNumber: 2, text: pages[1]!.text, confidence: 0.95 }],
            },
          ],
          classifications: [{ documentType: "OPPONENT_ANSWER" }],
          analyses: [
            {
              analysisStatus: "AI_ANALYZED",
              analysisJson: analyzeLitigationDocumentContent({
                fileId: "file-answer",
                caseId: "case-1",
                documentType: "OPPONENT_ANSWER",
                originalFileName: "피고답변서.pdf",
                pages: [pages[1]!],
              }),
            },
          ],
          opponentBriefAnalyses: [
            {
              analysisStatus: "AI_ANALYZED",
              analysisJson: opponentAnalysis,
            },
          ],
        },
      ],
      interviews: [
        {
          id: "iv-1",
          status: "COMPLETED",
          answersJson: { loanNature: "대여금이며 차용증은 없습니다" },
        },
      ],
      attachments: [],
      supplementRequests: [],
      intelligenceSnapshot: null,
    } as unknown as EvidenceMappingCaseContext);

    expect(ctx).not.toBeNull();
    const result = runEvidenceMappingEngine(ctx!);

    expect(result.mappingStatus).toBe("AI_MAPPED");
    expect(result.claimEvidenceLinks.length + result.unsupportedClaims.length).toBeGreaterThan(0);
    expect(result.contradictedClaims.length).toBeGreaterThan(0);
    expect(result.claimEvidenceLinks[0]?.sourceRefs.length).toBeGreaterThan(0);
    expect(result.claimEvidenceLinks[0]?.reviewStatus).toBe("NEEDS_LAWYER_REVIEW");
    expect(result.claimEvidenceLinks[0]?.description).toContain("후보");
  });

  it("does not emit forbidden final judgment fields", () => {
    const ctx = buildEvidenceMappingEngineContext({
      caseRow: {
        id: "case-2",
        title: "테스트",
        description: null,
        category: null,
        opponentName: null,
      },
      litigationFiles: [],
      interviews: [],
      attachments: [],
      supplementRequests: [],
      intelligenceSnapshot: null,
    } as unknown as EvidenceMappingCaseContext);

    expect(ctx).not.toBeNull();
    const result = runEvidenceMappingEngine({
      ...ctx!,
      documentAnalyses: [],
      opponentBriefAnalyses: [],
      evidenceFiles: [],
    });

    expect(result).not.toHaveProperty("evidenceConfirmed");
    expect(result).not.toHaveProperty("claimProven");
  });
});
