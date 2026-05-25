/**
 * Product Phase 44-D — JudgmentProcedurePack policy SSOT.
 */
import { JUDGMENT_PROCEDURE_PACK_ITEMS, COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG } from "./judgment-procedure-pack.registry";
import type { JudgmentProcedurePackResult } from "./judgment-procedure-pack.schema";
import { JUDGMENT_PROCEDURE_PACK_VERSION } from "./judgment-procedure-pack.schema";

export const JUDGMENT_PROCEDURE_PACK_POLICY_MARKER_44D =
  "phase44d-judgment-procedure-pack-policy" as const;

export const JUDGMENT_PROCEDURE_PACK_GATE_MARKER_44D =
  "phase44d-judgment-procedure-pack-gate" as const;


export function assembleJudgmentProcedurePack(input: {
  casePackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): JudgmentProcedurePackResult {
  const items = JUDGMENT_PROCEDURE_PACK_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: JUDGMENT_PROCEDURE_PACK_VERSION,
    casePackScopeSlug: input.casePackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    judgmentProcedurePackReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
