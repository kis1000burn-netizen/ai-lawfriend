/**
 * Phase 19-F — Purge target preview snapshot (policy-blocked candidates only).
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { assertAdminOnly } from "@/features/cases/case.permissions";
import type { AttachmentLifecycleBlockedReason } from "@/lib/data-governance/attachment-lifecycle-policy";
import {
  DATA_GOVERNANCE_RC_VERSION,
  DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING,
} from "@/features/data-governance/data-governance-rc-lock";
import { getDataGovernanceVisibilitySnapshot } from "@/features/data-governance/data-governance-visibility.service";
import type { DataGovernanceVisibilityItem } from "@/features/data-governance/data-governance-visibility.schema";

export const DATA_GOVERNANCE_PURGE_PREVIEW_SERVICE_MARKER_PHASE19F =
  "phase19f-data-governance-purge-preview-service" as const;

export type DataGovernancePurgePreviewCandidate = {
  id: string;
  model: string;
  caseId: string | null;
  summary: string;
  category: string;
  blockedReason: AttachmentLifecycleBlockedReason;
  wouldPurgeIfUnlocked: true;
};

export type DataGovernancePurgePreviewSnapshot = {
  capturedAt: string;
  version: string;
  candidateCount: number;
  legalHoldBlockedCount: number;
  legalHoldRecheckPassed: boolean;
  rollbackWarning: string;
  candidates: DataGovernancePurgePreviewCandidate[];
};

function isPurgeExecutionLockedCandidate(
  item: DataGovernanceVisibilityItem,
): item is DataGovernanceVisibilityItem & {
  eligibility: { blockedReason: "PURGE_EXECUTION_LOCKED" };
} {
  return item.eligibility.blockedReason === "PURGE_EXECUTION_LOCKED";
}

function toPreviewCandidate(
  item: DataGovernanceVisibilityItem,
): DataGovernancePurgePreviewCandidate {
  return {
    id: item.id,
    model: item.model,
    caseId: item.caseId,
    summary: item.summary,
    category: item.category,
    blockedReason: item.eligibility.blockedReason as AttachmentLifecycleBlockedReason,
    wouldPurgeIfUnlocked: true,
  };
}

export async function getDataGovernancePurgePreviewSnapshot(
  currentUser?: SessionUser,
): Promise<DataGovernancePurgePreviewSnapshot> {
  if (currentUser) {
    assertAdminOnly(currentUser);
  }

  const visibility = await getDataGovernanceVisibilitySnapshot();
  const allItems = [
    ...visibility.litigationFiles,
    ...visibility.litigationExtracted,
    ...visibility.sharedDocuments,
    ...visibility.documentDeliveries,
    ...visibility.packageShares,
    ...visibility.externalMessages,
  ];

  const purgeLockedCandidates = allItems
    .filter(isPurgeExecutionLockedCandidate)
    .map(toPreviewCandidate);

  const orphanCandidates: DataGovernancePurgePreviewCandidate[] = visibility.orphans
    .filter((o) => o.eligibility.blockedReason === "PURGE_EXECUTION_LOCKED")
    .map((o) => ({
      id: o.litigationUploadedFileId ?? o.storagePath,
      model: "LitigationUploadedFile",
      caseId: o.caseId ?? null,
      summary: `${o.kind}: ${o.storagePath}`,
      category: "orphan_dry_run",
      blockedReason: "PURGE_EXECUTION_LOCKED" as const,
      wouldPurgeIfUnlocked: true as const,
    }));

  const candidates = [...purgeLockedCandidates, ...orphanCandidates];

  const legalHoldBlockedCount = allItems.filter(
    (item) => item.eligibility.blockedReason === "LEGAL_HOLD_ACTIVE",
  ).length;

  return {
    capturedAt: new Date().toISOString(),
    version: DATA_GOVERNANCE_RC_VERSION,
    candidateCount: candidates.length,
    legalHoldBlockedCount,
    legalHoldRecheckPassed: legalHoldBlockedCount === 0,
    rollbackWarning: DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING,
    candidates,
  };
}
