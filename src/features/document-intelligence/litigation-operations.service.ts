/**
 * Phase 13-H — Litigation Operations Integration service.
 */
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { findReviewDecisionByCaseAndItemId, loadReviewQueueSourceData } from "./document-intelligence-review.repository";
import { buildDocumentIntelligenceReviewQueue } from "./document-intelligence-review-queue.builder";
import {
  assertCanReadLitigationOperations,
  assertCanRunLitigationOperationsSync,
  assertReviewItemConfirmedForDownstream,
} from "./litigation-operations.policy";
import {
  litigationOpsDraftContextBodySchema,
  litigationOpsItemActionBodySchema,
  litigationOpsSyncResultSchema,
  type LitigationOpsStatusResponse,
} from "./litigation-operations.schema";
import {
  auditLitigationOpsDraftContextCreated,
  auditLitigationOpsDeadlineCreated,
  auditLitigationOpsSupplementCreated,
  auditLitigationOpsSyncCompleted,
  auditLitigationOpsTaskCreated,
} from "./litigation-operations-audit";
import {
  createOpsSyncRecord,
  findCaseForOps,
  findLatestOpsSync,
  findOpsLink,
  getLatestOpsSyncRevision,
  loadOpsStatusCounts,
} from "./litigation-operations.repository";
import {
  runLitigationOperationsSync,
  syncDeadlineFromReviewItem,
  syncDraftContextFromItems,
  syncSupplementFromReviewItem,
  syncTaskFromReviewItem,
} from "./litigation-operations.sync";

export const PHASE13H_LITIGATION_OPERATIONS_SERVICE_MARKER =
  "PHASE13H_LITIGATION_OPERATIONS_SERVICE" as const;

async function buildQueueWithDecisions(caseId: string) {
  const source = await loadReviewQueueSourceData(caseId);
  const queue = buildDocumentIntelligenceReviewQueue({
    caseId,
    litigationFiles: source.litigationFiles,
    evidenceMapping: source.evidenceMapping,
    decisions: source.decisions,
    portalSources: source.portalSources,
  });
  return { queue, decisions: source.decisions };
}

function findItem(
  queue: Awaited<ReturnType<typeof buildQueueWithDecisions>>["queue"],
  itemId: string,
) {
  const item = queue.items.find((i) => i.itemId === itemId);
  if (!item) {
    throw new NotFoundError("검토 큐 항목을 찾을 수 없습니다.");
  }
  return item;
}

function buildSyncContext(
  caseId: string,
  ownerUserId: string,
  actorUserId: string,
  decisions: Awaited<ReturnType<typeof buildQueueWithDecisions>>["decisions"],
) {
  return {
    caseId,
    ownerUserId,
    actorUserId,
    decisionByItemId: new Map(decisions.map((d) => [d.itemId, d])),
  };
}

export async function getLitigationOperationsStatusService(
  currentUser: SessionUser,
  caseId: string,
): Promise<LitigationOpsStatusResponse> {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanReadLitigationOperations(access);

  const [latestSync, counts] = await Promise.all([
    findLatestOpsSync(caseId),
    loadOpsStatusCounts(caseId),
  ]);

  let latestSyncResult = null;
  if (latestSync) {
    const parsed = litigationOpsSyncResultSchema.safeParse(latestSync.syncJson);
    if (parsed.success) {
      latestSyncResult = parsed.data;
    }
  }

  return {
    caseId,
    latestSync: latestSyncResult,
    ...counts,
  };
}

export async function syncLitigationOperationsService(
  currentUser: SessionUser,
  caseId: string,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanRunLitigationOperationsSync(access);

  const caseRow = await findCaseForOps(caseId);
  if (!caseRow) {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const { queue, decisions } = await buildQueueWithDecisions(caseId);

  const result = await runLitigationOperationsSync({
    caseId,
    ownerUserId: caseRow.ownerUserId,
    actorUserId: currentUser.id,
    items: queue.items,
    decisions,
  });

  const revision = (await getLatestOpsSyncRevision(caseId)) + 1;
  await createOpsSyncRecord({
    caseId,
    revision,
    syncJson: result,
    syncedByUserId: currentUser.id,
  });

  await auditLitigationOpsSyncCompleted({
    actorUserId: currentUser.id,
    caseId,
    revision,
    deadlinesCreated: result.deadlinesCreated,
    tasksCreated: result.tasksCreated,
    supplementDraftsCreated: result.supplementDraftsCreated,
    draftContextsCreated: result.draftContextsCreated,
    reviewDecisionIds: result.syncedFromReviewDecisionIds,
  });

  return result;
}

export async function createDeadlineFromReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanRunLitigationOperationsSync(access);

  const { reviewItemId } = litigationOpsItemActionBodySchema.parse(body);
  const caseRow = await findCaseForOps(caseId);
  if (!caseRow) throw new NotFoundError("사건을 찾을 수 없습니다.");

  const { queue, decisions } = await buildQueueWithDecisions(caseId);
  const item = findItem(queue, reviewItemId);
  assertReviewItemConfirmedForDownstream(item);

  const ctx = buildSyncContext(
    caseId,
    caseRow.ownerUserId,
    currentUser.id,
    decisions,
  );
  const r = await syncDeadlineFromReviewItem(ctx, item);

  if (r.created && r.reviewDecisionId) {
    const opsLink = await findOpsLink(caseId, reviewItemId, "DEADLINE");
    if (opsLink) {
      await auditLitigationOpsDeadlineCreated({
        actorUserId: currentUser.id,
        caseId,
        deadlineId: opsLink.targetId,
        reviewDecisionId: r.reviewDecisionId,
        sourceItemId: reviewItemId,
      });
    }
  }

  return {
    caseId,
    reviewItemId,
    ...r,
    operations: await getLitigationOperationsStatusService(currentUser, caseId),
  };
}

