import type { Prisma } from "@prisma/client";

import { redactAuditLogMetadataForPersist } from "@/lib/data-governance/data-redaction.service";
import { ConflictError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type {
  CaseLawyerMatchingRecommendation,
  StoredCaseLawyerMatchingRecommendation,
} from "./case-lawyer-matching.schema";
import {
  APPROVABLE_CASE_LAWYER_MATCHING_RECOMMENDATION_STATUSES,
} from "./case-lawyer-matching.schema";

type LawyerMatchingRecommendationRecord = Prisma.LawyerMatchingRecommendationGetPayload<{
  select: {
    id: true;
    caseId: true;
    status: true;
    matchedSpecialties: true;
    excludedLawyersSnapshot: true;
    eligibleLawyerIds: true;
    recommendedAssignmentNote: true;
    generatedBy: true;
    requiresHumanApproval: true;
    version: true;
    createdByAdminId: true;
    approvedByAdminId: true;
    approvedAt: true;
    approvedAssignmentId: true;
    rejectedByAdminId: true;
    rejectedAt: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

const recommendationSelect = {
  id: true,
  caseId: true,
  status: true,
  matchedSpecialties: true,
  excludedLawyersSnapshot: true,
  eligibleLawyerIds: true,
  recommendedAssignmentNote: true,
  generatedBy: true,
  requiresHumanApproval: true,
  version: true,
  createdByAdminId: true,
  approvedByAdminId: true,
  approvedAt: true,
  approvedAssignmentId: true,
  rejectedByAdminId: true,
  rejectedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const assignmentSelect = {
  id: true,
  caseId: true,
  assigneeUserId: true,
  assignedByUserId: true,
  note: true,
  isActive: true,
  createdAt: true,
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} as const;

function parseStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function parseExcludedLawyers(
  value: Prisma.JsonValue,
): CaseLawyerMatchingRecommendation["excludedLawyers"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "lawyerId" in item &&
      "reason" in item &&
      typeof item.lawyerId === "string" &&
      typeof item.reason === "string"
    ) {
      return [
        {
          lawyerId: item.lawyerId,
          reason: item.reason as CaseLawyerMatchingRecommendation["excludedLawyers"][number]["reason"],
        },
      ];
    }
    return [];
  });
}

export function mapLawyerMatchingRecommendationRecord(
  record: LawyerMatchingRecommendationRecord,
): StoredCaseLawyerMatchingRecommendation {
  return {
    recommendationId: record.id,
    caseId: record.caseId,
    status: record.status,
    matchedSpecialties: parseStringArray(record.matchedSpecialties),
    excludedLawyers: parseExcludedLawyers(record.excludedLawyersSnapshot),
    eligibleLawyerIds: parseStringArray(record.eligibleLawyerIds),
    recommendedAssignmentNote: record.recommendedAssignmentNote,
    generatedBy: record.generatedBy,
    requiresHumanApproval: true,
    version: record.version,
    createdByAdminId: record.createdByAdminId,
    approvedAssignmentId: record.approvedAssignmentId,
    approvedByAdminId: record.approvedByAdminId,
    approvedAt: record.approvedAt?.toISOString() ?? null,
    rejectedByAdminId: record.rejectedByAdminId,
    rejectedAt: record.rejectedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function findCaseLawyerMatchingRecommendationById(
  recommendationId: string,
) {
  const record = await prisma.lawyerMatchingRecommendation.findUnique({
    where: { id: recommendationId },
    select: recommendationSelect,
  });

  return record ? mapLawyerMatchingRecommendationRecord(record) : null;
}

export async function findActiveCaseLawyerMatchingRecommendationByCaseId(
  caseId: string,
) {
  const record = await prisma.lawyerMatchingRecommendation.findFirst({
    where: { activeCaseKey: caseId },
    select: recommendationSelect,
  });

  return record ? mapLawyerMatchingRecommendationRecord(record) : null;
}

export async function createCaseLawyerMatchingRecommendation(input: {
  recommendation: CaseLawyerMatchingRecommendation;
  createdByAdminId: string;
}) {
  const active = await findActiveCaseLawyerMatchingRecommendationByCaseId(
    input.recommendation.caseId,
  );
  if (active) {
    throw new ValidationError("이미 활성 매칭 권고안이 존재합니다.");
  }

  try {
    const record = await prisma.lawyerMatchingRecommendation.create({
      data: {
        id: input.recommendation.recommendationId,
        caseId: input.recommendation.caseId,
        status: input.recommendation.status,
        matchedSpecialties: input.recommendation.matchedSpecialties,
        excludedLawyersSnapshot: input.recommendation.excludedLawyers,
        eligibleLawyerIds: input.recommendation.eligibleLawyerIds,
        recommendedAssignmentNote: input.recommendation.recommendedAssignmentNote,
        generatedBy: input.recommendation.generatedBy,
        requiresHumanApproval: true,
        version: input.recommendation.version,
        activeCaseKey: input.recommendation.caseId,
        createdByAdminId: input.createdByAdminId,
      },
      select: recommendationSelect,
    });

    return mapLawyerMatchingRecommendationRecord(record);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ValidationError("이미 활성 매칭 권고안이 존재합니다.");
    }
    throw error;
  }
}

function isPrismaUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function writeRecommendationConflictAuditInTransaction(
  tx: Prisma.TransactionClient,
  input: {
    actorUserId: string;
    recommendation: StoredCaseLawyerMatchingRecommendation;
    requestedAssigneeUserId: string;
    resolvedAssigneeUserId: string | null;
    approvedAssignmentId: string | null;
  },
) {
  const metadata = redactAuditLogMetadataForPersist({
    caseId: input.recommendation.caseId,
    recommendationId: input.recommendation.recommendationId,
    requestedAssigneeUserId: input.requestedAssigneeUserId,
    resolvedAssigneeUserId: input.resolvedAssigneeUserId,
    approvedAssignmentId: input.approvedAssignmentId,
    conflictReason: "CONCURRENT_APPROVAL_UNIQUE_VIOLATION",
  });

  await tx.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "CASE_LAWYER_MATCHING_RECOMMEND_APPROVE_CONFLICT",
      entityType: "CASE_LAWYER_MATCHING_RECOMMENDATION",
      entityId: input.recommendation.recommendationId,
      message: "동시 승인 충돌",
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

async function resolveConcurrentApprovalAfterUniqueConflict(
  tx: Prisma.TransactionClient,
  input: {
    recommendationId: string;
    caseId: string;
    assigneeUserId: string;
    adminUserId: string;
  },
) {
  const record = await tx.lawyerMatchingRecommendation.findUnique({
    where: { id: input.recommendationId },
    select: recommendationSelect,
  });

  if (!record || record.caseId !== input.caseId) {
    throw new ConflictError("동시 승인으로 인해 배정 결과를 확정할 수 없습니다.");
  }

  const recommendation = mapLawyerMatchingRecommendationRecord(record);

  if (recommendation.status === "APPROVED" && recommendation.approvedAssignmentId) {
    const assignment = await tx.caseAssignment.findUnique({
      where: { id: recommendation.approvedAssignmentId },
      select: assignmentSelect,
    });

    if (assignment && assignment.assigneeUserId === input.assigneeUserId) {
      return {
        recommendation,
        assignment,
        idempotent: true as const,
      };
    }

    await writeRecommendationConflictAuditInTransaction(tx, {
      actorUserId: input.adminUserId,
      recommendation,
      requestedAssigneeUserId: input.assigneeUserId,
      resolvedAssigneeUserId: assignment?.assigneeUserId ?? null,
      approvedAssignmentId: recommendation.approvedAssignmentId,
    });

    throw new ConflictError(
      "동시 승인으로 인해 다른 배정 결과가 이미 확정되었습니다.",
      {
        recommendationId: recommendation.recommendationId,
        approvedAssignmentId: recommendation.approvedAssignmentId,
        resolvedAssigneeUserId: assignment?.assigneeUserId ?? null,
      },
    );
  }

  const activeAssignment = await tx.caseAssignment.findFirst({
    where: {
      caseId: input.caseId,
      assigneeUserId: input.assigneeUserId,
      isActive: true,
    },
    select: assignmentSelect,
  });

  if (activeAssignment) {
    return {
      recommendation,
      assignment: activeAssignment,
      idempotent: true as const,
    };
  }

  await writeRecommendationConflictAuditInTransaction(tx, {
    actorUserId: input.adminUserId,
    recommendation,
    requestedAssigneeUserId: input.assigneeUserId,
    resolvedAssigneeUserId: null,
    approvedAssignmentId: null,
  });

  throw new ConflictError("동시 승인으로 인해 배정 결과를 확정할 수 없습니다.");
}

async function writeRecommendationAuditInTransaction(
  tx: Prisma.TransactionClient,
  input: {
    actorUserId: string;
    action:
      | "CASE_LAWYER_MATCHING_RECOMMEND_CREATE"
      | "CASE_LAWYER_MATCHING_RECOMMEND_APPROVE"
      | "CASE_LAWYER_MATCHING_RECOMMEND_REJECT";
    recommendation: StoredCaseLawyerMatchingRecommendation;
    assignmentId?: string | null;
    reviewNote?: string | null;
  },
) {
  const metadata = redactAuditLogMetadataForPersist({
    caseId: input.recommendation.caseId,
    recommendationId: input.recommendation.recommendationId,
    status: input.recommendation.status,
    generatedBy: input.recommendation.generatedBy,
    requiresHumanApproval: true,
    eligibleLawyerCount: input.recommendation.eligibleLawyerIds.length,
    excludedLawyerCount: input.recommendation.excludedLawyers.length,
    assignmentId: input.assignmentId ?? null,
    reviewNote: input.reviewNote ?? null,
  });

  await tx.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: "CASE_LAWYER_MATCHING_RECOMMENDATION",
      entityId: input.recommendation.recommendationId,
      message:
        input.action === "CASE_LAWYER_MATCHING_RECOMMEND_CREATE"
          ? "변호사 매칭 권고안 생성"
          : input.action === "CASE_LAWYER_MATCHING_RECOMMEND_APPROVE"
            ? "변호사 매칭 권고안 승인"
            : "변호사 매칭 권고안 반려",
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

export async function approveCaseLawyerMatchingRecommendationInTransaction(input: {
  recommendationId: string;
  caseId: string;
  assigneeUserId: string;
  note: string | null;
  adminUserId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const record = await tx.lawyerMatchingRecommendation.findUnique({
      where: { id: input.recommendationId },
      select: recommendationSelect,
    });

    if (!record || record.caseId !== input.caseId) {
      return null;
    }

    const recommendation = mapLawyerMatchingRecommendationRecord(record);

    if (recommendation.status === "APPROVED") {
      if (!recommendation.approvedAssignmentId) {
        throw new ValidationError("이미 승인된 매칭 권고안입니다.");
      }

      const existingAssignment = await tx.caseAssignment.findUnique({
        where: { id: recommendation.approvedAssignmentId },
        select: assignmentSelect,
      });

      if (
        existingAssignment &&
        existingAssignment.assigneeUserId === input.assigneeUserId
      ) {
        return {
          recommendation,
          assignment: existingAssignment,
          idempotent: true as const,
        };
      }

      if (recommendation.approvedByAdminId === input.adminUserId) {
        throw new ValidationError("이미 승인된 매칭 권고안입니다.");
      }

      await writeRecommendationConflictAuditInTransaction(tx, {
        actorUserId: input.adminUserId,
        recommendation,
        requestedAssigneeUserId: input.assigneeUserId,
        resolvedAssigneeUserId: existingAssignment?.assigneeUserId ?? null,
        approvedAssignmentId: recommendation.approvedAssignmentId,
      });

      throw new ConflictError(
        "동시 승인으로 인해 다른 배정 결과가 이미 확정되었습니다.",
        {
          recommendationId: recommendation.recommendationId,
          approvedAssignmentId: recommendation.approvedAssignmentId,
          resolvedAssigneeUserId: existingAssignment?.assigneeUserId ?? null,
        },
      );
    }

    if (recommendation.status === "REJECTED" || recommendation.status === "EXPIRED") {
      throw new ValidationError("검토가 종료된 매칭 권고안은 승인할 수 없습니다.");
    }

    if (
      !APPROVABLE_CASE_LAWYER_MATCHING_RECOMMENDATION_STATUSES.includes(
        recommendation.status,
      )
    ) {
      throw new ValidationError("승인 가능한 상태의 매칭 권고안이 아닙니다.");
    }

    if (!recommendation.eligibleLawyerIds.includes(input.assigneeUserId)) {
      throw new ValidationError("권고 후보에 포함되지 않은 변호사입니다.");
    }

    const assignee = await tx.user.findUnique({
      where: { id: input.assigneeUserId },
      select: { id: true, role: true },
    });
    if (!assignee || assignee.role !== "LAWYER") {
      throw new ValidationError("배정 대상은 변호사 계정이어야 합니다.");
    }

    const duplicateAssignment = await tx.caseAssignment.findFirst({
      where: {
        caseId: input.caseId,
        assigneeUserId: input.assigneeUserId,
        isActive: true,
      },
      select: { id: true },
    });
    if (duplicateAssignment) {
      throw new ValidationError("이미 배정된 변호사입니다.");
    }

    try {
      const assignment = await tx.caseAssignment.create({
        data: {
          caseId: input.caseId,
          assigneeUserId: input.assigneeUserId,
          assignedByUserId: input.adminUserId,
          note: input.note,
        },
        select: assignmentSelect,
      });

      const updatedRecord = await tx.lawyerMatchingRecommendation.update({
        where: { id: input.recommendationId },
        data: {
          status: "APPROVED",
          activeCaseKey: null,
          approvedByAdminId: input.adminUserId,
          approvedAt: new Date(),
          approvedAssignmentId: assignment.id,
        },
        select: recommendationSelect,
      });

      const updated = mapLawyerMatchingRecommendationRecord(updatedRecord);

      await writeRecommendationAuditInTransaction(tx, {
        actorUserId: input.adminUserId,
        action: "CASE_LAWYER_MATCHING_RECOMMEND_APPROVE",
        recommendation: updated,
        assignmentId: assignment.id,
        reviewNote: input.note,
      });

      await tx.auditLog.create({
        data: {
          actorUserId: input.adminUserId,
          action: "CASE_ASSIGNMENT_CREATE",
          entityType: "CASE_ASSIGNMENT",
          entityId: assignment.id,
          message: "사건 배정 생성",
          metadata: redactAuditLogMetadataForPersist({
            caseId: input.caseId,
            assigneeUserId: input.assigneeUserId,
            recommendationId: input.recommendationId,
          }) as Prisma.InputJsonValue,
        },
      });

      return {
        recommendation: updated,
        assignment,
        idempotent: false as const,
      };
    } catch (error) {
      if (!isPrismaUniqueConstraintError(error)) {
        throw error;
      }

      return resolveConcurrentApprovalAfterUniqueConflict(tx, input);
    }
  });
}

export async function rejectCaseLawyerMatchingRecommendation(input: {
  recommendationId: string;
  caseId: string;
  adminUserId: string;
  reviewNote?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const record = await tx.lawyerMatchingRecommendation.findUnique({
      where: { id: input.recommendationId },
      select: recommendationSelect,
    });

    if (!record || record.caseId !== input.caseId) {
      return null;
    }

    const recommendation = mapLawyerMatchingRecommendationRecord(record);

    if (recommendation.status === "APPROVED") {
      throw new ValidationError("이미 승인된 매칭 권고안은 반려할 수 없습니다.");
    }

    if (recommendation.status === "REJECTED") {
      return recommendation;
    }

    if (recommendation.status === "EXPIRED") {
      throw new ValidationError("만료된 매칭 권고안은 반려할 수 없습니다.");
    }

    const updatedRecord = await tx.lawyerMatchingRecommendation.update({
      where: { id: input.recommendationId },
      data: {
        status: "REJECTED",
        activeCaseKey: null,
        rejectedByAdminId: input.adminUserId,
        rejectedAt: new Date(),
      },
      select: recommendationSelect,
    });

    const updated = mapLawyerMatchingRecommendationRecord(updatedRecord);

    await writeRecommendationAuditInTransaction(tx, {
      actorUserId: input.adminUserId,
      action: "CASE_LAWYER_MATCHING_RECOMMEND_REJECT",
      recommendation: updated,
      reviewNote: input.reviewNote ?? null,
    });

    return updated;
  });
}

export async function writeCaseLawyerMatchingRecommendationAudit(input: {
  actorUserId: string;
  action: "CASE_LAWYER_MATCHING_RECOMMEND_CREATE";
  recommendation: StoredCaseLawyerMatchingRecommendation;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: "CASE_LAWYER_MATCHING_RECOMMENDATION",
      entityId: input.recommendation.recommendationId,
      message: "변호사 매칭 권고안 생성",
      metadata: redactAuditLogMetadataForPersist({
        caseId: input.recommendation.caseId,
        recommendationId: input.recommendation.recommendationId,
        status: input.recommendation.status,
        generatedBy: input.recommendation.generatedBy,
        requiresHumanApproval: true,
        eligibleLawyerCount: input.recommendation.eligibleLawyerIds.length,
        excludedLawyerCount: input.recommendation.excludedLawyers.length,
        assignmentId: null,
        reviewNote: null,
      }) as Prisma.InputJsonValue,
    },
  });
}
