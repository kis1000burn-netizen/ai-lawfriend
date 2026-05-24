/**
 * Phase 18-C — Document pipeline recovery service.
 */
import type { DocumentPipelineStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import { hasMinRole } from "@/lib/auth/roles";
import { extractLitigationDocumentService } from "@/features/document-intelligence/document-extraction.service";
import { classifyLitigationDocumentService } from "@/features/document-intelligence/document-classification.service";
import { analyzeLitigationDocumentService } from "@/features/document-intelligence/document-analysis.service";
import { analyzeLitigationOpponentBriefService } from "@/features/document-intelligence/opponent-brief-analysis.service";
import { recordFailedRetryJob } from "./retry-job.service";
import {
  documentPipelineRecoveryJobCode,
  type DocumentPipelineRecoveryPreviewDto,
  type DocumentPipelineRecoveryResultDto,
  type OperatorDocumentPipelineRecoverInput,
  operatorDocumentPipelineRecoverInputSchema,
} from "./document-pipeline-recovery.schema";
import {
  buildDuplicateGuardKey,
  evaluateDocumentPipelineRecoveryPolicy,
  listCompletedStages,
} from "./document-pipeline-recovery.policy";

export const RELIABILITY_DOCUMENT_PIPELINE_RECOVERY_SERVICE_MARKER_PHASE18C =
  "phase18c-document-pipeline-recovery-service" as const;

const CONFIRMED_REVIEW_STATUSES = ["LAWYER_CONFIRMED", "LAWYER_CORRECTED"];

function assertPlatformAdmin(user: SessionUser) {
  if (!hasMinRole(user.role, "ADMIN")) {
    throw new ForbiddenError("Document pipeline recovery requires ADMIN role.");
  }
}

type FileWithRelations = NonNullable<Awaited<ReturnType<typeof loadUploadedFile>>>;

async function loadUploadedFile(fileId: string) {
  return prisma.litigationUploadedFile.findUnique({
    where: { id: fileId },
    include: {
      extractions: { orderBy: { revision: "desc" }, take: 1 },
      classifications: { orderBy: { revision: "desc" }, take: 1 },
      analyses: { orderBy: { revision: "desc" }, take: 1 },
      opponentBriefAnalyses: { orderBy: { revision: "desc" }, take: 1 },
    },
  });
}

function detectFailedStage(file: FileWithRelations): {
  stage: DocumentPipelineStage;
  reason: string;
} | null {
  if (file.extractionStatus === "FAILED") {
    return { stage: "EXTRACT", reason: "Text extraction/OCR failed" };
  }
  const classification = file.classifications[0];
  if (classification?.classificationStatus === "FAILED") {
    return {
      stage: "CLASSIFY",
      reason: classification.errorMessage ?? "Document classification failed",
    };
  }
  const analysis = file.analyses[0];
  if (analysis?.analysisStatus === "FAILED") {
    return {
      stage: "ANALYZE",
      reason: analysis.errorMessage ?? "Document analysis failed",
    };
  }
  const opponent = file.opponentBriefAnalyses[0];
  if (opponent?.analysisStatus === "FAILED") {
    return {
      stage: "OPPONENT_BRIEF",
      reason: opponent.errorMessage ?? "Opponent brief analysis failed",
    };
  }
  return null;
}

async function isLawyerReviewLocked(fileId: string, caseId: string): Promise<boolean> {
  const count = await prisma.litigationDocumentIntelligenceReviewDecision.count({
    where: {
      caseId,
      sourceFileId: fileId,
      reviewStatus: { in: CONFIRMED_REVIEW_STATUSES },
    },
  });
  return count > 0;
}

async function isClientDisclosureLocked(caseId: string): Promise<boolean> {
  const [releaseCount, activeShareCount] = await Promise.all([
    prisma.caseClientDisclosureRelease.count({ where: { caseId } }),
    prisma.caseSharedDocument.count({
      where: { caseId, shareStatus: "ACTIVE" },
    }),
  ]);
  return releaseCount > 0 || activeShareCount > 0;
}

function buildSnapshot(file: FileWithRelations, failedStage: DocumentPipelineStage) {
  return {
    uploadedFileId: file.id,
    caseId: file.caseId,
    extractionStatus: file.extractionStatus,
    hasExtractedText: file.extractions.length > 0,
    classificationStatus: file.classifications[0]?.classificationStatus ?? null,
    analysisStatus: file.analyses[0]?.analysisStatus ?? null,
    opponentBriefStatus: file.opponentBriefAnalyses[0]?.analysisStatus ?? null,
    failedStage,
  };
}

export async function syncFailedDocumentPipelineJobs(limit = 50) {
  const files = await prisma.litigationUploadedFile.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit * 3,
    include: {
      extractions: { orderBy: { revision: "desc" }, take: 1 },
      classifications: { orderBy: { revision: "desc" }, take: 1 },
      analyses: { orderBy: { revision: "desc" }, take: 1 },
      opponentBriefAnalyses: { orderBy: { revision: "desc" }, take: 1 },
    },
  });

  let created = 0;
  let scanned = 0;

  for (const file of files) {
    const failed = detectFailedStage(file);
    if (!failed) continue;
    scanned += 1;
    if (scanned > limit) break;

    const duplicateGuardKey = buildDuplicateGuardKey(file.id, failed.stage);
    const existing = await prisma.documentPipelineJob.findUnique({
      where: { duplicateGuardKey },
    });
    if (existing) continue;

    const snapshot = buildSnapshot(file, failed.stage);
    const [lawyerReviewLocked, clientDisclosureLocked] = await Promise.all([
      isLawyerReviewLocked(file.id, file.caseId),
      isClientDisclosureLocked(file.caseId),
    ]);
    const policy = evaluateDocumentPipelineRecoveryPolicy({
      snapshot,
      lawyerReviewLocked,
      clientDisclosureLocked,
      hasInFlightRecovery: false,
      attemptCount: 0,
      maxAttempts: 3,
    });

    const job = await prisma.documentPipelineJob.create({
      data: {
        uploadedFileId: file.id,
        caseId: file.caseId,
        failedStage: failed.stage,
        resumeFromStage: policy.resumeFromStage,
        status: policy.retryable ? "FAILED" : "BLOCKED",
        failureReason: failed.reason,
        completedStagesJson: policy.completedStages,
        lawyerReviewLocked,
        clientDisclosureLocked,
        duplicateGuardKey,
      },
    });

    await recordFailedRetryJob({
      sourceType: "DOCUMENT_PIPELINE",
      sourceRefId: job.id,
      jobCode: `${documentPipelineRecoveryJobCode}:${failed.stage}`,
      caseId: file.caseId,
      failureReason: failed.reason,
      failurePayload: {
        uploadedFileId: file.id,
        failedStage: failed.stage,
        resumeFromStage: policy.resumeFromStage,
        metadataOnly: true,
      },
    });
    created += 1;
  }

  return { scanned, created };
}

