"use client";

import { useCallback, useEffect, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import DocumentApprovalReviewPanel from "./document-approval-review-panel";

type ParagraphItem = {
  id: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  order: number;
  sourceQuestionKey?: string | null;
  included: boolean;
  locked?: boolean;
  aiHint?: string | null;
};

type HistoryItem = {
  id: string;
  paragraphId: string;
  beforeContent: string;
  afterContent: string;
  instruction?: string | null;
  aiModel?: string | null;
  status?: string | null;
  createdAt: string;
};

type DiffLine = {
  type: "UNCHANGED" | "ADDED" | "REMOVED";
  left?: string;
  right?: string;
};

type PanelPayload = {
  documentId: string;
  caseId: string;
  title: string;
  paragraphs: ParagraphItem[];
  approvalReview: {
    includedParagraphCount: number;
    lockedParagraphCount: number;
    paragraphCount: number;
    recentRewriteCount: number;
    approvalLocked: boolean;
  };
};

type Props = {
  documentId: string;
};

export default function DocumentParagraphPanel({ documentId }: Props) {
  const [payload, setPayload] = useState<PanelPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyByParagraphId, setHistoryByParagraphId] = useState<Record<string, HistoryItem[]>>({});
  const [diffByHistoryId, setDiffByHistoryId] = useState<Record<string, DiffLine[]>>({});
  const [diffFilterByHistoryId, setDiffFilterByHistoryId] = useState<
    Record<string, "ALL" | "CHANGED_ONLY" | "ADDED_ONLY" | "REMOVED_ONLY">
  >({});
  const [loadingHistoryFor, setLoadingHistoryFor] = useState<string | null>(null);
  const [loadingDiffHistoryId, setLoadingDiffHistoryId] = useState<string | null>(null);

  const loadPanel = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/paragraph-panel`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkData<PanelPayload>(
        res,
        raw,
        "문단 구조 패널 조회에 실패했습니다.",
      );
      setPayload(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 구조 패널 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  async function loadHistory(caseId: string, paragraphId: string) {
    setLoadingHistoryFor(paragraphId);

    try {
      const qs = new URLSearchParams();
      qs.set("paragraphId", paragraphId);
      qs.set("documentId", documentId);

      const res = await fetch(`/api/cases/${caseId}/documents/draft/history?${qs.toString()}`);
      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{ items?: HistoryItem[] }>(
        res,
        raw,
        "문단 이력 조회에 실패했습니다.",
      );
      setHistoryByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: Array.isArray(payload?.items) ? payload.items : [],
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 이력 조회 중 오류가 발생했습니다.");
    } finally {
      setLoadingHistoryFor(null);
    }
  }

  async function loadDiff(caseId: string, historyId: string) {
    const filter = diffFilterByHistoryId[historyId] ?? "ALL";
    setLoadingDiffHistoryId(historyId);

    try {
      const res = await fetch(
        `/api/cases/${caseId}/documents/draft/history/${historyId}/diff?filter=${filter}`,
      );
      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{ diffLines?: DiffLine[] }>(
        res,
        raw,
        "문단 diff 조회에 실패했습니다.",
      );
      setDiffByHistoryId((prev) => ({
        ...prev,
        [historyId]: Array.isArray(payload?.diffLines) ? payload.diffLines : [],
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 diff 조회 중 오류가 발생했습니다.");
    } finally {
      setLoadingDiffHistoryId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-aibeop-muted shadow-sm">
        문단 구조 패널을 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!payload) return null;

  return (
    <div className="space-y-6">
      <DocumentApprovalReviewPanel summary={payload.approvalReview} />

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">문단 구조 패널</h3>
          <span className="text-sm text-aibeop-subtle">전체 문단 {payload.paragraphs.length}개</span>
        </div>

        <div className="space-y-4">
          {payload.paragraphs.map((paragraph) => {
            const historyItems = historyByParagraphId[paragraph.id] ?? [];

            return (
              <article key={paragraph.id} className="rounded-xl border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-aibeop-faint">순서 {paragraph.order}</div>
                    <div className="font-medium">{paragraph.label ?? "문단"}</div>
                    {paragraph.sectionTitle ? (
                      <div className="text-xs text-aibeop-subtle">섹션: {paragraph.sectionTitle}</div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {paragraph.locked ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                        잠금
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => loadHistory(payload.caseId, paragraph.id)}
                      className="rounded-lg border px-3 py-1.5 text-sm"
                    >
                      {loadingHistoryFor === paragraph.id ? "이력 조회 중..." : "이력 보기"}
                    </button>
                  </div>
                </div>

                <pre className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-aibeop-subtle">
                  {paragraph.content}
                </pre>

                {historyItems.length > 0 ? (
                  <div className="mt-4 rounded-xl border bg-neutral-50 p-4">
                    <h4 className="mb-3 font-medium">문단 이력</h4>

                    <div className="space-y-3">
                      {historyItems.map((item) => (
                        <div key={item.id} className="rounded-lg border bg-white p-3">
                          <div className="mb-2 text-xs text-aibeop-subtle">
                            {item.createdAt} / 모델: {item.aiModel ?? "-"} / 상태: {item.status ?? "-"}
                          </div>

                          {item.instruction ? (
                            <div className="mb-2 text-xs text-blue-700">지시: {item.instruction}</div>
                          ) : null}

                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <select
                              className="rounded-lg border px-2 py-1 text-xs"
                              value={diffFilterByHistoryId[item.id] ?? "ALL"}
                              onChange={(e) =>
                                setDiffFilterByHistoryId((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value as
                                    | "ALL"
                                    | "CHANGED_ONLY"
                                    | "ADDED_ONLY"
                                    | "REMOVED_ONLY",
                                }))
                              }
                            >
                              <option value="ALL">전체</option>
                              <option value="CHANGED_ONLY">변경 줄만</option>
                              <option value="ADDED_ONLY">추가만</option>
                              <option value="REMOVED_ONLY">삭제만</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => loadDiff(payload.caseId, item.id)}
                              className="rounded-lg border px-3 py-1.5 text-xs"
                            >
                              {loadingDiffHistoryId === item.id ? "diff 조회 중..." : "diff 보기"}
                            </button>
                          </div>

                          {(diffByHistoryId[item.id] ?? []).length > 0 ? (
                            <div className="overflow-hidden rounded-lg border">
                              {(diffByHistoryId[item.id] ?? []).map((line, idx) => (
                                <div
                                  key={`${item.id}_${idx}`}
                                  className={
                                    line.type === "ADDED"
                                      ? "bg-green-50 px-3 py-2 text-xs text-green-800"
                                      : line.type === "REMOVED"
                                        ? "bg-red-50 px-3 py-2 text-xs text-red-800"
                                        : "bg-white px-3 py-2 text-xs text-aibeop-subtle"
                                  }
                                >
                                  {line.type === "ADDED"
                                    ? `+ ${line.right ?? ""}`
                                    : line.type === "REMOVED"
                                      ? `- ${line.left ?? ""}`
                                      : `  ${line.right ?? line.left ?? ""}`}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
