"use client";

/**
 * Phase 11-B — Client Disclosure Preview & Release Control panel.
 * @see docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md
 */
import Link from "next/link";
import { useCallback, useState } from "react";
import type { ClientDisclosurePreviewResult } from "@/features/ai-core/client-disclosure-preview.schema";
import { requireOkData } from "@/lib/client/api-error";

export const CLIENT_DISCLOSURE_PREVIEW_PANEL_MARKER_PHASE11B =
  "phase11b-client-disclosure-preview-panel" as const;

type Props = {
  caseId: string;
  caseTitle: string;
  initialPreview: ClientDisclosurePreviewResult;
  readOnly: boolean;
};

export function ClientDisclosurePreviewPanel({
  caseId,
  caseTitle,
  initialPreview,
  readOnly,
}: Readonly<Props>) {
  const [preview, setPreview] = useState(initialPreview);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [releaseNotes, setReleaseNotes] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch(`/api/cases/${caseId}/client-disclosure-preview`, {
      credentials: "include",
    });
    const raw = await res.json().catch(() => null);
    const data = requireOkData<{ preview: ClientDisclosurePreviewResult }>(
      res,
      raw,
      "미리보기를 불러오지 못했습니다.",
    );
    setPreview(data.preview);
  }, [caseId]);

  async function submitRelease() {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/client-disclosure-preview`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RELEASE",
          releaseNotes: releaseNotes.trim() || undefined,
        }),
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ preview: ClientDisclosurePreviewResult }>(
        res,
        raw,
        "Release 기록에 실패했습니다.",
      );
      setPreview(data.preview);
      setReleaseNotes("");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Release 실패");
    } finally {
      setBusy(false);
    }
  }

  const { clientPreview, diff, eligibilitySummary, lastRelease } = preview;

  return (
    <div className="space-y-6" data-testid="client-disclosure-preview-panel">
      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-aibeop-muted">
          Phase 11-B · Client Disclosure Preview
        </p>
        <h1 className="mt-1 text-xl font-semibold text-aibeop-text">{caseTitle}</h1>
        <p className="mt-1 text-sm text-aibeop-muted">
          변호사 승인 CLIENT_VISIBLE + CONFIRMED/EDITED만 의뢰인 공개 미리보기 · diff · release
          기록
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/cases/${caseId}/intelligence-review`}
            className="rounded-xl border border-aibeop-line px-3 py-2 text-sm"
          >
            ← Lawyer Review Console
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void reload()}
            className="rounded-xl border border-aibeop-line px-3 py-2 text-sm disabled:opacity-50"
          >
            미리보기 새로고침
          </button>
        </div>
        <dl className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-aibeop-muted">공개 가능 문장</dt>
            <dd className="font-semibold">{eligibilitySummary.eligibleStatementCount}</dd>
          </div>
          <div>
            <dt className="text-aibeop-muted">차단·미승인 항목</dt>
            <dd className="font-semibold">{eligibilitySummary.blockedEntryCount}</dd>
          </div>
          <div>
            <dt className="text-aibeop-muted">미공개 diff</dt>
            <dd className="font-semibold text-amber-800">
              {diff.hasUnreleasedChanges ? "있음" : "없음"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
        <h2 className="text-sm font-semibold text-emerald-950">의뢰인 공개 미리보기</h2>
        {clientPreview.statements.length === 0 ? (
          <p className="mt-3 text-sm text-emerald-900/80">
            {clientPreview.emptyReleaseNotice ??
              "공개 가능한 승인 문장이 없습니다. Review Console에서 CLIENT_VISIBLE + 확인/수정 후 다시 보세요."}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {clientPreview.statements.map((statement) => (
              <li
                key={statement.statementId}
                className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-800"
              >
                <span className="text-xs font-semibold text-emerald-800">
                  {statement.judgmentState}
                </span>
                <p className="mt-1 whitespace-pre-wrap">{statement.text}</p>
              </li>
            ))}
          </ul>
        )}
        {clientPreview.disclaimer ? (
          <p className="mt-4 text-xs text-emerald-900/70">{clientPreview.disclaimer}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-aibeop-text">공개 전 diff</h2>
        {diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0 ? (
          <p className="mt-2 text-sm text-aibeop-muted">마지막 release 대비 변경 없음</p>
        ) : (
          <div className="mt-3 space-y-4 text-sm">
            {diff.added.length > 0 ? (
              <div>
                <h3 className="font-semibold text-emerald-800">추가 ({diff.added.length})</h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {diff.added.map((s) => (
                    <li key={s.statementId}>{s.text}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {diff.changed.length > 0 ? (
              <div>
                <h3 className="font-semibold text-blue-800">변경 ({diff.changed.length})</h3>
                <ul className="mt-1 space-y-2">
                  {diff.changed.map((c) => (
                    <li key={c.sourceEntryId} className="rounded-lg bg-blue-50/50 p-2">
                      <p className="text-xs text-red-700 line-through">{c.beforeText}</p>
                      <p className="mt-1 text-slate-800">{c.afterText}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {diff.removed.length > 0 ? (
              <div>
                <h3 className="font-semibold text-red-800">제거 ({diff.removed.length})</h3>
                <ul className="mt-1 list-inside list-disc space-y-1 text-red-900/80">
                  {diff.removed.map((s) => (
                    <li key={s.statementId}>{s.text}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {!readOnly ? (
        <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft space-y-3">
          <h2 className="text-sm font-semibold text-aibeop-text">Release 기록</h2>
          <label className="block text-sm">
            <span className="text-xs text-aibeop-muted">releaseNotes (선택)</span>
            <textarea
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-aibeop-line px-3 py-2 text-sm"
              rows={2}
              placeholder="의뢰인 포털 반영 전 메모"
            />
          </label>
          <button
            type="button"
            disabled={busy || (!diff.hasUnreleasedChanges && !!lastRelease)}
            data-testid="client-disclosure-release"
            onClick={() => void submitRelease()}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Release 기록
          </button>
          {lastRelease ? (
            <p className="text-xs text-aibeop-muted">
              마지막 release: {new Date(lastRelease.releasedAt).toLocaleString("ko-KR")} ·{" "}
              {lastRelease.statements.length}문장
            </p>
          ) : (
            <p className="text-xs text-aibeop-muted">아직 release 기록 없음</p>
          )}
        </section>
      ) : null}

      {preview.releaseHistory.length > 0 ? (
        <section className="rounded-2xl border border-aibeop-line bg-aibeop-soft/40 p-4">
          <h2 className="text-xs font-semibold uppercase text-aibeop-muted">Release 이력</h2>
          <ul className="mt-2 space-y-2 text-xs">
            {preview.releaseHistory.map((release) => (
              <li key={release.releaseId} className="rounded-lg bg-white px-3 py-2">
                {new Date(release.releasedAt).toLocaleString("ko-KR")} ·{" "}
                {release.statements.length}문장 · added {release.diff.added.length} / changed{" "}
                {release.diff.changed.length}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
