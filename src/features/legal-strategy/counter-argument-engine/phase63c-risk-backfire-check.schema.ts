/**
 * Product Phase 63-C — Risk & Backfire Check schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_RISK_BACKFIRE_CHECK_PHASE63C.md
 */
import { z } from "zod";
import { gongbuhoReasoningContextBundleSchema } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import {
  counterArgumentCandidateSchema,
  counterArgumentSourceTraceSchema,
} from "./phase63b-counter-argument-candidate.schema";

export const PHASE63C_RISK_BACKFIRE_CHECK_VERSION = "63-C.1" as const;

export const PHASE63C_RISK_BACKFIRE_CHECK_SCHEMA_MARKER =
  "phase63c-risk-backfire-check-schema" as const;

export const backfireRiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export type BackfireRiskLevel = z.infer<typeof backfireRiskLevelSchema>;

export const backfireRiskTypeSchema = z.enum([
  "OUR_WEAKNESS_EXPOSURE",
  "INSUFFICIENT_EVIDENCE",
  "INCONSISTENT_WITH_PRIOR_STATEMENT",
  "UNFAVORABLE_JUDGMENT_LINK",
  "OVERSTATED_FACT",
  "OPPONENT_REBUTTAL_OPENING",
  "CLIENT_CONFIDENTIALITY_RISK",
]);

export type BackfireRiskType = z.infer<typeof backfireRiskTypeSchema>;

export const backfireRiskRecommendationSchema = z.enum([
  "SAFE_TO_REVIEW",
  "REVIEW_WITH_CAUTION",
  "REQUIRES_REVISION",
  "DO_NOT_USE",
]);

export type BackfireRiskRecommendation = z.infer<typeof backfireRiskRecommendationSchema>;

export const backfireRiskReportReviewStatusSchema = z.literal("LAWYER_REVIEW_REQUIRED");

export type BackfireRiskReportReviewStatus = z.infer<
  typeof backfireRiskReportReviewStatusSchema
>;

export const backfireRiskSignalSchema = z.object({
  signalId: z.string().min(1),
  riskType: backfireRiskTypeSchema,
  severity: backfireRiskLevelSchema,
  summary: z.string().min(1),
  sourceTrace: z.array(counterArgumentSourceTraceSchema).min(1),
  mitigationSuggestion: z.string().min(1),
});

export type BackfireRiskSignal = z.infer<typeof backfireRiskSignalSchema>;

export const backfireRiskReportBoundariesSchema = z.object({
  noCounterArgumentUseWithoutBackfireCheck: z.literal(true),
  noDocumentUseWhenBackfireCritical: z.literal(true),
  noClientVisibleBackfireRisk: z.literal(true),
  noOverstatedFactInCounterArgument: z.literal(true),
  noWeaknessExposureWithoutLawyerReview: z.literal(true),
  noCounterArgumentWithInconsistentSource: z.literal(true),
  noUnfavorableJudgmentIgnored: z.literal(true),
  backfireRiskReportAuditRequired: z.literal(true),
  lawyerReviewRequiredForRiskAcceptance: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const backfireRiskReportSchema = z.object({
  marker: z.literal(PHASE63C_RISK_BACKFIRE_CHECK_SCHEMA_MARKER),
  version: z.literal(PHASE63C_RISK_BACKFIRE_CHECK_VERSION),
  reportId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceCounterArgumentCandidateId: z.string().min(1),
  reasoningContextAuditRef: z.string().min(1),
  riskLevel: backfireRiskLevelSchema,
  riskSignals: z.array(backfireRiskSignalSchema),
  recommendation: backfireRiskRecommendationSchema,
  reviewStatus: backfireRiskReportReviewStatusSchema,
  documentUseAllowed: z.literal(false),
  clientVisibleAllowed: z.literal(false),
  autoFileAllowed: z.literal(false),
  boundaries: backfireRiskReportBoundariesSchema,
  auditRef: z.string().min(1),
  phase63BVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63b"),
  phase63CVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63c"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  checkedAt: z.string().datetime(),
});

export type BackfireRiskReport = z.infer<typeof backfireRiskReportSchema>;

export const buildBackfireRiskReportInputSchema = z.object({
  reportId: z.string().min(1),
  counterArgumentCandidate: counterArgumentCandidateSchema,
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  riskSignals: z.array(backfireRiskSignalSchema),
  auditRef: z.string().min(1),
});

export type BuildBackfireRiskReportInput = z.infer<typeof buildBackfireRiskReportInputSchema>;

export const runBackfireRiskCheckInputSchema = z.object({
  reportId: z.string().min(1),
  counterArgumentCandidate: counterArgumentCandidateSchema,
  reasoningContext: gongbuhoReasoningContextBundleSchema,
  auditRef: z.string().min(1),
});

export type RunBackfireRiskCheckInput = z.infer<typeof runBackfireRiskCheckInputSchema>;
