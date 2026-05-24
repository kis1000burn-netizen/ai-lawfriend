/**
 * Phase 13-H — sync confirmed review items to litigation operations entities.
 */
import type { SessionUser } from "@/lib/auth/require-session-user";
import type { DocumentIntelligenceReviewQueueItem } from "./document-intelligence-review.schema";
import { isConfirmedReviewStatus } from "./document-intelligence-review.schema";
import type { LitigationDocumentIntelligenceReviewDecision } from "@prisma/client";
import type { LitigationTaskKind, LitigationOpsLinkTargetType } from "@prisma/client";
import {
  DEADLINE_CATEGORIES,
  DRAFT_CONTEXT_CATEGORIES,
  LITIGATION_OPERATIONS_VERSION,
  SUPPLEMENT_CATEGORIES,
  TASK_CATEGORIES,
  type LitigationOpsSyncResult,
} from "./litigation-operations.schema";
import {
  createLitigationDeadlineRecord,
  createLitigationDraftContextRecord,
  createLitigationTaskRecord,
  createOpsLink,
  findOpsLink,
} from "./litigation-operations.repository";
import { createSupplementRequestRepository } from "@/features/supplement-request/supplement-request.repository";

export const PHASE13H_LITIGATION_OPERATIONS_SYNC_MARKER =
  "PHASE13H_LITIGATION_OPERATIONS_SYNC" as const;

type SyncContext = {
  caseId: string;
  ownerUserId: string;
  actorUserId: string;
  decisionByItemId: Map<string, LitigationDocumentIntelligenceReviewDecision>;
};

function taskKindForCategory(
  category: DocumentIntelligenceReviewQueueItem["itemCategory"],
): LitigationTaskKind {
  switch (category) {
    case "risk":
      return "RISK";
    case "issue":
      return "ISSUE";
    case "rebuttal":
    case "contradiction":
      return "REBUTTAL";
    case "evidence":
      return "EVIDENCE_GAP";
    default:
      return "GENERAL";
  }
}

function isSupplementEligible(reviewStatus: string): boolean {
  return (
    isConfirmedReviewStatus(reviewStatus) ||
    reviewStatus === "NEEDS_CLIENT_CONFIRMATION"
  );
}

async function alreadySynced(
  caseId: string,
  sourceItemId: string,
  targetType: LitigationOpsLinkTargetType,
): Promise<boolean> {
  const link = await findOpsLink(caseId, sourceItemId, targetType);
  return !!link;
}

