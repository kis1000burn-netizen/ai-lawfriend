/**
 * Product Phase 44-D — JudgmentProcedurePack service.
 */
import {
  COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
  JUDGMENT_PROCEDURE_PACK_ITEMS,
} from "./judgment-procedure-pack.registry";
import { assembleJudgmentProcedurePack } from "./judgment-procedure-pack.policy";
import type { JudgmentProcedurePackResult } from "./judgment-procedure-pack.schema";

export const JUDGMENT_PROCEDURE_PACK_SERVICE_MARKER_44D =
  "phase44d-judgment-procedure-pack-service" as const;

export function buildJudgmentProcedurePack(input?: {
  casePackScopeSlug?: string;
  definedItemIds?: string[];
}): JudgmentProcedurePackResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      JUDGMENT_PROCEDURE_PACK_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleJudgmentProcedurePack({
    casePackScopeSlug: input?.casePackScopeSlug ?? COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
