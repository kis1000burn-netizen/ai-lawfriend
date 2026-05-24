/**
 * Phase 14-C — optimistic Command Center state patches.
 */
import type { LitigationCommandCenterResponse } from "./litigation-command-center.schema";

const ACTIVE_TASK_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);

export function applyOptimisticTaskStatus(
  data: LitigationCommandCenterResponse,
  taskId: string,
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED",
): LitigationCommandCenterResponse {
  const todayTasks = data.todayTasks
    .map((task) => (task.id === taskId ? { ...task, status } : task))
    .filter((task) => ACTIVE_TASK_STATUSES.has(task.status));

  return { ...data, todayTasks };
}

export function applyOptimisticDeadlinePatch(
  data: LitigationCommandCenterResponse,
  deadlineId: string,
  patch: { status?: "COMPLETED"; dueAt?: string | null; memo?: string },
): LitigationCommandCenterResponse {
  const deadlines = data.deadlines.map((deadline) => {
    if (deadline.id !== deadlineId) return deadline;
    return {
      ...deadline,
      status: patch.status ?? deadline.status,
      dueAt: patch.dueAt !== undefined ? patch.dueAt : deadline.dueAt,
      description:
        patch.memo !== undefined ? patch.memo.trim() || null : deadline.description,
    };
  });

  return { ...data, deadlines };
}

export function applyOptimisticSupplementSent(
  data: LitigationCommandCenterResponse,
  requestId: string,
): LitigationCommandCenterResponse {
  const supplements = data.supplements.map((sup) =>
    sup.id === requestId
      ? { ...sup, status: "SENT", isDraft: false, awaitingClient: true, awaitingReview: false }
      : sup,
  );

  return { ...data, supplements };
}

export function applyOptimisticSupplementReviewStarted(
  data: LitigationCommandCenterResponse,
  requestId: string,
): LitigationCommandCenterResponse {
  const supplements = data.supplements.map((sup) =>
    sup.id === requestId
      ? {
          ...sup,
          status: "UNDER_REVIEW",
          isDraft: false,
          awaitingClient: false,
          awaitingReview: false,
          needsMoreInfo: false,
        }
      : sup,
  );

  return { ...data, supplements };
}

export function applyOptimisticDraftGenerated(
  data: LitigationCommandCenterResponse,
  draftContextId: string,
): LitigationCommandCenterResponse {
  const draftContexts = data.draftContexts.map((ctx) =>
    ctx.id === draftContextId ? { ...ctx, status: "READY" as const } : ctx,
  );

  return { ...data, draftContexts };
}
