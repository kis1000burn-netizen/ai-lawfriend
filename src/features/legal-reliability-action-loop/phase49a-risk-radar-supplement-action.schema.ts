/**
 * Product Phase 49-A — Risk Radar → Supplement Request Action schema SSOT.
 */
import { z } from "zod";

export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_VERSION = "49-A.1" as const;

export const PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_MARKER =
  "phase49a-legal-reliability-risk-radar-supplement-action" as const;

export const PHASE49A_SUPPLEMENT_REQUEST_SOURCE_TYPE =
  "LEGAL_RELIABILITY_RISK_RADAR" as const;

export const PHASE49A_SUPPLEMENT_ITEM_SOURCE_MARKER =
  "phase49a-legal-reliability-risk-radar-supplement-action" as const;

export const riskRadarRiskTypeSchema = z.enum([
  "EVIDENCE_GAP",
  "FACT_INCONSISTENCY",
  "OPPONENT_ATTACK_EXPECTED",
  "JUDGMENT_SUPPORT_WEAK",
  "COURT_READY_SECTION_INCOMPLETE",
  "CLIENT_EXPLANATION_NEEDED",
]);

export const riskRadarSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const riskRadarSignalSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  sourcePhase: z.literal("48-B"),
  riskType: riskRadarRiskTypeSchema,
  title: z.string().min(1),
  internalReason: z.string().min(1),
  linkedClaimIds: z.array(z.string()).optional(),
  linkedEvidenceIds: z.array(z.string()).optional(),
  linkedJudgmentIds: z.array(z.string()).optional(),
  severity: riskRadarSeveritySchema,
  clientVisibleDefault: z.literal(false),
  requiresLawyerReview: z.literal(true),
});

export const supplementActionCandidateStatusSchema = z.enum([
  "CANDIDATE",
  "LAWYER_REVIEWING",
  "LAWYER_APPROVED",
  "LAWYER_REJECTED",
  "LAWYER_EDITED",
  "SUPPLEMENT_DRAFT_CREATED",
  "SUPPLEMENT_SENT",
  "CLIENT_RESPONDED",
  "RESOLVED",
]);

export const lawyerActionDecisionTypeSchema = z.enum([
  "APPROVE_SUPPLEMENT_REQUEST",
  "EDIT_SUPPLEMENT_REQUEST",
  "REJECT_SUPPLEMENT_REQUEST",
  "DEFER_SUPPLEMENT_REQUEST",
]);

export const supplementActionCandidateSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  sourceRiskRadarSignalId: z.string(),
  actionType: z.literal("SUPPLEMENT_REQUEST"),
  status: supplementActionCandidateStatusSchema,
  lawyerFacingTitle: z.string(),
  lawyerFacingReason: z.string(),
  proposedClientRequestTitle: z.string(),
  proposedClientRequestBody: z.string(),
  clientVisibleRiskLabel: z.string().optional(),
  prohibitedClientTextRemoved: z.boolean(),
  linkedClaimIds: z.array(z.string()),
  linkedEvidenceIds: z.array(z.string()),
  linkedJudgmentIds: z.array(z.string()),
  decisionLedgerRequired: z.literal(true),
  supplementRequestId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createSupplementCandidateFromRiskRadarInputSchema = z.object({
  signal: riskRadarSignalSchema,
});

export const decideSupplementCandidateInputSchema = z.object({
  decision: lawyerActionDecisionTypeSchema,
  editedClientRequestTitle: z.string().optional(),
  editedClientRequestBody: z.string().optional(),
  rejectionReason: z.string().optional(),
  deferReason: z.string().optional(),
});

export type RiskRadarSignal = z.infer<typeof riskRadarSignalSchema>;
export type SupplementActionCandidate = z.infer<typeof supplementActionCandidateSchema>;
export type SupplementActionCandidateStatus = z.infer<typeof supplementActionCandidateStatusSchema>;
export type LawyerActionDecisionType = z.infer<typeof lawyerActionDecisionTypeSchema>;
export type CreateSupplementCandidateFromRiskRadarInput = z.infer<
  typeof createSupplementCandidateFromRiskRadarInputSchema
>;
export type DecideSupplementCandidateInput = z.infer<typeof decideSupplementCandidateInputSchema>;
