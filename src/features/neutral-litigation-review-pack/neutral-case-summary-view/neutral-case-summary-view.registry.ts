/**
 * Product Phase 46-A — NeutralCaseSummaryView SSOT.
 */
import type { NeutralCaseSummaryViewResult } from "./neutral-case-summary-view.schema";

export const NEUTRAL_CASE_SUMMARY_VIEW_REGISTRY_MARKER_46A =
  "phase46a-neutral-case-summary-view-registry" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG = "neutral-litigation-review-pack-001" as const;

type NeutralCaseSummaryViewItem = Omit<NeutralCaseSummaryViewResult["items"][number], "defined">;

export const NEUTRAL_CASE_SUMMARY_VIEW_ITEMS: NeutralCaseSummaryViewItem[] = [
  { itemId: "NEUTRAL_SUMMARY_BODY", label: "Neutral case summary body", required: true },
  { itemId: "NEUTRAL_TONE_CHECK", label: "Neutral tone check", required: true },
  { itemId: "PARTY_ROLE_NEUTRALITY", label: "Party role neutrality", required: true },
  { itemId: "SUMMARY_LAWYER_REVIEW", label: "Lawyer review of summary view", required: true },
];
