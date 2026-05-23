/**
 * Phase 9-D — Case Intelligence Graph schema SSOT.
 * @see docs/ai/AIBEOPCHIN_CASE_INTELLIGENCE_GRAPH_SPEC.md
 *
 * 불변 원칙: AI는 판단하지 않는다. 주장·근거·출처·모순·누락을 구조화하고, 최종 판단은 변호사가 한다.
 */
import { z } from "zod";

export const PHASE9D_CASE_INTELLIGENCE_GRAPH_MARKER =
  "PHASE9D_CASE_INTELLIGENCE_GRAPH" as const;

export const CASE_INTELLIGENCE_GRAPH_VERSION = "9-D.1" as const;

/** 주장 유형 — AI가 “판단”이 아니라 “분류”만 수행 */
export const CASE_CLAIM_TYPES = [
  "USER_CLAIM",
  "USER_STATEMENT",
  "SYSTEM_INFERENCE",
  "GONGBUHO_GUIDANCE",
  "ATTACHMENT_META",
  "STATUS_FACT",
] as const;

export type CaseClaimType = (typeof CASE_CLAIM_TYPES)[number];

export const CONFIDENCE_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const LAWYER_REVIEW_STATES = [
  "NOT_REVIEWED",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
  "EDITED",
] as const;

export type LawyerReviewState = (typeof LAWYER_REVIEW_STATES)[number];

export const AUDIENCE_VISIBILITY = ["INTERNAL", "CLIENT", "COURT_READY"] as const;
export type AudienceVisibility = (typeof AUDIENCE_VISIBILITY)[number];

export const EVIDENCE_SOURCE_KINDS = [
  "INTERVIEW_ANSWER",
  "ATTACHMENT_META",
  "GONGBUHO_PACKET",
  "GONGBUHO_TRACE",
  "CASE_STATUS",
  "SYSTEM_DERIVED",
] as const;

export type EvidenceSourceKind = (typeof EVIDENCE_SOURCE_KINDS)[number];

export const evidenceRefSchema = z.object({
  kind: z.enum(EVIDENCE_SOURCE_KINDS),
  /** e.g. InterviewAnswer.case_background, GongbuhoPacket.WAGE_BACKPAY */
  ref: z.string().min(1),
  label: z.string().optional(),
  excerpt: z.string().max(2000).optional(),
});

export type EvidenceRef = z.infer<typeof evidenceRefSchema>;

export const legalBasisRefSchema = z.object({
  /** e.g. GongbuhoPacket.WAGE_BACKPAY, outputContract.summary heading */
  ref: z.string().min(1),
  code: z.string().optional(),
  version: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type LegalBasisRef = z.infer<typeof legalBasisRefSchema>;

export const caseIntelligenceClaimSchema = z.object({
  claimId: z.string().min(1),
  text: z.string().min(1).max(4000),
  claimType: z.enum(CASE_CLAIM_TYPES),
  sources: z.array(evidenceRefSchema).min(1),
  legalBasis: z.array(legalBasisRefSchema).optional(),
  confidence: z.enum(CONFIDENCE_LEVELS),
  lawyerReviewState: z.enum(LAWYER_REVIEW_STATES).default("NOT_REVIEWED"),
  clientVisible: z.boolean(),
  audience: z.enum(AUDIENCE_VISIBILITY).default("INTERNAL"),
  /** Output spec §6 section key e.g. case_overview, fact_summary */
  outputSectionKey: z.string().optional(),
  /** API field hint e.g. caseOverview, timeline */
  apiFieldHint: z.string().optional(),
});

export type CaseIntelligenceClaim = z.infer<typeof caseIntelligenceClaimSchema>;

export const caseIntelligenceGraphSchema = z.object({
  graphVersion: z.literal(CASE_INTELLIGENCE_GRAPH_VERSION),
  caseId: z.string().min(1),
  generatedAt: z.string().datetime(),
  summaryOperation: z.enum(["CASE_SUMMARY_GENERATE", "CASE_SUMMARY_REGENERATE"]),
  caseSummaryAiMode: z.string().min(1),
  claims: z.array(caseIntelligenceClaimSchema),
  /** Phase 9-E: contradiction edges */
  contradictions: z
    .array(
      z.object({
        claimIdA: z.string(),
        claimIdB: z.string(),
        reason: z.string().max(500),
      }),
    )
    .optional(),
});

export type CaseIntelligenceGraph = z.infer<typeof caseIntelligenceGraphSchema>;

export function parseCaseIntelligenceGraph(input: unknown): CaseIntelligenceGraph {
  return caseIntelligenceGraphSchema.parse(input);
}

export function safeParseCaseIntelligenceGraph(
  input: unknown,
): z.SafeParseReturnType<unknown, CaseIntelligenceGraph> {
  return caseIntelligenceGraphSchema.safeParse(input);
}
