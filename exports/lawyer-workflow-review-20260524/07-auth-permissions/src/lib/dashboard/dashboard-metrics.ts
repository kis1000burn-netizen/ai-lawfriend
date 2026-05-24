import type { CaseStatus } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { buildAccessibleCaseWhere } from "@/features/cases/case.permissions";
import {
  formatDashboardDateTime,
  getDashboardAdminAttentionCtaLabel,
  getDashboardCaseHref,
  getDashboardCaseStatusLabel,
  getDashboardCaseTitle,
  getDashboardReviewCtaLabel,
} from "@/lib/dashboard/dashboard-display";
import {
  ADMIN_STALE_CASE_DAYS,
  getAdminStaleCaseLabel,
  getAdminStaleCaseReason,
  getStaleDays,
} from "@/lib/dashboard/admin-stale-case";
import { getLawyerReviewPriority } from "@/lib/dashboard/lawyer-review-priority";
import { prisma } from "@/lib/prisma";

const LAWYER_PREVIEW_STATUS: CaseStatus[] = [
  "INTERVIEW_DONE",
  "DRAFTING",
  "REVIEW_PENDING",
  "INTAKE_PENDING",
];

export type ClientCaseReadinessItem = {
  key: "basic" | "story" | "opponent" | "attachments" | "review";
  label: string;
  done: boolean;
  description?: string;
};

export type ClientCaseReadiness = {
  percent: number;
  doneCount: number;
  totalCount: number;
  items: ClientCaseReadinessItem[];
  sourceCaseId?: string;
  sourceCaseTitle?: string;
};

export type ClientCasePreviewItem = {
  id: string;
  title: string;
  status: string;
  statusLabel?: string;
  updatedAtLabel?: string;
  href: string;
  label: string;
  readinessPercent?: number;
  readinessLabel?: string;
};

export const EMPTY_CLIENT_CASE_READINESS: ClientCaseReadiness = {
  percent: 0,
  doneCount: 0,
  totalCount: 5,
  items: [
    {
      key: "basic",
      label: "기본 정보",
      done: false,
      description: "사건 제목과 기본 정보가 준비되면 완료됩니다.",
    },
    {
      key: "story",
      label: "사건 경위",
      done: false,
      description: "사건의 흐름이나 인터뷰 답변이 준비되면 완료됩니다.",
    },
    {
      key: "opponent",
      label: "상대방 정보",
      done: false,
      description: "상대방 또는 관련 당사자 정보가 준비되면 완료됩니다.",
    },
    {
      key: "attachments",
      label: "첨부자료",
      done: false,
      description: "계약서, 문자, 사진 등 자료가 연결되면 완료됩니다.",
    },
    {
      key: "review",
      label: "검토 준비",
      done: false,
      description: "인터뷰가 진행되거나 검토 단계로 넘어가면 완료됩니다.",
    },
  ],
};

export type ClientDashboardMetrics = {
  totalCases: number;
  activeCases: number;
  interviewInProgress: number;
  attachmentsReady: number;
  /** 대표 사건 진단 카드 딥링크(진행 중·최근 사건 기준). 없으면 목록으로 유도 */
  guidanceCaseHref?: string | null;
  readiness?: ClientCaseReadiness;
  recentCasesPreview?: ClientCasePreviewItem[];
};

export type LawyerReviewQueuePreviewItem = {
  id: string;
  title: string;
  status: string;
  statusLabel?: string;
  updatedAtLabel?: string;
  href: string;
  label: string;
  priorityScore?: number;
  priorityLabel?: string;
  priorityTone?: "cyan" | "amber" | "slate";
};

export type LawyerDashboardMetrics = {
  interviewCompleted: number;
  draftReady: number;
  needsSupplement: number;
  reviewQueuePreview?: LawyerReviewQueuePreviewItem[];
};

export type AdminAttentionPreviewItem = {
  id: string;
  title: string;
  status: string;
  statusLabel?: string;
  updatedAtLabel?: string;
  href: string;
  label: string;
  reason: string;
  staleDays?: number;
  staleLabel?: string;
  staleReason?: string;
};

export type AdminDashboardMetrics = {
  totalCases: number;
  reviewPending: number;
  approvalPending: number;
  attentionNeeded: number;
  /** HOLD/INTAKE_PENDING/REVIEW_PENDING 중 updatedAt 7일+ 미변경(접근 범위 내). attentionNeeded와 별도. */
  staleCaseCount: number;
  statusBreakdown?: {
    intakePending: number;
    inInterview: number;
    interviewDone: number;
    drafting: number;
    reviewPending: number;
    approved: number;
    hold: number;
    rejected: number;
    closed: number;
  };
  attentionPreview?: AdminAttentionPreviewItem[];
};

