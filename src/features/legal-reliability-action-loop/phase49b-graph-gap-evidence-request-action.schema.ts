/**
 * Product Phase 49-B — Graph Gap → Evidence Request Action schema SSOT.
 */
import { z } from "zod";
import {
  supplementActionCandidateStatusSchema,
} from "./phase49a-risk-radar-supplement-action.schema";

export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_VERSION = "49-B.1" as const;

export const PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_MARKER =
  "phase49b-legal-reliability-graph-gap-evidence-request-action" as const;

export const PHASE49B_EVIDENCE_REQUEST_SOURCE_TYPE =
  "LEGAL_RELIABILITY_CLAIM_GRAPH_GAP" as const;

export const PHASE49B_EVIDENCE_REQUEST_ITEM_SOURCE_MARKER =
  "phase49b-legal-reliability-graph-gap-evidence-request-action" as const;

export const claimGraphGapTypeSchema = z.enum([
  "CLAIM_EVIDENCE_DISCONNECT",
  "INSUFFICIENT_EVIDENCE",
  "JUDGMENT_NOT_LINKED",
  "PROOF_GAP",
]);

export const claimGraphGapSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const claimGraphGapSignalSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  sourcePhase: z.literal("48-C"),
  gapType: claimGraphGapTypeSchema,
  claimId: z.string().min(1),
  claimTitle: z.string().min(1),
  internalReason: z.string().min(1),
  linkedClaimIds: z.array(z.string()).optional(),
  linkedEvidenceIds: z.array(z.string()).optional(),
  linkedJudgmentIds: z.array(z.string()).optional(),
  severity: claimGraphGapSeveritySchema,
  clientVisibleDefault: z.literal(false),
  requiresLawyerReview: z.literal(true),
});

export const evidenceRequestDecisionTypeSchema = z.enum([
  "APPROVE_EVIDENCE_REQUEST",
  "EDIT_EVIDENCE_REQUEST",
  "REJECT_EVIDENCE_REQUEST",
  "DEFER_EVIDENCE_REQUEST",
]);

export const evidenceRequestActionCandidateSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  sourceClaimGraphGapId: z.string(),
  actionType: z.literal("EVIDENCE_REQUEST"),
  status: supplementActionCandidateStatusSchema,
  lawyerFacingTitle: z.string(),
  lawyerFacingReason: z.string(),
  proposedClientRequestTitle: z.string(),
  proposedClientRequestBody: z.string(),
  prohibitedClientTextRemoved: z.boolean(),
  linkedClaimIds: z.array(z.string()),
  linkedEvidenceIds: z.array(z.string()),
  linkedJudgmentIds: z.array(z.string()),
  decisionLedgerRequired: z.literal(true),
  supplementRequestId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createEvidenceRequestCandidateFromGraphGapInputSchema = z.object({
  gap: claimGraphGapSignalSchema,
});

export const decideEvidenceRequestCandidateInputSchema = z.object({
  decision: evidenceRequestDecisionTypeSchema,
  editedClientRequestTitle: z.string().optional(),
  editedClientRequestBody: z.string().optional(),
  rejectionReason: z.string().optional(),
  deferReason: z.string().optional(),
});

export type ClaimGraphGapSignal = z.infer<typeof claimGraphGapSignalSchema>;
export type EvidenceRequestActionCandidate = z.infer<typeof evidenceRequestActionCandidateSchema>;
export type EvidenceRequestDecisionType = z.infer<typeof evidenceRequestDecisionTypeSchema>;
export type CreateEvidenceRequestCandidateFromGraphGapInput = z.infer<
  typeof createEvidenceRequestCandidateFromGraphGapInputSchema
>;
export type DecideEvidenceRequestCandidateInput = z.infer<
  typeof decideEvidenceRequestCandidateInputSchema
>;
