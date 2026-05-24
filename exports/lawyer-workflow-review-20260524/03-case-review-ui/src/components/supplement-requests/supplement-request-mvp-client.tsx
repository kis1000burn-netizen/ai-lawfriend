"use client";

import { useEffect, useMemo, useState } from "react";
import { SupplementRequestStatusBadge } from "./supplement-request-status-badge";

type Role = "CLIENT" | "LAWYER" | "STAFF" | "ADMIN" | "SUPER_ADMIN" | string;

type SupplementRequestItem = {
  id: string;
  status: string;
  requestType: string;
  title: string;
  description: string;
  dueAt?: string | null;
  targetUserId?: string;
  requesterUserId?: string;
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
  role: Role;
};

const REQUEST_TYPES = [
  ["MISSING_FACT", "누락 사실 보완"],
  ["UNCLEAR_FACT", "불명확 사실 확인"],
  ["ADDITIONAL_EVIDENCE", "추가 증거자료 요청"],
  ["DOCUMENT_CLARIFICATION", "문서 내용 보완"],
  ["PARTY_INFO", "당사자 정보 보완"],
  ["TIMELINE_CONFIRMATION", "시점/순서 확인"],
  ["DAMAGE_DETAIL", "피해금액/손해내용 보완"],
  ["CONSENT_OR_NOTICE", "동의/고지 확인"],
  ["OTHER", "기타 보완"],
] as const;

const TERMINAL = new Set(["CLOSED", "CANCELLED", "EXPIRED"]);

function canCreate(role: Role) {
  return role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

function canRespond(role: Role, item: SupplementRequestItem) {
  return role === "CLIENT" && !TERMINAL.has(item.status);
}

function nextActionsFor(role: Role, item: SupplementRequestItem): [string, string][] {
  if (!(role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN")) {
    return [];
  }

  if (item.status === "DRAFT") return [["SENT", "발송"], ["CANCELLED", "취소"]];
  if (item.status === "CLIENT_RESPONDED") return [["UNDER_REVIEW", "재검토 시작"]];
  if (item.status === "UNDER_REVIEW") {
    return [["ACCEPTED", "수용"], ["NEEDS_MORE_INFO", "추가 보완 필요"]];
  }
  if (item.status === "NEEDS_MORE_INFO") return [["SENT", "재발송"]];
  if (item.status === "ACCEPTED") return [["CLOSED", "종료"]];
  return [];
}

export function SupplementRequestMvpClient({ caseId, role }: Props) {
  const [items, setItems] = useState<SupplementRequestItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    targetUserId: "",
    requestType: "MISSING_FACT",
    title: "",
    description: "",
    dueAt: "",
  });
  const [responseText, setResponseText] = useState("");

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  );

  async function loadItems() {
    const response = await fetch(`/api/cases/${caseId}/supplement-requests`, {
      cache: "no-store",
    });
    const json = (await response.json()) as {
      ok?: boolean;
      error?: string;
      data?: { items?: SupplementRequestItem[] };
      items?: SupplementRequestItem[];
    };

    if (!response.ok || json.ok === false) {
      setMessage(json.error ?? "보완 요청 목록을 불러오지 못했습니다.");
      return;
    }

    const rows = json.data?.items ?? json.items ?? [];
    setItems(rows);
    if (!selectedId && rows[0]) setSelectedId(rows[0].id);
  }

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function createRequest() {
    setMessage("");
    const response = await fetch(`/api/cases/${caseId}/supplement-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || json.ok === false) {
      setMessage(json.error ?? "보완 요청 생성에 실패했습니다.");
      return;
    }

    setCreating(false);
    setForm({
      targetUserId: "",
      requestType: "MISSING_FACT",
      title: "",
      description: "",
      dueAt: "",
    });
    await loadItems();
  }

  async function transitionRequest(toStatus: string) {
    if (!selected) return;
    setMessage("");

    const response = await fetch(
      `/api/cases/${caseId}/supplement-requests/${selected.id}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus }),
      },
    );
    const json = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || json.ok === false) {
      setMessage(json.error ?? "상태 변경에 실패했습니다.");
      return;
    }

    await loadItems();
  }

  async function submitResponse() {
    if (!selected) return;
    if (!responseText.trim()) {
      setMessage("보완 답변을 입력해 주세요.");
      return;
    }
    setMessage("");

    const response = await fetch(
      `/api/cases/${caseId}/supplement-requests/${selected.id}/responses`,
      {
        method: "POST",
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
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-aibeop-text">보완 요청</h2>
            <p className="mt-1 text-sm text-aibeop-muted">
              변호사는 보완 요청을 작성하고, 의뢰인은 본인 요청에 응답합니다.
            </p>
          </div>

          {canCreate(role) ? (
            <button
              type="button"
              onClick={() => setCreating((value) => !value)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              {creating ? "작성 닫기" : "새 보완 요청"}
            </button>
          ) : null}
        </div>

        {creating && canCreate(role) ? (
          <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              value={form.targetUserId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetUserId: event.target.value }))
              }
              placeholder="대상 의뢰인 User ID"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <select
              value={form.requestType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, requestType: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {REQUEST_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="요청 제목"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="보완 요청 상세 내용"
              rows={5}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <input
              value={form.dueAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dueAt: event.target.value }))
              }
              placeholder="응답 기한 ISO 예: 2026-05-10T09:00:00.000Z"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              보완 요청은 변호사의 사건 검토를 위한 추가 정보 요청입니다. AI가 법률 판단을
              확정하지 않으며, 최종 검토와 요청 발송은 권한 있는 사용자가 수행합니다.
            </p>

            <button
              type="button"
              onClick={() => void createRequest()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              보완 요청 생성
            </button>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-aibeop-text">요청 목록</h3>

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-aibeop-subtle">
                아직 보완 요청이 없습니다.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={[
                    "w-full rounded-xl border p-4 text-left",
                    selected?.id === item.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  ].join(" ")}
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
          <h3 className="text-base font-bold text-aibeop-text">요청 상세</h3>

          {selected ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <SupplementRequestStatusBadge status={selected.status} />
                  <span className="text-xs text-aibeop-subtle">{selected.requestType}</span>
                </div>
                <h4 className="mt-3 text-lg font-bold text-aibeop-text">{selected.title}</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-aibeop-subtle">
                  {selected.description}
                </p>
              </div>

              {nextActionsFor(role, selected).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nextActionsFor(role, selected).map(([toStatus, label]) => (
                    <button
                      key={toStatus}
                      type="button"
                      onClick={() => void transitionRequest(toStatus)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-aibeop-subtle hover:bg-slate-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}

              {canRespond(role, selected) ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-900">보완 응답</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    제출하는 답변과 자료는 사건 검토 목적으로 사용됩니다. 최종 검토는 변호사가
                    수행합니다.
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
                    onClick={() => void submitResponse()}
                    className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    보완 응답 제출
                  </button>
                </div>
              ) : null}

              {selected.responses && selected.responses.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-aibeop-text">제출된 응답</p>
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
            <p className="mt-4 text-sm text-aibeop-subtle">왼쪽 목록에서 보완 요청을 선택하세요.</p>
          )}
        </section>
      </div>
    </div>
  );
}
