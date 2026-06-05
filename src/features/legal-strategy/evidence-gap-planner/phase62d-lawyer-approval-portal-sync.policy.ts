/**
 * Product Phase 62-D — Lawyer Approval & Portal Draft Sync policy SSOT.
 */
import { randomUUID } from "node:crypto";
import { ValidationError } from "@/lib/errors";
import {
  INTERNAL_STRATEGY_LEAK_PATTERNS,
  assertClientSafeQuestionDraftAllowed,
} from "./phase62c-supplement-request-draft.policy";
import type {
  ClientPortalSupplementDraftSync,
  LawyerSupplementDecisionLedgerEntry,
  LawyerSupplementReviewResult,
  PortalSupplementDraftItem,
} from "./phase62d-lawyer-approval-portal-sync.schema";
import {
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_SCHEMA_MARKER,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERSION,
  clientPortalSupplementDraftSyncSchema,
  lawyerSupplementReviewResultSchema,
  portalDraftSyncBoundariesSchema,
} from "./phase62d-lawyer-approval-portal-sync.schema";
import type {
  ApproveSupplementRequestDraftInput,
  ModifySupplementRequestDraftInput,
  RejectSupplementRequestDraftInput,
  SyncApprovedSupplementDraftInput,
} from "./phase62d-lawyer-approval-portal-sync.schema";
import type {
  ClientSafeDraftItem,
  SupplementRequestDraft,
} from "./phase62c-supplement-request-draft.schema";
import { supplementRequestDraftSchema } from "./phase62c-supplement-request-draft.schema";

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_POLICY_MARKER =
  "phase62d-lawyer-approval-portal-sync-policy" as const;

export const PHASE62D_ONE_LINE_STANDARD =
  "Phase 62-D는 62-C SupplementRequestDraft를 변호사가 승인·수정·거절할 수 있게 하고, LAWYER_APPROVED 또는 LAWYER_MODIFIED 상태의 항목만 의뢰인 포털 보완요청 draft로 동기화하되, 실제 발송·알림·task 실행은 별도 승인 게이트 전까지 차단하는 단계다." as const;

