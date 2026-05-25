/**
 * Product Phase 48 — Legal Reliability Lawyer Workbench shared types (Zod SSOT).
 */
import { z } from "zod";

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_PANEL_IDS = [
  "overview",
  "radar",
  "graph",
  "judgment",
  "evidence",
  "court-ready",
  "explainability",
  "neutral",
] as const;

export const legalReliabilityLawyerWorkbenchPanelIdSchema = z.enum(
  LEGAL_RELIABILITY_LAWYER_WORKBENCH_PANEL_IDS,
);

export const legalReliabilityLawyerWorkbenchRouteSchema = z.object({
  caseId: z.string().min(1),
  panel: legalReliabilityLawyerWorkbenchPanelIdSchema.optional(),
  drawer: z.enum(["judgment"]).optional(),
});

export type LegalReliabilityLawyerWorkbenchPanelId = z.infer<
  typeof legalReliabilityLawyerWorkbenchPanelIdSchema
>;
