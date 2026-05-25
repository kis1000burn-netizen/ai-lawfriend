/**
 * Product Phase 46-C — LawyerControlledExportScope service.
 */
import {
  NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
  LAWYER_CONTROLLED_EXPORT_SCOPE_ITEMS,
} from "./lawyer-controlled-export-scope.registry";
import { assembleLawyerControlledExportScope } from "./lawyer-controlled-export-scope.policy";
import type { LawyerControlledExportScopeResult } from "./lawyer-controlled-export-scope.schema";

export const LAWYER_CONTROLLED_EXPORT_SCOPE_SERVICE_MARKER_46C =
  "phase46c-lawyer-controlled-export-scope-service" as const;

export function buildLawyerControlledExportScope(input?: {
  neutralPackScopeSlug?: string;
  definedItemIds?: string[];
}): LawyerControlledExportScopeResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      LAWYER_CONTROLLED_EXPORT_SCOPE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleLawyerControlledExportScope({
    neutralPackScopeSlug: input?.neutralPackScopeSlug ?? NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
