/**
 * Phase 19-D — Storage orphan detection (dry-run · no delete while locked).
 */
import {
  ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D,
  evaluateLitigationUploadedFileLifecycleEligibility,
  type AttachmentLifecycleEligibilityResult,
} from "./attachment-lifecycle-policy";

export const ATTACHMENT_ORPHAN_DETECTION_MARKER_PHASE19D =
  "phase19d-attachment-orphan-detection" as const;

export const LITIGATION_STORAGE_ROOT_SEGMENT = "document-intelligence" as const;

export type StorageOrphanKind = "DISK_WITHOUT_DB" | "DB_WITHOUT_DISK";

export type StorageOrphanCandidate = {
  kind: StorageOrphanKind;
  storagePath: string;
  litigationUploadedFileId?: string;
  caseId?: string;
};

export function normalizeLitigationStoragePath(storagePath: string): string {
  return storagePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

export function detectLitigationStorageOrphanCandidates(input: {
  dbRecords: ReadonlyArray<{ id: string; storagePath: string; caseId: string }>;
  diskRelativePaths: ReadonlyArray<string>;
}): StorageOrphanCandidate[] {
  const dbPathSet = new Set(
    input.dbRecords.map((row) => normalizeLitigationStoragePath(row.storagePath)),
  );
  const diskPathSet = new Set(
    input.diskRelativePaths.map((p) => normalizeLitigationStoragePath(p)),
  );

  const dbByPath = new Map(
    input.dbRecords.map((row) => [
      normalizeLitigationStoragePath(row.storagePath),
      row,
    ]),
  );

  const candidates: StorageOrphanCandidate[] = [];

  for (const diskPath of diskPathSet) {
    if (!dbPathSet.has(diskPath)) {
      const caseId = diskPath.split("/")[1] ?? undefined;
      candidates.push({
        kind: "DISK_WITHOUT_DB",
        storagePath: diskPath,
        caseId,
      });
    }
  }

  for (const row of input.dbRecords) {
    const normalized = normalizeLitigationStoragePath(row.storagePath);
    if (!diskPathSet.has(normalized)) {
      candidates.push({
        kind: "DB_WITHOUT_DISK",
        storagePath: normalized,
        litigationUploadedFileId: row.id,
        caseId: row.caseId,
      });
    }
  }

  return candidates;
}

export function evaluateStorageOrphanReclamationEligibility(input: {
  candidate: StorageOrphanCandidate;
  caseClosed: boolean;
  legalHoldActive: boolean;
}): AttachmentLifecycleEligibilityResult {
  if (ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D) {
    return {
      eligible: false,
      blockedReason: "PURGE_EXECUTION_LOCKED",
      model: "LitigationUploadedFile",
    };
  }

  if (input.candidate.kind === "DB_WITHOUT_DISK") {
    return evaluateLitigationUploadedFileLifecycleEligibility({
      caseClosed: input.caseClosed,
      legalHoldActive: input.legalHoldActive,
    });
  }

  return evaluateLitigationUploadedFileLifecycleEligibility({
    caseClosed: input.caseClosed,
    legalHoldActive: input.legalHoldActive,
  });
}

export function summarizeOrphanDetection(input: {
  candidates: ReadonlyArray<StorageOrphanCandidate>;
}): {
  diskWithoutDbCount: number;
  dbWithoutDiskCount: number;
  total: number;
} {
  const diskWithoutDbCount = input.candidates.filter(
    (c) => c.kind === "DISK_WITHOUT_DB",
  ).length;
  const dbWithoutDiskCount = input.candidates.filter(
    (c) => c.kind === "DB_WITHOUT_DISK",
  ).length;
  return {
    diskWithoutDbCount,
    dbWithoutDiskCount,
    total: input.candidates.length,
  };
}
