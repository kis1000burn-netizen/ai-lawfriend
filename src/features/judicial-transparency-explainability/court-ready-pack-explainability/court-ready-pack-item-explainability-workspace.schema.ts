/**
 * Product Phase 45-E — CourtReadyPackItemExplainabilityWorkspace schema (Zod SSOT).
 */
import { z } from "zod";
import { aiExplainabilityTraceSchema } from "../shared/judicial-transparency-explainability-types.schema";

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_SCHEMA_MARKER_45E =
  "phase45e-court-ready-pack-item-explainability-workspace-schema" as const;

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_VERSION = "45-E.1" as const;

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEM_IDS = [
  "PACK_ITEM_EXPLAINABILITY_MAP",
  "CANDIDATE_JUDGMENT_RATIONALE",
  "EXPLAINABILITY_LAWYER_GATE",
  "NO_CLIENT_EXPLAINABILITY_LEAK",
] as const;

export const courtreadypackitemexplainabilityworkspaceItemSchema = z.object({
  itemId: z.enum(COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const courtreadypackitemexplainabilityworkspaceResultSchema = z.object({
  version: z.literal("45-E.1"),
  explainabilityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(courtreadypackitemexplainabilityworkspaceItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  courtReadyPackItemExplainabilityWorkspaceReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
  sampleExplainabilityTrace: aiExplainabilityTraceSchema,
});

export type CourtReadyPackItemExplainabilityWorkspaceItemId = (typeof COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEM_IDS)[number];
export type CourtReadyPackItemExplainabilityWorkspaceResult = z.infer<typeof courtreadypackitemexplainabilityworkspaceResultSchema>;
