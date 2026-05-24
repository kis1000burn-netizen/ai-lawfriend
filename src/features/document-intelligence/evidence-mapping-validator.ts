/**
 * Phase 13-F — blocks forbidden final evidence/legal judgment fields.
 */
import {
  FORBIDDEN_EVIDENCE_MAPPING_KEYS,
  evidenceMappingResultSchema,
  type EvidenceMappingResult,
} from "./evidence-mapping.schema";

export const PHASE13F_EVIDENCE_MAPPING_VALIDATOR_MARKER =
  "PHASE13F_EVIDENCE_MAPPING_VALIDATOR" as const;

/** Blocks: evidenceConfirmed, claimProven, hasSufficientEvidence, winningProbability, confirmedFact, clientVisible */
/** Blocks: evidenceConfirmed, claimProven, hasSufficientEvidence, winningProbability, confirmedFact, clientVisible */
export { FORBIDDEN_EVIDENCE_MAPPING_KEYS };

function assertNoForbiddenKeys(input: unknown, path = ""): void {
  if (!input || typeof input !== "object") return;

  if (Array.isArray(input)) {
    input.forEach((item, i) => assertNoForbiddenKeys(item, `${path}[${i}]`));
    return;
  }

  for (const key of Object.keys(input)) {
    if (
      (FORBIDDEN_EVIDENCE_MAPPING_KEYS as readonly string[]).includes(key)
    ) {
      throw new Error(
        `13-F forbidden evidence mapping field: ${path ? `${path}.` : ""}${key}`,
      );
    }
    assertNoForbiddenKeys(
      (input as Record<string, unknown>)[key],
      path ? `${path}.${key}` : key,
    );
  }
}

function assertAllItemsNeedLawyerReview(result: EvidenceMappingResult): void {
  const collections = [
    result.claimEvidenceLinks,
    result.unsupportedClaims,
    result.contradictedClaims,
    result.missingEvidenceRequests,
    result.clientConfirmationQuestions,
    result.evidenceStrengthCandidates,
    result.issueMappingCandidates,
    result.supplementRequestDrafts,
  ];

  for (const items of collections) {
    for (const item of items) {
      if (item.reviewStatus !== "NEEDS_LAWYER_REVIEW") {
        throw new Error(
          "13-F: all mapping items must default to NEEDS_LAWYER_REVIEW",
        );
      }
      if (!item.sourceRefs?.length) {
        throw new Error("13-F: sourceRef required for mapping item");
      }
      for (const ref of item.sourceRefs) {
        if (!ref.snippet?.trim()) {
          throw new Error("13-F: sourceRef snippet required");
        }
      }
    }
  }
}

function assertCandidatePhrasing(result: EvidenceMappingResult): void {
  const forbiddenAssertion = /증거가\s*(?:있다|없다|충분|불충분)(?!.*후보)/;

  for (const link of result.claimEvidenceLinks) {
    if (forbiddenAssertion.test(link.description)) {
      throw new Error("13-F: use candidate phrasing for evidence linkage");
    }
  }
}

export function validateEvidenceMappingResult(
  input: unknown,
): EvidenceMappingResult {
  assertNoForbiddenKeys(input);
  const parsed = evidenceMappingResultSchema.parse(input);
  assertAllItemsNeedLawyerReview(parsed);
  assertCandidatePhrasing(parsed);
  return parsed;
}
