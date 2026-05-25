/**
 * Product Phase 41-C — SimilarSentencingOutcomeComparison policy SSOT.
 */
import { SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEMS } from "./similar-sentencing-outcome-comparison.registry";
import type { SimilarSentencingOutcomeComparisonResult } from "./similar-sentencing-outcome-comparison.schema";
import { SIMILAR_SENTENCING_OUTCOME_COMPARISON_VERSION } from "./similar-sentencing-outcome-comparison.schema";

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_POLICY_MARKER_41C =
  "phase41c-similar-sentencing-outcome-comparison-policy" as const;

export const SIMILAR_SENTENCING_OUTCOME_COMPARISON_GATE_MARKER_41C =
  "phase41c-similar-sentencing-outcome-comparison-gate" as const;

export const SENTENCING_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const SENTENCING_COMPARISON_BOUNDARY_NO_SENTENCE_GUARANTEE =
  "NO_SENTENCE_GUARANTEE" as const;

export function assembleSimilarSentencingOutcomeComparison(input: {
  sentencingAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): SimilarSentencingOutcomeComparisonResult {
  const items = SIMILAR_SENTENCING_OUTCOME_COMPARISON_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: SIMILAR_SENTENCING_OUTCOME_COMPARISON_VERSION,
    sentencingAssessmentScopeSlug: input.sentencingAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    similarSentencingOutcomeComparisonReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    clientVisibleBeforeReview: false,
    sections: [
      {
        sectionType: "SENTENCING_RANGE" as const,
        summary: "Similar fraud cases sentencing outcome distribution (judgment-based, not prediction)",
        sentencingOutcomeReferences: [{
            judgmentId: "sentencing-judgment-sample-001",
            courtName: "서울중앙지방법원",
            caseNumber: "20XX고단XXXXX",
            decisionDate: "2020-06-01",
            offenseName: "사기",
            sentenceType: "SUSPENDED_SENTENCE" as const,
            sentenceText: "징역 10월, 집행유예 2년",
            imprisonmentMonths: 10,
            suspendedSentenceYears: 2,
            sentencingReasons: {
              favorable: ["일부 피해 회복", "초범"],
              unfavorable: ["피해 규모 상당"],
              neutral: ["양형기준 참고"],
            },
            comparableFactors: {
              damageAmount: 75000000,
              settlementStatus: "PARTIAL" as const,
              priorRecord: "NONE" as const,
              confession: "PARTIAL" as const,
              victimForgiveness: true,
              restitution: true,
            },
            similarity: {
              factSimilarityScore: 78,
              sentencingFactorSimilarityScore: 82,
              distinctionRisk: "MEDIUM" as const,
            },
            lawyerReviewStatus: "NEEDS_REVIEW" as const,
          }],
        noJudgmentFallbackAllowed: false as const,
        noOutcomeGuaranteeAllowed: true as const,
        lawyerReviewRequired: true as const,
        clientVisibleBeforeReview: false as const,
      },
    ],
  };
}