export const PHASE62D_BOUNDARY_MARKERS = [
  "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL",
  "NO_PORTAL_SYNC_FROM_REJECTED_DRAFT",
  "NO_AUTO_SEND_AFTER_PORTAL_SYNC",
  "NO_AUTO_NOTIFICATION_AFTER_PORTAL_SYNC",
  "NO_AUTO_TASK_EXECUTION_AFTER_PORTAL_SYNC",
  "NO_INTERNAL_STRATEGY_LEAK_TO_PORTAL",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "PORTAL_DRAFT_SYNC_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type PortalDraftSyncBoundaryMarker = (typeof PHASE62D_BOUNDARY_MARKERS)[number];

export const PHASE62D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62d" as const;

export const PHASE62D_PHASE62C_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62c" as const;

const DEFAULT_SYNC_BOUNDARIES = portalDraftSyncBoundariesSchema.parse({
  noPortalSyncWithoutLawyerApproval: true,
  noPortalSyncFromRejectedDraft: true,
  noAutoSendAfterPortalSync: true,
  noAutoNotificationAfterPortalSync: true,
  noAutoTaskExecutionAfterPortalSync: true,
  noInternalStrategyLeakToPortal: true,
  lawyerDecisionLedgerRequired: true,
  portalDraftSyncAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

const PORTAL_SYNC_ALLOWED_STATUSES = new Set(["LAWYER_APPROVED", "LAWYER_MODIFIED"]);

export function evaluatePortalDraftMessage(text: string): {
  allowed: boolean;
  blockedBy?: PortalDraftSyncBoundaryMarker;
} {
  for (const pattern of INTERNAL_STRATEGY_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, blockedBy: "NO_INTERNAL_STRATEGY_LEAK_TO_PORTAL" };
    }
  }
  return { allowed: true };
}

export function assertPortalDraftMessageAllowed(text: string) {
  const result = evaluatePortalDraftMessage(text);
  if (!result.allowed) {
    throw new ValidationError(result.blockedBy ?? "NO_INTERNAL_STRATEGY_LEAK_TO_PORTAL");
  }
}

function assertDecisionAuditRef(auditRef: string) {
  if (!auditRef.trim()) {
    throw new ValidationError("PORTAL_DRAFT_SYNC_AUDIT_REQUIRED");
  }
}

function createLedgerEntry(input: {
  draft: SupplementRequestDraft;
  lawyerId: string;
  auditRef: string;
  action: LawyerSupplementDecisionLedgerEntry["action"];
  nextReviewStatus: SupplementRequestDraft["reviewStatus"];
  decisionNote?: string;
  ledgerEntryId?: string;
}): LawyerSupplementDecisionLedgerEntry {
  assertDecisionAuditRef(input.auditRef);

  return {
    ledgerEntryId: input.ledgerEntryId ?? randomUUID(),
    draftId: input.draft.draftId,
    caseId: input.draft.caseId,
    tenantId: input.draft.tenantId,
    action: input.action,
    previousReviewStatus: input.draft.reviewStatus,
    nextReviewStatus: input.nextReviewStatus,
    lawyerId: input.lawyerId,
    decisionNote: input.decisionNote,
    auditRef: input.auditRef,
    decidedAt: new Date().toISOString(),
  };
}

function withUpdatedDraft(
  draft: SupplementRequestDraft,
  updates: Partial<SupplementRequestDraft>,
): SupplementRequestDraft {
  return supplementRequestDraftSchema.parse({
    ...draft,
    ...updates,
  });
}

export function evaluatePortalDraftSyncAllowed(input: {
  draft: SupplementRequestDraft;
  ledgerEntry?: LawyerSupplementDecisionLedgerEntry;
  auditRef: string;
}): { allowed: boolean; blockedBy?: PortalDraftSyncBoundaryMarker } {
  if (!input.auditRef.trim()) {
    return { allowed: false, blockedBy: "PORTAL_DRAFT_SYNC_AUDIT_REQUIRED" };
  }

  if (input.draft.reviewStatus === "REJECTED") {
    return { allowed: false, blockedBy: "NO_PORTAL_SYNC_FROM_REJECTED_DRAFT" };
  }

  if (input.draft.reviewStatus === "LAWYER_REVIEW_REQUIRED") {
    return { allowed: false, blockedBy: "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL" };
  }

  if (!PORTAL_SYNC_ALLOWED_STATUSES.has(input.draft.reviewStatus)) {
    return { allowed: false, blockedBy: "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL" };
  }

  if (!input.ledgerEntry) {
    return { allowed: false, blockedBy: "LAWYER_DECISION_LEDGER_REQUIRED" };
  }

  if (input.ledgerEntry.draftId !== input.draft.draftId) {
    return { allowed: false, blockedBy: "LAWYER_DECISION_LEDGER_REQUIRED" };
  }

  if (
    input.ledgerEntry.nextReviewStatus !== input.draft.reviewStatus ||
    !PORTAL_SYNC_ALLOWED_STATUSES.has(input.ledgerEntry.nextReviewStatus)
  ) {
    return { allowed: false, blockedBy: "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL" };
  }

  return { allowed: true };
}

export function assertPortalDraftSyncAllowed(input: {
  draft: SupplementRequestDraft;
  ledgerEntry: LawyerSupplementDecisionLedgerEntry;
  auditRef: string;
}) {
  const gate = evaluatePortalDraftSyncAllowed(input);
  if (!gate.allowed) {
    throw new ValidationError(gate.blockedBy ?? "NO_PORTAL_SYNC_WITHOUT_LAWYER_APPROVAL");
  }
}

function buildPortalDraftItems(items: ClientSafeDraftItem[]): PortalSupplementDraftItem[] {
  return items.map((item) => {
    assertPortalDraftMessageAllowed(item.clientSafeQuestionDraft);

    return {
      portalItemId: `portal-${item.itemId}`,
      sourceDraftItemId: item.itemId,
      requestedEvidenceType: item.requestedEvidenceType,
      clientMessageDraft: item.clientSafeQuestionDraft,
      syncStatus: "CLIENT_COLLABORATION_PORTAL_DRAFT" as const,
    };
  });
}

export function approveSupplementRequestDraftForPortalSync(
  input: ApproveSupplementRequestDraftInput,
): LawyerSupplementReviewResult {
  assertDecisionAuditRef(input.auditRef);

  if (input.draft.reviewStatus === "REJECTED") {
    throw new ValidationError("NO_PORTAL_SYNC_FROM_REJECTED_DRAFT");
  }

  const ledgerEntry = createLedgerEntry({
    draft: input.draft,
    lawyerId: input.lawyerId,
    auditRef: input.auditRef,
    action: "APPROVE",
    nextReviewStatus: "LAWYER_APPROVED",
    decisionNote: input.decisionNote,
    ledgerEntryId: input.ledgerEntryId,
  });

  const draft = withUpdatedDraft(input.draft, {
    reviewStatus: "LAWYER_APPROVED",
  });

  return lawyerSupplementReviewResultSchema.parse({ draft, ledgerEntry });
}

export function modifySupplementRequestDraftForPortalSync(
  input: ModifySupplementRequestDraftInput,
): LawyerSupplementReviewResult {
  assertDecisionAuditRef(input.auditRef);

  if (input.draft.reviewStatus === "REJECTED") {
    throw new ValidationError("NO_PORTAL_SYNC_FROM_REJECTED_DRAFT");
  }

  for (const item of input.modifiedClientSafeDraftItems) {
    assertClientSafeQuestionDraftAllowed(item.clientSafeQuestionDraft);
  }

  const ledgerEntry = createLedgerEntry({
    draft: input.draft,
    lawyerId: input.lawyerId,
    auditRef: input.auditRef,
    action: "MODIFY",
    nextReviewStatus: "LAWYER_MODIFIED",
    decisionNote: input.decisionNote,
    ledgerEntryId: input.ledgerEntryId,
  });

  const draft = withUpdatedDraft(input.draft, {
    reviewStatus: "LAWYER_MODIFIED",
    clientSafeDraftItems: input.modifiedClientSafeDraftItems,
  });

  return lawyerSupplementReviewResultSchema.parse({ draft, ledgerEntry });
}

export function rejectSupplementRequestDraft(
  input: RejectSupplementRequestDraftInput,
): LawyerSupplementReviewResult {
  assertDecisionAuditRef(input.auditRef);

  const ledgerEntry = createLedgerEntry({
    draft: input.draft,
    lawyerId: input.lawyerId,
    auditRef: input.auditRef,
    action: "REJECT",
    nextReviewStatus: "REJECTED",
    decisionNote: input.decisionNote,
    ledgerEntryId: input.ledgerEntryId,
  });

  const draft = withUpdatedDraft(input.draft, {
    reviewStatus: "REJECTED",
  });

  return lawyerSupplementReviewResultSchema.parse({ draft, ledgerEntry });
}

export function syncApprovedSupplementDraftToClientPortal(
  input: SyncApprovedSupplementDraftInput,
): ClientPortalSupplementDraftSync {
  assertPortalDraftSyncAllowed({
    draft: input.draft,
    ledgerEntry: input.ledgerEntry,
    auditRef: input.auditRef,
  });

  const portalDraftItems = buildPortalDraftItems(input.draft.clientSafeDraftItems);

  const sync: ClientPortalSupplementDraftSync = {
    marker: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_SCHEMA_MARKER,
    version: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERSION,
    syncId: input.syncId ?? randomUUID(),
    draftId: input.draft.draftId,
    caseId: input.draft.caseId,
    tenantId: input.draft.tenantId,
    sourceDetectionReportId: input.draft.sourceDetectionReportId,
    reviewStatus: input.draft.reviewStatus as "LAWYER_APPROVED" | "LAWYER_MODIFIED",
    portalDraftItems,
    lawyerDecisionLedgerEntryId: input.ledgerEntry.ledgerEntryId,
    sendAllowed: false,
    notificationAllowed: false,
    autoTaskExecutionAllowed: false,
    clientVisible: false,
    boundaries: DEFAULT_SYNC_BOUNDARIES,
    auditRef: input.auditRef,
    phase62CVerifyScript: PHASE62D_PHASE62C_VERIFY_SCRIPT,
    phase62DVerifyScript: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE62D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    syncedAt: new Date().toISOString(),
  };

  return clientPortalSupplementDraftSyncSchema.parse(sync);
}
