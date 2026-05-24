"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import {
  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
} from "@/features/client-portal/client-portal-mobile-a11y.policy";

export const CLIENT_PORTAL_NOTIFICATION_CENTER_MARKER_PHASE21D =
  "phase21d-client-portal-notification-center" as const;

export const CLIENT_PORTAL_NOTIFICATION_CENTER_A11Y_MARKER_PHASE21E =
  "phase21e-client-portal-notification-center-a11y" as const;

type NotificationCenterItem = {
  id: string;
  caseId: string;
  channel: string;
  status: string;
  surfaceLabel: string;
  title: string;
  portalPath: string | null;
  createdAt: string;
  metadataOnly: boolean;
};

export function ClientPortalNotificationCenter() {
  const [items, setItems] = useState<NotificationCenterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/client/notifications", {
          credentials: "include",
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        const data = requireOkData<{ items?: NotificationCenterItem[] }>(
          res,
          raw,
          "알림함을 불러오지 못했습니다.",
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
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-labelledby="client-portal-notification-center-title"
      data-testid="client-portal-notification-center"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
        Product Phase 21-D · 알림함
      </p>
      <h2 id="client-portal-notification-center-title" className="mt-1 text-lg font-bold text-slate-900">
        최근 포털 알림
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Phase 20 외부 메시징·포털 알림 기록입니다. 본문·첨부는 표시하지 않습니다.
      </p>

      {error ? (
        <p
          className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-slate-500" role="status" aria-live="polite">
          불러오는 중…
        </p>
      ) : null}

      {!loading && items.length === 0 ? (
        <p className="mt-4 rounded-xl border bg-slate-50 px-3 py-3 text-sm text-slate-600">
          아직 알림이 없습니다.
        </p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const href =
            item.portalPath ??
            (item.caseId ? `/client/cases/${item.caseId}` : "/client/cases");
          return (
            <li key={item.id}>
              <Link
                href={href}
                aria-label={`${item.surfaceLabel} 알림: ${item.title}`}
                className={[
                  "block rounded-xl border border-slate-100 px-3 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/40 sm:min-h-11",
                  CLIENT_PORTAL_MOBILE_FOCUS_RING_CLASS,
                ].join(" ")}
                data-testid={`client-portal-notification-item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-indigo-800">{item.surfaceLabel}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.channel} · {new Date(item.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  {item.metadataOnly ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                      metadata
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
