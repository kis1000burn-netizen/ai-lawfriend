/**
 * Product Phase 40-C — IssueBurdenEvidenceJudgmentMapping SSOT.
 */
import type { IssueBurdenEvidenceJudgmentMappingResult } from "./issue-burden-evidence-judgment-mapping.schema";

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_REGISTRY_MARKER_40C =
  "phase40c-issue-burden-evidence-judgment-mapping-registry" as const;

export const JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "judgment-grounded-outcome-assessment-001" as const;

type IssueBurdenEvidenceJudgmentMappingItem = Omit<IssueBurdenEvidenceJudgmentMappingResult["items"][number], "defined">;

export const ISSUE_BURDEN_EVIDENCE_JUDGMENT_MAPPING_ITEMS: IssueBurdenEvidenceJudgmentMappingItem[] = [
  { itemId: "CLAIM_SECTION_JUDGMENTS", label: "Claim section judgment references", required: true },
  { itemId: "ISSUE_SECTION_JUDGMENTS", label: "Issue section judgment references", required: true },
  { itemId: "BURDEN_SECTION_JUDGMENTS", label: "Burden of proof section judgment references", required: true },
  { itemId: "EVIDENCE_SECTION_JUDGMENTS", label: "Evidence strength section judgment references", required: true },
  { itemId: "OPPONENT_SECTION_JUDGMENTS", label: "Opponent argument section judgment references", required: true },
  { itemId: "OUTCOME_SCENARIO_JUDGMENTS", label: "Outcome scenario judgment references", required: true },
];
