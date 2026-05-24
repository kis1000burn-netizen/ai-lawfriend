import { describe, expect, it } from "vitest";
import {
  DOCUMENT_TYPES_REQUIRING_DUAL_ANALYSIS,
  LEGAL_DOCUMENT_INTELLIGENCE_VERSION,
  litigationDocumentAnalysisBundleSchema,
  parseLitigationDocumentAnalysisBundle,
  requiresDualAnalysisForDocumentType,
} from "./document-intelligence-engine.schema";

describe("document-intelligence-engine.schema (Phase 13-A)", () => {
  const minimalBundle = {
    bundleVersion: LEGAL_DOCUMENT_INTELLIGENCE_VERSION,
    uploadedFileId: "file-1",
    caseId: "case-1",
    narrativeSummary: "피고 답변서 요약",
    structuredData: {
      documentType: "OPPONENT_ANSWER",
      claims: ["투자금 주장"],
      admissions: ["금전 수령 사실 인정"],
      denials: ["대여금 부인"],
      evidenceRefs: ["을 제1호증"],
    },
    recordComparison: {
      conflictsWithCaseRecord: ["의뢰인: 대여 / 상대: 투자"],
      additionalConfirmationNeeded: ["투자계약서 존재 여부"],
    },
    lawyerActionRecommendations: [
      { actionText: "의뢰인에게 투자계약서 확인" },
    ],
    citations: [
      {
        citationId: "cit-1",
        sourceFileId: "file-1",
        pageNumber: 3,
        paragraphIndex: 2,
        excerpt: "해당 금원은 투자금이다",
        confidence: "HIGH",
      },
    ],
  };

  it("parses 5-part analysis bundle", () => {
    const parsed = parseLitigationDocumentAnalysisBundle(minimalBundle);
    expect(parsed.analysisStatus).toBe("NEEDS_LAWYER_REVIEW");
    expect(parsed.structuredData.documentType).toBe("OPPONENT_ANSWER");
    expect(parsed.citations).toHaveLength(1);
  });

  it("rejects bundle without narrative summary", () => {
    const result = litigationDocumentAnalysisBundleSchema.safeParse({
      ...minimalBundle,
      narrativeSummary: "",
    });
    expect(result.success).toBe(false);
  });

  it("flags dual analysis document types", () => {
    expect(requiresDualAnalysisForDocumentType("OPPONENT_ANSWER")).toBe(true);
    expect(requiresDualAnalysisForDocumentType("CONTRACT_EVIDENCE")).toBe(false);
    expect(DOCUMENT_TYPES_REQUIRING_DUAL_ANALYSIS).toContain("JUDGMENT");
  });
});
