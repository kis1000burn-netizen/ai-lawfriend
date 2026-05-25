/**
 * Product Phase 33-B — Sales demo / pitch deck pack schema (Zod SSOT).
 */
import { z } from "zod";

export const SALES_DEMO_PITCH_DECK_SCHEMA_MARKER_PHASE33B =
  "phase33b-sales-demo-pitch-deck-schema" as const;

export const SALES_DEMO_PITCH_DECK_VERSION = "33-B.1" as const;

export const PITCH_DECK_SLIDE_IDS = [
  "PRODUCT_OVERVIEW",
  "WORKFLOW_DEMO",
  "ENTERPRISE_DIFFERENTIATORS",
  "PRICING_HANDOFF",
  "SECURITY_APPENDIX",
] as const;

export const pitchDeckSlideSchema = z.object({
  slideId: z.enum(PITCH_DECK_SLIDE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  prepared: z.boolean(),
});

export const salesDemoPitchDeckPackResultSchema = z.object({
  version: z.literal(SALES_DEMO_PITCH_DECK_VERSION),
  launchScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  slides: z.array(pitchDeckSlideSchema).min(1),
  completionRate: z.number().min(0).max(100),
  salesDemoPackReady: z.boolean(),
});

export type PitchDeckSlideId = (typeof PITCH_DECK_SLIDE_IDS)[number];
export type SalesDemoPitchDeckPackResult = z.infer<typeof salesDemoPitchDeckPackResultSchema>;
