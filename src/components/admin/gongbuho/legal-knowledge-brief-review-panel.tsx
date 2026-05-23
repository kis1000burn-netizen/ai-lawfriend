"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  canMarkBriefReadyForReview,
  canRecordLawyerReviewOnBrief,
  countCanonicalSourceRefs,
  legalKnowledgeBriefStatusBadgeClass,
  legalKnowledgeIntakeStatusBadgeClass,
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

type ReviewRow = {
  id: string;
  decision: string;
  status: string;
  gongbuhoPacketId: string | null;
  createdAt: string;
};

type Props = {
  brief: {
    id: string;
    intakeId: string;
    status: string;
    demandKeywordSnapshot: string;
    targetCaseType: string;
    legalIssueOutline: string;
    canonicalSourceRefs: unknown;
    structureHints: unknown;
    researchCompliance: unknown;
  };
  intakeStatus: string;
  reviews: ReviewRow[];
  viewerCanWriteBrief: boolean;
  viewerCanRecordLawyerReview: boolean;
  viewerCanCompile: boolean;
  staffReadOnlyBanner: string | null;
};

export function LegalKnowledgeBriefReviewPanel(props: Readonly<Props>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compileCode, setCompileCode] = useState("");
  const [compileVersion, setCompileVersion] = useState("1.0.0");
  const [compileName, setCompileName] = useState("");

  const refresh = useCallback(() => router.refresh(), [router]);

  const refs = Array.isArray(props.brief.canonicalSourceRefs)
    ? (props.brief.canonicalSourceRefs as CanonicalRef[])
    : [];

  const latestApprovedReview = props.reviews.find(
    (r) => r.decision === "APPROVE_FOR_PACKET_DRAFT" && !r.gongbuhoPacketId,
  );
  const compiledReview = props.reviews.find((r) => r.gongbuhoPacketId);

  async function handleReadyForReview() {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/gongbuho/legal-knowledge/research-brief/${props.brief.id}/ready-for-review`,
        { method: "POST", credentials: "include" },
      );
      const body = await parseApi<unknown>(res);
      if (!body.ok) throw new Error(body.message ?? "ready-for-review 실패");
      refresh();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "오류");
    } finally {
      setBusy(false);
    }
  }

  async function handleLawyerReview(decision: "APPROVE_FOR_PACKET_DRAFT" | "REJECT") {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/gongbuho/legal-knowledge/research-brief/${props.brief.id}/lawyer-review`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            reviewNotes:
              decision === "APPROVE_FOR_PACKET_DRAFT"
                ? "구조·표현 검수 후 패킷 DRAFT 컴파일 허용"
                : "수요 부적절 또는 근거 불충분",
            noUgcOrPiiInReviewNotes: true,
          }),
        },
      );
      const body = await parseApi<unknown>(res);
      if (!body.ok) throw new Error(body.message ?? "Lawyer Review 실패");
      refresh();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "오류");
    } finally {
      setBusy(false);
    }
  }

  async function handleCompile(e: React.FormEvent) {
    e.preventDefault();
    if (!latestApprovedReview) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/gongbuho/legal-knowledge/lawyer-review/${latestApprovedReview.id}/compile-packet-draft`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: compileCode.trim(),
            version: compileVersion.trim(),
            name: compileName.trim(),
            domain: "AI법친",
          }),
        },
      );
      const body = await parseApi<{ packet: { id: string } }>(res);
      if (!body.ok) throw new Error(body.message ?? "compile 실패");
      refresh();
      if (body.data?.packet?.id) {
        router.push(`/admin/gongbuho/${body.data.packet.id}`);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {props.staffReadOnlyBanner ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {props.staffReadOnlyBanner}
        </p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">Research Brief</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeBriefStatusBadgeClass(props.brief.status)}`}
          >
            {props.brief.status}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeIntakeStatusBadgeClass(props.intakeStatus)}`}
          >
            Intake: {props.intakeStatus}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{props.brief.demandKeywordSnapshot}</p>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {props.brief.targetCaseType} · {props.brief.id}
        </p>
        <p className="mt-4 text-sm text-slate-800">{props.brief.legalIssueOutline}</p>
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase text-slate-500">
            canonicalSourceRefs ({countCanonicalSourceRefs(props.brief.canonicalSourceRefs)})
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {refs.map((r) => (
              <li key={r.citationKey} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-mono text-xs text-slate-600">{r.sourceKind}</span> ·{" "}
                <span className="font-medium">{r.citationKey}</span>
                <p className="mt-1 text-xs text-slate-600">{r.summaryPointer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">파이프라인 액션</h2>

        {props.viewerCanWriteBrief && canMarkBriefReadyForReview(props.brief.status) ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleReadyForReview}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            ready-for-review
          </button>
        ) : null}

        {props.viewerCanRecordLawyerReview &&
        canRecordLawyerReviewOnBrief(props.brief.status) ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            변호사 검수는{" "}
            <strong>/lawyer/legal-knowledge/reviews</strong> 에서 LAWYER가 수행합니다. 아래는
            ADMIN 위임 검수(레거시)입니다.
          </div>
        ) : null}

        {props.viewerCanRecordLawyerReview &&
        canRecordLawyerReviewOnBrief(props.brief.status) ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleLawyerReview("APPROVE_FOR_PACKET_DRAFT")}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Lawyer Review — APPROVE_FOR_PACKET_DRAFT
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleLawyerReview("REJECT")}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
            >
              REJECT
            </button>
          </div>
        ) : null}

        {props.viewerCanCompile && latestApprovedReview ? (
          <form onSubmit={handleCompile} className="space-y-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              승인된 Review({latestApprovedReview.id.slice(0, 8)}…)에서 DRAFT 패킷 컴파일
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                required
                placeholder="code (LAW-XXX-001)"
                value={compileCode}
                onChange={(e) => setCompileCode(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="version"
                value={compileVersion}
                onChange={(e) => setCompileVersion(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="패킷 name"
                value={compileName}
                onChange={(e) => setCompileName(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              compile-packet-draft
            </button>
          </form>
        ) : null}

        {compiledReview?.gongbuhoPacketId ? (
          <p className="text-sm">
            컴파일된 패킷:{" "}
            <Link
              href={`/admin/gongbuho/${compiledReview.gongbuhoPacketId}`}
              className="font-mono text-sky-700 underline"
            >
              {compiledReview.gongbuhoPacketId}
            </Link>
          </p>
        ) : null}

        {errorMsg ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        ) : null}
      </section>

      {props.reviews.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Lawyer Review 이력</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {props.reviews.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs">
                {r.decision} · {r.status}
                {r.gongbuhoPacketId ? ` · packet ${r.gongbuhoPacketId}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
