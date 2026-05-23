"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { SeverityBadge } from "@/components/admin/alerts/severity-badge";
import { StatusBadge } from "@/components/admin/alerts/status-badge";
import { AlertDetailModal } from "@/components/admin/alerts/alert-detail-modal";
import { CaseAlertTimelineCta } from "@/components/cases/case-alert-timeline-cta";

type AlertItem = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  detectedAt: string;
  rule: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type Props = {
  caseId: string;
};

export function CaseAlertWidget({ caseId }: Props) {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/alert-events/by-case/${caseId}`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "사건 관련 경고 조회 실패");
      setItems((data.items as AlertItem[] | undefined) ?? []);
    } catch (err: unknown) {
      const e = err as Error;
      setMessage(e.message || "오류가 발생했습니다.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const latestOpenAlertId = useMemo(() => {
    const openItem = items.find((x) => x.status === "OPEN");
    return openItem?.id ?? null;
  }, [items]);

  return (
    <>
      <section className="space-y-4">
        <CaseAlertTimelineCta caseId={caseId} latestOpenAlertId={latestOpenAlertId} />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-aibeop-text">사건 관련 경고</h2>
              <p className="mt-1 text-sm text-aibeop-subtle">
                이 사건과 연결된 최근 경고를 표시합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchItems}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-aibeop-subtle"
              >
                새로고침
              </button>
              <Link
                href={`/admin/audit-logs?entityType=CASE&entityId=${encodeURIComponent(caseId)}`}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-aibeop-subtle"
              >
                사건 감사로그 보기
              </Link>
            </div>
          </div>

          {loading ? <div className="text-sm text-aibeop-subtle">불러오는 중...</div> : null}
          {message ? <div className="text-sm text-red-600">{message}</div> : null}

          {!loading && !message ? (
            <div className="space-y-3">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventId(item.id);
                          setDetailOpen(true);
                        }}
                        className="font-semibold text-aibeop-text hover:underline"
                      >
                        {item.title}
                      </button>
                      <SeverityBadge severity={item.severity} />
                      <StatusBadge status={item.status} />
                      {item.rule ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-aibeop-subtle">
                          {item.rule.code}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 text-sm text-aibeop-subtle">{item.message}</div>
                    <div className="mt-2 text-xs text-aibeop-subtle">
                      {new Date(item.detectedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-aibeop-subtle">
                  이 사건과 연결된 경고가 없습니다.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <AlertDetailModal
        eventId={selectedEventId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onChanged={fetchItems}
      />
    </>
  );
}
