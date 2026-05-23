"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { AibeopchinCmbStatus } from "@/cmb/core/cmb-schema";
import type { CmbPublishLockPanelModel } from "@/cmb/publish/cmb-publish-lock.service";
import { cmbStatusBadgeClass } from "@/cmb/admin/cmb-admin-preview";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; message?: string; code?: string };

async function parseApi<T>(res: Response): Promise<ApiEnvelope<T>> {
  const raw = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!raw || typeof raw !== "object" || typeof raw.ok !== "boolean") {
    return { ok: false, message: "응답 형식 오류입니다." };
  }
  return raw;
}

type Props = {
  panel: CmbPublishLockPanelModel;
};

export function CmbPublishLockPanel({ panel }: Readonly<Props>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState("");
  const [evidenceTag, setEvidenceTag] = useState(
    "EVIDENCE-20260523-AIBEOPCHIN-CMB-LAYER-PHASE6F-PUBLISH-LOCK",
  );

  const refresh = useCallback(() => router.refresh(), [router]);

  async function transition(toStatus: AibeopchinCmbStatus) {
    if (!panel.activeRevision) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/cmb/revisions/${panel.activeRevision.id}/transition`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toStatus,
            changeReason: changeReason.trim() || undefined,
            evidenceTag: evidenceTag.trim() || undefined,
          }),
        },
      );
      const body = await parseApi<{ revision: unknown }>(res);
      if (!body.ok) {
        throw new Error(body.message ?? `전이 실패 (${res.status})`);
      }
      refresh();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "전이 실패");
    } finally {
      setBusy(false);
    }
  }

  if (!panel.activeRevision) {
    return (
      <section
        data-testid="cmb-publish-lock-empty"
        className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 p-5 text-sm text-amber-950"
      >
        DB에 CMB revision이 없습니다. 목록 페이지에서{" "}
        <strong>Baseline sync</strong> (ADMIN)을 실행하세요.
      </section>
    );
  }

  const rev = panel.activeRevision;

  return (
    <section
      data-testid="cmb-publish-lock-panel"
      className="rounded-2xl border border-slate-300 bg-slate-50/90 p-5 shadow-soft space-y-4"
    >
      <div>
        <h2 className="text-sm font-semibold text-aibeop-text">Publish / Lock (Phase 6-F)</h2>
        <p className="mt-1 text-xs text-aibeop-muted">
          DRAFT → REVIEW → VERIFY_PASS → LOCKED → PUBLISHED · verify 통과 전 publish 차단 ·
          LOCKED config 보호
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cmbStatusBadgeClass(rev.status)}`}
        >
          {rev.status}
        </span>
        <span className="font-mono text-xs text-aibeop-muted">
          {rev.configId} · v{rev.version}
        </span>
        {rev.publishedAt ? (
          <span className="text-xs text-aibeop-muted">
            publishedAt: {new Date(rev.publishedAt).toLocaleString("ko-KR")}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-aibeop-muted">
        evidenceTag: <code className="font-mono">{rev.evidenceTag}</code>
      </p>

      {panel.canTransition ? (
        <div className="space-y-3 rounded-xl border border-aibeop-line bg-white p-4">
          <label className="block text-xs">
            <span className="text-aibeop-muted">changeReason (REVIEW/PUBLISHED 시 필수)</span>
            <textarea
              data-testid="cmb-transition-change-reason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-aibeop-line px-3 py-2 text-sm"
              rows={2}
            />
          </label>
          <label className="block text-xs">
            <span className="text-aibeop-muted">evidenceTag</span>
            <input
              value={evidenceTag}
              onChange={(e) => setEvidenceTag(e.target.value)}
              className="mt-1 w-full rounded-lg border border-aibeop-line px-3 py-2 font-mono text-xs"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {panel.allowedTransitions.map((toStatus) => (
              <button
                key={toStatus}
                type="button"
                disabled={busy}
                data-testid={`cmb-transition-${toStatus}`}
                onClick={() => transition(toStatus)}
                className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                → {toStatus}
              </button>
            ))}
          </div>
          {rev.status === "LOCKED" || rev.status === "PUBLISHED" ? (
            <p className="text-xs text-aibeop-muted" data-testid="cmb-lock-notice">
              {rev.status} revision — config 수정 불가 · preview/transition만 허용
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-aibeop-muted">상태 전이는 ADMIN 이상만 가능합니다.</p>
      )}

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}

      {panel.publishEvents.length > 0 ? (
        <div>
          <h3 className="text-xs font-semibold uppercase text-aibeop-muted">Publish 이력</h3>
          <ul className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white text-xs">
            {panel.publishEvents.map((ev) => (
              <li key={ev.id} className="px-3 py-2">
                <span className="font-mono">
                  {ev.fromStatus} → {ev.toStatus}
                </span>
                {ev.verifyPassed ? (
                  <span className="ml-2 rounded bg-emerald-100 px-1 text-emerald-800">verify</span>
                ) : null}
                <p className="mt-1 text-aibeop-muted">
                  {ev.evidenceTag} · {new Date(ev.createdAt).toLocaleString("ko-KR")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
