/**
 * Phase 13-D — blocks forbidden final-judgment fields.
 */
import {
  documentAnalysisResultSchema,
  FORBIDDEN_DOCUMENT_ANALYSIS_KEYS,
  type DocumentAnalysisResult,
} from "./document-analysis.schema";

export const PHASE13D_DOCUMENT_ANALYSIS_VALIDATOR_MARKER =
  "PHASE13D_DOCUMENT_ANALYSIS_VALIDATOR" as const;

/** Blocks: finalLegalConclusion, winningProbability, courtWillLikely, confirmedFact, filingReady, clientVisible, deadlineFinalDueAt */
export { FORBIDDEN_DOCUMENT_ANALYSIS_KEYS };

function assertNoForbiddenKeys(input: unknown, path = ""): void {
  if (!input || typeof input !== "object") return;

  if (Array.isArray(input)) {
    input.forEach((item, i) => assertNoForbiddenKeys(item, `${path}[${i}]`));
    return;
  }

  for (const key of Object.keys(input)) {
    if (
      (FORBIDDEN_DOCUMENT_ANALYSIS_KEYS as readonly string[]).includes(key)
    ) {
      throw new Error(
        `13-D forbidden analysis field: ${path ? `${path}.` : ""}${key}`,
      );
    }
    assertNoForbiddenKeys(
      (input as Record<string, unknown>)[key],
      path ? `${path}.${key}` : key,
    );
  }
}

function assertAllItemsNeedLawyerReview(result: DocumentAnalysisResult): void {
  const withCitation = [
    ...result.claims,
    ...result.facts,
    ...result.requests,
    ...result.evidenceRefs,
    ...result.deadlineCandidates,
    ...result.legalIssueCandidates,
  ];

  for (const item of withCitation) {
    if (item.reviewStatus !== "NEEDS_LAWYER_REVIEW") {
      throw new Error("13-D: all extracted items must default to NEEDS_LAWYER_REVIEW");
    }
    if (!item.citation?.snippet) {
      throw new Error("13-D: citation required for extracted item");
    }
  }

  for (const risk of result.riskSignals) {
    if (risk.reviewStatus !== "NEEDS_LAWYER_REVIEW") {
      throw new Error("13-D: risk signal must be NEEDS_LAWYER_REVIEW");
    }
  }
}

export function validateDocumentAnalysisResult(
  input: unknown,
): DocumentAnalysisResult {
  assertNoForbiddenKeys(input);
  const parsed = documentAnalysisResultSchema.parse(input);
  assertAllItemsNeedLawyerReview(parsed);
  return parsed;
}
