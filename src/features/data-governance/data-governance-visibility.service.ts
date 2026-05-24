/**
 * Phase 19-E — Admin Data Governance visibility snapshot (read-only · no purge execution).
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { CaseStatus } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { assertAdminOnly } from "@/features/cases/case.permissions";
import { DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A } from "@/lib/data-governance/data-retention-policy.schema";
import { AUDIT_LOG_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19C } from "@/lib/data-governance/audit-log-retention-policy";
import {
  ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D,
  evaluateCaseDocumentDeliveryExpiryEligibility,
  evaluateCasePackageShareExpiryEligibility,
  evaluateCaseSharedDocumentExpiryEligibility,
  evaluateExternalMessageLogSecureLinkEligibility,
  evaluateLitigationExtractedTextLifecycleEligibility,
  evaluateLitigationUploadedFileLifecycleEligibility,
  getExternalMessageLogRetentionDays,
  isCaseDocumentDeliveryTokenExpired,
  resolveCaseSharedDocumentEffectiveStatus,
  type AttachmentLifecycleBlockedReason,
  type AttachmentLifecycleEligibilityResult,
} from "@/lib/data-governance/attachment-lifecycle-policy";
import {
  detectLitigationStorageOrphanCandidates,
  evaluateStorageOrphanReclamationEligibility,
  LITIGATION_STORAGE_ROOT_SEGMENT,
  summarizeOrphanDetection,
} from "@/lib/data-governance/attachment-lifecycle-orphan-detection.service";
import {
  DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E,
  DATA_GOVERNANCE_VISIBILITY_VERSION,
} from "@/features/data-governance/data-governance-rc-lock";
import type {
  DataGovernanceOrphanVisibilityItem,
  DataGovernanceVisibilityCategory,
  DataGovernanceVisibilityItem,
  DataGovernanceVisibilitySnapshot,
} from "@/features/data-governance/data-governance-visibility.schema";

export const DATA_GOVERNANCE_VISIBILITY_SERVICE_MARKER_PHASE19E =
  "phase19e-data-governance-visibility-service" as const;

const SAMPLE_LIMIT = 25;

const CLOSED_CASE_STATUSES: ReadonlySet<CaseStatus> = new Set(["CLOSED", "DELETED"]);

function isCaseClosed(status: CaseStatus): boolean {
  return CLOSED_CASE_STATUSES.has(status);
}

function inferLegalHoldActive(caseStatus: CaseStatus): boolean {
  return !isCaseClosed(caseStatus);
}

function categorizeVisibility(
  eligibility: AttachmentLifecycleEligibilityResult,
  context: "litigation" | "share" | "external",
): DataGovernanceVisibilityCategory {
  if (eligibility.blockedReason === "LEGAL_HOLD_ACTIVE") {
    return "legal_hold_blocked";
  }
  if (context === "litigation") {
    return eligibility.blockedReason === "CASE_NOT_CLOSED" ||
      eligibility.blockedReason === "RETAIN_CASE_LIFECYCLE"
      ? "deletion_candidate"
      : "expiry_candidate";
  }
  if (context === "external") {
    return "external_retention";
  }
  if (
    eligibility.blockedReason === "SHARE_ACTIVE" ||
    eligibility.blockedReason === "NOT_EXPIRED"
  ) {
    return "share_expiry";
  }
  return "expiry_candidate";
}

function countByCategory(
  items: ReadonlyArray<{ category: DataGovernanceVisibilityCategory }>,
): {
  expiryCandidateCount: number;
  deletionCandidateCount: number;
  legalHoldBlockedCount: number;
} {
  let expiryCandidateCount = 0;
  let deletionCandidateCount = 0;
  let legalHoldBlockedCount = 0;
  for (const item of items) {
    if (item.category === "legal_hold_blocked") legalHoldBlockedCount += 1;
    if (item.category === "deletion_candidate") deletionCandidateCount += 1;
    if (
      item.category === "expiry_candidate" ||
      item.category === "share_expiry" ||
      item.category === "external_retention"
    ) {
      expiryCandidateCount += 1;
    }
  }
  return { expiryCandidateCount, deletionCandidateCount, legalHoldBlockedCount };
}

async function listLitigationDiskRelativePaths(): Promise<string[]> {
  const root = path.join(process.cwd(), "storage", LITIGATION_STORAGE_ROOT_SEGMENT);
  try {
    const caseDirs = await readdir(root);
    const paths: string[] = [];
    for (const caseDir of caseDirs) {
      const casePath = path.join(root, caseDir);
      const caseStat = await stat(casePath).catch(() => null);
      if (!caseStat?.isDirectory()) continue;
      const files = await readdir(casePath).catch(() => []);
      for (const file of files) {
        paths.push(
          `${LITIGATION_STORAGE_ROOT_SEGMENT}/${caseDir}/${file}`.replace(/\\/g, "/"),
        );
      }
      if (paths.length >= 500) break;
    }
    return paths;
  } catch {
    return [];
  }
}

export async function getDataGovernanceVisibilitySnapshot(
  currentUser?: SessionUser,
): Promise<DataGovernanceVisibilitySnapshot> {
  if (currentUser) {
    assertAdminOnly(currentUser);
  }

  const reference = new Date();
  const retentionDays = getExternalMessageLogRetentionDays();

  const [
    litigationFiles,
    litigationExtracted,
    sharedDocuments,
    documentDeliveries,
    packageShares,
    externalMessages,
    allLitigationForOrphan,
    diskPaths,
  ] = await Promise.all([
    prisma.litigationUploadedFile.findMany({
      take: SAMPLE_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseId: true,
        originalFileName: true,
        storagePath: true,
        createdAt: true,
        case: { select: { status: true, title: true } },
      },
    }),
    prisma.litigationExtractedText.findMany({
      take: SAMPLE_LIMIT,
      orderBy: { extractedAt: "desc" },
      select: {
        id: true,
        uploadedFileId: true,
        extractedAt: true,
        uploadedFile: {
          select: {
            caseId: true,
            originalFileName: true,
            case: { select: { status: true } },
          },
        },
      },
    }),
    prisma.caseSharedDocument.findMany({
      take: SAMPLE_LIMIT,
      orderBy: { sharedAt: "desc" },
      select: {
        id: true,
        caseId: true,
        shareStatus: true,
        expiresAt: true,
        sharedAt: true,
      },
    }),
    prisma.caseDocumentDelivery.findMany({
      take: SAMPLE_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseId: true,
        deliveryStatus: true,
        tokenExpiresAt: true,
        createdAt: true,
      },
    }),
    prisma.casePackageShare.findMany({
      take: SAMPLE_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseId: true,
        status: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    }),
    prisma.externalMessageLog.findMany({
      take: SAMPLE_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseId: true,
        payloadSummaryJson: true,
        createdAt: true,
        delivery: { select: { tokenExpiresAt: true } },
      },
    }),
    prisma.litigationUploadedFile.findMany({
      take: 500,
      orderBy: { createdAt: "desc" },
      select: { id: true, storagePath: true, caseId: true },
    }),
    listLitigationDiskRelativePaths(),
  ]);

  const litigationFileItems: DataGovernanceVisibilityItem[] = litigationFiles.map((row) => {
    const caseClosed = isCaseClosed(row.case.status);
    const legalHoldActive = inferLegalHoldActive(row.case.status);
    const eligibility = evaluateLitigationUploadedFileLifecycleEligibility({
      caseClosed,
      legalHoldActive,
    });
    return {
      id: row.id,
      model: "LitigationUploadedFile",
      category: categorizeVisibility(eligibility, "litigation"),
      caseId: row.caseId,
      summary: row.originalFileName,
      expiresAt: null,
      effectiveStatus: caseClosed ? "CASE_CLOSED" : row.case.status,
      createdAt: row.createdAt.toISOString(),
      eligibility,
    };
  });

  const litigationExtractedItems: DataGovernanceVisibilityItem[] = litigationExtracted.map(
    (row) => {
      const caseStatus = row.uploadedFile.case.status;
      const caseClosed = isCaseClosed(caseStatus);
      const legalHoldActive = inferLegalHoldActive(caseStatus);
      const eligibility = evaluateLitigationExtractedTextLifecycleEligibility({
        caseClosed,
        legalHoldActive,
        hasUploadedFileReference: Boolean(row.uploadedFileId),
      });
      return {
        id: row.id,
        model: "LitigationExtractedText",
        category: categorizeVisibility(eligibility, "litigation"),
        caseId: row.uploadedFile.caseId,
        summary: row.uploadedFile.originalFileName,
        expiresAt: null,
        effectiveStatus: caseClosed ? "CASE_CLOSED" : caseStatus,
        createdAt: row.extractedAt.toISOString(),
        eligibility,
      };
    },
  );

  const sharedDocumentItems: DataGovernanceVisibilityItem[] = sharedDocuments.map((row) => {
    const effectiveStatus = resolveCaseSharedDocumentEffectiveStatus({
      shareStatus: row.shareStatus,
      expiresAt: row.expiresAt,
      reference,
    });
    const eligibility = evaluateCaseSharedDocumentExpiryEligibility({
      shareStatus: row.shareStatus,
      expiresAt: row.expiresAt,
      reference,
    });
    return {
      id: row.id,
      model: "CaseSharedDocument",
      category: categorizeVisibility(eligibility, "share"),
      caseId: row.caseId,
      summary: `share ${effectiveStatus}`,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      effectiveStatus,
      createdAt: row.sharedAt.toISOString(),
      eligibility,
    };
  });

  const documentDeliveryItems: DataGovernanceVisibilityItem[] = documentDeliveries.map(
    (row) => {
      const tokenExpired = isCaseDocumentDeliveryTokenExpired(row.tokenExpiresAt, reference);
      const eligibility = evaluateCaseDocumentDeliveryExpiryEligibility({
        tokenExpiresAt: row.tokenExpiresAt,
        deliveryStatus: row.deliveryStatus,
        reference,
      });
      return {
        id: row.id,
        model: "CaseDocumentDelivery",
        category: categorizeVisibility(eligibility, "share"),
        caseId: row.caseId,
        summary: `${row.deliveryStatus}${tokenExpired ? " · token expired" : ""}`,
        expiresAt: row.tokenExpiresAt.toISOString(),
        effectiveStatus: tokenExpired ? "TOKEN_EXPIRED" : "TOKEN_ACTIVE",
        createdAt: row.createdAt.toISOString(),
        eligibility,
      };
    },
  );

  const packageShareItems: DataGovernanceVisibilityItem[] = packageShares.map((row) => {
    const eligibility = evaluateCasePackageShareExpiryEligibility({
      status: row.status,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      reference,
    });
    return {
      id: row.id,
      model: "CasePackageShare",
      category: categorizeVisibility(eligibility, "share"),
      caseId: row.caseId,
      summary: `package share ${row.status}`,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      effectiveStatus: row.status,
      createdAt: row.createdAt.toISOString(),
      eligibility,
    };
  });

  const externalMessageItems: DataGovernanceVisibilityItem[] = externalMessages.map((row) => {
    const linkedDeliveryTokenExpired = row.delivery
      ? isCaseDocumentDeliveryTokenExpired(row.delivery.tokenExpiresAt, reference)
      : undefined;
    const eligibility = evaluateExternalMessageLogSecureLinkEligibility({
      createdAt: row.createdAt,
      payloadSummaryJson: row.payloadSummaryJson,
      linkedDeliveryTokenExpired,
      reference,
    });
    return {
      id: row.id,
      model: "ExternalMessageLog",
      category: categorizeVisibility(eligibility, "external"),
      caseId: row.caseId,
      summary: `secure link metadata · ${retentionDays}d retention`,
      expiresAt: null,
      effectiveStatus: linkedDeliveryTokenExpired ? "DELIVERY_EXPIRED" : null,
      createdAt: row.createdAt.toISOString(),
      eligibility,
    };
  });

  const orphanCandidates = detectLitigationStorageOrphanCandidates({
    dbRecords: allLitigationForOrphan,
    diskRelativePaths: diskPaths,
  }).slice(0, SAMPLE_LIMIT);

  const orphanItems: DataGovernanceOrphanVisibilityItem[] = orphanCandidates.map(
    (candidate) => {
      const eligibility = evaluateStorageOrphanReclamationEligibility({
        candidate,
        caseClosed: false,
        legalHoldActive: false,
      });
      return { ...candidate, eligibility, category: "orphan_dry_run" as const };
    },
  );

  const allItems = [
    ...litigationFileItems,
    ...litigationExtractedItems,
    ...sharedDocumentItems,
    ...documentDeliveryItems,
    ...packageShareItems,
    ...externalMessageItems,
  ];
  const categoryCounts = countByCategory(allItems);
  const orphanSummary = summarizeOrphanDetection({ candidates: orphanCandidates });

  return {
    capturedAt: reference.toISOString(),
    version: DATA_GOVERNANCE_VISIBILITY_VERSION,
    purgeExecutionLocked: {
      phase19a: DATA_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19A,
      phase19cAuditLog: AUDIT_LOG_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19C,
      phase19dAttachment: ATTACHMENT_LIFECYCLE_PURGE_EXECUTION_LOCKED_PHASE19D,
      phase19eUi: DATA_GOVERNANCE_PURGE_EXECUTION_UI_LOCKED_PHASE19E,
    },
    executionDisabledMessage:
      "purge · delete · blob reclaim 실행은 Phase 19-F RC unlock 전까지 비활성화됩니다.",
    summary: {
      litigationFileSamples: litigationFileItems.length,
      litigationExtractedSamples: litigationExtractedItems.length,
      sharedDocumentSamples: sharedDocumentItems.length,
      documentDeliverySamples: documentDeliveryItems.length,
      packageShareSamples: packageShareItems.length,
      externalMessageSamples: externalMessageItems.length,
      orphanSamples: orphanSummary.total,
      ...categoryCounts,
    },
    litigationFiles: litigationFileItems,
    litigationExtracted: litigationExtractedItems,
    sharedDocuments: sharedDocumentItems,
    documentDeliveries: documentDeliveryItems,
    packageShares: packageShareItems,
    externalMessages: externalMessageItems,
    orphans: orphanItems,
  };
}

export function formatBlockedReason(
  reason: AttachmentLifecycleBlockedReason | null,
): string {
  if (!reason) return "—";
  const labels: Record<AttachmentLifecycleBlockedReason, string> = {
    PURGE_EXECUTION_LOCKED: "19-F RC 전 실행 잠금",
    DELETE_EXECUTION_LOCKED: "19-F RC 전 삭제 잠금",
    LEGAL_HOLD_ACTIVE: "Legal hold",
    CASE_NOT_CLOSED: "사건 미종결",
    RETAIN_CASE_LIFECYCLE: "사건 lifecycle 보존",
    NOT_EXPIRED: "만료 전",
    SHARE_ACTIVE: "공유 활성",
    WITHIN_RETENTION_WINDOW: "retention 기간 내",
    MISSING_EXPIRY_SIGNAL: "만료 신호 없음",
    NO_SECURE_LINK_METADATA: "secure link metadata 아님",
  };
  return labels[reason] ?? reason;
}
