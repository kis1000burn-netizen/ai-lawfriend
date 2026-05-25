/**
 * Product Phase 46-C — LawyerControlledExportScope policy SSOT.
 */
import { LAWYER_CONTROLLED_EXPORT_SCOPE_ITEMS, NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG } from "./lawyer-controlled-export-scope.registry";
import type { LawyerControlledExportScopeResult } from "./lawyer-controlled-export-scope.schema";
import { LAWYER_CONTROLLED_EXPORT_SCOPE_VERSION } from "./lawyer-controlled-export-scope.schema";

export const LAWYER_CONTROLLED_EXPORT_SCOPE_POLICY_MARKER_46C =
  "phase46c-lawyer-controlled-export-scope-policy" as const;

export const LAWYER_CONTROLLED_EXPORT_SCOPE_GATE_MARKER_46C =
  "phase46c-lawyer-controlled-export-scope-gate" as const;

export const NEUTRAL_PACK_BOUNDARY_LAWYER_CONTROLLED_EXPORT_ONLY =
  "LAWYER_CONTROLLED_EXPORT_ONLY" as const;
export const NEUTRAL_PACK_BOUNDARY_NO_OPPOSING_PARTY_AUTO_SHARE =
  "NO_OPPOSING_PARTY_AUTO_SHARE" as const;


export function assembleLawyerControlledExportScope(input: {
  neutralPackScopeSlug: string;
  definedItemIds: Set<string>;
  generatedAt?: string;
}): LawyerControlledExportScopeResult {
  const items = LAWYER_CONTROLLED_EXPORT_SCOPE_ITEMS.map((item) => ({
    ...item,
    defined: input.definedItemIds.has(item.itemId),
  }));

  const required = items.filter((item) => item.required);
  const definedRequired = required.filter((item) => item.defined).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((definedRequired / required.length) * 100);

  return {
    version: LAWYER_CONTROLLED_EXPORT_SCOPE_VERSION,
    neutralPackScopeSlug: input.neutralPackScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    items,
    completionRate,
    lawyerControlledExportScopeReady: definedRequired === required.length,
    lawyerReviewRequired: true,
  };
}
