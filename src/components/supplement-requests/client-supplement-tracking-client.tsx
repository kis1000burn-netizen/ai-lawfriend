"use client";

/**
 * Phase 15-A — Client portal supplement request tracking.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SupplementRequestStatusBadge } from "@/components/supplement-requests/supplement-request-status-badge";
import {
  canClientRespondToSupplement,
  countClientPendingSupplements,
} from "@/features/supplement-request/supplement-request.portal";
import type { SupplementRequestStatus } from "@prisma/client";

export const CLIENT_SUPPLEMENT_TRACKING_CLIENT_MARKER_PHASE15A =
  "phase15a-client-supplement-tracking-client" as const;

type SupplementRequestItem = {
  id: string;
  status: string;
  requestType: string;
  title: string;
  description: string;
  dueAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  responses?: Array<{
    id: string;
    responseText?: string | null;
    createdAt?: string;
  }>;
};

type Props = {
  caseId: string;
  caseTitle: string;
};

const TRACKING_STEPS = [
  { key: "received", label: "보완요청 수신" },
  { key: "respond", label: "자료·답변 작성" },
  { key: "submitted", label: "제출 완료" },
  { key: "review", label: "변호사 검토" },
] as const;

function trackingStepIndex(status: string): number {
  switch (status) {
    case "SENT":
    case "CLIENT_VIEWED":
      return 1;
    case "NEEDS_MORE_INFO":
      return 1;
    case "CLIENT_RESPONDED":
      return 2;
    case "UNDER_REVIEW":
      return 3;
    case "ACCEPTED":
    case "CLOSED":
      return 4;
    default:
      return 0;
  }
}

function formatDueAt(dueAt?: string | null) {
  if (!dueAt) return null;
  try {
    return new Date(dueAt).toLocaleString("ko-KR");
  } catch {
    return dueAt;
  }
}

export function ClientSupplementTrackingClient({ caseId, caseTitle }: Props) {
  const [items, setItems] = useState<SupplementRequestItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SupplementRequestItem | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pendingCount = useMemo(
    () => countClientPendingSupplements(items.map((item) => item.status as SupplementRequestStatus)),
    [items],
  );

  const selected = selectedDetail ?? items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const activeStep = selected ? trackingStepIndex(selected.status) : 0;
  const canRespond =
    selected !== null &&
    canClientRespondToSupplement(selected.status as SupplementRequestStatus);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/cases/${caseId}/supplement-requests`, {
        cache: "no-store",
        credentials: "include",
      });
      const json = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { items?: SupplementRequestItem[] };
      };

      if (!response.ok || json.ok === false) {
        setMessage(json.error ?? "보완 요청 목록을 불러오지 못했습니다.");
        return;
      }

      const rows = json.data?.items ?? [];
      setItems(rows);
      if (!selectedId && rows[0]) {
        setSelectedId(rows[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [caseId, selectedId]);

  const loadDetail = useCallback(
    async (requestId: string) => {
      setDetailLoading(true);
      setMessage("");
      try {
        const response = await fetch(
          `/api/cases/${caseId}/supplement-requests/${requestId}`,
          { cache: "no-store", credentials: "include" },
        );
        const json = (await response.json()) as {
          ok?: boolean;
          error?: string;
          data?: SupplementRequestItem;
        };

        if (!response.ok || json.ok === false) {
          setMessage(json.error ?? "보완 요청 상세를 불러오지 못했습니다.");
          return;
        }

        const detail = json.data ?? null;
        setSelectedDetail(detail);
        setItems((prev) =>
          prev.map((item) => (item.id === requestId && detail ? { ...item, ...detail } : item)),
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [caseId],
  );

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!selectedId) return;
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function submitResponse() {
    if (!selected) return;
    if (!responseText.trim()) {
      setMessage("보완 답변을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/cases/${caseId}/supplement-requests/${selected.id}/responses`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseText }),
        },
      );
      const json = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || json.ok === false) {
        setMessage(json.error ?? "보완 응답 제출에 실패했습니다.");
        return;
      }

      setResponseText("");
      await loadItems();
      await loadDetail(selected.id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="client-supplement-tracking">
      {message ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Phase 15-A</p>
        <h2 className="mt-1 text-lg font-bold text-indigo-950">보완요청 추적</h2>
        <p className="mt-2 text-sm leading-6 text-indigo-900/80">
          {caseTitle} 사건에서 변호사가 보낸 보완요청을 확인하고, 자료·답변을 제출할 수 있습니다.
          제출 후 변호사 지휘실에서 검토가 진행됩니다.
        </p>
        {pendingCount > 0 ? (
          <p
            className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
            data-testid="client-supplement-pending-count"
          >
            응답 대기 {pendingCount}건
          </p>
        ) : (
          <p className="mt-3 text-xs text-indigo-800/70">현재 응답이 필요한 보완요청이 없습니다.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">진행 단계</h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-4" data-testid="client-supplement-tracking-steps">
          {TRACKING_STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = activeStep >= stepNumber;
            const isCurrent = activeStep + 1 === stepNumber || (activeStep === 0 && stepNumber === 1);
            return (
              <li
                key={step.key}
                className={[
                  "rounded-xl border px-3 py-3 text-center text-xs",
                  isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : isCurrent
                      ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                ].join(" ")}
              >
                <p className="font-bold">{step.label}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-aibeop-text">받은 보완요청</h3>
            <button
              type="button"
              onClick={() => void loadItems()}
              className="text-xs font-medium text-indigo-700 underline"
            >
              새로고침
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-aibeop-subtle">불러오는 중…</p>
            ) : items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-aibeop-subtle">
                아직 받은 보완요청이 없습니다.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setSelectedDetail(null);
                  }}
                  className={[
                    "w-full rounded-xl border p-4 text-left",
                    selected?.id === item.id
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  ].join(" ")}
                  data-testid={`client-supplement-item-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-aibeop-text">{item.title}</p>
                      <p className="mt-1 text-xs text-aibeop-subtle">{item.requestType}</p>
                    </div>
                    <SupplementRequestStatusBadge status={item.status} />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-aibeop-text">상세 · 응답</h3>

          {detailLoading && !selected ? (
            <p className="mt-4 text-sm text-aibeop-subtle">상세 불러오는 중…</p>
          ) : selected ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <SupplementRequestStatusBadge status={selected.status} />
                  <span className="text-xs text-aibeop-subtle">{selected.requestType}</span>
                </div>
                <h4 className="mt-3 text-lg font-bold text-aibeop-text">{selected.title}</h4>
                {formatDueAt(selected.dueAt) ? (
                  <p className="mt-1 text-xs text-amber-800">응답 기한: {formatDueAt(selected.dueAt)}</p>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-aibeop-subtle">
                  {selected.description}
                </p>
              </div>

              {canRespond ? (
                <div
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                  data-testid="client-supplement-response-form"
                >
                  <p className="text-sm font-bold text-emerald-900">보완 답변 · 자료 설명</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    답변과 함께 제출할 자료가 있으면 내용에 기재해 주세요. 사건 파일은 사건 상세
                    화면에서 별도로 업로드할 수 있습니다.
                  </p>
                  <textarea
                    value={responseText}
                    onChange={(event) => setResponseText(event.target.value)}
                    rows={5}
                    placeholder="보완 답변을 입력하세요."
                    className="mt-3 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitResponse()}
                    className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                    data-testid="client-supplement-submit-response"
                  >
                    {submitting ? "제출 중…" : "제출 완료"}
                  </button>
                </div>
              ) : selected.status === "CLIENT_RESPONDED" ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  제출이 완료되었습니다. 변호사 검토 결과를 기다려 주세요.
                </p>
              ) : null}

              {selected.responses && selected.responses.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-aibeop-text">제출 내역</p>
                  <div className="mt-3 space-y-2">
                    {selected.responses.map((resp) => (
                      <p
                        key={resp.id}
                        className="rounded-xl bg-white px-3 py-2 text-sm text-aibeop-subtle"
                      >
                        {resp.responseText ?? "JSON 응답"}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-aibeop-subtle">왼쪽 목록에서 보완요청을 선택하세요.</p>
          )}
        </section>
      </div>

      <p className="text-center text-xs text-aibeop-subtle">
        <Link href={`/cases/${caseId}`} className="underline hover:text-aibeop-text">
          ← 사건 상세로 돌아가기
        </Link>
      </p>
    </div>
  );
}