export async function createTaskFromReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanRunLitigationOperationsSync(access);

  const { reviewItemId } = litigationOpsItemActionBodySchema.parse(body);
  const caseRow = await findCaseForOps(caseId);
  if (!caseRow) throw new NotFoundError("사건을 찾을 수 없습니다.");

  const { queue, decisions } = await buildQueueWithDecisions(caseId);
  const item = findItem(queue, reviewItemId);
  assertReviewItemConfirmedForDownstream(item);

  const ctx = buildSyncContext(
    caseId,
    caseRow.ownerUserId,
    currentUser.id,
    decisions,
  );
  const r = await syncTaskFromReviewItem(ctx, item);

  if (r.created && r.reviewDecisionId) {
    const opsLink = await findOpsLink(caseId, reviewItemId, "TASK");
    if (opsLink) {
      await auditLitigationOpsTaskCreated({
        actorUserId: currentUser.id,
        caseId,
        taskId: opsLink.targetId,
        reviewDecisionId: r.reviewDecisionId,
        sourceItemId: reviewItemId,
      });
    }
  }

  return {
    caseId,
    reviewItemId,
    ...r,
    operations: await getLitigationOperationsStatusService(currentUser, caseId),
  };
}

export async function createSupplementFromReviewItemService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanRunLitigationOperationsSync(access);

  const { reviewItemId } = litigationOpsItemActionBodySchema.parse(body);
  const caseRow = await findCaseForOps(caseId);
  if (!caseRow) throw new NotFoundError("사건을 찾을 수 없습니다.");

  const { queue, decisions } = await buildQueueWithDecisions(caseId);
  const item = findItem(queue, reviewItemId);

  const ctx = buildSyncContext(
    caseId,
    caseRow.ownerUserId,
    currentUser.id,
    decisions,
  );
  const r = await syncSupplementFromReviewItem(ctx, item);

  if (r.created && r.reviewDecisionId) {
    const opsLink = await findOpsLink(caseId, reviewItemId, "SUPPLEMENT");
    if (opsLink) {
      await auditLitigationOpsSupplementCreated({
        actorUserId: currentUser.id,
        caseId,
        supplementRequestId: opsLink.targetId,
        reviewDecisionId: r.reviewDecisionId,
        sourceItemId: reviewItemId,
      });
    }
  }

  return {
    caseId,
    reviewItemId,
    ...r,
    operations: await getLitigationOperationsStatusService(currentUser, caseId),
  };
}

export async function createDraftContextFromReviewItemsService(
  currentUser: SessionUser,
  caseId: string,
  body: unknown,
) {
  const access = await getCaseAccessContext(currentUser, caseId);
  assertCanRunLitigationOperationsSync(access);

  const parsedBody = litigationOpsDraftContextBodySchema.parse(body ?? {});
  const caseRow = await findCaseForOps(caseId);
  if (!caseRow) throw new NotFoundError("사건을 찾을 수 없습니다.");

  const { queue, decisions } = await buildQueueWithDecisions(caseId);
  const items = parsedBody.reviewItemIds?.length
    ? parsedBody.reviewItemIds.map((id) => findItem(queue, id))
    : queue.items.filter((i) =>
        ["claim", "rebuttal", "evidence", "defense", "contradiction"].includes(
          i.itemCategory,
        ),
      );

  for (const item of items) {
    assertReviewItemConfirmedForDownstream(item);
  }

  const ctx = buildSyncContext(
    caseId,
    caseRow.ownerUserId,
    currentUser.id,
    decisions,
  );
  const r = await syncDraftContextFromItems(ctx, items, parsedBody.title);

  if (r.created) {
    const draft = await prisma.litigationDraftContext.findFirst({
      where: { caseId },
      orderBy: { createdAt: "desc" },
    });
    if (draft) {
      await auditLitigationOpsDraftContextCreated({
        actorUserId: currentUser.id,
        caseId,
        draftContextId: draft.id,
        reviewDecisionIds: r.reviewDecisionIds,
      });
    }
  }

  return {
    caseId,
    ...r,
    operations: await getLitigationOperationsStatusService(currentUser, caseId),
  };
}

// re-export for tests
export { findReviewDecisionByCaseAndItemId };
