import { describe, expect, it } from "vitest";
import {
  EVIDENCE_MAPPING_VERSION,
  FORBIDDEN_EVIDENCE_MAPPING_KEYS,
} from "./evidence-mapping.schema";
import { validateEvidenceMappingResult } from "./evidence-mapping-validator";

describe("evidence-mapping-validator (Phase 13-F)", () => {
  const sourceRef = {
    sourceKind: "DOCUMENT_ANALYSIS_13D" as const,
    sourceFileId: "file-1",
    snippet: "금전 수령 사실은 인정한다.",
    reason: "13-D 주장 후보",
  };

  const validResult = {
    version: EVIDENCE_MAPPING_VERSION,
    caseId: "case-1",
    mappingStatus: "AI_MAPPED" as const,
    inputSummary: {
      documentAnalysisCount: 1,
      opponentBriefAnalysisCount: 0,
      interviewAnswerCount: 1,
      litigationEvidenceFileCount: 1,
      caseAttachmentCount: 0,
      existingSupplementItemCount: 0,
    },
    claimEvidenceLinks: [
      {
        itemId: "cel-1",
        itemKind: "CLAIM_EVIDENCE_LINK" as const,
        claimText: "금전 수령",
        claimParty: "OPPONENT" as const,
        mappingKind: "SUPPORTS" as const,
        description: "이 주장과 연결 가능한 증거 후보가 있습니다.",
        confidence: 0.8,
        sourceRefs: [sourceRef],
        reviewStatus: "NEEDS_LAWYER_REVIEW" as const,
      },
    ],
    unsupportedClaims: [],
    contradictedClaims: [],
    missingEvidenceRequests: [],
    clientConfirmationQuestions: [],
    evidenceStrengthCandidates: [],
    issueMappingCandidates: [],
    supplementRequestDrafts: [],
  };

  it("accepts valid evidence mapping result", () => {
    const parsed = validateEvidenceMappingResult(validResult);
    expect(parsed.claimEvidenceLinks).toHaveLength(1);
  });

  it("blocks forbidden keys", () => {
    expect(FORBIDDEN_EVIDENCE_MAPPING_KEYS).toContain("evidenceConfirmed");
    expect(() =>
      validateEvidenceMappingResult({
        ...validResult,
        evidenceConfirmed: true,
      }),
    ).toThrow(/13-F forbidden evidence mapping field/);
  });
});
