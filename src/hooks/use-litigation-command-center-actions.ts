"use client";

/**
 * Phase 14-C — Command Center action runner (optimistic UI, toast, feed).
 */
import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkData } from "@/lib/client/api-error";
import type { LitigationCommandCenterResponse } from "@/features/document-intelligence/litigation-command-center.schema";
import type { LitigationCommandCenterActionFeedItem } from "@/features/document-intelligence/litigation-command-center-action-feed";
import { auditActionForOptimisticKind } from "@/features/document-intelligence/litigation-command-center-action-feed";
import {
  applyOptimisticDeadlinePatch,
  applyOptimisticDraftGenerated,
  applyOptimisticSupplementSent,
  applyOptimisticSupplementReviewStarted,
  applyOptimisticTaskStatus,
} from "@/features/document-intelligence/litigation-command-center-optimistic";

export const LITIGATION_COMMAND_CENTER_ACTIONS_HOOK_MARKER_PHASE14C =
  "phase14c-litigation-command-center-actions-hook" as const;

type RunActionParams = {
  pendingKey: string;
  label: string;
  toastDescription?: string;
  feed: {
    kind: "task" | "deadline" | "supplement" | "supplementReview" | "draft";
    entityId: string;
    message: string;
  };
  optimistic: (prev: LitigationCommandCenterResponse) => LitigationCommandCenterResponse;
  execute: () => Promise<void>;
  onSuccess?: () => void;
};

