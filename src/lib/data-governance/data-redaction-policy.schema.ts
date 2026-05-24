/**
 * Phase 19-B — Data redaction policy schemas (19-A tier → output path).
 */
import { z } from "zod";
import { dataSensitivityTierSchema } from "./data-retention-policy.schema";

export const DATA_GOVERNANCE_REDACTION_POLICY_MARKER_PHASE19B =
  "phase19b-data-redaction-policy-registry-tier" as const;

export const dataRedactionSurfaceSchema = z.enum([
  "DISPLAY",
  "EXPORT",
  "AUDIT_PERSIST",
  "OPERATIONS_PAYLOAD",
]);

export const dataRedactionOutputPathSchema = z.enum([
  "AUDIT_LOG_METADATA",
  "RETRY_JOB_FAILURE_PAYLOAD",
  "EXTERNAL_MESSAGE_PAYLOAD",
  "DOCUMENT_PIPELINE_FAILURE_PAYLOAD",
  "AI_AUDIT_METADATA",
  "CASE_INTELLIGENCE_SNAPSHOT",
  "LITIGATION_EXTRACTED_TEXT",
  "VOICE_TRANSCRIPT_TEXT",
]);

export const dataRedactionAudienceSchema = z.enum([
  "OPERATIONS",
  "LEGAL_WORKSPACE",
  "CLIENT",
]);

export const dataRedactionPolicyEntrySchema = z.object({
  outputPath: dataRedactionOutputPathSchema,
  sourcePrismaModel: z.string().min(1),
  sensitivityTier: dataSensitivityTierSchema,
  surfaces: z.array(dataRedactionSurfaceSchema).min(1),
  forbiddenKeyPatterns: z.array(z.string()).min(1),
  allowedKeyAllowlist: z.array(z.string()).optional(),
  maxStringLength: z.number().int().positive().optional(),
  contentFieldPaths: z.array(z.string()).optional(),
  notes: z.string().min(1),
  crosswalkRef: z.string().optional(),
});

export type DataRedactionSurface = z.infer<typeof dataRedactionSurfaceSchema>;
export type DataRedactionOutputPath = z.infer<typeof dataRedactionOutputPathSchema>;
export type DataRedactionAudience = z.infer<typeof dataRedactionAudienceSchema>;
export type DataRedactionPolicyEntry = z.infer<typeof dataRedactionPolicyEntrySchema>;

export type DataRedactionContext = {
  outputPath: DataRedactionOutputPath;
  surface: DataRedactionSurface;
  audience?: DataRedactionAudience;
};

export type DataRedactionResult = {
  value: unknown;
  redacted: boolean;
  redactionApplied: string[];
  outputPath: DataRedactionOutputPath;
  surface: DataRedactionSurface;
};

export const DATA_REDACTION_PLACEHOLDER = "[REDACTED:REGISTRY_TIER]" as const;
export const DATA_REDACTION_LEGAL_SENSITIVE_PLACEHOLDER =
  "[REDACTED:LEGAL_SENSITIVE]" as const;
export const DATA_REDACTION_PII_PLACEHOLDER = "[REDACTED:PII]" as const;

export type DataRedactionRegistryValidationResult = {
  ok: boolean;
  violations: Array<{ outputPath: string; code: string; message: string }>;
};
