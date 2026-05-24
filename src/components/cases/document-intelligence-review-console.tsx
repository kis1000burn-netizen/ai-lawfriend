"use client";

/**
 * Phase 13-G — Document Intelligence Review tab (서류·증거 분석).
 */
import { useCallback, useMemo, useState } from "react";
import type { DocumentIntelligenceReviewQueueResponse } from "@/features/document-intelligence/document-intelligence-review.schema";
import { requireOkData } from "@/lib/client/api-error";

export const DOCUMENT_INTELLIGENCE_REVIEW_CONSOLE_MARKER_PHASE13G =
  "phase13g-document-intelligence-review-console" as const;

type Props = {
  caseId: string;
  readOnly: boolean;
  initialQueue: DocumentIntelligenceReviewQueueResponse | null;
};

type Filter = "PENDING" | "ALL" | "PHASE_13D" | "PHASE_13E" | "PHASE_13F" | "PHASE_15B" | "PHASE_15C";

const CATEGORY_LABELS: Record<string, string> = {
  claim: "주장",
  evidence: "증거",
  deadline: "기한",
  issue: "쟁점",
  question: "의뢰인 확인",
  supplement_draft: "보완요청 초안",
  defense: "항변",
  contradiction: "충돌",
  rebuttal: "반박",
  risk: "위험",
  client_statement: "의뢰인 진술",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 ring-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  EDITED: "bg-blue-100 text-blue-900 ring-blue-200",
  REJECTED: "bg-red-100 text-red-800 ring-red-200",
  NEEDS_CLIENT_CONFIRMATION: "bg-purple-100 text-purple-900 ring-purple-200",
};

