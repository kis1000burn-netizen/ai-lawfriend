"use client";

/**
 * Phase 15-A — Case detail banner for client supplement tracking.
 */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  countClientPendingSupplements,
} from "@/features/supplement-request/supplement-request.portal";
import type { SupplementRequestStatus } from "@prisma/client";

export const CLIENT_SUPPLEMENT_TRACKING_PANEL_MARKER_PHASE15A =
  "phase15a-client-supplement-tracking-panel" as const;

type Props = {
  caseId: string;
};

export function ClientSupplementTrackingPanel({ caseId }: Readonly<Props>) {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [totalVisible, setTotalVisible] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/supplement-requests?pageSize=50`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: { items?: Array<{ status: string }> };
      };
      if (!res.ok || json.ok === false) {
        setPendingCount(0);
        setTotalVisible(0);
        return;
      }
      const items = json.data?.items ?? [];
      const statuses = items.map((item) => item.status as SupplementRequestStatus);
      setTotalVisible(items.length);
      setPendingCount(countClientPendingSupplements(statuses));
    } catch {
      setPendingCount(0);
      setTotalVisible(0);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        data-testid="client-supplement-tracking-panel-loading"
      >
        <p className="text-sm text-aibeop-subtle">보완요청 상태 확인 중…</p>
      </section>
    );
  }

  if (totalVisible === 0) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm"
      data-testid="client-supplement-tracking-panel"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-950">보완요청</h2>
          <p className="mt-1 text-sm text-amber-900/80">
            {pendingCount && pendingCount > 0
              ? `응답이 필요한 보완요청 ${pendingCount}건이 있습니다.`
              : "제출한 보완요청의 검토 진행 상황을 확인할 수 있습니다."}
          </p>
        </div>
        <Link
          href={`/client/cases/${caseId}`}
          className="inline-flex shrink-0 rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          data-testid="client-supplement-tracking-panel-cta"
        >
          의뢰인 포털 열기
        </Link>
      </div>
    </section>
  );
}
