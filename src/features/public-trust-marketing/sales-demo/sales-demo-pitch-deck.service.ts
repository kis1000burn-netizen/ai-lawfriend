/**
 * Product Phase 33-B — Sales demo / pitch deck pack service.
 */
import { PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG } from "../trust-center/trust-center-content.registry";
import { PITCH_DECK_SLIDES } from "./sales-demo-pitch-deck.registry";
import { assembleSalesDemoPitchDeckPack } from "./sales-demo-pitch-deck.policy";
import type { SalesDemoPitchDeckPackResult } from "./sales-demo-pitch-deck.schema";

export const SALES_DEMO_PITCH_DECK_SERVICE_MARKER_PHASE33B =
  "phase33b-sales-demo-pitch-deck-service" as const;

export function buildSalesDemoPitchDeckPack(input?: {
  launchScopeSlug?: string;
  preparedSlideIds?: string[];
}): SalesDemoPitchDeckPackResult {
  const preparedSlideIds = new Set(
    input?.preparedSlideIds ??
      PITCH_DECK_SLIDES.filter((slide) => slide.required).map((slide) => slide.slideId),
  );

  return assembleSalesDemoPitchDeckPack({
    launchScopeSlug: input?.launchScopeSlug ?? PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG,
    preparedSlideIds,
  });
}
