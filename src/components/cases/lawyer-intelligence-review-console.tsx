"use client";

/**
 * Phase 11-A — Lawyer Review Console (Graph · Radar · Ledger queue).
 * @see docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md
 */
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { CaseIntelligenceReviewSnapshot } from "@/features/ai-core/case-intelligence-review.service";
import type { LawyerJudgmentBoundaryEntry } from "@/features/ai-core/lawyer-judgment-boundary-ledger.schema";
import { requireOkData } from "@/lib/client/api-error";

export const LAWYER_INTELLIGENCE_REVIEW_CONSOLE_MARKER_PHASE11A =
  "phase11a-lawyer-intelligence-review-console" as const;

type Props = {
  caseId: string;
  caseTitle: string;
  initialSnapshot: CaseIntelligenceReviewSnapshot | null;
  readOnly: boolean;
};

type Filter = "PENDING" | "ALL" | "CLAIM" | "RADAR_SIGNAL" | "CONTRADICTION_EDGE";

const SUBJECT_LABELS: Record<LawyerJudgmentBoundaryEntry["subjectKind"], string> = {
  CLAIM: "Claim",
  RADAR_SIGNAL: "Radar",
  CONTRADICTION_EDGE: "모순",
};

const STATE_BADGE: Record<LawyerJudgmentBoundaryEntry["judgmentState"], string> = {
  PENDING: "bg-amber-100 text-amber-900 ring-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  REJECTED: "bg-red-100 text-red-800 ring-red-200",
  EDITED: "bg-blue-100 text-blue-900 ring-blue-200",
};

function matchesFilter(entry: LawyerJudgmentBoundaryEntry, filter: Filter): boolean {
  if (filter === "ALL") return true;
  if (filter === "PENDING") return entry.judgmentState === "PENDING";
  return entry.subjectKind === filter;
}

