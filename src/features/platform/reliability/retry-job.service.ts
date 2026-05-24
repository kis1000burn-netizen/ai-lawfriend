/**
 * Phase 18-A — Retry queue service (persist failures · operator retry).
 */
import type { Prisma, RetryJobSourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import { hasMinRole } from "@/lib/auth/roles";
import {
  type RecordFailedRetryJobInput,
  type RetryJobListItemDto,
  type RetryJobListQuery,
  recordFailedRetryJobInputSchema,
} from "./retry-job.schema";
import {
  canOperatorQueueRetry,
  evaluateRetryJobPolicy,
} from "./retry-job-policy";
import { redactRetryJobFailurePayload } from "@/lib/data-governance/data-redaction.service";

export const RELIABILITY_RETRY_JOB_SERVICE_MARKER_PHASE18A =
  "phase18a-retry-job-service" as const;

function toListItem(row: {
  id: string;
  sourceType: RetryJobSourceType;
  sourceRefId: string | null;
  jobCode: string;
  caseId: string | null;
  status: string;
  safetyClass: string;
  retryable: boolean;
  attemptCount: number;
  maxAttempts: number;
  failureReason: string | null;
  lastAttemptAt: Date | null;
  nextRetryAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): RetryJobListItemDto {
  return {
    id: row.id,
    sourceType: row.sourceType,
    sourceRefId: row.sourceRefId,
    jobCode: row.jobCode,
    caseId: row.caseId,
    status: row.status as RetryJobListItemDto["status"],
    safetyClass: row.safetyClass as RetryJobListItemDto["safetyClass"],
    retryable: row.retryable,
    attemptCount: row.attemptCount,
    maxAttempts: row.maxAttempts,
    failureReason: row.failureReason,
    lastAttemptAt: row.lastAttemptAt?.toISOString() ?? null,
    nextRetryAt: row.nextRetryAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function assertPlatformAdmin(user: SessionUser) {
  if (!hasMinRole(user.role, "ADMIN")) {
    throw new ForbiddenError("Retry job operations require ADMIN role.");
  }
}

export async function recordFailedRetryJob(input: RecordFailedRetryJobInput) {
  const parsed = recordFailedRetryJobInputSchema.parse(input);
  const policy = evaluateRetryJobPolicy({
    sourceType: parsed.sourceType,
    jobCode: parsed.jobCode,
    failureReason: parsed.failureReason,
    attemptCount: parsed.attemptCount ?? 0,
  });

  const data: Prisma.RetryJobCreateInput = {
    sourceType: parsed.sourceType,
    sourceRefId: parsed.sourceRefId,
    jobCode: parsed.jobCode,
    caseId: parsed.caseId,
    status: policy.retryable ? "FAILED" : "EXHAUSTED",
    safetyClass: policy.safetyClass,
    retryable: policy.retryable,
    attemptCount: parsed.attemptCount ?? 0,
    maxAttempts: policy.maxAttempts,
    failureReason: parsed.failureReason ?? policy.blockReason ?? null,
    failurePayload:
      parsed.failurePayload === undefined
        ? undefined
        : (redactRetryJobFailurePayload(parsed.failurePayload) as Prisma.InputJsonValue),
    lastAttemptAt: new Date(),
  };

  if (parsed.sourceRefId) {
    return prisma.retryJob.upsert({
      where: {
        sourceType_sourceRefId: {
          sourceType: parsed.sourceType,
          sourceRefId: parsed.sourceRefId,
        },
      },
      create: data,
      update: {
        ...data,
        resolvedAt: null,
        resolvedByUserId: null,
        operatorNote: null,
      },
    });
  }

  return prisma.retryJob.create({ data });
}

export async function syncFailedCronLogsToRetryJobs(limit = 50) {
  const failedLogs = await prisma.cronJobExecutionLog.findMany({
    where: { status: "FAILED" },
    orderBy: { startedAt: "desc" },
    take: limit,
  });

  let created = 0;
  for (const log of failedLogs) {
    const before = await prisma.retryJob.count({
      where: { sourceType: "CRON", sourceRefId: log.id },
    });
    if (before > 0) continue;

    await recordFailedRetryJob({
      sourceType: "CRON",
      sourceRefId: log.id,
      jobCode: log.jobCode,
      failureReason: log.message ?? log.errorStack ?? "Cron execution failed",
      failurePayload: {
        jobName: log.jobName,
        startedAt: log.startedAt.toISOString(),
        triggeredBy: log.triggeredBy,
      },
    });
    created += 1;
  }

  return { scanned: failedLogs.length, created };
}

export async function listRetryJobsService(user: SessionUser, query: RetryJobListQuery) {
  assertPlatformAdmin(user);

  const where: Prisma.RetryJobWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.sourceType ? { sourceType: query.sourceType } : {}),
    ...(query.retryable !== undefined ? { retryable: query.retryable } : {}),
    ...(query.caseId ? { caseId: query.caseId } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.retryJob.count({ where }),
    prisma.retryJob.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    total,
    page: query.page,
    pageSize: query.pageSize,
    items: rows.map(toListItem),
  };
}

export async function operatorQueueRetryJobService(
  user: SessionUser,
  retryJobId: string,
  operatorNote?: string,
) {
  assertPlatformAdmin(user);

  const job = await prisma.retryJob.findUnique({ where: { id: retryJobId } });
  if (!job) {
    throw new NotFoundError("Retry job not found.");
  }

  const gate = canOperatorQueueRetry({
    retryable: job.retryable,
    safetyClass: job.safetyClass,
    status: job.status,
    attemptCount: job.attemptCount,
    maxAttempts: job.maxAttempts,
  });

  if (!gate.allowed) {
    throw new ValidationError(gate.reason ?? "Retry not allowed.");
  }

  const now = new Date();
  const updated = await prisma.retryJob.update({
    where: { id: retryJobId },
    data: {
      status: "PENDING_RETRY",
      nextRetryAt: now,
      resolvedByUserId: user.id,
      operatorNote: operatorNote?.trim() || null,
      attemptCount: { increment: 1 },
      lastAttemptAt: now,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "RETRY_JOB_OPERATOR_QUEUED",
    entityType: "RetryJob",
    entityId: updated.id,
    message: `Operator queued retry for ${updated.jobCode} (${updated.sourceType})`,
    metadata: {
      sourceRefId: updated.sourceRefId,
      caseId: updated.caseId,
      safetyClass: updated.safetyClass,
      attemptCount: updated.attemptCount,
    },
  });

  return toListItem(updated);
}
