/**
 * Product Phase 62-B — Evidence Gap Detection Engine schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_DETECTION_ENGINE_PHASE62B.md
 */
import { z } from "zod";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import { strategyCandidateSchema } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.schema";
import { evidenceGapCandidateSchema } from "./phase62a-evidence-gap-candidate.schema";

export const PHASE62B_EVIDENCE_GAP_DETECTION_VERSION = "62-B.1" as const;

export const PHASE62B_EVIDENCE_GAP_DETECTION_SCHEMA_MARKER =
  "phase62b-evidence-gap-detection-engine-schema" as const;

export const evidenceGapDetectionAxisSchema = z.enum([
  "CLAIM_EVIDENCE",
  "FACT_EVIDENCE",
  "STRATEGY_EVIDENCE",
  "JUDGMENT_CASE_MATERIAL",
]);

export type EvidenceGapDetectionAxis = z.infer<typeof evidenceGapDetectionAxisSchema>;

export const evidenceGapDetectionSummarySchema = z.object({
  totalGapCount: z.number().int().nonnegative(),
  criticalGapCount: z.number().int().nonnegative(),
  highPriorityGapCount: z.number().int().nonnegative(),
  supplementDraftCount: z.number().int().nonnegative(),
});

export type EvidenceGapDetectionSummary = z.infer<typeof evidenceGapDetectionSummarySchema>;

export const evidenceGapDetectionExcludedItemsSchema = z.object({
  missingSourceTraceCount: z.number().int().nonnegative(),
  unapprovedSignalSourceCount: z.number().int().nonnegative(),
  aiCandidateMemorySourceCount: z.number().int().nonnegative(),
  crossTenantSourceCount: z.number().int().nonnegative(),
});

export type EvidenceGapDetectionExcludedItems = z.infer<
  typeof evidenceGapDetectionExcludedItemsSchema
>;

export const evidenceGapDetectionReportSchema = z.object({
  marker: z.literal(PHASE62B_EVIDENCE_GAP_DETECTION_SCHEMA_MARKER),
  version: z.literal(PHASE62B_EVIDENCE_GAP_DETECTION_VERSION),
  reportId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  sourceStrategyCandidateIds: z.array(z.string().min(1)),
  detectedCandidates: z.array(evidenceGapCandidateSchema),
  detectionSummary: evidenceGapDetectionSummarySchema,
  excludedItems: evidenceGapDetectionExcludedItemsSchema,
  auditRef: z.string().min(1),
  clientVisible: z.literal(false),
  autoTaskCreationAllowed: z.literal(false),
  autoFilingAllowed: z.literal(false),
  lawyerReviewRequired: z.literal(true),
  phase62VerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62b"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  detectedAt: z.string().datetime(),
});

export type EvidenceGapDetectionReport = z.infer<typeof evidenceGapDetectionReportSchema>;

export const detectEvidenceGapsInputSchema = z.object({
  reportId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  strategyCandidates: z.array(strategyCandidateSchema).default([]),
  auditRef: z.string().min(1),
});

export type DetectEvidenceGapsInput = z.infer<typeof detectEvidenceGapsInputSchema>;
