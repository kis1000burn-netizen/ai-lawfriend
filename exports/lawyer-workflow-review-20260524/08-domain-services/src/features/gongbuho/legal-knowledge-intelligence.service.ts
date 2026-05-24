import type {
  LegalKnowledgeIntakeStatus,
  LegalKnowledgeLawyerReviewStatus,
  LegalKnowledgeResearchBriefStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  LEGAL_KNOWLEDGE_LAWYER_REVIEW_SLA_HOURS_DEFAULT,
  LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_POLICY_MARKER,
  pickLegalKnowledgeBottleneckStage,
  readBriefComplianceNoRawUgc,
  readIntakeComplianceNoRawUgc,
  readReviewAttestationNoUgcOrPii,
  type LegalKnowledgeIntelligenceBottleneckStage,
} from "@/lib/gongbuho/legal-knowledge-intelligence-policy";

/** Phase 4-I — 라우트·verify 정적 마커 */
export const LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_SERVICE_MARKER =
  "phase4i-gongbuho-legal-knowledge-intelligence-dashboard";

const INTAKE_STATUSES: LegalKnowledgeIntakeStatus[] = [
  "DRAFT",
  "MAPPING_PENDING",
  "READY_FOR_RESEARCH",
  "RESEARCH_IN_PROGRESS",
  "LAWYER_REVIEW_PENDING",
  "PACKET_DRAFT_LINKED",
  "PACKET_APPROVED",
  "PIPELINE_REJECTED",
  "REJECTED",
  "ARCHIVED",
];

const BRIEF_STATUSES: LegalKnowledgeResearchBriefStatus[] = [
  "DRAFT",
  "READY_FOR_LAWYER_REVIEW",
  "REVISION_REQUESTED",
  "SUPERSEDED",
  "ARCHIVED",
];

const REVIEW_STATUSES: LegalKnowledgeLawyerReviewStatus[] = [
  "PENDING",
  "APPROVED",
  "REVISION_REQUESTED",
  "REJECTED",
];

function emptyStatusMap<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export type LegalKnowledgeIntelligenceDashboard = {
  generatedAt: string;
  backlog: {
    intakeByStatus: Record<LegalKnowledgeIntakeStatus, number>;
    briefByStatus: Record<LegalKnowledgeResearchBriefStatus, number>;
    reviewByStatus: Record<LegalKnowledgeLawyerReviewStatus, number>;
  };
  funnel: {
    totalIntakes: number;
    intakesWithBrief: number;
    intakesWithApprovedReview: number;
    intakesPacketDraftLinked: number;
    intakesPacketApproved: number;
    reviewsApproved: number;
    reviewsWithPacketDraft: number;
    rates: {
      intakeToBriefPct: number | null;
      briefToApprovedReviewPct: number | null;
      approvedReviewToPacketDraftPct: number | null;
      intakeToPacketApprovedPct: number | null;
    };
  };
  caseTypeDemand: Array<{
    caseType: string;
    intakeCount: number;
    packetApprovedCount: number;
  }>;
  demandGap: {
    activePipelineCount: number;
    withoutBriefCount: number;
    awaitingLawyerReviewCount: number;
    approvedNotCompiledCount: number;
    packetDraftNotApprovedCount: number;
  };
  lawyerReviewSla: {
    slaHoursDefault: number;
    pendingReviewCount: number;
    briefsAwaitingReviewCount: number;
    overduePendingReviewCount: number;
    overdueBriefsAwaitingReviewCount: number;
    avgHoursReviewDecisionTime: number | null;
    bottleneckStage: LegalKnowledgeIntelligenceBottleneckStage;
  };
  complianceMeta: {
    intakeNoRawUgcPass: number;
    intakeNoRawUgcFail: number;
    briefNoRawUgcPass: number;
    briefNoRawUgcFail: number;
    reviewAttestationPass: number;
    reviewAttestationFail: number;
  };
};

