/**
 * Phase 13-C — classification output validator (no legal content analysis).
 */
import {
  documentClassificationResultSchema,
  type DocumentClassificationResult,
} from "./document-classification.schema";

export const PHASE13C_DOCUMENT_CLASSIFICATION_VALIDATOR_MARKER =
  "PHASE13C_DOCUMENT_CLASSIFICATION_VALIDATOR" as const;

/** 13-C 금지: 법률 판단·쟁점·기한 확정 필드가 없어야 함 */
const FORBIDDEN_CLASSIFICATION_KEYS = [
  "legalConclusion",
  "rebuttalStrategy",
  "deadlineDate",
  "issueList",
  "draftBrief",
  "clientQuestions",
] as const;

export function validateDocumentClassificationResult(
  input: unknown,
): DocumentClassificationResult {
  const parsed = documentClassificationResultSchema.parse(input);

  if (input && typeof input === "object") {
    for (const key of FORBIDDEN_CLASSIFICATION_KEYS) {
      if (key in input) {
        throw new Error(`13-C forbidden classification field: ${key}`);
      }
    }
  }

  if (parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error("classification confidence must be between 0 and 1");
  }

  return parsed;
}

export function assertClassificationReadyForDownstreamAnalysis(
  analysisReadiness: DocumentClassificationResult["analysisReadiness"],
): boolean {
  return analysisReadiness === "READY";
}
