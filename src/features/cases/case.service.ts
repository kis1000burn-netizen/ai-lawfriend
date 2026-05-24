import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";
import { writeAuditLog } from "@/lib/audit-log";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/require-session-user";
import type {
  CreateCaseInput,
  UpdateCaseInput,
  CaseListQueryInput,
} from "@/features/cases/case.validators";
import {
  canSoftDeleteCase,
  getCaseAccessContext,
} from "@/features/cases/case.permissions";
import {
  createCase,
  findAccessibleCases,
  findCaseById,
  findRecentAccessibleCases,
  updateCaseById,
} from "@/features/cases/case.repository";
import { getLitigationCommandCenterListSummariesForCases } from "@/features/document-intelligence/litigation-command-center-list-summary.service";
import { prismaRoleToUiRole } from "@/lib/role-map";

function normalizeNullable(value?: string) {
  if (typeof value === "undefined") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseIncidentDate(value?: string) {
  if (!value) return undefined;
  return new Date(value);
}

export async function createCaseService(
  currentUser: SessionUser,
  input: CreateCaseInput
) {
  const created = await createCase({
    ownerUserId: currentUser.id,
    title: input.title.trim(),
    description: normalizeNullable(input.description),
    category: normalizeNullable(input.category),
    opponentName: normalizeNullable(input.opponentName),
    courtName: normalizeNullable(input.courtName),
    incidentDate: parseIncidentDate(input.incidentDate) ?? null,
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_CREATE",
    entityType: "CASE",
    entityId: created.id,
    message: "사건 생성",
    metadata: { title: created.title, status: created.status },
  });

  return {
    ...created,
    allowedLifecycleActions: getAllowedLifecycleActionsForCase(
      created.status,
      currentUser.role,
    ),
  };
}

export async function listCasesService(
  currentUser: SessionUser,
  query: CaseListQueryInput
) {
  const { items, total } = await findAccessibleCases(currentUser, {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search || "",
    status: query.status,
  });

  const totalPages =
    total === 0 ? 0 : Math.ceil(total / query.pageSize);

  const uiRole = prismaRoleToUiRole(currentUser.role);
  const summaries =
    ["LAWYER", "ADMIN", "STAFF"].includes(uiRole)
      ? await getLitigationCommandCenterListSummariesForCases(
          currentUser,
          items.map((item) => item.id),
        )
      : {};

  return {
    items: items.map((item) => ({
      ...item,
      commandCenterSummary: summaries[item.id] ?? null,
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * `GET /api/cases/:id` — `caseSelect` 스칼라 + `allowedLifecycleActions`(서버 `getAllowedLifecycleActionsForCase` 단일 함수).
 * 풀 상세(문서·인터뷰·타임라인)는 `GET /api/cases/:id/detail` → `serializeCaseDetail` ([353-P1-IO05] 응답 shape·권한 맥락 필드 정합).
 */
export async function getCaseDetailService(
  currentUser: SessionUser,
  caseId: string
) {
  await getCaseAccessContext(currentUser, caseId);
  const found = await findCaseById(caseId);
  if (!found) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }
  return {
    ...found,
    allowedLifecycleActions: getAllowedLifecycleActionsForCase(
      found.status,
      currentUser.role,
    ),
  };
}

export async function updateCaseService(
  currentUser: SessionUser,
  caseId: string,
  input: UpdateCaseInput
) {
  const access = await getCaseAccessContext(currentUser, caseId);

  if (!access.canWriteCase) {
    throw new ForbiddenError("수정 권한이 없습니다.");
  }

  if (Object.keys(input).length === 0) {
    throw new ValidationError("수정할 항목이 없습니다.");
  }

  const updated = await updateCaseById(caseId, {
    ...(typeof input.title !== "undefined" ? { title: input.title.trim() } : {}),
    ...(typeof input.description !== "undefined"
      ? { description: normalizeNullable(input.description) }
      : {}),
    ...(typeof input.category !== "undefined"
      ? { category: normalizeNullable(input.category) }
      : {}),
    ...(typeof input.opponentName !== "undefined"
      ? { opponentName: normalizeNullable(input.opponentName) }
      : {}),
    ...(typeof input.courtName !== "undefined"
      ? { courtName: normalizeNullable(input.courtName) }
      : {}),
    ...(typeof input.incidentDate !== "undefined"
      ? {
          incidentDate: input.incidentDate
            ? new Date(input.incidentDate)
            : null,
        }
      : {}),
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_UPDATE",
    entityType: "CASE",
    entityId: updated.id,
    message: "사건 수정",
    metadata: { title: updated.title, status: updated.status },
  });

  return {
    ...updated,
    allowedLifecycleActions: getAllowedLifecycleActionsForCase(
      updated.status,
      currentUser.role,
    ),
  };
}

export async function softDeleteCaseService(
  currentUser: SessionUser,
  caseId: string
) {
  const access = await getCaseAccessContext(currentUser, caseId);

  if (!canSoftDeleteCase(access)) {
    throw new ForbiddenError("삭제 권한이 없습니다.");
  }

  const deleted = await updateCaseById(caseId, {
    status: "DELETED",
  });

  await writeAuditLog({
    actorUserId: currentUser.id,
    action: "CASE_SOFT_DELETE",
    entityType: "CASE",
    entityId: deleted.id,
    message: "사건 삭제(soft delete)",
    metadata: { title: deleted.title },
  });

  return {
    ...deleted,
    allowedLifecycleActions: getAllowedLifecycleActionsForCase(
      deleted.status,
      currentUser.role,
    ),
  };
}

export async function getDashboardCasesService(currentUser: SessionUser) {
  return findRecentAccessibleCases(currentUser, 5);
}