export async function getLegalKnowledgeIntelligenceDashboard(): Promise<LegalKnowledgeIntelligenceDashboard> {
  const now = new Date();
  const slaCutoff = new Date(
    now.getTime() - LEGAL_KNOWLEDGE_LAWYER_REVIEW_SLA_HOURS_DEFAULT * 60 * 60 * 1000,
  );

  const [
    intakeGroups,
    briefGroups,
    reviewGroups,
    totalIntakes,
    intakesWithBrief,
    intakesWithApprovedReview,
    intakesPacketDraftLinked,
    intakesPacketApproved,
    reviewsApproved,
    reviewsWithPacketDraft,
    activePipelineCount,
    withoutBriefCount,
    briefsAwaitingReviewCount,
    intakeLawyerReviewPendingCount,
    approvedNotCompiledCount,
    packetDraftNotApprovedCount,
    pendingReviewCount,
    overduePendingReviewCount,
    overdueBriefsAwaitingReviewCount,
    intakeComplianceRows,
    briefComplianceRows,
    reviewAttestationRows,
    completedReviewTimings,
    intakesForCaseType,
  ] = await Promise.all([
    prisma.legalKnowledgeDemandIntake.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.legalKnowledgeResearchBrief.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.legalKnowledgeLawyerReviewDecision.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.legalKnowledgeDemandIntake.count(),
    prisma.legalKnowledgeDemandIntake.count({
      where: { researchBriefs: { some: {} } },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: { lawyerReviews: { some: { status: "APPROVED" } } },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: { status: "PACKET_DRAFT_LINKED" },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: { status: "PACKET_APPROVED" },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.count({
      where: { status: "APPROVED" },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.count({
      where: { gongbuhoPacketId: { not: null } },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: {
        status: { notIn: ["ARCHIVED", "REJECTED", "PIPELINE_REJECTED", "PACKET_APPROVED"] },
      },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: {
        status: { in: ["READY_FOR_RESEARCH", "RESEARCH_IN_PROGRESS"] },
        researchBriefs: { none: {} },
      },
    }),
    prisma.legalKnowledgeResearchBrief.count({
      where: { status: "READY_FOR_LAWYER_REVIEW" },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: { status: "LAWYER_REVIEW_PENDING" },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.count({
      where: { status: "APPROVED", gongbuhoPacketId: null },
    }),
    prisma.legalKnowledgeDemandIntake.count({
      where: { status: "PACKET_DRAFT_LINKED" },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.count({
      where: { status: "PENDING" },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.count({
      where: { status: "PENDING", createdAt: { lt: slaCutoff } },
    }),
    prisma.legalKnowledgeResearchBrief.count({
      where: { status: "READY_FOR_LAWYER_REVIEW", updatedAt: { lt: slaCutoff } },
    }),
    prisma.legalKnowledgeDemandIntake.findMany({
      select: { intakeCompliance: true },
    }),
    prisma.legalKnowledgeResearchBrief.findMany({
      select: { researchCompliance: true },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.findMany({
      select: { reviewerAttestation: true },
    }),
    prisma.legalKnowledgeLawyerReviewDecision.findMany({
      where: { status: { not: "PENDING" } },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.legalKnowledgeDemandIntake.findMany({
      select: { caseTypeMapping: true, status: true },
    }),
  ]);

  const intakeByStatus = emptyStatusMap(INTAKE_STATUSES);
  for (const g of intakeGroups) {
    intakeByStatus[g.status] = g._count._all;
  }

  const briefByStatus = emptyStatusMap(BRIEF_STATUSES);
  for (const g of briefGroups) {
    briefByStatus[g.status] = g._count._all;
  }

  const reviewByStatus = emptyStatusMap(REVIEW_STATUSES);
  for (const g of reviewGroups) {
    reviewByStatus[g.status] = g._count._all;
  }

  const caseTypeMap = new Map<string, { intakeCount: number; packetApprovedCount: number }>();
  for (const row of intakesForCaseType) {
    const mapped =
      typeof row.caseTypeMapping === "object" &&
      row.caseTypeMapping !== null &&
      typeof (row.caseTypeMapping as Record<string, unknown>).mappedCaseType === "string"
        ? String((row.caseTypeMapping as Record<string, unknown>).mappedCaseType).trim()
        : "UNKNOWN";
    const caseType = mapped || "UNKNOWN";
    const prev = caseTypeMap.get(caseType) ?? { intakeCount: 0, packetApprovedCount: 0 };
    prev.intakeCount += 1;
    if (row.status === "PACKET_APPROVED") prev.packetApprovedCount += 1;
    caseTypeMap.set(caseType, prev);
  }

  const caseTypeDemand = [...caseTypeMap.entries()]
    .map(([caseType, counts]) => ({ caseType, ...counts }))
    .sort((a, b) => b.intakeCount - a.intakeCount);

  let intakeNoRawUgcPass = 0;
  let intakeNoRawUgcFail = 0;
  for (const row of intakeComplianceRows) {
    if (readIntakeComplianceNoRawUgc(row.intakeCompliance)) intakeNoRawUgcPass += 1;
    else intakeNoRawUgcFail += 1;
  }

  let briefNoRawUgcPass = 0;
  let briefNoRawUgcFail = 0;
  for (const row of briefComplianceRows) {
    if (readBriefComplianceNoRawUgc(row.researchCompliance)) briefNoRawUgcPass += 1;
    else briefNoRawUgcFail += 1;
  }

  let reviewAttestationPass = 0;
  let reviewAttestationFail = 0;
  for (const row of reviewAttestationRows) {
    if (readReviewAttestationNoUgcOrPii(row.reviewerAttestation)) reviewAttestationPass += 1;
    else reviewAttestationFail += 1;
  }

  let avgHoursReviewDecisionTime: number | null = null;
  if (completedReviewTimings.length > 0) {
    const totalMs = completedReviewTimings.reduce(
      (sum, r) => sum + (r.updatedAt.getTime() - r.createdAt.getTime()),
      0,
    );
    avgHoursReviewDecisionTime =
      Math.round((totalMs / completedReviewTimings.length / (60 * 60 * 1000)) * 10) / 10;
  }

  const awaitingLawyerReviewCount = briefsAwaitingReviewCount + intakeLawyerReviewPendingCount;

  const bottleneckCounts: Record<LegalKnowledgeIntelligenceBottleneckStage, number> = {
    INTAKE_PRE_BRIEF: withoutBriefCount,
    BRIEF_AWAITING_REVIEW: awaitingLawyerReviewCount,
    REVIEW_APPROVED_NO_PACKET: approvedNotCompiledCount,
    PACKET_DRAFT_NOT_APPROVED: packetDraftNotApprovedCount,
  };

  return {
    generatedAt: now.toISOString(),
    backlog: {
      intakeByStatus,
      briefByStatus,
      reviewByStatus,
    },
    funnel: {
      totalIntakes,
      intakesWithBrief,
      intakesWithApprovedReview,
      intakesPacketDraftLinked,
      intakesPacketApproved,
      reviewsApproved,
      reviewsWithPacketDraft,
      rates: {
        intakeToBriefPct: rate(intakesWithBrief, totalIntakes),
        briefToApprovedReviewPct: rate(intakesWithApprovedReview, intakesWithBrief),
        approvedReviewToPacketDraftPct: rate(reviewsWithPacketDraft, reviewsApproved),
        intakeToPacketApprovedPct: rate(intakesPacketApproved, totalIntakes),
      },
    },
    caseTypeDemand,
    demandGap: {
      activePipelineCount,
      withoutBriefCount,
      awaitingLawyerReviewCount,
      approvedNotCompiledCount,
      packetDraftNotApprovedCount,
    },
    lawyerReviewSla: {
      slaHoursDefault: LEGAL_KNOWLEDGE_LAWYER_REVIEW_SLA_HOURS_DEFAULT,
      pendingReviewCount,
      briefsAwaitingReviewCount,
      overduePendingReviewCount,
      overdueBriefsAwaitingReviewCount,
      avgHoursReviewDecisionTime,
      bottleneckStage: pickLegalKnowledgeBottleneckStage(bottleneckCounts),
    },
    complianceMeta: {
      intakeNoRawUgcPass,
      intakeNoRawUgcFail,
      briefNoRawUgcPass,
      briefNoRawUgcFail,
      reviewAttestationPass,
      reviewAttestationFail,
    },
  };
}

/** verify·테스트용 — 본문 필드가 dashboard 타입에 없음을 명시 */
export function assertLegalKnowledgeIntelligenceDashboardMetaOnly(
  dashboard: LegalKnowledgeIntelligenceDashboard,
): LegalKnowledgeIntelligenceDashboard {
  const forbidden = [
    "legalIssueOutline",
    "reviewNotes",
    "operatorNote",
    "rawSnippet",
    "draftText",
  ];
  const serialized = JSON.stringify(dashboard);
  for (const key of forbidden) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Dashboard must not expose body field: ${key}`);
    }
  }
  return dashboard;
}

export { LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_POLICY_MARKER };