export function DocumentIntelligenceReviewConsole({
  caseId,
  readOnly,
  initialQueue,
}: Readonly<Props>) {
  const [queue, setQueue] = useState(initialQueue);
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [rejectItemId, setRejectItemId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [opsSummary, setOpsSummary] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const items = queue?.items ?? [];
    if (filter === "ALL") return items;
    if (filter === "PENDING") {
      return items.filter((i) => i.decisionLabel === "PENDING");
    }
    return items.filter((i) => i.sourcePhase === filter);
  }, [queue, filter]);

  const refreshQueue = useCallback(async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/document-intelligence/review-queue`,
        { credentials: "include" },
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkData<DocumentIntelligenceReviewQueueResponse>(
        res,
        raw,
        "검토 큐를 불러오지 못했습니다.",
      );
      setQueue(data);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "새로고침 실패");
    } finally {
      setBusy(false);
    }
  }, [caseId]);

  async function postAction(
    itemId: string,
    action: "confirm" | "edit" | "reject" | "request-client-confirmation",
    body?: Record<string, unknown>,
  ) {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/document-intelligence/review-queue/${encodeURIComponent(itemId)}/${action}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
        },
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ queue: DocumentIntelligenceReviewQueueResponse }>(
        res,
        raw,
        "검토 저장에 실패했습니다.",
      );
      setQueue(data.queue);
      setEditItemId(null);
      setRejectItemId(null);
      setEditText("");
      setRejectReason("");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "검토 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  async function runOperationsSync() {
    setBusy(true);
    setErrorMsg(null);
    setOpsSummary(null);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/document-intelligence/operations/sync`,
        { method: "POST", credentials: "include" },
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{
        deadlinesCreated: number;
        tasksCreated: number;
        supplementDraftsCreated: number;
        draftContextsCreated: number;
      }>(res, raw, "운영 연동 동기화에 실패했습니다.");
      setOpsSummary(
        `기일 ${data.deadlinesCreated} · 업무 ${data.tasksCreated} · 보완요청 ${data.supplementDraftsCreated} · 서면컨텍스트 ${data.draftContextsCreated}`,
      );
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "운영 연동 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4" data-testid="document-intelligence-review-console">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-aibeop-muted">
          13-D/E/F 분석 후보 — 변호사 검토 게이트 (확정 전 downstream 사용 금지)
        </p>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void runOperationsSync()}
            className="rounded-xl bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            data-testid="doc-intel-ops-sync"
          >
            운영 연동 (13-H)
          </button>
        ) : null}
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void refreshQueue()}
            className="rounded-xl border border-aibeop-line px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            큐 새로고침
          </button>
        ) : null}
      </div>

      {opsSummary ? (
        <p className="text-sm text-indigo-800" data-testid="doc-intel-ops-summary">
          운영 연동 완료: {opsSummary}
        </p>
      ) : null}

      {queue ? (
        <dl className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl bg-aibeop-soft px-3 py-2">
            <dt className="text-xs text-aibeop-muted">전체</dt>
            <dd className="font-semibold">{queue.summary.totalCount}</dd>
          </div>
          <div className="rounded-xl bg-aibeop-soft px-3 py-2">
            <dt className="text-xs text-aibeop-muted">대기</dt>
            <dd className="font-semibold text-amber-800">{queue.summary.pendingCount}</dd>
          </div>
          <div className="rounded-xl bg-aibeop-soft px-3 py-2">
            <dt className="text-xs text-aibeop-muted">확정</dt>
            <dd className="font-semibold text-emerald-800">{queue.summary.confirmedCount}</dd>
          </div>
          <div className="rounded-xl bg-aibeop-soft px-3 py-2">
            <dt className="text-xs text-aibeop-muted">13-D</dt>
            <dd className="font-semibold">{queue.summary.phase13dCount}</dd>
          </div>
          <div className="rounded-xl bg-aibeop-soft px-3 py-2">
            <dt className="text-xs text-aibeop-muted">13-E</dt>
            <dd className="font-semibold">{queue.summary.phase13eCount}</dd>
          </div>
          <div className="rounded-xl bg-aibeop-soft px-3 py-2">
            <dt className="text-xs text-aibeop-muted">13-F</dt>
            <dd className="font-semibold">{queue.summary.phase13fCount}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-aibeop-muted">
          13-D/E/F 분석 결과가 없습니다. 문서 분석 파이프라인을 먼저 실행하세요.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["PENDING", "대기"],
            ["ALL", "전체"],
            ["PHASE_13D", "13-D"],
            ["PHASE_13E", "13-E"],
            ["PHASE_13F", "13-F"],
            ["PHASE_15B", "의뢰인 제출"],
            ["PHASE_15C", "채팅"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              filter === key
                ? "bg-aibeop-primary text-white ring-aibeop-primary"
                : "bg-white text-aibeop-muted ring-aibeop-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-aibeop-muted">표시할 검토 항목이 없습니다.</p>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.itemId}
              className="rounded-2xl border border-aibeop-line bg-aibeop-card p-4"
              data-testid={`doc-intel-review-${item.itemId}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">
                  {CATEGORY_LABELS[item.itemCategory] ?? item.itemCategory}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                  {item.sourcePhase.replace("PHASE_", "")}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${STATUS_BADGE[item.decisionLabel] ?? STATUS_BADGE.PENDING}`}
                >
                  {item.decisionLabel}
                </span>
                {item.downstreamUsable ? (
                  <span className="text-xs text-emerald-700">downstream OK</span>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{item.displayText}</p>
              {item.sourceFileName ? (
                <p className="mt-1 text-xs text-aibeop-muted">출처: {item.sourceFileName}</p>
              ) : null}
              {item.citations[0] ? (
                <p className="mt-1 text-xs text-aibeop-muted">
                  인용: {item.citations[0].snippet.slice(0, 100)}
                </p>
              ) : null}
              {!readOnly && item.decisionLabel === "PENDING" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void postAction(item.itemId, "confirm")}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditItemId(item.itemId);
                      setEditText(item.displayText);
                    }}
                    className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs text-blue-800"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setRejectItemId(item.itemId);
                      setRejectReason("");
                    }}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700"
                  >
                    기각
                  </button>
                  {(item.itemCategory === "question" ||
                    item.itemCategory === "supplement_draft") && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void postAction(item.itemId, "request-client-confirmation")
                      }
                      className="rounded-lg border border-purple-300 px-3 py-1.5 text-xs text-purple-800"
                    >
                      의뢰인 확인 요청
                    </button>
                  )}
                </div>
              ) : null}
              {editItemId === item.itemId ? (
                <div className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-lg border border-blue-200 px-2 py-1 text-sm"
                    rows={3}
                  />
                  <button
                    type="button"
                    disabled={busy || !editText.trim()}
                    onClick={() =>
                      void postAction(item.itemId, "edit", { editedText: editText.trim() })
                    }
                    className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    수정 저장
                  </button>
                </div>
              ) : null}
              {rejectItemId === item.itemId ? (
                <div className="mt-3 space-y-2 rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="기각 사유"
                    className="w-full rounded-lg border border-red-200 px-2 py-1 text-sm"
                    rows={2}
                  />
                  <button
                    type="button"
                    disabled={busy || !rejectReason.trim()}
                    onClick={() =>
                      void postAction(item.itemId, "reject", {
                        rejectionReason: rejectReason.trim(),
                      })
                    }
                    className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    기각 저장
                  </button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
