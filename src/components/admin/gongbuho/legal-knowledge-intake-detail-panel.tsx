"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  canCreateResearchBriefForIntake,
  countCanonicalSourceRefs,
  legalKnowledgeBriefStatusBadgeClass,
  legalKnowledgeIntakeStatusBadgeClass,
  readMappedCaseTypeFromIntake,
  readNormalizedKeywordFromIntake,
} from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";
import type { LegalKnowledgeIntakeStatus } from "@prisma/client";
import Link from "next/link";

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

type BriefRow = {
  id: string;
  status: string;
  targetCaseType: string;
  demandKeywordSnapshot: string;
  canonicalSourceRefs: unknown;
  updatedAt: string;
};

type Props = {
  intake: {
    id: string;
    status: LegalKnowledgeIntakeStatus;
    signalSource: string;
    demandStrength: string;
    querySignature: unknown;
    caseTypeMapping: unknown;
    intakeCompliance: unknown;
    updatedAt: string;
  };
  briefs: BriefRow[];
  viewerCanWrite: boolean;
  staffReadOnlyBanner: string | null;
};

export function LegalKnowledgeIntakeDetailPanel(props: Readonly<Props>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBriefForm, setShowBriefForm] = useState(false);
  const [legalIssueOutline, setLegalIssueOutline] = useState("");
  const [citationKey, setCitationKey] = useState("민법 제565조");
  const [summaryPointer, setSummaryPointer] = useState("임대차 종료 시 원상회복");

  const refresh = useCallback(() => router.refresh(), [router]);
  const canCreateBrief =
    props.viewerCanWrite &&
    canCreateResearchBriefForIntake(props.intake.status);

  async function handleCreateBrief(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreateBrief) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/gongbuho/legal-knowledge/intake/${props.intake.id}/research-brief`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packetIntent: "NEW_PACKET",
            canonicalSourceRefs: [
              {
                sourceKind: "STATUTE",
                citationKey: citationKey.trim(),
                summaryPointer: summaryPointer.trim(),
              },
            ],
            legalIssueOutline: legalIssueOutline.trim(),
            structureHints: {
              suggestedQuestionThemes: ["사실관계", "증거"],
              suggestedOutputSections: ["쟁점", "다음 단계"],
              suggestedForbiddenThemes: ["확정적 승소 단정"],
            },
          }),
        },
      );
      const body = await parseApi<{ brief: { id: string } }>(res);
      if (!body.ok) {
        throw new Error(body.message ?? `Brief 생성 실패 (${res.status})`);
      }
      setShowBriefForm(false);
      refresh();
      if (body.data?.brief?.id) {
        router.push(
          `/admin/gongbuho/legal-knowledge/brief/${body.data.brief.id}`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Brief 생성 실패";
      setErrorMsg(msg);
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
          <h2 className="text-lg font-semibold text-slate-900">Intake</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeIntakeStatusBadgeClass(props.intake.status)}`}
          >
            {props.intake.status}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">수요 키워드</dt>
            <dd>{readNormalizedKeywordFromIntake(props.intake.querySignature)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">mappedCaseType</dt>
            <dd className="font-mono text-xs">
              {readMappedCaseTypeFromIntake(props.intake.caseTypeMapping) ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">signalSource</dt>
            <dd className="text-xs">{props.intake.signalSource}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">demandStrength</dt>
            <dd>{props.intake.demandStrength}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">noRawUgcStored</dt>
            <dd className="font-mono text-xs">
              {typeof props.intake.intakeCompliance === "object" &&
              props.intake.intakeCompliance !== null &&
              (props.intake.intakeCompliance as Record<string, unknown>)
                .noRawUgcStored === true
                ? "true"
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Research Brief</h2>
          {canCreateBrief ? (
            <button
              type="button"
              onClick={() => setShowBriefForm((v) => !v)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
            >
              {showBriefForm ? "폼 닫기" : "+ Brief 생성"}
            </button>
          ) : null}
        </div>

        {showBriefForm ? (
          <form
            onSubmit={handleCreateBrief}
            className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <label className="block text-sm">
              <span className="text-xs font-medium text-slate-600">legalIssueOutline</span>
              <textarea
                required
                value={legalIssueOutline}
                onChange={(e) => setLegalIssueOutline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="구조화 쟁점 요약(UGC 인용 금지)"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">citationKey</span>
                <input
                  required
                  value={citationKey}
                  onChange={(e) => setCitationKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-slate-600">summaryPointer</span>
                <input
                  required
                  value={summaryPointer}
                  onChange={(e) => setSummaryPointer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Brief 생성
            </button>
          </form>
        ) : null}

        {errorMsg ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        ) : null}

        {props.briefs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            연결된 Brief가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {props.briefs.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeBriefStatusBadgeClass(b.status)}`}
                    >
                      {b.status}
                    </span>
                    <span className="font-mono text-xs text-slate-600">{b.targetCaseType}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-800">{b.demandKeywordSnapshot}</p>
                  <p className="text-xs text-slate-500">
                    canonicalSourceRefs: {countCanonicalSourceRefs(b.canonicalSourceRefs)}건
                  </p>
                </div>
                <Link
                  href={`/admin/gongbuho/legal-knowledge/brief/${b.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  Brief 상세
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
