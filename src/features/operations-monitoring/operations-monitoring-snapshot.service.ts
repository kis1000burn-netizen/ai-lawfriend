/**
 * Phase 17-A — Live post-deploy monitoring snapshot (DB-backed).
 * Operators see who/when/case + AI · document · notification · file signals.
 */
import { prisma } from "@/lib/prisma";
import { getHealthStatus } from "@/lib/health";
import { getReleaseMetaInline } from "@/lib/release-meta";
import {
  isOperationsObserverIssueAction,
  OPERATIONS_OBSERVER_DOMAINS,
  resolveOperationsObserverDomain,
  type OperationsObserverDomain,
} from "./operations-observer.constants";

export const OPERATIONS_MONITORING_SNAPSHOT_MARKER_PHASE17A =
  "phase17a-post-deploy-monitoring-snapshot" as const;

const DEFAULT_WINDOW_HOURS = 24;

export type OperationsMonitoringRecentAuditIssue = {
  id: string;
  action: string;
  domain: OperationsObserverDomain;
  actorUserId: string;
  entityType: string | null;
  entityId: string | null;
  message: string | null;
  createdAt: string;
};

export type OperationsMonitoringRecentExternalFailure = {
  id: string;
  caseId: string;
  channel: string;
  status: string;
  failureReason: string | null;
  recipientUserId: string;
  createdAt: string;
};

export type OperationsMonitoringRecentCronFailure = {
  id: string;
  jobCode: string;
  jobName: string;
  status: string;
  message: string | null;
  startedAt: string;
};

export type OperationsMonitoringSnapshot = {
  capturedAt: string;
  windowHours: number;
  health: Awaited<ReturnType<typeof getHealthStatus>>;
  release: ReturnType<typeof getReleaseMetaInline>;
  audit: {
    totalInWindow: number;
    byDomain: Record<OperationsObserverDomain, number>;
    issueCountInWindow: number;
    recentIssues: OperationsMonitoringRecentAuditIssue[];
  };
  externalMessages: {
    failedInWindow: number;
    recentFailures: OperationsMonitoringRecentExternalFailure[];
  };
  cron: {
    failedInWindow: number;
    recentFailures: OperationsMonitoringRecentCronFailure[];
  };
};

function windowStart(hours: number): Date {
  const start = new Date();
  start.setHours(start.getHours() - hours);
  return start;
}

function emptyDomainCounts(): Record<OperationsObserverDomain, number> {
  return OPERATIONS_OBSERVER_DOMAINS.reduce(
    (acc, domain) => {
      acc[domain] = 0;
      return acc;
    },
    {} as Record<OperationsObserverDomain, number>,
  );
}

export async function getOperationsMonitoringSnapshot(
  windowHours = DEFAULT_WINDOW_HOURS,
): Promise<OperationsMonitoringSnapshot> {
  const since = windowStart(windowHours);
  const [health, release, auditRows, externalFailures, cronFailures] = await Promise.all([
    getHealthStatus(),
    Promise.resolve(getReleaseMetaInline()),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        action: true,
        actorUserId: true,
        entityType: true,
        entityId: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.externalMessageLog.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ["FAILED", "SKIPPED_NO_CONSENT"] },
      },
      select: {
        id: true,
        caseId: true,
        channel: true,
        status: true,
        failureReason: true,
        recipientUserId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.cronJobExecutionLog.findMany({
      where: {
        startedAt: { gte: since },
        status: "FAILED",
      },
      select: {
        id: true,
        jobCode: true,
        jobName: true,
        status: true,
        message: true,
        startedAt: true,
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
  ]);

  const byDomain = emptyDomainCounts();
  let issueCountInWindow = 0;
  const recentIssues: OperationsMonitoringRecentAuditIssue[] = [];

  for (const row of auditRows) {
    const domain = resolveOperationsObserverDomain(row.action);
    byDomain[domain] += 1;
    if (isOperationsObserverIssueAction(row.action)) {
      issueCountInWindow += 1;
      if (recentIssues.length < 15) {
        recentIssues.push({
          id: row.id,
          action: row.action,
          domain,
          actorUserId: row.actorUserId,
          entityType: row.entityType,
          entityId: row.entityId,
          message: row.message,
          createdAt: row.createdAt.toISOString(),
        });
      }
    }
  }

  return {
    capturedAt: new Date().toISOString(),
    windowHours,
    health,
    release,
    audit: {
      totalInWindow: auditRows.length,
      byDomain,
      issueCountInWindow,
      recentIssues,
    },
    externalMessages: {
      failedInWindow: externalFailures.length,
      recentFailures: externalFailures.map((row) => ({
        id: row.id,
        caseId: row.caseId,
        channel: row.channel,
        status: row.status,
        failureReason: row.failureReason,
        recipientUserId: row.recipientUserId,
        createdAt: row.createdAt.toISOString(),
      })),
    },
    cron: {
      failedInWindow: cronFailures.length,
      recentFailures: cronFailures.map((row) => ({
        id: row.id,
        jobCode: row.jobCode,
        jobName: row.jobName,
        status: row.status,
        message: row.message,
        startedAt: row.startedAt.toISOString(),
      })),
    },
  };
}
