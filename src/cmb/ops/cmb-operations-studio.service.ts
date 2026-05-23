import type { AibeopchinCmbConfigStatus } from "@prisma/client";

import { listCmbCaseConfigs, listRegisteredCmbCaseTypes } from "@/cmb/core/cmb-registry";
import { validateSingleCmbConfig } from "@/cmb/core/cmb-validator";
import {
  CMB_OPERATIONS_STUDIO_RECENT_EVENTS_LIMIT,
  CMB_PHASE6H_OPERATIONS_STUDIO_POLICY_MARKER,
  pickCmbOperationsBottleneckStage,
  type CmbOperationsStudioBottleneckStage,
  type CmbOperationsStudioCoverageGap,
} from "@/cmb/ops/cmb-operations-studio-policy";
import { prisma } from "@/lib/prisma";

/** Phase 6-H — 라우트·verify 정적 마커 */
export const CMB_PHASE6H_OPERATIONS_STUDIO_SERVICE_MARKER =
  "phase6h-cmb-operations-studio";

const REVISION_STATUSES: AibeopchinCmbConfigStatus[] = [
  "DRAFT",
  "REVIEW",
  "VERIFY_PASS",
  "LOCKED",
  "PUBLISHED",
];

function emptyStatusMap(): Record<AibeopchinCmbConfigStatus, number> {
  return {
    DRAFT: 0,
    REVIEW: 0,
    VERIFY_PASS: 0,
    LOCKED: 0,
    PUBLISHED: 0,
  };
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export type CmbOperationsStudioDashboard = {
  generatedAt: string;
  revisionBacklog: {
    total: number;
    byStatus: Record<AibeopchinCmbConfigStatus, number>;
  };
  statusQueue: {
    draft: number;
    review: number;
    verifyPass: number;
    locked: number;
    published: number;
    nonTerminalBacklog: number;
  };
  publishEventsRecent: Array<{
    id: string;
    revisionId: string;
    caseType: string;
    version: string;
    fromStatus: AibeopchinCmbConfigStatus;
    toStatus: AibeopchinCmbConfigStatus;
    evidenceTag: string;
    verifyPassed: boolean;
    actorUserId: string;
    createdAt: string;
  }>;
  caseTypeCoverage: Array<{
    caseType: string;
    registryPresent: boolean;
    registryValidationOk: boolean;
    revisionCount: number;
    publishedRevisionId: string | null;
    publishedVersion: string | null;
    latestRevisionStatus: AibeopchinCmbConfigStatus | null;
    coverageGap: CmbOperationsStudioCoverageGap;
  }>;
  coverageSummary: {
    registeredCaseTypes: number;
    withPublishedRevision: number;
    withoutPublishedRevision: number;
    withValidationFailure: number;
  };
  transitionFunnel: {
    totalRevisions: number;
    reachedVerifyPass: number;
    reachedLocked: number;
    reachedPublished: number;
    rates: {
      toVerifyPassPct: number | null;
      toLockedPct: number | null;
      toPublishedPct: number | null;
    };
  };
  bottleneckStage: CmbOperationsStudioBottleneckStage;
};

export async function getCmbOperationsStudioDashboard(): Promise<CmbOperationsStudioDashboard> {
  const now = new Date();
  const registeredTypes = listRegisteredCmbCaseTypes();

  const [
    revisionGroups,
    totalRevisions,
    reachedVerifyPass,
    reachedLocked,
    reachedPublished,
    recentEvents,
    revisionsByCaseType,
    publishedByCaseType,
  ] = await Promise.all([
    prisma.aibeopchinCmbConfigRevision.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.aibeopchinCmbConfigRevision.count(),
    prisma.aibeopchinCmbConfigRevision.count({
      where: {
        status: { in: ["VERIFY_PASS", "LOCKED", "PUBLISHED"] },
      },
    }),
    prisma.aibeopchinCmbConfigRevision.count({
      where: {
        status: { in: ["LOCKED", "PUBLISHED"] },
      },
    }),
    prisma.aibeopchinCmbConfigRevision.count({
      where: { status: "PUBLISHED" },
    }),
    prisma.aibeopchinCmbPublishEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: CMB_OPERATIONS_STUDIO_RECENT_EVENTS_LIMIT,
      select: {
        id: true,
        revisionId: true,
        fromStatus: true,
        toStatus: true,
        evidenceTag: true,
        verifyPassed: true,
        actorUserId: true,
        createdAt: true,
        revision: {
          select: {
            caseType: true,
            version: true,
          },
        },
      },
    }),
    prisma.aibeopchinCmbConfigRevision.groupBy({
      by: ["caseType"],
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.aibeopchinCmbConfigRevision.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        caseType: true,
        version: true,
      },
    }),
  ]);

  const byStatus = emptyStatusMap();
  for (const group of revisionGroups) {
    byStatus[group.status] = group._count._all;
  }

  const revisionCountMap = new Map(
    revisionsByCaseType.map((r) => [r.caseType, r._count._all]),
  );
  const publishedMap = new Map(
    publishedByCaseType.map((r) => [r.caseType, { id: r.id, version: r.version }]),
  );

  const latestStatusRows = await Promise.all(
    registeredTypes.map(async (caseType) => {
      const latest = await prisma.aibeopchinCmbConfigRevision.findFirst({
        where: { caseType },
        orderBy: [{ updatedAt: "desc" }],
        select: { status: true },
      });
      return { caseType, status: latest?.status ?? null };
    }),
  );
  const latestStatusMap = new Map(latestStatusRows.map((r) => [r.caseType, r.status]));

  const caseTypeCoverage: CmbOperationsStudioDashboard["caseTypeCoverage"] = [];
  let withPublishedRevision = 0;
  let withoutPublishedRevision = 0;
  let withValidationFailure = 0;

  for (const caseType of registeredTypes) {
    const registryConfig = listCmbCaseConfigs().find((c) => c.caseType === caseType);
    const registryValidationOk =
      registryConfig != null && validateSingleCmbConfig(registryConfig).length === 0;
    const revisionCount = revisionCountMap.get(caseType) ?? 0;
    const published = publishedMap.get(caseType) ?? null;

    let coverageGap: CmbOperationsStudioCoverageGap = "NONE";
    if (!registryValidationOk) {
      coverageGap = "VALIDATION_FAIL";
      withValidationFailure += 1;
    } else if (revisionCount === 0) {
      coverageGap = "NO_REVISION";
      withoutPublishedRevision += 1;
    } else if (!published) {
      coverageGap = "NO_PUBLISHED";
      withoutPublishedRevision += 1;
    } else {
      withPublishedRevision += 1;
    }

    caseTypeCoverage.push({
      caseType,
      registryPresent: registryConfig != null,
      registryValidationOk,
      revisionCount,
      publishedRevisionId: published?.id ?? null,
      publishedVersion: published?.version ?? null,
      latestRevisionStatus: latestStatusMap.get(caseType) ?? null,
      coverageGap,
    });
  }

  const draftReviewQueue = byStatus.DRAFT + byStatus.REVIEW;
  const verifyPassAwaitingLock = byStatus.VERIFY_PASS;
  const lockedAwaitingPublish = byStatus.LOCKED;
  const caseTypeNoPublished = withoutPublishedRevision;

  const bottleneckStage = pickCmbOperationsBottleneckStage({
    DRAFT_REVIEW_QUEUE: draftReviewQueue,
    VERIFY_PASS_AWAITING_LOCK: verifyPassAwaitingLock,
    LOCKED_AWAITING_PUBLISH: lockedAwaitingPublish,
    CASE_TYPE_NO_PUBLISHED: caseTypeNoPublished,
  });

  return {
    generatedAt: now.toISOString(),
    revisionBacklog: {
      total: totalRevisions,
      byStatus,
    },
    statusQueue: {
      draft: byStatus.DRAFT,
      review: byStatus.REVIEW,
      verifyPass: byStatus.VERIFY_PASS,
      locked: byStatus.LOCKED,
      published: byStatus.PUBLISHED,
      nonTerminalBacklog:
        byStatus.DRAFT + byStatus.REVIEW + byStatus.VERIFY_PASS + byStatus.LOCKED,
    },
    publishEventsRecent: recentEvents.map((e) => ({
      id: e.id,
      revisionId: e.revisionId,
      caseType: e.revision.caseType,
      version: e.revision.version,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      evidenceTag: e.evidenceTag,
      verifyPassed: e.verifyPassed,
      actorUserId: e.actorUserId,
      createdAt: e.createdAt.toISOString(),
    })),
    caseTypeCoverage,
    coverageSummary: {
      registeredCaseTypes: registeredTypes.length,
      withPublishedRevision,
      withoutPublishedRevision,
      withValidationFailure,
    },
    transitionFunnel: {
      totalRevisions,
      reachedVerifyPass,
      reachedLocked,
      reachedPublished,
      rates: {
        toVerifyPassPct: rate(reachedVerifyPass, totalRevisions),
        toLockedPct: rate(reachedLocked, totalRevisions),
        toPublishedPct: rate(reachedPublished, totalRevisions),
      },
    },
    bottleneckStage,
  };
}

export function assertCmbOperationsStudioDashboardMetaOnly(
  dashboard: CmbOperationsStudioDashboard,
): CmbOperationsStudioDashboard {
  const serialized = JSON.stringify(dashboard);
  if (serialized.includes('"configJson"')) {
    throw new Error("CMB Operations Studio must not expose configJson");
  }
  return dashboard;
}

export { CMB_PHASE6H_OPERATIONS_STUDIO_POLICY_MARKER, REVISION_STATUSES };
