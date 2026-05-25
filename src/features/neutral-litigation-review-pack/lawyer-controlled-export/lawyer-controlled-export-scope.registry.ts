/**
 * Product Phase 46-C — LawyerControlledExportScope SSOT.
 */
import type { LawyerControlledExportScopeResult } from "./lawyer-controlled-export-scope.schema";

export const LAWYER_CONTROLLED_EXPORT_SCOPE_REGISTRY_MARKER_46C =
  "phase46c-lawyer-controlled-export-scope-registry" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG = "neutral-litigation-review-pack-001" as const;

type LawyerControlledExportScopeItem = Omit<LawyerControlledExportScopeResult["items"][number], "defined">;

export const LAWYER_CONTROLLED_EXPORT_SCOPE_ITEMS: LawyerControlledExportScopeItem[] = [
  { itemId: "EXPORT_SCOPE_SELECTION", label: "Lawyer export scope selection", required: true },
  { itemId: "OPPOSING_PARTY_SHARE_BLOCK", label: "Opposing party auto-share block", required: true },
  { itemId: "EXPORT_AUDIT_TRAIL", label: "Export audit trail", required: true },
  { itemId: "EXPORT_LAWYER_REVIEW", label: "Lawyer review of export scope", required: true },
];