export function LawyerIntelligenceReviewConsole({
  caseId,
  caseTitle,
  initialSnapshot,
  readOnly,
}: Readonly<Props>) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [rejectEntryId, setRejectEntryId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const entries = snapshot?.intelligenceGraph.ledger.entries ?? [];
  const summary = snapshot?.intelligenceGraph.ledger.summary;
  const radarCount = snapshot?.intelligenceGraph.radar.signals.length ?? 0;
  const claimCount = snapshot?.intelligenceGraph.graph.claims.length ?? 0;

  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesFilter(entry, filter)),
    [entries, filter],
  );

  const refreshSnapshot = useCallback(async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intelligence-review`, {
        method: "POST",
        credentials: "include",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ snapshot: CaseIntelligenceReviewSnapshot }>(
        res,
        raw,
        "지능 스냅샷 새로고침에 실패했습니다.",
      );
      setSnapshot(data.snapshot);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "새로고침 실패");
    } finally {
      setBusy(false);
    }
  }, [caseId]);

  async function submitJudgment(
    entryId: string,
    judgmentState: "CONFIRMED" | "REJECTED" | "EDITED",
    extra?: {
      lawyerEditedText?: string;
      rejectionReason?: string;
      clientVisible?: boolean;
    },
  ) {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intelligence-review/judgments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId,
          judgmentState,
          ...extra,
        }),
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ snapshot: CaseIntelligenceReviewSnapshot }>(
        res,
        raw,
        "판단 저장에 실패했습니다.",
      );
      setSnapshot(data.snapshot);
      setEditEntryId(null);
      setRejectEntryId(null);
      setEditText("");
      setRejectReason("");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "판단 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="lawyer-intelligence-review-console">
      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-aibeop-muted">
              Phase 11-A · Lawyer Review Console
            </p>
            <h1 className="mt-1 text-xl font-semibold text-aibeop-text">{caseTitle}</h1>
            <p className="mt-1 text-sm text-aibeop-muted">
              AI는 구조화했고, 변호사가 판단한다 — Graph · Radar · Ledger
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
          <Link
            href={`/cases/${caseId}/client-disclosure-preview`}
            className="rounded-xl border border-emerald-300 px-3 py-2 text-sm text-emerald-900"
          >
            Client Disclosure Preview
          </Link>
          <Link
            href={`/cases/${caseId}`}
            className="rounded-xl border border-aibeop-line px-3 py-2 text-sm text-aibeop-text"
          >
            사건 상세
          </Link>
            {!readOnly ? (
              <button
                type="button"
                disabled={busy}
                data-testid="intelligence-review-refresh"
                onClick={() => void refreshSnapshot()}
                className="rounded-xl bg-aibeop-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                스냅샷 새로고침
              </button>
            ) : null}
          </div>
        </div>

        {snapshot ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-aibeop-soft px-3 py-2">
              <dt className="text-xs text-aibeop-muted">Claims</dt>
              <dd className="text-lg font-semibold text-aibeop-text">{claimCount}</dd>
            </div>
            <div className="rounded-xl bg-aibeop-soft px-3 py-2">
              <dt className="text-xs text-aibeop-muted">Radar signals</dt>
              <dd className="text-lg font-semibold text-aibeop-text">{radarCount}</dd>
            </div>
            <div className="rounded-xl bg-aibeop-soft px-3 py-2">
              <dt className="text-xs text-aibeop-muted">Pending</dt>
              <dd className="text-lg font-semibold text-amber-800">{summary?.pendingCount ?? 0}</dd>
            </div>
            <div className="rounded-xl bg-aibeop-soft px-3 py-2">
              <dt className="text-xs text-aibeop-muted">Client visible</dt>
              <dd className="text-lg font-semibold text-emerald-800">
                {summary?.clientVisibleCount ?? 0}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-aibeop-muted">
            저장된 intelligence snapshot이 없습니다. 인터뷰·요약 데이터를 바탕으로 스냅샷을
            생성하세요.
          </p>
        )}
      </section>

      {!snapshot && !readOnly ? (
        <section className="rounded-2xl border border-dashed border-aibeop-line bg-aibeop-soft/40 p-6 text-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => void refreshSnapshot()}
            className="rounded-xl bg-aibeop-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            첫 스냅샷 생성
          </button>
        </section>
      ) : null}

      {snapshot ? (
        <>
          <section className="flex flex-wrap gap-2">
            {(
              [
                ["PENDING", "대기"],
                ["ALL", "전체"],
                ["CLAIM", "Claim"],
                ["RADAR_SIGNAL", "Radar"],
                ["CONTRADICTION_EDGE", "모순"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  filter === key
                    ? "bg-aibeop-primary text-white ring-aibeop-primary"
                    : "bg-white text-aibeop-muted ring-aibeop-line"
                }`}
              >
                {label}
              </button>
            ))}
          </section>

          <section className="space-y-3">
            {filteredEntries.length === 0 ? (
              <p className="text-sm text-aibeop-muted">표시할 Ledger 항목이 없습니다.</p>
            ) : (
              filteredEntries.map((entry) => (
                <article
                  key={entry.entryId}
                  className="rounded-2xl border border-aibeop-line bg-aibeop-card p-4 shadow-soft"
                  data-testid={`ledger-entry-${entry.entryId}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {SUBJECT_LABELS[entry.subjectKind]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${STATE_BADGE[entry.judgmentState]}`}
                    >
                      {entry.judgmentState}
                    </span>
                    {entry.clientVisible ? (
                      <span className="text-xs text-emerald-700">CLIENT_VISIBLE</span>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-aibeop-text">
                    {entry.lawyerEditedText ?? entry.aiDetectedText}
                  </p>
                  {entry.rejectionReason ? (
                    <p className="mt-2 text-xs text-red-700">기각 사유: {entry.rejectionReason}</p>
                  ) : null}
                  {!readOnly && entry.judgmentState === "PENDING" ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        data-testid={`confirm-${entry.entryId}`}
                        onClick={() =>
                          void submitJudgment(entry.entryId, "CONFIRMED", {
                            clientVisible: false,
                          })
                        }
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setRejectEntryId(entry.entryId);
                          setRejectReason("");
                        }}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 disabled:opacity-50"
                      >
                        기각
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditEntryId(entry.entryId);
                          setEditText(entry.aiDetectedText);
                        }}
                        className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs text-blue-800 disabled:opacity-50"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void submitJudgment(entry.entryId, "CONFIRMED", {
                            clientVisible: true,
                          })
                        }
                        className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs text-emerald-800 disabled:opacity-50"
                      >
                        확인 + 의뢰인 공개
                      </button>
                    </div>
                  ) : null}
                  {rejectEntryId === entry.entryId ? (
                    <div className="mt-3 space-y-2 rounded-xl border border-red-100 bg-red-50/50 p-3">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="기각 사유"
                        className="w-full rounded-lg border border-red-200 px-2 py-1 text-sm"
                        rows={2}
                      />
                      <button
                        type="button"
                        disabled={busy || !rejectReason.trim()}
                        onClick={() =>
                          void submitJudgment(entry.entryId, "REJECTED", {
                            rejectionReason: rejectReason.trim(),
                          })
                        }
                        className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        기각 저장
                      </button>
                    </div>
                  ) : null}
                  {editEntryId === entry.entryId ? (
                    <div className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded-lg border border-blue-200 px-2 py-1 text-sm"
                        rows={3}
                      />
                      <button
                        type="button"
                        disabled={busy || !editText.trim()}
                        onClick={() =>
                          void submitJudgment(entry.entryId, "EDITED", {
                            lawyerEditedText: editText.trim(),
                          })
                        }
                        className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        수정 저장
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </section>
        </>
      ) : null}

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
