/**
 * Phase 19-A — Data retention policy SSOT schemas (constitution · no purge jobs).
 */
import { z } from "zod";

export const DATA_GOVERNANCE_RETENTION_CONSTITUTION_MARKER_PHASE19A =
  "phase19a-data-retention-policy-constitution" as const;

/** Purge execution jobs are deferred until Phase 19-F RC explicitly unlocks. */
export const DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A = true as const;

export const dataSensitivityTierSchema = z.enum([
  "PUBLIC",
  "INTERNAL",
  "PII",
  "LEGAL_SENSITIVE",
  "AI_METADATA",
  "OPERATIONS_LOG",
]);

export const retentionDispositionSchema = z.enum([
  "RETAIN_INDEFINITE",
  "RETAIN_CASE_LIFECYCLE",
  "RETAIN_FIXED_DAYS",
  "RETAIN_UNTIL_EXPIRY",
  "PURGE_AFTER_RETENTION",
]);

export const dataRetentionDomainSchema = z.enum([
  "CASE_CORE",
  "INTERVIEW_VOICE",
  "LEGAL_DOCUMENT",
  "DOCUMENT_INTELLIGENCE",
  "CLIENT_PORTAL",
  "AI_GOVERNANCE",
  "OPERATIONS_RELIABILITY",
  "AUDIT_COMPLIANCE",
  "SPECIAL_REPORT",
]);

export const dataRetentionPolicyEntrySchema = z.object({
  prismaModel: z.string().min(1),
  domain: dataRetentionDomainSchema,
  sensitivityTier: dataSensitivityTierSchema,
  disposition: retentionDispositionSchema,
  defaultRetentionDays: z.number().int().positive().nullable(),
  purgeEligible: z.boolean(),
  legalHoldDefault: z.boolean(),
  redactionRequired: z.boolean(),
  exportRedactionRequired: z.boolean(),
  notes: z.string().min(1),
  crosswalkRef: z.string().optional(),
});

export type DataSensitivityTier = z.infer<typeof dataSensitivityTierSchema>;
export type RetentionDisposition = z.infer<typeof retentionDispositionSchema>;
export type DataRetentionDomain = z.infer<typeof dataRetentionDomainSchema>;
export type DataRetentionPolicyEntry = z.infer<typeof dataRetentionPolicyEntrySchema>;

export type DataRetentionConstitutionViolation = {
  prismaModel: string;
  code: string;
  message: string;
};

export type DataRetentionRegistryValidationResult = {
  ok: boolean;
  violations: DataRetentionConstitutionViolation[];
  missingPrismaModels: string[];
  duplicateModels: string[];
};
