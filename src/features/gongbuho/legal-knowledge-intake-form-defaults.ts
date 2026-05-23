import type { z } from "zod";
import type { createLegalKnowledgeIntakeBodySchema } from "@/lib/validators/legal-knowledge-pipeline";

export type LegalKnowledgeIntakeCreatePayload = z.infer<
  typeof createLegalKnowledgeIntakeBodySchema
>;

/** 관리자 Intake 등록 폼·E2E 스모크 공통 기본값 */
export function buildLegalKnowledgeIntakeCreatePayload(input: {
  normalizedKeyword: string;
  mappedCaseType: string;
  mappingRationale?: string;
  demandStrength?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "DRAFT" | "MAPPING_PENDING" | "READY_FOR_RESEARCH";
  signalSource?: string;
}): LegalKnowledgeIntakeCreatePayload {
  const today = new Date().toISOString().slice(0, 10);

  return {
    signalSource: input.signalSource ?? "MANUAL_RESEARCH_BRIEF",
    observationWindow: { from: today, to: today },
    querySignature: {
      normalizedKeyword: input.normalizedKeyword.trim(),
      locale: "ko-KR",
    },
    questionType: {
      questionTypeCode: "QT_REMEDY",
      taxonomyVersion: "2026.05",
      confidence: "MEDIUM",
    },
    caseTypeMapping: {
      mappedCaseType: input.mappedCaseType.trim(),
      mappingRationale: input.mappingRationale?.trim() ?? "관리자 UI 수동 Intake",
      mappingConfidence: "MEDIUM",
    },
    demandStrength: input.demandStrength ?? "MEDIUM",
    intakeCompliance: {
      compilerPolicyVersion: "2026-05-23",
      noRawUgcStored: true,
      intakeMethod: "MANUAL_FORM",
    },
    status: input.status ?? "READY_FOR_RESEARCH",
  };
}
