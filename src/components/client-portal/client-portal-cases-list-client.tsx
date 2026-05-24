"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

export const CLIENT_PORTAL_CASES_LIST_MARKER_PHASE21A =
  "phase21a-client-portal-cases-list" as const;

type CaseListItem = {
  caseId: string;
  title: string;
  statusLabel: string;
  pendingSupplementCount: number;
  unreadMessageCount: number;
};

export function ClientPortalCasesListClient() {
  const [items, setItems] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/client/cases", {
          credentials: "include",
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        const data = requireOkData<{ items?: CaseListItem[] }>(
          res,
          raw,
          "사건 목록을 불러오지 못했습니다.",
        );
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4" data-testid="client-portal-cases-list">
      <header className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          Product Phase 21-D · AI법친 의뢰인 포털
        </p>
        <h1 className="mt-1 text-2xl font-black text-indigo-950">내 사건 포털</h1>
        <p className="mt-2 text-sm leading-6 text-indigo-900/80">
          알림 링크로 들어온 사건 또는 아래 목록에서 포털을 열 수 있습니다.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">불러오는 중…</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">
          진행 중인 사건이 없습니다.
        </p>
      ) : null}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.caseId}>
            <Link
              href={`/client/cases/${item.caseId}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/30"
              data-testid={`client-portal-case-link-${item.caseId}`}
            >
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.statusLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-indigo-900">
                {item.pendingSupplementCount > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">
                    보완요청 {item.pendingSupplementCount}
                  </span>
                ) : null}
                {item.unreadMessageCount > 0 ? (
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-900">
                    새 메시지 {item.unreadMessageCount}
                  </span>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
