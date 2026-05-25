/**
 * Product Phase 59-E — Reusable Legal Pattern schema SSOT.
 * @see docs/gongbuho/AIBEOPCHIN_GONGBUHO_REUSABLE_LEGAL_PATTERN_PHASE59E.md
 */
import { z } from "zod";

export const PHASE59E_REUSABLE_LEGAL_PATTERN_VERSION = "59-E.1" as const;

export const PHASE59E_REUSABLE_LEGAL_PATTERN_SCHEMA_MARKER =
  "phase59e-reusable-legal-pattern-schema" as const;

export const reusableLegalPatternTypeSchema = z.enum([
  "WEAKNESS_PATTERN",
  "COUNTER_ARGUMENT_PATTERN",
  "EVIDENCE_GAP_PATTERN",
  "CLAIM_EVIDENCE_LINK_PATTERN",
  "JUDGMENT_LINK_PATTERN",
]);

export const reusableLegalPatternReuseScopeSchema = z.enum([
  "CASE_TYPE_ANONYMIZED",
  "TENANT_ONLY",
  "GLOBAL_ANONYMIZED",
]);

export const reusableLegalPatternSourceDecisionSchema = z.enum([
  "LAWYER_APPROVED",
  "LAWYER_MODIFIED",
]);

export const reusableLegalPatternStatusSchema = z.enum([
  "DRAFT",
  "APPROVED_FOR_REUSE",
  "REJECTED",
  "RETIRED",
]);

export const reusableLegalPatternSchema = z.object({
  patternId: z.string().min(1),
  sourceTraceIds: z.array(z.string().min(1)).min(1),
  tenantId: z.string().min(1).optional(),
  patternType: reusableLegalPatternTypeSchema,
  caseType: z.string().min(1),
  issueTags: z.array(z.string().min(1)),
  abstractedPattern: z.string().min(1),
  recommendedUse: z.string().min(1),
  riskNotes: z.array(z.string()),
  reuseScope: reusableLegalPatternReuseScopeSchema,
  sourceDecision: reusableLegalPatternSourceDecisionSchema,
  modifiedPatternRef: z.string().min(1).optional(),
  rawClientFactIncluded: z.literal(false),
  anonymizationVerified: z.literal(true),
  auditRef: z.string().min(1),
  status: reusableLegalPatternStatusSchema,
  clientDirectVisible: z.literal(false),
  createdAt: z.string().datetime(),
});

export const buildReusableLegalPatternInputSchema = z.object({
  patternId: z.string().min(1),
  sourceTraceIds: z.array(z.string().min(1)).min(1),
  tenantId: z.string().min(1).optional(),
  patternType: reusableLegalPatternTypeSchema,
  caseType: z.string().min(1),
  issueTags: z.array(z.string().min(1)),
  abstractedPattern: z.string().min(1),
  recommendedUse: z.string().min(1),
  riskNotes: z.array(z.string()),
  reuseScope: reusableLegalPatternReuseScopeSchema,
  sourceDecision: reusableLegalPatternSourceDecisionSchema,
  modifiedPatternRef: z.string().min(1).optional(),
  rawClientFactIncluded: z.literal(false),
  anonymizationVerified: z.literal(true),
  auditRef: z.string().min(1),
  status: reusableLegalPatternStatusSchema.default("DRAFT"),
  clientDirectVisible: z.literal(false).default(false),
  globalGovernanceApproved: z.boolean().optional(),
});

export type ReusableLegalPattern = z.infer<typeof reusableLegalPatternSchema>;
export type BuildReusableLegalPatternInput = z.infer<
  typeof buildReusableLegalPatternInputSchema
>;
