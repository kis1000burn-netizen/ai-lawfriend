/**
 * Product Phase 38-B — Quarterly business review pack SSOT.
 */
import type { QuarterlyBusinessReviewPackResult } from "./quarterly-business-review-pack.schema";

export const QUARTERLY_BUSINESS_REVIEW_REGISTRY_MARKER_PHASE38B =
  "phase38b-quarterly-business-review-registry" as const;

type QuarterlyBusinessReviewItem = Omit<
  QuarterlyBusinessReviewPackResult["items"][number],
  "defined"
>;

export const QUARTERLY_BUSINESS_REVIEW_ITEMS: QuarterlyBusinessReviewItem[] = [
  { itemId: "QBR_AGENDA_TEMPLATE", label: "QBR agenda template", required: true },
  { itemId: "USAGE_METRICS_DASHBOARD", label: "Usage metrics dashboard pack", required: true },
  { itemId: "VALUE_REALIZATION_STORY", label: "Value realization narrative", required: true },
  { itemId: "ACTION_ITEMS_TRACKER", label: "Action items tracker", required: true },
  { itemId: "EXECUTIVE_SUMMARY", label: "Executive summary deck", required: true },
];
