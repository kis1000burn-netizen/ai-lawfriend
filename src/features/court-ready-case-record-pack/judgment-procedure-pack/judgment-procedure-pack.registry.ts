/**
 * Product Phase 44-D — JudgmentProcedurePack SSOT.
 */
import type { JudgmentProcedurePackResult } from "./judgment-procedure-pack.schema";

export const JUDGMENT_PROCEDURE_PACK_REGISTRY_MARKER_44D =
  "phase44d-judgment-procedure-pack-registry" as const;

export const COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG = "court-ready-case-record-pack-001" as const;

type JudgmentProcedurePackItem = Omit<JudgmentProcedurePackResult["items"][number], "defined">;

export const JUDGMENT_PROCEDURE_PACK_ITEMS: JudgmentProcedurePackItem[] = [
  { itemId: "JUDGMENT_REFERENCE_INDEX", label: "Judgment reference index", required: true },
  { itemId: "CITATION_GROUNDING", label: "Citation grounding per issue", required: true },
  { itemId: "PROCEDURE_HISTORY_TIMELINE", label: "Procedure history timeline", required: true },
  { itemId: "FILING_DEADLINE_NOTES", label: "Filing deadline notes (no auto submit)", required: true },
  { itemId: "JUDGMENT_PROCEDURE_LAWYER_REVIEW", label: "Lawyer review of judgment/procedure pack", required: true },
];