async function loadPipelineJob(jobId: string) {
  return prisma.documentPipelineJob.findUnique({
    where: { id: jobId },
    include: { uploadedFile: { include: { extractions: { take: 1, orderBy: { revision: "desc" } } } } },
  });
}

export async function previewDocumentPipelineRecovery(
  pipelineJobId: string,
): Promise<DocumentPipelineRecoveryPreviewDto> {
  const job = await loadPipelineJob(pipelineJobId);
  if (!job) {
    throw new NotFoundError("Document pipeline job not found.");
  }

  const file = await loadUploadedFile(job.uploadedFileId);
  if (!file) {
    throw new NotFoundError("Uploaded file not found.");
  }

  const snapshot = buildSnapshot(file, job.failedStage);
  const inFlight = await prisma.documentPipelineJob.findFirst({
    where: {
      uploadedFileId: job.uploadedFileId,
      failedStage: job.failedStage,
      status: "RECOVERING",
      id: { not: job.id },
    },
  });

  const policy = evaluateDocumentPipelineRecoveryPolicy({
    snapshot,
    lawyerReviewLocked: job.lawyerReviewLocked,
    clientDisclosureLocked: job.clientDisclosureLocked,
    hasInFlightRecovery: Boolean(inFlight),
    attemptCount: job.attemptCount,
    maxAttempts: job.maxAttempts,
  });

  return {
    pipelineJobId: job.id,
    uploadedFileId: job.uploadedFileId,
    caseId: job.caseId,
    failedStage: job.failedStage,
    resumeFromStage: policy.resumeFromStage,
    retryable: policy.retryable,
    blockReason: policy.blockReason ?? null,
    duplicateGuardPassed: !inFlight,
    lawyerReviewLocked: job.lawyerReviewLocked,
    clientDisclosureLocked: job.clientDisclosureLocked,
    completedStages: policy.completedStages,
  };
}

