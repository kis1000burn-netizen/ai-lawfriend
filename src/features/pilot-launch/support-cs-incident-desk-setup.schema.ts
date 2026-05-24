/**
 * Product Phase 26-D — Support / CS / incident desk setup schema (Zod SSOT).
 */
import { z } from "zod";

export const SUPPORT_CS_INCIDENT_DESK_SETUP_SCHEMA_MARKER_PHASE26D =
  "phase26d-support-cs-incident-desk-setup-schema" as const;

export const SUPPORT_CS_INCIDENT_DESK_SETUP_VERSION = "26-D.1" as const;

export const supportDeskItemSchema = z.object({
  itemId: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().default(true),
  adminPath: z.string().optional(),
  runbookPath: z.string().optional(),
  configured: z.boolean(),
});

export const supportCsIncidentDeskSetupResultSchema = z.object({
  version: z.literal(SUPPORT_CS_INCIDENT_DESK_SETUP_VERSION),
  generatedAt: z.string().datetime(),
  items: z.array(supportDeskItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  supportDeskReady: z.boolean(),
});

export type SupportCsIncidentDeskSetupResult = z.infer<
  typeof supportCsIncidentDeskSetupResultSchema
>;
