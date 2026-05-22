import { Prisma, CaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { buildAccessibleCaseWhere } from "@/features/cases/case.permissions";

export type CaseListFilters = {
  page: number;
  pageSize: number;
  search?: string;
  status?: "CREATED" | "IN_INTERVIEW" | "CLOSED" | "ALL";
};

/**
 * 목록·단건(`GET /api/cases/:id`)·생성/수정 응답 공통 선택 — [353-P1-IO05] `buildPermissionContextForCase`·상세 직렬화와 동일한 담당 필드 축.
 */
export const caseSelect = {
  id: true,
  ownerUserId: true,
  assignedLawyerUserId: true,
  assignedStaffUserId: true,
  title: true,
  description: true,
  category: true,
  opponentName: true,
  courtName: true,
  incidentDate: true,
  status: true,
  questionSetId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CaseSelect;

export async function createCase(data: {
  ownerUserId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  opponentName?: string | null;
  courtName?: string | null;
  incidentDate?: Date | null;
}) {
  return prisma.case.create({
    data,
    select: caseSelect,
  });
}

export async function findAccessibleCases(
  currentUser: SessionUser,
  filters: CaseListFilters
) {
  const accessibleWhere = await buildAccessibleCaseWhere(currentUser);

  const where: Prisma.CaseWhereInput = {
    AND: [
      accessibleWhere,
      ...(filters.status && filters.status !== "ALL"
        ? [{ status: filters.status as CaseStatus }]
        : []),
      ...(filters.search
        ? [
              {
              OR: [
                {
                  title: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  description: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  category: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  opponentName: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  courtName: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          ]
        : []),
    ],
  };

  const [items, total] = await Promise.all([
    prisma.case.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: caseSelect,
    }),
    prisma.case.count({ where }),
  ]);

  return { items, total };
}

export async function findRecentAccessibleCases(
  currentUser: SessionUser,
  take = 5
) {
  return prisma.case.findMany({
    where: await buildAccessibleCaseWhere(currentUser),
    orderBy: { createdAt: "desc" },
    take,
    select: caseSelect,
  });
}

export async function findCaseById(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: caseSelect,
  });
}

export async function updateCaseById(
  caseId: string,
  data: Prisma.CaseUpdateInput
) {
  return prisma.case.update({
    where: { id: caseId },
    data,
    select: caseSelect,
  });
}
