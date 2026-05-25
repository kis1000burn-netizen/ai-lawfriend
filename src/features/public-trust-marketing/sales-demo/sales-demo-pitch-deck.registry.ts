/**
 * Product Phase 33-B — Sales demo / pitch deck slides SSOT.
 */
import type { SalesDemoPitchDeckPackResult } from "./sales-demo-pitch-deck.schema";

export const SALES_DEMO_PITCH_DECK_REGISTRY_MARKER_PHASE33B =
  "phase33b-sales-demo-pitch-deck-registry" as const;

type PitchDeckSlide = Omit<SalesDemoPitchDeckPackResult["slides"][number], "prepared">;

export const PITCH_DECK_SLIDES: PitchDeckSlide[] = [
  { slideId: "PRODUCT_OVERVIEW", label: "Product overview and ICP", required: true },
  { slideId: "WORKFLOW_DEMO", label: "End-to-end workflow demo script", required: true },
  {
    slideId: "ENTERPRISE_DIFFERENTIATORS",
    label: "Enterprise scale and partner ecosystem (Phase 30-31)",
    required: true,
  },
  { slideId: "PRICING_HANDOFF", label: "Pricing and sales handoff (Phase 28-D)", required: true },
  { slideId: "SECURITY_APPENDIX", label: "Security appendix link (Phase 32)", required: true },
];
