/**
 * Phase 13-E — blocks forbidden final-judgment fields on opponent brief analysis.
 */
import {
  FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS,
  opponentBriefAnalysisResultSchema,
  type OpponentBriefAnalysisResult,
} from "./opponent-brief-analysis.schema";

export const PHASE13E_OPPONENT_BRIEF_ANALYSIS_VALIDATOR_MARKER =
  "PHASE13E_OPPONENT_BRIEF_ANALYSIS_VALIDATOR" as const;

/** Blocks: opponentClaimIsWrong, winningProbability, rebuttalFilingReady, confirmedIssue, clientVisible, deadlineFinalDueAt, finalLegalConclusion */
export { FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS };

function assertNoForbiddenKeys(input: unknown, path = ""): void {
  if (!input || typeof input !== "object") return;

  if (Array.isArray(input)) {
    input.forEach((item, i) => assertNoForbiddenKeys(item, `${path}[${i}]`));
    return;
  }

  for (const key of Object.keys(input)) {
    if (
      (FORBIDDEN_OPPONENT_BRIEF_ANALYSIS_KEYS as readonly string[]).includes(
        key,
      )
    ) {
      throw new Error(
        `13-E forbidden opponent brief field: ${path ? `${path}.` : ""}${key}`,
      );
    }
    assertNoForbiddenKeys(
      (input as Record<string, unknown>)[key],
      path ? `${path}.${key}` : key,
    );
  }
}

function assertAllItemsNeedLawyerReview(
  result: OpponentBriefAnalysisResult,
): void {
  const collections = [
    result.admissions,
    result.denials,
    result.defenses,
    result.newArguments,
    result.contradictionCandidates,
    result.rebuttalIssueCandidates,
    result.clientConfirmationQuestions,
    result.evidenceRequests,
  ];

  for (const items of collections) {
    for (const item of items) {
      if (item.reviewStatus !== "NEEDS_LAWYER_REVIEW") {
        throw new Error(
          "13-E: all opponent brief items must default to NEEDS_LAWYER_REVIEW",
        );
      }
      if (!item.citation?.snippet) {
        throw new Error("13-E: citation required for opponent brief item");
      }
    }
  }

  if (result.draftContext.reviewStatus !== "NEEDS_LAWYER_REVIEW") {
    throw new Error("13-E: draftContext must be NEEDS_LAWYER_REVIEW");
  }
}

export function validateOpponentBriefAnalysisResult(
  input: unknown,
): OpponentBriefAnalysisResult {
  assertNoForbiddenKeys(input);
  const parsed = opponentBriefAnalysisResultSchema.parse(input);
  assertAllItemsNeedLawyerReview(parsed);
  return parsed;
}
