/**
 * Product Phase 35-A — Contract template pack schema (Zod SSOT).
 */
import { z } from "zod";

export const CONTRACT_TEMPLATE_PACK_SCHEMA_MARKER_PHASE35A =
  "phase35a-contract-template-pack-schema" as const;

export const CONTRACT_TEMPLATE_PACK_VERSION = "35-A.1" as const;

export const CONTRACT_TEMPLATE_IDS = [
  "MSA",
  "ORDER_FORM",
  "SOW",
  "AMENDMENT",
  "NDA",
] as const;

export const contractTemplateItemSchema = z.object({
  templateId: z.enum(CONTRACT_TEMPLATE_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const contractTemplatePackResultSchema = z.object({
  version: z.literal(CONTRACT_TEMPLATE_PACK_VERSION),
  contractingScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  templates: z.array(contractTemplateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  contractTemplatePackReady: z.boolean(),
});

export type ContractTemplateId = (typeof CONTRACT_TEMPLATE_IDS)[number];
export type ContractTemplatePackResult = z.infer<typeof contractTemplatePackResultSchema>;
