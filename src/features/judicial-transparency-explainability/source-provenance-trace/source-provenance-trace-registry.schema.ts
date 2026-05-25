/**
 * Product Phase 45-A — SourceProvenanceTraceRegistry schema (Zod SSOT).
 */
import { z } from "zod";

export const SOURCE_PROVENANCE_TRACE_REGISTRY_SCHEMA_MARKER_45A =
  "phase45a-source-provenance-trace-registry-schema" as const;

export const SOURCE_PROVENANCE_TRACE_REGISTRY_VERSION = "45-A.1" as const;

export const SOURCE_PROVENANCE_TRACE_REGISTRY_ITEM_IDS = [
  "EVIDENCE_USED_INDEX",
  "EXCLUDED_MATERIALS_LOG",
  "SOURCE_CITATION_LINK",
  "PROVENANCE_LAWYER_REVIEW",
] as const;

export const sourceprovenancetraceregistryItemSchema = z.object({
  itemId: z.enum(SOURCE_PROVENANCE_TRACE_REGISTRY_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const sourceprovenancetraceregistryResultSchema = z.object({
  version: z.literal("45-A.1"),
  explainabilityScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(sourceprovenancetraceregistryItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  sourceProvenanceTraceRegistryReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type SourceProvenanceTraceRegistryItemId = (typeof SOURCE_PROVENANCE_TRACE_REGISTRY_ITEM_IDS)[number];
export type SourceProvenanceTraceRegistryResult = z.infer<typeof sourceprovenancetraceregistryResultSchema>;
