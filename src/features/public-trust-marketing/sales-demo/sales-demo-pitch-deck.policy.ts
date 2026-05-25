/**
 * Product Phase 33-B — Sales demo / pitch deck pack policy SSOT.
 */
import { PITCH_DECK_SLIDES } from "./sales-demo-pitch-deck.registry";
import type { SalesDemoPitchDeckPackResult } from "./sales-demo-pitch-deck.schema";
import { SALES_DEMO_PITCH_DECK_VERSION } from "./sales-demo-pitch-deck.schema";

export const SALES_DEMO_PITCH_DECK_POLICY_MARKER_PHASE33B =
  "phase33b-sales-demo-pitch-deck-policy" as const;

export function assembleSalesDemoPitchDeckPack(input: {
  launchScopeSlug: string;
  preparedSlideIds: Set<string>;
  generatedAt?: string;
}): SalesDemoPitchDeckPackResult {
  const slides = PITCH_DECK_SLIDES.map((slide) => ({
    ...slide,
    prepared: input.preparedSlideIds.has(slide.slideId),
  }));

  const required = slides.filter((slide) => slide.required);
  const preparedRequired = required.filter((slide) => slide.prepared).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((preparedRequired / required.length) * 100);

  return {
    version: SALES_DEMO_PITCH_DECK_VERSION,
    launchScopeSlug: input.launchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    slides,
    completionRate,
    salesDemoPackReady: preparedRequired === required.length,
  };
}