export function useLitigationCommandCenterActions({
  caseId,
  data,
  setData,
  canAct,
  refresh,
}: {
  caseId: string;
  data: LitigationCommandCenterResponse;
  setData: Dispatch<SetStateAction<LitigationCommandCenterResponse>>;
  canAct: boolean;
  refresh: () => Promise<void>;
}) {
  const { pushToast } = useToast();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set());
  const [optimisticFeed, setOptimisticFeed] = useState<
    LitigationCommandCenterActionFeedItem[]
  >([]);
  const snapshotsRef = useRef<Map<string, LitigationCommandCenterResponse>>(new Map());

  const isPending = useCallback((key: string) => pendingKeys.has(key), [pendingKeys]);
  const isGlobalBusy = pendingKeys.size > 0;

  const addPending = useCallback((key: string) => {
    setPendingKeys((prev) => new Set(prev).add(key));
  }, []);

  const removePending = useCallback((key: string) => {
    setPendingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const pushOptimisticFeed = useCallback(
    (item: Omit<LitigationCommandCenterActionFeedItem, "id" | "source" | "outcome">) => {
      const feedItem: LitigationCommandCenterActionFeedItem = {
        ...item,
        id: `optimistic-${item.entityId}-${Date.now()}`,
        source: "OPTIMISTIC",
        outcome: "PENDING",
      };
      setOptimisticFeed((prev) => [feedItem, ...prev].slice(0, 8));
      return feedItem.id;
    },
    [],
  );

  const resolveOptimisticFeed = useCallback((optimisticId: string) => {
    setOptimisticFeed((prev) => prev.filter((item) => item.id !== optimisticId));
  }, []);

  const failOptimisticFeed = useCallback((optimisticId: string) => {
    setOptimisticFeed((prev) =>
      prev.map((item) =>
        item.id === optimisticId ? { ...item, outcome: "FAILED" as const } : item,
      ),
    );
  }, []);

  const runAction = useCallback(
    async ({
      pendingKey,
      label,
      toastDescription,
      feed,
      optimistic,
      execute,
      onSuccess,
    }: RunActionParams) => {
      if (!canAct) return;

      const snapshot = data;
      snapshotsRef.current.set(pendingKey, snapshot);
      addPending(pendingKey);

      const optimisticId = pushOptimisticFeed({
        auditAction: auditActionForOptimisticKind(feed.kind),
        message: feed.message,
        entityId: feed.entityId,
        occurredAt: new Date().toISOString(),
      });

      setData(optimistic(snapshot));

      try {
        await execute();
        pushToast({
          kind: "success",
          title: `${label} 완료`,
          description: toastDescription,
        });
        resolveOptimisticFeed(optimisticId);
        onSuccess?.();
        await refresh();
      } catch (err) {
        const rolledBack = snapshotsRef.current.get(pendingKey) ?? snapshot;
        setData(rolledBack);
        failOptimisticFeed(optimisticId);
        const message = err instanceof Error ? err.message : `${label}에 실패했습니다.`;
        pushToast({
          kind: "error",
          title: `${label} 실패`,
          description: message,
        });
      } finally {
        snapshotsRef.current.delete(pendingKey);
        removePending(pendingKey);
      }
    },
    [
      addPending,
      canAct,
      data,
      failOptimisticFeed,
      pushOptimisticFeed,
      pushToast,
      refresh,
      removePending,
      resolveOptimisticFeed,
      setData,
    ],
  );

  const patchTask = useCallback(
    (taskId: string, status: "OPEN" | "IN_PROGRESS" | "COMPLETED", label: string) => {
      const pendingKey = `task:${taskId}:${status}`;
      void runAction({
        pendingKey,
        label,
        feed: {
          kind: "task",
          entityId: taskId,
          message: `업무 ${label}`,
        },
        optimistic: (prev) => applyOptimisticTaskStatus(prev, taskId, status),
        execute: async () => {
          const res = await fetch(
            `/api/cases/${caseId}/litigation-command-center/tasks/${taskId}`,
            {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
            },
          );
          const raw = await res.json().catch(() => null);
          requireOkData(res, raw, "업무 상태 변경에 실패했습니다.");
        },
      });
    },
    [caseId, runAction],
  );

  const patchDeadline = useCallback(
    (
      deadlineId: string,
      body: { status?: "COMPLETED"; dueAt?: string | null; memo?: string },
      label: string,
    ) => {
      const pendingKey = `deadline:${deadlineId}:${JSON.stringify(body)}`;
      void runAction({
        pendingKey,
        label,
        feed: {
          kind: "deadline",
          entityId: deadlineId,
          message: label,
        },
        optimistic: (prev) => applyOptimisticDeadlinePatch(prev, deadlineId, body),
        execute: async () => {
          const res = await fetch(
            `/api/cases/${caseId}/litigation-command-center/deadlines/${deadlineId}`,
            {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            },
          );
          const raw = await res.json().catch(() => null);
          requireOkData(res, raw, "기일·마감 변경에 실패했습니다.");
        },
      });
    },
    [caseId, runAction],
  );

  const sendSupplement = useCallback(
    (requestId: string) => {
      const pendingKey = `supplement:${requestId}:send`;
      void runAction({
        pendingKey,
        label: "보완요청 발송",
        toastDescription: "의뢰인 확인 대기 상태로 전환됩니다.",
        feed: {
          kind: "supplement",
          entityId: requestId,
          message: "보완요청 발송(DRAFT→SENT)",
        },
        optimistic: (prev) => applyOptimisticSupplementSent(prev, requestId),
        execute: async () => {
          const res = await fetch(
            `/api/cases/${caseId}/litigation-command-center/supplements/${requestId}/send`,
            { method: "POST", credentials: "include" },
          );
          const raw = await res.json().catch(() => null);
          requireOkData(res, raw, "보완요청 발송에 실패했습니다.");
        },
      });
    },
    [caseId, runAction],
  );

  const startSupplementReview = useCallback(
    (requestId: string) => {
      const pendingKey = `supplement:${requestId}:review`;
      void runAction({
        pendingKey,
        label: "보완 재검토 시작",
        toastDescription: "의뢰인 응답을 검토 중 상태로 전환합니다.",
        feed: {
          kind: "supplementReview",
          entityId: requestId,
          message: "보완요청 재검토 시작(CLIENT_RESPONDED→UNDER_REVIEW)",
        },
        optimistic: (prev) => applyOptimisticSupplementReviewStarted(prev, requestId),
        execute: async () => {
          const res = await fetch(
            `/api/cases/${caseId}/litigation-command-center/supplements/${requestId}/start-review`,
            { method: "POST", credentials: "include" },
          );
          const raw = await res.json().catch(() => null);
          requireOkData(res, raw, "보완 재검토 시작에 실패했습니다.");
        },
      });
    },
    [caseId, runAction],
  );

  const generateDraft = useCallback(
    (draftContextId: string) => {
      const pendingKey = `draft:${draftContextId}:generate`;
      void runAction({
        pendingKey,
        label: "서면 초안 생성",
        feed: {
          kind: "draft",
          entityId: draftContextId,
          message: "준비서면 컨텍스트에서 초안 생성",
        },
        optimistic: (prev) => applyOptimisticDraftGenerated(prev, draftContextId),
        execute: async () => {
          const res = await fetch(
            `/api/cases/${caseId}/litigation-command-center/draft-contexts/${draftContextId}/generate-draft`,
            { method: "POST", credentials: "include" },
          );
          const raw = await res.json().catch(() => null);
          const result = requireOkData<{ documentHref: string; title: string }>(
            res,
            raw,
            "서면 초안 생성에 실패했습니다.",
          );
          globalThis.open(result.documentHref, "_blank", "noopener,noreferrer");
        },
        onSuccess: () => {
          pushToast({
            kind: "info",
            title: "초안 문서 열림",
            description: "새 탭에서 생성된 초안을 확인하세요.",
          });
        },
      });
    },
    [caseId, pushToast, runAction],
  );

  const mergedFeed = useMemo(() => {
    const pendingOptimistic = optimisticFeed.filter(
      (item) =>
        item.outcome !== "SUCCESS" &&
        !data.recentActionFeed.some(
          (audit) =>
            audit.entityId === item.entityId && audit.auditAction === item.auditAction,
        ),
    );
    const failed = pendingOptimistic.filter((item) => item.outcome === "FAILED");
    const pending = pendingOptimistic.filter((item) => item.outcome === "PENDING");
    return [...pending, ...failed, ...data.recentActionFeed].slice(0, 12);
  }, [data.recentActionFeed, optimisticFeed]);

  return {
    isPending,
    isGlobalBusy,
    mergedFeed,
    patchTask,
    patchDeadline,
    sendSupplement,
    startSupplementReview,
    generateDraft,
  };
}
