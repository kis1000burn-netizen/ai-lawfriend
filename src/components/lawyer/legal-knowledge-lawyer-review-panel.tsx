"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  countCanonicalSourceRefs,
  legalKnowledgeBriefStatusBadgeClass,
} from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";

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

type CanonicalRef = {
  sourceKind: string;
  citationKey: string;
  summaryPointer: string;
};

type Props = {
  brief: {
    id: string;
    demandKeywordSnapshot: string;
    targetCaseType: string;
    legalIssueOutline: string;
    canonicalSourceRefs: unknown;
    status: string;
  };
};

export function LegalKnowledgeLawyerReviewPanel(props: Readonly<Props>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState(
    "구조·표현·고위험 쟁점 검수 완료 — 패킷 DRAFT 컴파일 허용",
  );

  const refresh = useCallback(() => router.refresh(), [router]);

  const refs = Array.isArray(props.brief.canonicalSourceRefs)
    ? (props.brief.canonicalSourceRefs as CanonicalRef[])
    : [];

  async function submitReview(
    decision: "APPROVE_FOR_PACKET_DRAFT" | "REQUEST_BRIEF_REVISION" | "REJECT",
  ) {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/lawyer/legal-knowledge/research-briefs/${props.brief.id}/lawyer-review`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            reviewNotes: reviewNotes.trim(),
            noUgcOrPiiInReviewNotes: true,
          }),
        },
      );
      const body = await parseApi<unknown>(res);
      if (!body.ok) {
        throw new Error(body.message ?? `검수 기록 실패 (${res.status})`);
      }
      router.push("/lawyer/legal-knowledge/reviews");
      refresh();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "검수 기록 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="legal-knowledge-lawyer-review-panel">
      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-aibeop-text">Legal Knowledge Brief 검수</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeBriefStatusBadgeClass(props.brief.status)}`}
          >
            {props.brief.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-aibeop-muted">
          UGC·네이버 원문 없이 공신력 근거 포인터만 검토합니다. 패킷 컴파일·승인은 관리자(ADMIN)가
          수행합니다.
        </p>
        <p className="mt-3 font-medium text-aibeop-text">{props.brief.demandKeywordSnapshot}</p>
        <p className="mt-1 font-mono text-xs text-aibeop-muted">
          {props.brief.targetCaseType} · {props.brief.id}
        </p>
        <p className="mt-4 text-sm text-aibeop-text">{props.brief.legalIssueOutline}</p>

        <div className="mt-4">
          <h2 className="text-xs font-semibold uppercase text-aibeop-muted">
            canonicalSourceRefs ({countCanonicalSourceRefs(props.brief.canonicalSourceRefs)})
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {refs.map((r) => (
              <li key={r.citationKey} className="rounded-lg bg-aibeop-soft px-3 py-2">
                <span className="font-mono text-xs text-aibeop-muted">{r.sourceKind}</span> ·{" "}
                {r.citationKey}
                <p className="mt-1 text-xs text-aibeop-muted">{r.summaryPointer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft space-y-4">
        <h2 className="text-lg font-semibold text-aibeop-text">검수 결정</h2>
        <label className="block text-sm">
          <span className="text-xs font-medium text-aibeop-muted">reviewNotes</span>
          <textarea
            data-testid="lawyer-review-notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-aibeop-line px-3 py-2 text-sm"
            rows={3}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            data-testid="lawyer-review-approve"
            onClick={() => submitReview("APPROVE_FOR_PACKET_DRAFT")}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            APPROVE_FOR_PACKET_DRAFT
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => submitReview("REQUEST_BRIEF_REVISION")}
            className="rounded-xl border border-amber-300 px-4 py-2 text-sm text-amber-900 disabled:opacity-50"
          >
            REQUEST_BRIEF_REVISION
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => submitReview("REJECT")}
            className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
          >
            REJECT
          </button>
        </div>
        {errorMsg ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        ) : null}
      </section>
    </div>
  );
}
