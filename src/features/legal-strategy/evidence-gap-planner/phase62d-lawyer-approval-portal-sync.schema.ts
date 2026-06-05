/**
 * Product Phase 62-D — Lawyer Approval & Portal Draft Sync schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_LAWYER_APPROVAL_PORTAL_DRAFT_SYNC_PHASE62D.md
 */
import { z } from "zod";
import {
  clientSafeDraftItemSchema,
  requestedEvidenceTypeSchema,
  supplementRequestDraftReviewStatusSchema,
  supplementRequestDraftSchema,
} from "./phase62c-supplement-request-draft.schema";

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERSION = "62-D.1" as const;

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_SCHEMA_MARKER =
  "phase62d-lawyer-approval-portal-sync-schema" as const;

export const lawyerSupplementDecisionActionSchema = z.enum(["APPROVE", "MODIFY", "REJECT"]);

export type LawyerSupplementDecisionAction = z.infer<typeof lawyerSupplementDecisionActionSchema>;

export const lawyerSupplementDecisionLedgerEntrySchema = z.object({
  ledgerEntryId: z.string().min(1),
  draftId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  action: lawyerSupplementDecisionActionSchema,
  previousReviewStatus: supplementRequestDraftReviewStatusSchema,
  nextReviewStatus: supplementRequestDraftReviewStatusSchema,
  lawyerId: z.string().min(1),
  decisionNote: z.string().optional(),
  auditRef: z.string().min(1),
  decidedAt: z.string().datetime(),
});

export type LawyerSupplementDecisionLedgerEntry = z.infer<
  typeof lawyerSupplementDecisionLedgerEntrySchema
>;

export const portalSupplementDraftItemSchema = z.object({
  portalItemId: z.string().min(1),
  sourceDraftItemId: z.string().min(1),
  requestedEvidenceType: requestedEvidenceTypeSchema,
  clientMessageDraft: z.string().min(1),
  syncStatus: z.literal("CLIENT_COLLABORATION_PORTAL_DRAFT"),
});

export type PortalSupplementDraftItem = z.infer<typeof portalSupplementDraftItemSchema>;

export const portalDraftSyncBoundariesSchema = z.object({
  noPortalSyncWithoutLawyerApproval: z.literal(true),
  noPortalSyncFromRejectedDraft: z.literal(true),
  noAutoSendAfterPortalSync: z.literal(true),
  noAutoNotificationAfterPortalSync: z.literal(true),
  noAutoTaskExecutionAfterPortalSync: z.literal(true),
  noInternalStrategyLeakToPortal: z.literal(true),
  lawyerDecisionLedgerRequired: z.literal(true),
  portalDraftSyncAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const clientPortalSupplementDraftSyncSchema = z.object({
  marker: z.literal(PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_SCHEMA_MARKER),
  version: z.literal(PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERSION),
  syncId: z.string().min(1),
  draftId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceDetectionReportId: z.string().min(1),
  reviewStatus: z.enum(["LAWYER_APPROVED", "LAWYER_MODIFIED"]),
  portalDraftItems: z.array(portalSupplementDraftItemSchema).min(1),
  lawyerDecisionLedgerEntryId: z.string().min(1),
  sendAllowed: z.literal(false),
  notificationAllowed: z.literal(false),
  autoTaskExecutionAllowed: z.literal(false),
  clientVisible: z.literal(false),
  boundaries: portalDraftSyncBoundariesSchema,
  auditRef: z.string().min(1),
  phase62CVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62c"),
  phase62DVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase62d"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  syncedAt: z.string().datetime(),
});

export type ClientPortalSupplementDraftSync = z.infer<
  typeof clientPortalSupplementDraftSyncSchema
>;

export const lawyerSupplementReviewResultSchema = z.object({
  draft: supplementRequestDraftSchema,
  ledgerEntry: lawyerSupplementDecisionLedgerEntrySchema,
});

export type LawyerSupplementReviewResult = z.infer<typeof lawyerSupplementReviewResultSchema>;

export const approveSupplementRequestDraftInputSchema = z.object({
  draft: supplementRequestDraftSchema,
  lawyerId: z.string().min(1),
  auditRef: z.string().min(1),
  decisionNote: z.string().optional(),
  ledgerEntryId: z.string().min(1).optional(),
});

export const modifySupplementRequestDraftInputSchema = z.object({
  draft: supplementRequestDraftSchema,
  lawyerId: z.string().min(1),
  auditRef: z.string().min(1),
  modifiedClientSafeDraftItems: z.array(clientSafeDraftItemSchema).min(1),
  decisionNote: z.string().optional(),
  ledgerEntryId: z.string().min(1).optional(),
});

export const rejectSupplementRequestDraftInputSchema = z.object({
  draft: supplementRequestDraftSchema,
  lawyerId: z.string().min(1),
  auditRef: z.string().min(1),
  decisionNote: z.string().optional(),
  ledgerEntryId: z.string().min(1).optional(),
});

export const syncApprovedSupplementDraftInputSchema = z.object({
  draft: supplementRequestDraftSchema,
  ledgerEntry: lawyerSupplementDecisionLedgerEntrySchema,
  auditRef: z.string().min(1),
  syncId: z.string().min(1).optional(),
});

export type ApproveSupplementRequestDraftInput = z.infer<
  typeof approveSupplementRequestDraftInputSchema
>;
export type ModifySupplementRequestDraftInput = z.infer<
  typeof modifySupplementRequestDraftInputSchema
>;
export type RejectSupplementRequestDraftInput = z.infer<
  typeof rejectSupplementRequestDraftInputSchema
>;
export type SyncApprovedSupplementDraftInput = z.infer<
  typeof syncApprovedSupplementDraftInputSchema
>;
