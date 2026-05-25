/**
 * Product Phase 40-C — IssueBurdenEvidenceJudgmentMapping policy SSOT.
 */
import { ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEMS } from "./issue-burden-evidence-judgment-mapping.registry";
import type { IssueBurdenEvidenceJudgmentMappingResult } from "./issue-burden-evidence-judgment-mapping.schema";
import { ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_VERSION } from "./issue-burden-evidence-judgment-mapping.schema";

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_POLICY_MARKER_40C =
  "phase40c-issue-burden-evidence-judgment-mapping-policy" as const;

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_GATE_MARKER_40C =
  "phase40c-issue-burden-evidence-judgment-mapping-gate" as const;

export const JUDGMENT_GROUNDED_BOUNDARY_LAWYER_REVIEW_REQUIRED =
  "LAWYER_REVIEW_REQUIRED" as const;

export const JUDGMENT_MAPPING_BOUNDARY_NO_JUDGMENTLESS =
  "NO_JUDGMENTLESS_LEGAL_ASSESSMENT" as const;

export function assembleIssueBurdenEvidenceJudgmentMapping(input: {
  caseAssessmentScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): IssueBurdenEvidenceJudgmentMappingResult {
  const items = ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_VERSION,
    caseAssessmentScopeSlug: input.caseAssessmentScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    issueBurdenEvidenceJudgmentMappingReady: definedRequired === required.length,
    lawyerReviewRequired: true,
    sections: [
      {
        sectionType: "ISSUE" as const,
        summary: "Contract termination issue matrix with judgment references",
        judgmentReferences: [
          {
            judgmentId: "judgment-sample-001",
            courtName: "대법원",
            caseNumber: "20XX다XXXXX",
            decisionDate: "2020-01-01",
            title: "Contract termination judgment sample",
            sourceType: "OFFICIAL" as const,
            holdingSummary: "Contract termination requires material breach",
            relevantParagraphs: [
              {
                paragraphId: "p-001",
                textExcerpt: "Material breach standard excerpt",
                relevanceReason: "Same termination issue",
              },
            ],
            similarity: {
              factSimilarityScore: 72,
              legalIssueSimilarityScore: 85,
              distinctionRisk: "MEDIUM" as const,
            },
            lawyerReviewStatus: "NEEDS_REVIEW" as const,
          },
        ],
        noJudgmentFallbackAllowed: false as const,
        lawyerReviewRequired: true as const,
      },
    ],
  };
}
