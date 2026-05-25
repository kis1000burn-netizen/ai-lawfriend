/**
 * Product Phase 44-A — CaseSummaryPack SSOT.
 */
import type { CaseSummaryPackResult } from "./case-summary-pack.schema";

export const CASE_SUMMARY_PACK_REGISTRY_MARKER_44A =
  "phase44a-case-summary-pack-registry" as const;

export const COURT_READY_CASE_RECORD_PACK_DEFAULT_SCOPE_SLUG = "court-ready-case-record-pack-001" as const;

type CaseSummaryPackItem = Omit<CaseSummaryPackResult["items"][number], "defined">;

export const CASE_SUMMARY_PACK_ITEMS: CaseSummaryPackItem[] = [
  { itemId: "CASE_FACTS_SUMMARY", label: "Case facts summary section", required: true },
  { itemId: "PARTY_ROLES_SUMMARY", label: "Party roles summary", required: true },
  { itemId: "PROCEDURAL_POSTURE", label: "Procedural posture summary", required: true },
  { itemId: "NEUTRAL_TONE_CHECK", label: "Neutral tone for court-ready summary", required: true },
  { itemId: "SUMMARY_LAWYER_REVIEW", label: "Lawyer review of case summary", required: true },
];
