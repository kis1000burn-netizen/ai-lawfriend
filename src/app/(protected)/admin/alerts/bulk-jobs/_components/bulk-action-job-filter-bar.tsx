"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BulkActionJobFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [action, setAction] = useState(searchParams.get("action") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [actorQuery, setActorQuery] = useState(searchParams.get("actorQuery") ?? "");
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [onlyRetry, setOnlyRetry] = useState(searchParams.get("onlyRetry") === "true");
  const [priority, setPriority] = useState(searchParams.get("priority") ?? "");

  function applyFilters() {
    const params = new URLSearchParams();

    if (status) params.set("status", status);
    if (action) params.set("action", action);
    if (priority) params.set("priority", priority);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (actorQuery) params.set("actorQuery", actorQuery);
    if (query) params.set("query", query);
    if (onlyRetry) params.set("onlyRetry", "true");
    params.set("page", "1");

    router.push(`/admin/alerts/bulk-jobs?${params.toString()}`);
  }

  function resetFilters() {
    router.push("/admin/alerts/bulk-jobs");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">상태</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">전체</option>
            <option value="QUEUED">QUEUED</option>
            <option value="RUNNING">RUNNING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PARTIAL_SUCCESS">PARTIAL_SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">액션</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="">전체</option>
            <option value="ACKNOWLEDGE">ACKNOWLEDGE</option>
            <option value="RESOLVE">RESOLVE</option>
            <option value="IGNORE">IGNORE</option>
            <option value="REASSIGN">REASSIGN</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">우선순위</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">전체</option>
            <option value="LOW">LOW</option>
            <option value="NORMAL">NORMAL</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">실행자</label>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={actorQuery}
            onChange={(e) => setActorQuery(e.target.value)}
            placeholder="이름 또는 이메일"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">시작일</label>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">종료일</label>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-aibeop-subtle">통합 검색</label>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="job id / action / error"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex items-center gap-2 text-sm text-aibeop-muted">
          <input
            type="checkbox"
            checked={onlyRetry}
            onChange={(e) => setOnlyRetry(e.target.checked)}
          />
          재시도 Job만 보기
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-aibeop-subtle hover:bg-slate-50"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
          >
            필터 적용
          </button>
        </div>
      </div>
    </div>
  );
}
