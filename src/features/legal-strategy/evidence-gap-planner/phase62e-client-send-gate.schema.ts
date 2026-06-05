/**
 * Product Phase 62-E — Client-visible Send Gate & Litigation Ops Draft Link schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_CLIENT_VISIBLE_SEND_GATE_PHASE62E.md
 */
import { z } from "zod";
import { requestedEvidenceTypeSchema } from "./phase62c-supplement-request-draft.schema";
import {
  clientPortalSupplementDraftSyncSchema,
  lawyerSupplementDecisionLedgerEntrySchema,
} from "./phase62d-lawyer-approval-portal-sync.schema";

export const PHASE62E_CLIENT_SEND_GATE_VERSION = "62-E.1" as const;

export const PHASE62E_CLIENT_SEND_GATE_SCHEMA_MARKER =
  "phase62e-client-send-gate-schema" as const;

export const finalLawyerApprovalActionSchema = z.literal("FINAL_APPROVE_FOR_CLIENT");

export type FinalLawyerApprovalAction = z.infer<typeof finalLawyerApprovalActionSchema>;

export const finalLawyerApprovalLedgerEntrySchema = z.object({
  ledgerEntryId: z.string().min(1),
  syncId: z.string().min(1),
  draftId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  lawyerId: z.string().min(1),
  action: finalLawyerApprovalActionSchema,
  portalReviewLedgerEntryId: z.string().min(1),
  auditRef: z.string().min(1),
  approvedAt: z.string().datetime(),
});

export type FinalLawyerApprovalLedgerEntry = z.infer<typeof finalLawyerApprovalLedgerEntrySchema>;

export const supplementRequestSendGateLedgerEntrySchema = z.object({
  ledgerEntryId: z.string().min(1),
  payloadId: z.string().min(1),
  syncId: z.string().min(1),
  draftId: z.string().min(1),
  lawyerId: z.string().min(1),
  action: z.literal("ENABLE_SEND_GATE"),
  finalLawyerApprovalLedgerEntryId: z.string().min(1),
  auditRef: z.string().min(1),
  enabledAt: z.string().datetime(),
});

export type SupplementRequestSendGateLedgerEntry = z.infer<
  typeof supplementRequestSendGateLedgerEntrySchema
>;

export const clientVisibleSupplementRequestItemSchema = z.object({
  portalItemId: z.string().min(1),
  clientMessage: z.string().min(1),
  requestedEvidenceType: requestedEvidenceTypeSchema,
});

export type ClientVisibleSupplementRequestItem = z.infer<
  typeof clientVisibleSupplementRequestItemSchema
>;

export const clientVisibleSendGateBoundariesSchema = z.object({
  noClientVisibleWithoutFinalLawyerApproval: z.literal(true),
  noSendWithoutSendGate: z.literal(true),
  noNotificationWithoutMessagePolicy: z.literal(true),
  noAutoLitigationTaskExecution: z.literal(true),
  noInternalStrategyLeakToClient: z.literal(true),
  noUnapprovedDraftToClientPortal: z.literal(true),
  lawyerDecisionLedgerRequired: z.literal(true),
  clientVisiblePayloadAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const clientVisibleSupplementRequestPayloadSchema = z.object({
  marker: z.literal(PHASE62E_CLIENT_SEND_GATE_SCHEMA_MARKER),
  version: z.literal(PHASE62E_CLIENT_SEND_GATE_VERSION),
  payloadId: z.string().min(1),
  syncId: z.string().min(1),
  draftId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  items: z.array(clientVisibleSupplementRequestItemSchema).min(1),
  clientVisible: z.boolean(),
  sendAllowed: z.boolean(),
  notificationAllowed: z.boolean(),
  autoTaskExecutionAllowed: z.literal(false),
  finalLawyerApprovalLedgerEntryId: z.string().min(1),
  sendGateLedgerEntryId: z.string().min(1).optional(),
  messagePolicyGateRef: z.string().min(1).optional(),
  boundaries: clientVisibleSendGateBoundariesSchema,
  auditRef: z.string().min(1),
  phase62DVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62d"),
  phase62EVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62e"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  createdAt: z.string().datetime(),
});

export type ClientVisibleSupplementRequestPayload = z.infer<
  typeof clientVisibleSupplementRequestPayloadSchema
>;

export const litigationOpsDraftLinkTargetSchema = z.enum([
  "SUPPLEMENT_REQUEST_DRAFT",
  "LITIGATION_OPS_TASK_DRAFT",
]);

export type LitigationOpsDraftLinkTarget = z.infer<typeof litigationOpsDraftLinkTargetSchema>;

export const litigationOpsDraftLinkSchema = z.object({
  linkId: z.string().min(1),
  syncId: z.string().min(1),
  draftId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  litigationOpsTarget: litigationOpsDraftLinkTargetSchema,
  linkStatus: z.literal("DRAFT_LINKED"),
  payloadId: z.string().min(1),
  autoTaskExecutionAllowed: z.literal(false),
  auditRef: z.string().min(1),
  linkedAt: z.string().datetime(),
});

export type LitigationOpsDraftLink = z.infer<typeof litigationOpsDraftLinkSchema>;

export const approvePortalDraftForClientVisibilityInputSchema = z.object({
  portalSync: clientPortalSupplementDraftSyncSchema,
  portalReviewLedgerEntry: lawyerSupplementDecisionLedgerEntrySchema,
  lawyerId: z.string().min(1),
  auditRef: z.string().min(1),
  finalLedgerEntryId: z.string().min(1).optional(),
  payloadId: z.string().min(1).optional(),
});

export const enableSupplementRequestSendGateInputSchema = z.object({
  payload: clientVisibleSupplementRequestPayloadSchema,
  finalLawyerApprovalLedgerEntry: finalLawyerApprovalLedgerEntrySchema,
  lawyerId: z.string().min(1),
  auditRef: z.string().min(1),
  sendGateLedgerEntryId: z.string().min(1).optional(),
});

export const enableNotificationWithMessagePolicyInputSchema = z.object({
  payload: clientVisibleSupplementRequestPayloadSchema,
  messagePolicyGateRef: z.string().min(1),
  auditRef: z.string().min(1),
});

export const linkSupplementRequestToLitigationOpsDraftInputSchema = z.object({
  payload: clientVisibleSupplementRequestPayloadSchema,
  litigationOpsTarget: litigationOpsDraftLinkTargetSchema.default("LITIGATION_OPS_TASK_DRAFT"),
  auditRef: z.string().min(1),
  linkId: z.string().min(1).optional(),
});

export type ApprovePortalDraftForClientVisibilityInput = z.infer<
  typeof approvePortalDraftForClientVisibilityInputSchema
>;
export type EnableSupplementRequestSendGateInput = z.infer<
  typeof enableSupplementRequestSendGateInputSchema
>;
export type EnableNotificationWithMessagePolicyInput = z.infer<
  typeof enableNotificationWithMessagePolicyInputSchema
>;
export type LinkSupplementRequestToLitigationOpsDraftInput = z.infer<
  typeof linkSupplementRequestToLitigationOpsDraftInputSchema
>;