export const EMPTY_CLIENT_DASHBOARD_METRICS: ClientDashboardMetrics = {
  totalCases: 0,
  activeCases: 0,
  interviewInProgress: 0,
  attachmentsReady: 0,
  readiness: EMPTY_CLIENT_CASE_READINESS,
  recentCasesPreview: [],
};

export const EMPTY_LAWYER_DASHBOARD_METRICS: LawyerDashboardMetrics = {
  interviewCompleted: 0,
  draftReady: 0,
  needsSupplement: 0,
  reviewQueuePreview: [],
};

export const EMPTY_ADMIN_DASHBOARD_METRICS: AdminDashboardMetrics = {
  totalCases: 0,
  reviewPending: 0,
  approvalPending: 0,
  attentionNeeded: 0,
  staleCaseCount: 0,
  statusBreakdown: {
    intakePending: 0,
    inInterview: 0,
    interviewDone: 0,
    drafting: 0,
    reviewPending: 0,
    approved: 0,
    hold: 0,
    rejected: 0,
    closed: 0,
  },
  attentionPreview: [],
};

/** 종료·반려 등 비진행으로 보는 상태(삭제 제외는 `buildAccessibleCaseWhere`가 이미 처리). */
const CLIENT_NON_ACTIVE_STATUSES: CaseStatus[] = ["CLOSED", "REJECTED"];

/** 관리자 운영 확인 후보 카드용 상태별 안내(운영 확인 톤). `staleReason`이 있으면 매핑에서 우선한다. */
function getAdminOperationalReviewReason(status: string): string {
  switch (status) {
    case "HOLD":
      return "보류 상태로 남아 있어 진행 상태 확인이 필요합니다.";
    case "INTAKE_PENDING":
      return "접수 대기 상태로 남아 있어 초기 확인이 필요합니다.";
    case "REVIEW_PENDING":
      return "검토 대기 상태로 남아 있어 담당자 확인이 필요합니다.";
    default:
      return "운영 확인이 필요한 사건입니다.";
  }
}

export async function fetchClientDashboardMetrics(
  user: SessionUser,
): Promise<ClientDashboardMetrics> {
  const base = await buildAccessibleCaseWhere(user);
  const [totalCases, activeCases, interviewInProgress, attachmentsReady] =
    await Promise.all([
      prisma.case.count({ where: base }),
      prisma.case.count({
        where: {
          AND: [base, { status: { notIn: CLIENT_NON_ACTIVE_STATUSES } }],
        },
      }),
      prisma.case.count({
        where: { AND: [base, { status: "IN_INTERVIEW" }] },
      }),
      prisma.case.count({
        where: { AND: [base, { status: "INTAKE_PENDING" }] },
      }),
    ]);

  /* attachmentsReady 1차: INTAKE_PENDING 건수. 정밀 completeness는 대시보드 2.1. */
  return {
    totalCases,
    activeCases,
    interviewInProgress,
    attachmentsReady,
  };
}