async function executeResumeStage(
  user: SessionUser,
  caseId: string,
  fileId: string,
  stage: DocumentPipelineStage,
) {
  switch (stage) {
    case "EXTRACT":
      return extractLitigationDocumentService(user, caseId, fileId);
    case "CLASSIFY":
      return classifyLitigationDocumentService(user, caseId, fileId);
    case "ANALYZE":
      return analyzeLitigationDocumentService(user, caseId, fileId);
    case "OPPONENT_BRIEF":
      return analyzeLitigationOpponentBriefService(user, caseId, fileId);
    default:
      throw new ValidationError("UPLOAD re-stage is not allowed — original file is preserved.");
  }
}

export async function operatorRecoverDocumentPipelineJobService(
  user: SessionUser,
  pipelineJobId: string,
  input?: OperatorDocumentPipelineRecoverInput,
): Promise<DocumentPipelineRecoveryResultDto> {
  assertPlatformAdmin(user);
  operatorDocumentPipelineRecoverInputSchema.parse(input ?? {});

  const preview = await previewDocumentPipelineRecovery(pipelineJobId);
  if (!preview.retryable) {
    throw new ValidationError(preview.blockReason ?? "Recovery not allowed.");
  }
  if (!preview.duplicateGuardPassed) {
    throw new ValidationError("Duplicate processing guard blocked recovery.");
  }

  const job = await loadPipelineJob(pipelineJobId);
  if (!job) {
    throw new NotFoundError("Document pipeline job not found.");
  }

  let retryJob = await prisma.retryJob.findUnique({
    where: {
      sourceType_sourceRefId: {
        sourceType: "DOCUMENT_PIPELINE",
        sourceRefId: job.id,
      },
    },
  });

  if (!retryJob) {
    retryJob = await recordFailedRetryJob({
      sourceType: "DOCUMENT_PIPELINE",
      sourceRefId: job.id,
      jobCode: `${documentPipelineRecoveryJobCode}:${job.failedStage}`,
      caseId: job.caseId,
    });
  }

  await prisma.documentPipelineJob.update({
    where: { id: job.id },
    data: {
      status: "RECOVERING",
      resumeFromStage: preview.resumeFromStage,
      attemptCount: { increment: 1 },
      resolvedByUserId: user.id,
      operatorNote: input?.operatorNote?.trim() || null,
    },
  });

  await prisma.retryJob.update({
    where: { id: retryJob.id },
    data: { status: "RETRYING", lastAttemptAt: new Date() },
  });

  try {
    await executeResumeStage(
      user,
      job.caseId,
      job.uploadedFileId,
      preview.resumeFromStage,
    );

    const now = new Date();
    await prisma.documentPipelineJob.update({
      where: { id: job.id },
      data: { status: "SUCCEEDED", resolvedAt: now, resolvedByUserId: user.id },
    });
    await prisma.retryJob.update({
      where: { id: retryJob.id },
      data: { status: "SUCCEEDED", resolvedAt: now, resolvedByUserId: user.id },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DOCUMENT_PIPELINE_OPERATOR_RECOVERED",
      entityType: "DocumentPipelineJob",
      entityId: job.id,
      message: `Stage-preserving recovery ${preview.resumeFromStage} for file ${job.uploadedFileId}`,
      metadata: {
        caseId: job.caseId,
        failedStage: job.failedStage,
        resumeFromStage: preview.resumeFromStage,
        completedStages: preview.completedStages,
        duplicateGuard: "passed",
        noReupload: true,
        noOverwriteExtract: preview.completedStages.includes("EXTRACT"),
      },
    });

    return {
      pipelineJobId: job.id,
      uploadedFileId: job.uploadedFileId,
      resumeFromStage: preview.resumeFromStage,
      status: "SUCCEEDED",
      retryJobId: retryJob.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recovery failed";
    await prisma.documentPipelineJob.update({
      where: { id: job.id },
      data: { status: "FAILED", failureReason: message },
    });
    await prisma.retryJob.update({
      where: { id: retryJob.id },
      data: { status: "FAILED", failureReason: message },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DOCUMENT_PIPELINE_RECOVERY_FAILED",
      entityType: "DocumentPipelineJob",
      entityId: job.id,
      message,
      metadata: { resumeFromStage: preview.resumeFromStage },
    });

    return {
      pipelineJobId: job.id,
      uploadedFileId: job.uploadedFileId,
      resumeFromStage: preview.resumeFromStage,
      status: "FAILED",
      retryJobId: retryJob.id,
    };
  }
}
