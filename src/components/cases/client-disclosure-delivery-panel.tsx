"use client";

/**
 * Phase 11-C — Client portal disclosure delivery panel (release-only).
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md
 */
import { useCallback, useState } from "react";
import type { ClientDisclosureDeliveryResult } from "@/features/ai-core/client-disclosure-delivery.schema";
import { requireOkData } from "@/lib/client/api-error";
import { CASE_STATUS_LABELS } from "@/lib/definitions";

export const CLIENT_DISCLOSURE_DELIVERY_PANEL_MARKER_PHASE11C =
  "phase11c-client-disclosure-delivery-panel" as const;

type Props = {
  caseId: string;
};

function SummaryBlock({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-slate-800">{body}</p>
    </div>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-800">
        {items.map((item, i) => (
          <li key={`${title}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ClientDisclosureDeliveryPanel({ caseId }: Readonly<Props>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<ClientDisclosureDeliveryResult | null>(null);

  const loadDelivery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/client-disclosure-delivery`, {
        credentials: "include",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ delivery: ClientDisclosureDeliveryResult }>(
        res,
        raw,
        "공개된 사건 정보를 불러오지 못했습니다.",
      );
      setDelivery(data.delivery);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const payload = delivery?.delivery;

  return (
    <section
      className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
      data-testid="client-disclosure-delivery-panel"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">변호사 공개 정보</h2>
          <p className="mt-1 text-sm text-slate-600">
            변호사가 release한 내용만 표시됩니다. 미공개 preview·내부 분석 자료는 포함되지
            않습니다.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          data-testid="client-disclosure-delivery-load"
          onClick={() => void loadDelivery()}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "불러오는 중..." : "공개 정보 보기"}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {delivery && !payload ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-sm text-emerald-950">
          {delivery.emptyNotice}
        </div>
      ) : null}

      {payload ? (
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              공개 시각: {new Date(payload.releasedAt).toLocaleString("ko-KR")}
            </span>
            <span>
              · 사건 상태:{" "}
              {CASE_STATUS_LABELS[payload.caseStatus as keyof typeof CASE_STATUS_LABELS] ??
                payload.caseStatus}
            </span>
            <span className="font-medium text-emerald-700">
              · release {payload.releaseId.slice(0, 8)}…
            </span>
          </div>

          {payload.content.structuredSummaryNote ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-950">
              {payload.content.structuredSummaryNote}
            </div>
          ) : null}

          <SummaryBlock title="사건 개요" body={payload.content.caseOverview} />
          <SummaryList title="공개 내용" items={payload.content.timeline} />

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
            {payload.content.disclaimer}
          </div>
        </div>
      ) : !error && !delivery ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
          「공개 정보 보기」를 눌러 변호사가 release한 최신 내용을 확인하세요.
        </div>
      ) : null}
    </section>
  );
}
