/**
 * Product Phase 62-D — Lawyer Approval & Portal Draft Sync service SSOT.
 */
export {
  approveSupplementRequestDraftForPortalSync,
  assertPortalDraftSyncAllowed,
  evaluatePortalDraftSyncAllowed,
  modifySupplementRequestDraftForPortalSync,
  rejectSupplementRequestDraft,
  syncApprovedSupplementDraftToClientPortal,
} from "./phase62d-lawyer-approval-portal-sync.policy";

import type { ClientPortalSupplementDraftSync } from "./phase62d-lawyer-approval-portal-sync.schema";
import type { SyncApprovedSupplementDraftInput } from "./phase62d-lawyer-approval-portal-sync.schema";
import { syncApprovedSupplementDraftToClientPortal } from "./phase62d-lawyer-approval-portal-sync.policy";

export function summarizeClientPortalSupplementDraftSync(sync: ClientPortalSupplementDraftSync) {
  return {
    syncId: sync.syncId,
    draftId: sync.draftId,
    itemCount: sync.portalDraftItems.length,
    reviewStatus: sync.reviewStatus,
    sendAllowed: sync.sendAllowed,
    notificationAllowed: sync.notificationAllowed,
    autoTaskExecutionAllowed: sync.autoTaskExecutionAllowed,
  };
}

export function runLawyerApprovalAndPortalSync(
  input: SyncApprovedSupplementDraftInput,
): ClientPortalSupplementDraftSync {
  return syncApprovedSupplementDraftToClientPortal(input);
}
