/**
 * Phase 14-B — Litigation Command Center actions service.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { createCaseDocumentDraft } from "@/features/document-drafts/document-draft.repository";
import { changeSupplementRequestStatusService } from "@/features/supplement-request/supplement-request.service";
import {
  assertCanReadLitigationCommandCenter,
  canRunLitigationCommandCenterActions,
} from "./litigation-command-center.policy";
import {
  auditCommandCenterDeadlineUpdated,
  auditCommandCenterDraftGenerated,
  auditCommandCenterSupplementSent,
  auditCommandCenterSupplementReviewStarted,
  auditCommandCenterTaskUpdated,
} from "./litigation-command-center-audit";
import {
  findLitigationDeadlineForCase,
  findLitigationDraftContextForCase,
  findLitigationTaskForCase,
  findSupplementRequestForCase,
  updateLitigationDeadlineRecord,
  updateLitigationDraftContextStatus,
  updateLitigationTaskStatus,
} from "./litigation-command-center-actions.repository";
import type {
  CommandCenterDraftGenerateResult,
} from "./litigation-command-center-actions.schema";
import {
  commandCenterDraftGenerateResultSchema,
  updateCommandCenterDeadlineBodySchema,
  updateCommandCenterTaskBodySchema,
} from "./litigation-command-center-actions.schema";

export const PHASE14B_LITIGATION_COMMAND_CENTER_ACTIONS_SERVICE_MARKER =
  "PHASE14B_LITIGATION_COMMAND_CENTER_ACTIONS_SERVICE" as const;

function assertCanMutate(currentUser: SessionUser, caseId: string) {
  return getCaseAccessContext(currentUser, caseId).then((access) => {
    assertCanReadLitigationCommandCenter(access);
    if (!canRunLitigationCommandCenterActions(access)) {
      throw new ForbiddenError("소송 지휘실 작업 처리 권한이 없습니다.");
    }
    return access;
  });
}

function buildDraftBodyFromContext(contextJson: unknown): string {
  const ctx =
    typeof contextJson === "object" && contextJson !== null
      ? (contextJson as Record<string, unknown>)
      : {};
  const claims = Array.isArray(ctx.claims) ? ctx.claims : [];
  const rebuttals = Array.isArray(ctx.rebuttals) ? ctx.rebuttals : [];
  const evidenceLinks = Array.isArray(ctx.evidenceLinks) ? ctx.evidenceLinks : [];
  const note =
    typeof ctx.preparatoryBriefContextNote === "string"
      ? ctx.preparatoryBriefContextNote
      : "13-H 확정 컨텍스트 기반 준비서면 초안입니다.";

  const sections = [
    `# 준비서면 초안 컨텍스트\n\n${note}\n`,
    claims.length
      ? `## 확정 주장\n${claims.map((c) => `- ${String(c)}`).join("\n")}`
      : "",
    rebuttals.length
      ? `## 확정 반박·쟁점\n${rebuttals.map((c) => `- ${String(c)}`).join("\n")}`
      : "",
    evidenceLinks.length
      ? `## 증거 연결\n${evidenceLinks.map((c) => `- ${String(c)}`).join("\n")}`
      : "",
  ].filter(Boolean);

  return sections.join("\n\n");
}

export async function updateCommandCenterTaskStatusService(
  currentUser: SessionUser,
  caseId: string,
  taskId: string,
  body: unknown,
) {
  await assertCanMutate(currentUser, caseId);
  const input = updateCommandCenterTaskBodySchema.parse(body);

  const task = await findLitigationTaskForCase(caseId, taskId);
  if (!task) {
    throw new NotFoundError("업무 항목을 찾을 수 없습니다.");
  }

  const updated = await updateLitigationTaskStatus(taskId, input.status);
  await auditCommandCenterTaskUpdated({
    actorUserId: currentUser.id,
    caseId,
    taskId,
    fromStatus: task.status,
    toStatus: input.status,
  });

  return updated;
}

export async function updateCommandCenterDeadlineService(
  currentUser: SessionUser,
  caseId: string,
  deadlineId: string,
  body: unknown,
) {
  await assertCanMutate(currentUser, caseId);
  const input = updateCommandCenterDeadlineBodySchema.parse(body);

  const deadline = await findLitigationDeadlineForCase(caseId, deadlineId);
  if (!deadline) {
    throw new NotFoundError("기일·마감 항목을 찾을 수 없습니다.");
  }

  const patch: {
    status?: typeof deadline.status;
    dueAt?: Date | null;
    description?: string | null;
  } = {};

  if (input.status !== undefined) {
    patch.status = input.status;
  }
  if (input.dueAt !== undefined) {
    patch.dueAt = input.dueAt ? new Date(input.dueAt) : null;
  }
  if (input.memo !== undefined) {
    patch.description = input.memo.trim() || null;
  }

  const updated = await updateLitigationDeadlineRecord(deadlineId, patch);
  await auditCommandCenterDeadlineUpdated({
    actorUserId: currentUser.id,
    caseId,
    deadlineId,
    patch: {
      ...patch,
      dueAt: patch.dueAt?.toISOString() ?? patch.dueAt,
    },
  });

  return updated;
}

export async function sendCommandCenterSupplementService(
  currentUser: SessionUser,
  caseId: string,
  requestId: string,
) {
  await assertCanMutate(currentUser, caseId);

  const row = await findSupplementRequestForCase(caseId, requestId);
  if (!row) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }
  if (row.status !== "DRAFT") {
    throw new ValidationError("DRAFT 상태의 보완요청만 발송할 수 있습니다.");
  }

  const updated = await changeSupplementRequestStatusService(currentUser, requestId, {
    toStatus: "SENT",
    reasonCode: "CMD_CENTER_SEND",
    reasonMemo: "Litigation Command Center에서 발송",
  });

  await auditCommandCenterSupplementSent({
    actorUserId: currentUser.id,
    caseId,
    supplementRequestId: requestId,
  });

  return updated;
}

export async function startCommandCenterSupplementReviewService(
  currentUser: SessionUser,
  caseId: string,
  requestId: string,
) {
  await assertCanMutate(currentUser, caseId);

  const row = await findSupplementRequestForCase(caseId, requestId);
  if (!row) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }
  if (row.status !== "CLIENT_RESPONDED") {
    throw new ValidationError("의뢰인 응답(CLIENT_RESPONDED) 상태의 보완요청만 재검토를 시작할 수 있습니다.");
  }

  const updated = await changeSupplementRequestStatusService(currentUser, requestId, {
    toStatus: "UNDER_REVIEW",
    reasonCode: "CMD_CENTER_REVIEW",
    reasonMemo: "Litigation Command Center에서 재검토 시작",
  });

  await auditCommandCenterSupplementReviewStarted({
    actorUserId: currentUser.id,
    caseId,
    supplementRequestId: requestId,
  });

  return updated;
}

export async function generateCommandCenterDraftFromContextService(
  currentUser: SessionUser,
  caseId: string,
  draftContextId: string,
): Promise<CommandCenterDraftGenerateResult> {
  await assertCanMutate(currentUser, caseId);

  const ctx = await findLitigationDraftContextForCase(caseId, draftContextId);
  if (!ctx) {
    throw new NotFoundError("준비서면 컨텍스트를 찾을 수 없습니다.");
  }

  const body = buildDraftBodyFromContext(ctx.contextJson);
  const document = await createCaseDocumentDraft({
    caseId,
    createdByUserId: currentUser.id,
    type: "statement",
    title: ctx.title,
    content: body,
  });

  await updateLitigationDraftContextStatus(draftContextId, "READY");

  await auditCommandCenterDraftGenerated({
    actorUserId: currentUser.id,
    caseId,
    draftContextId,
    documentId: document.id,
  });

  const result: CommandCenterDraftGenerateResult = {
    draftContextId,
    documentId: document.id,
    documentHref: `/cases/${caseId}/documents/${document.id}`,
    title: document.title,
  };

  return commandCenterDraftGenerateResultSchema.parse(result);
}
