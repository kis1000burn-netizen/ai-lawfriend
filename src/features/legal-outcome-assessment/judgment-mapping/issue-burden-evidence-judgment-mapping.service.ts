/**
 * Product Phase 40-C — IssueBurdenEvidenceJudgmentMapping service.
 */
import {
  JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
  ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEMS,
} from "./issue-burden-evidence-judgment-mapping.registry";
import { assembleIssueBurdenEvidenceJudgmentMapping } from "./issue-burden-evidence-judgment-mapping.policy";
import type { IssueBurdenEvidenceJudgmentMappingResult } from "./issue-burden-evidence-judgment-mapping.schema";

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_SERVICE_MARKER_40C =
  "phase40c-issue-burden-evidence-judgment-mapping-service" as const;

export function buildIssueBurdenEvidenceJudgmentMapping(input?: {
  caseAssessmentScopeSlug?: string;
  definedItemIds?: string[];
}): IssueBurdenEvidenceJudgmentMappingResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleIssueBurdenEvidenceJudgmentMapping({
    caseAssessmentScopeSlug: input?.caseAssessmentScopeSlug ?? JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
