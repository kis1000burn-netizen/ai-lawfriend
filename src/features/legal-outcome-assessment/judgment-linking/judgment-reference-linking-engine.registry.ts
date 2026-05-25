/**
 * Product Phase 40-B — JudgmentReferenceLinkingEngine SSOT.
 */
import type { JudgmentReferenceLinkingEngineResult } from "./judgment-reference-linking-engine.schema";

export const JUDGMENT_REFERENCE_LINKING_ENGINE_REGISTRY_MARKER_40B =
  "phase40b-judgment-reference-linking-engine-registry" as const;

export const JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_DEFAULT_SCOPE_SLUG = "judgment-grounded-outcome-assessment-001" as const;

type JudgmentReferenceLinkingEngineItem = Omit<JudgmentReferenceLinkingEngineResult["items"][number], "defined">;

export const JUDGMENT_REFERENCE_LINKING_ENGINE_ITEMS: JudgmentReferenceLinkingEngineItem[] = [
  { itemId: "ISSUE_TO_JUDGMENT_LINK", label: "Issue to judgment reference links", required: true },
  { itemId: "BURDEN_TO_JUDGMENT_LINK", label: "Burden of proof to judgment links", required: true },
  { itemId: "EVIDENCE_TYPE_TO_JUDGMENT_LINK", label: "Evidence type to judgment links", required: true },
  { itemId: "DEFENSE_TO_JUDGMENT_LINK", label: "Opponent defense to judgment links", required: true },
  { itemId: "LINKING_ENGINE_LAWYER_REVIEW", label: "Lawyer review of linking engine output", required: true },
];