export async function fetchLawyerDashboardMetrics(
  user: SessionUser,
): Promise<LawyerDashboardMetrics> {
  const base = await buildAccessibleCaseWhere(user);
  const [
    interviewCompleted,
    draftReady,
    needsSupplement,
    previewCases,
  ] = await Promise.all([
    prisma.case.count({
      where: { AND: [base, { status: "INTERVIEW_DONE" }] },
    }),
    prisma.case.count({
      where: {
        AND: [
          base,
          { status: { in: ["DRAFTING", "REVIEW_PENDING"] } },
        ],
      },
    }),
    prisma.case.count({
      where: {
        AND: [
          base,
          { status: { in: ["INTAKE_PENDING", "HOLD"] } },
        ],
      },
    }),
    prisma.case.findMany({
      where: {
        AND: [base, { status: { in: LAWYER_PREVIEW_STATUS } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const reviewQueuePreview: LawyerReviewQueuePreviewItem[] =
    previewCases.map((item) => {
      const priority = getLawyerReviewPriority(item.status);

      return {
        id: item.id,
        title: getDashboardCaseTitle(item.title),
        status: item.status,
        statusLabel: getDashboardCaseStatusLabel(item.status),
        updatedAtLabel: formatDashboardDateTime(item.updatedAt),
        href: getDashboardCaseHref(item.id),
        label: getDashboardReviewCtaLabel(),
        priorityScore: priority.score,
        priorityLabel: priority.label,
        priorityTone: priority.tone,
      };
    });

  return {
    interviewCompleted,
    draftReady,
    needsSupplement,
    reviewQueuePreview,
  };
}

export async function fetchAdminDashboardMetrics(
  user: SessionUser,
): Promise<AdminDashboardMetrics> {
  const base = await buildAccessibleCaseWhere(user);
  const withStatus = (status: CaseStatus) =>
    prisma.case.count({
      where: { AND: [base, { status }] },
    });

  const now = new Date();
  const staleCutoff = new Date(
    now.getTime() -
      ADMIN_STALE_CASE_DAYS.attention * 24 * 60 * 60 * 1000,
  );

  const [
    totalCases,
    reviewPending,
    approvalPending,
    attentionNeeded,
    intakePending,
    inInterview,
    interviewDone,
    drafting,
    approved,
    hold,
    rejected,
    closed,
    attentionPreviewCases,
    stalePreviewCases,
    staleCaseCount,
  ] = await Promise.all([
    prisma.case.count({ where: base }),
    withStatus("REVIEW_PENDING"),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.case.count({
      where: {
        AND: [base, { status: { in: ["HOLD", "INTAKE_PENDING"] } }],
      },
    }),
    withStatus("INTAKE_PENDING"),
    withStatus("IN_INTERVIEW"),
    withStatus("INTERVIEW_DONE"),
    withStatus("DRAFTING"),
    withStatus("APPROVED"),
    withStatus("HOLD"),
    withStatus("REJECTED"),
    withStatus("CLOSED"),
    prisma.case.findMany({
      where: {
        AND: [
          base,
          {
            status: {
              in: ["HOLD", "INTAKE_PENDING", "REVIEW_PENDING"],
            },
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.case.findMany({
      where: {
        AND: [
          base,
          {
            status: {
              in: ["HOLD", "INTAKE_PENDING", "REVIEW_PENDING"],
            },
            updatedAt: { lte: staleCutoff },
          },
        ],
      },
      orderBy: { updatedAt: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.case.count({
      where: {
        AND: [
          base,
          {
            status: {
              in: ["HOLD", "INTAKE_PENDING", "REVIEW_PENDING"],
            },
            updatedAt: { lte: staleCutoff },
          },
        ],
      },
    }),
  ]);

  type AttentionPreviewRow = (typeof attentionPreviewCases)[number] & {
    __staleCandidate?: boolean;
  };

  const attentionPreviewCaseMap = new Map<string, AttentionPreviewRow>();

  for (const item of attentionPreviewCases) {
    attentionPreviewCaseMap.set(item.id, {
      ...item,
      __staleCandidate: false,
    });
  }

  for (const item of stalePreviewCases) {
    attentionPreviewCaseMap.set(item.id, {
      ...item,
      __staleCandidate: true,
    });
  }

  const mergedAttentionPreviewCases = Array.from(
    attentionPreviewCaseMap.values(),
  )
    .sort((a, b) => {
      const aStaleDays = getStaleDays(a.updatedAt, now);
      const bStaleDays = getStaleDays(b.updatedAt, now);

      const aIsStale = aStaleDays >= ADMIN_STALE_CASE_DAYS.attention;
      const bIsStale = bStaleDays >= ADMIN_STALE_CASE_DAYS.attention;

      if (aIsStale !== bIsStale) {
        return aIsStale ? -1 : 1;
      }

      if (aIsStale && bIsStale) {
        return bStaleDays - aStaleDays;
      }

      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    })
    .slice(0, 5);

  const attentionPreview: AdminAttentionPreviewItem[] =
    mergedAttentionPreviewCases.map((item) => {
      const staleDays = getStaleDays(item.updatedAt, now);
      const staleLabel = getAdminStaleCaseLabel(staleDays);
      const staleReason = getAdminStaleCaseReason(staleDays);
      const existingReason = getAdminOperationalReviewReason(item.status);

      return {
        id: item.id,
        title: getDashboardCaseTitle(item.title),
        status: item.status,
        statusLabel: getDashboardCaseStatusLabel(item.status),
        updatedAtLabel: formatDashboardDateTime(item.updatedAt),
        href: getDashboardCaseHref(item.id),
        label: getDashboardAdminAttentionCtaLabel(),
        reason: staleReason ?? existingReason,
        staleDays: staleLabel ? staleDays : undefined,
        staleLabel,
        staleReason,
      };
    });

  return {
    totalCases,
    reviewPending,
    approvalPending,
    attentionNeeded,
    staleCaseCount,
    statusBreakdown: {
      intakePending,
      inInterview,
      interviewDone,
      drafting,
      reviewPending,
      approved,
      hold,
      rejected,
      closed,
    },
    attentionPreview,
  };
}