export async function syncDeadlineFromReviewItem(
  ctx: SyncContext,
  item: DocumentIntelligenceReviewQueueItem,
): Promise<{ created: boolean; reviewDecisionId?: string; reason?: string }> {
  if (!isConfirmedReviewStatus(item.reviewStatus)) {
    return { created: false, reason: "NOT_LAWYER_CONFIRMED" };
  }
  if (!(DEADLINE_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
    return { created: false, reason: "UNSUPPORTED_CATEGORY" };
  }
  if (await alreadySynced(ctx.caseId, item.itemId, "DEADLINE")) {
    return { created: false, reason: "ALREADY_SYNCED" };
  }

  const decision = ctx.decisionByItemId.get(item.itemId);
  if (!decision) {
    return { created: false, reason: "MISSING_REVIEW_DECISION" };
  }

  const deadline = await createLitigationDeadlineRecord({
    caseId: ctx.caseId,
    title: item.displayText.slice(0, 120),
    description: item.displayText,
    candidateDueText: item.displayText,
    reviewDecisionId: decision.id,
    sourceItemId: item.itemId,
    sourcePhase: item.sourcePhase,
    createdByUserId: ctx.actorUserId,
  });

  await createOpsLink({
    caseId: ctx.caseId,
    reviewDecisionId: decision.id,
    sourceItemId: item.itemId,
    targetType: "DEADLINE",
    targetId: deadline.id,
  });

  return { created: true, reviewDecisionId: decision.id };
}

export async function syncTaskFromReviewItem(
  ctx: SyncContext,
  item: DocumentIntelligenceReviewQueueItem,
): Promise<{ created: boolean; reviewDecisionId?: string; reason?: string }> {
  if (!isConfirmedReviewStatus(item.reviewStatus)) {
    return { created: false, reason: "NOT_LAWYER_CONFIRMED" };
  }
  if (!(TASK_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
    return { created: false, reason: "UNSUPPORTED_CATEGORY" };
  }
  if (await alreadySynced(ctx.caseId, item.itemId, "TASK")) {
    return { created: false, reason: "ALREADY_SYNCED" };
  }

  const decision = ctx.decisionByItemId.get(item.itemId);
  if (!decision) {
    return { created: false, reason: "MISSING_REVIEW_DECISION" };
  }

  const task = await createLitigationTaskRecord({
    caseId: ctx.caseId,
    title: item.displayText.slice(0, 120),
    description: item.displayText,
    taskKind: taskKindForCategory(item.itemCategory),
    reviewDecisionId: decision.id,
    sourceItemId: item.itemId,
    sourcePhase: item.sourcePhase,
    assigneeUserId: null,
    createdByUserId: ctx.actorUserId,
  });

  await createOpsLink({
    caseId: ctx.caseId,
    reviewDecisionId: decision.id,
    sourceItemId: item.itemId,
    targetType: "TASK",
    targetId: task.id,
  });

  return { created: true, reviewDecisionId: decision.id };
}

export async function syncSupplementFromReviewItem(
  ctx: SyncContext,
  item: DocumentIntelligenceReviewQueueItem,
): Promise<{ created: boolean; reviewDecisionId?: string; reason?: string }> {
  if (!isSupplementEligible(item.reviewStatus)) {
    return { created: false, reason: "NOT_LAWYER_CONFIRMED" };
  }
  if (!(SUPPLEMENT_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
    return { created: false, reason: "UNSUPPORTED_CATEGORY" };
  }
  if (await alreadySynced(ctx.caseId, item.itemId, "SUPPLEMENT")) {
    return { created: false, reason: "ALREADY_SYNCED" };
  }

  const decision = ctx.decisionByItemId.get(item.itemId);
  if (!decision) {
    return { created: false, reason: "MISSING_REVIEW_DECISION" };
  }

  const title =
    item.itemCategory === "supplement_draft" && item.payload?.draftTitle
      ? String(item.payload.draftTitle).slice(0, 120)
      : item.displayText.slice(0, 120);

  const supplement = await createSupplementRequestRepository({
    caseId: ctx.caseId,
    requesterUserId: ctx.actorUserId,
    targetUserId: ctx.ownerUserId,
    requestType: "ADDITIONAL_EVIDENCE",
    title,
    description: item.displayText,
  });

  await createOpsLink({
    caseId: ctx.caseId,
    reviewDecisionId: decision.id,
    sourceItemId: item.itemId,
    targetType: "SUPPLEMENT",
    targetId: supplement.id,
  });

  return { created: true, reviewDecisionId: decision.id };
}

export async function syncDraftContextFromItems(
  ctx: SyncContext,
  items: DocumentIntelligenceReviewQueueItem[],
  title?: string,
): Promise<{ created: boolean; reviewDecisionIds: string[]; reason?: string }> {
  const eligible = items.filter(
    (item) =>
      isConfirmedReviewStatus(item.reviewStatus) &&
      (DRAFT_CONTEXT_CATEGORIES as readonly string[]).includes(item.itemCategory),
  );

  if (eligible.length === 0) {
    return { created: false, reviewDecisionIds: [], reason: "UNSUPPORTED_CATEGORY" };
  }

  const bundleKey = eligible
    .map((i) => i.itemId)
    .sort()
    .join("|");
  const sourceItemId = `draft-bundle-${bundleKey.slice(0, 80)}`;

  if (await alreadySynced(ctx.caseId, sourceItemId, "DRAFT_CONTEXT")) {
    return { created: false, reviewDecisionIds: [], reason: "ALREADY_SYNCED" };
  }

  const reviewDecisionIds: string[] = [];
  const claims: string[] = [];
  const rebuttals: string[] = [];
  const evidenceLinks: string[] = [];

  for (const item of eligible) {
    const decision = ctx.decisionByItemId.get(item.itemId);
    if (!decision) continue;
    reviewDecisionIds.push(decision.id);

    if (item.itemCategory === "claim" || item.itemCategory === "defense") {
      claims.push(item.displayText);
    } else if (
      item.itemCategory === "rebuttal" ||
      item.itemCategory === "contradiction"
    ) {
      rebuttals.push(item.displayText);
    } else if (item.itemCategory === "evidence") {
      evidenceLinks.push(item.displayText);
    }
  }

  if (reviewDecisionIds.length === 0) {
    return { created: false, reviewDecisionIds: [], reason: "MISSING_REVIEW_DECISION" };
  }

  const draft = await createLitigationDraftContextRecord({
    caseId: ctx.caseId,
    title: title ?? `준비서면 컨텍스트 — ${ctx.caseId.slice(0, 8)}`,
    contextJson: {
      claims,
      rebuttals,
      evidenceLinks,
      preparatoryBriefContextNote:
        "13-G 확정 항목 기반 준비서면 초안 컨텍스트입니다. 변호사 최종 검토 후 사용하세요.",
    },
    reviewDecisionIds,
    createdByUserId: ctx.actorUserId,
  });

  await createOpsLink({
    caseId: ctx.caseId,
    reviewDecisionId: reviewDecisionIds[0]!,
    sourceItemId,
    targetType: "DRAFT_CONTEXT",
    targetId: draft.id,
  });

  return { created: true, reviewDecisionIds };
}

export async function runLitigationOperationsSync(params: {
  caseId: string;
  ownerUserId: string;
  actorUserId: string;
  items: DocumentIntelligenceReviewQueueItem[];
  decisions: LitigationDocumentIntelligenceReviewDecision[];
}): Promise<LitigationOpsSyncResult> {
  const ctx: SyncContext = {
    caseId: params.caseId,
    ownerUserId: params.ownerUserId,
    actorUserId: params.actorUserId,
    decisionByItemId: new Map(params.decisions.map((d) => [d.itemId, d])),
  };

  const result: LitigationOpsSyncResult = {
    caseId: params.caseId,
    version: LITIGATION_OPERATIONS_VERSION,
    syncedFromReviewDecisionIds: [],
    deadlinesCreated: 0,
    tasksCreated: 0,
    supplementDraftsCreated: 0,
    draftContextsCreated: 0,
    skippedItems: [],
    syncedAt: new Date().toISOString(),
  };

  const draftCandidates: DocumentIntelligenceReviewQueueItem[] = [];

  for (const item of params.items) {
    if ((DEADLINE_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
      const r = await syncDeadlineFromReviewItem(ctx, item);
      if (r.created && r.reviewDecisionId) {
        result.deadlinesCreated += 1;
        result.syncedFromReviewDecisionIds.push(r.reviewDecisionId);
      } else if (r.reason) {
        result.skippedItems.push({ itemId: item.itemId, reason: r.reason as LitigationOpsSyncResult["skippedItems"][number]["reason"] });
      }
      continue;
    }

    if ((TASK_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
      const r = await syncTaskFromReviewItem(ctx, item);
      if (r.created && r.reviewDecisionId) {
        result.tasksCreated += 1;
        result.syncedFromReviewDecisionIds.push(r.reviewDecisionId);
      } else if (r.reason) {
        result.skippedItems.push({ itemId: item.itemId, reason: r.reason as LitigationOpsSyncResult["skippedItems"][number]["reason"] });
      }
      continue;
    }

    if ((SUPPLEMENT_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
      const r = await syncSupplementFromReviewItem(ctx, item);
      if (r.created && r.reviewDecisionId) {
        result.supplementDraftsCreated += 1;
        result.syncedFromReviewDecisionIds.push(r.reviewDecisionId);
      } else if (r.reason) {
        result.skippedItems.push({ itemId: item.itemId, reason: r.reason as LitigationOpsSyncResult["skippedItems"][number]["reason"] });
      }
      continue;
    }

    if ((DRAFT_CONTEXT_CATEGORIES as readonly string[]).includes(item.itemCategory)) {
      draftCandidates.push(item);
    }
  }

  const draftResult = await syncDraftContextFromItems(ctx, draftCandidates);
  if (draftResult.created) {
    result.draftContextsCreated += 1;
    result.syncedFromReviewDecisionIds.push(...draftResult.reviewDecisionIds);
  }

  result.syncedFromReviewDecisionIds = [...new Set(result.syncedFromReviewDecisionIds)];
  return result;
}

export type { SyncContext };
