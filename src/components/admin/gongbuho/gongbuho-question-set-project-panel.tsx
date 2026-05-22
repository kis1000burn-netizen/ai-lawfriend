"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GongbuhoQuestionSetProjectPanelUiModel } from "@/features/gongbuho/admin-gongbuho-question-set-project-ui";
import { useCallback, useState } from "react";

type ProjectOkEnvelope = {
  ok: true;
  data?: {
    questionSet?: { id: string; title: string; status: string };
  };
};

type ProjectErrEnvelope = {
  ok: false;
  message?: string;
  code?: string;
  details?: { code?: string; existingQuestionSetId?: string };
};

async function parseProjectResponse(
  res: Response,
): Promise<ProjectOkEnvelope | ProjectErrEnvelope> {
  const raw = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (
    !raw ||
    typeof raw !== "object" ||
    typeof (raw.ok as unknown) !== "boolean"
  ) {
    return { ok: false, message: "응답 형식 오류입니다." };
  }
  if (raw.ok === true) {
    return raw as ProjectOkEnvelope;
  }
  return raw as ProjectErrEnvelope;
}

export function GongbuhoQuestionSetProjectPanel(props: Readonly<{
  packetId: string;
  ui: GongbuhoQuestionSetProjectPanelUiModel;
}>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: "ok" | "err";
    summary: string;
    extra?: string;
  } | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  async function handleProject() {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/gongbuho/${props.packetId}/question-set/project`, {
        method: "POST",
        credentials: "include",
      });
      const body = await parseProjectResponse(res);

      if (!body.ok) {
        const details = body.details;
        const detailCode =
          details && typeof details === "object" && "code" in details
            ? String((details as { code?: unknown }).code ?? "")
            : "";
        const existingIdRaw =
          details && typeof details === "object" && "existingQuestionSetId" in details
            ? (details as { existingQuestionSetId?: unknown }).existingQuestionSetId
            : undefined;
        const existingId = typeof existingIdRaw === "string" ? existingIdRaw : "";

        const summary = body.message ?? `저장 실패 (${res.status})`;
        let extra = `HTTP ${res.status}`;
        if (detailCode) extra += ` · ${detailCode}`;
        else if (body.code) extra += ` · ${body.code}`;

        if (existingId && (detailCode === "QUESTION_SET_FROM_GONGBUHO_EXISTS" || res.status === 409)) {
          extra += ` · 질문셋 ${existingId}`;
        }

        setFeedback({ variant: "err", summary, extra });

        alert(`${summary}\n${extra}`);
        refresh();
        return;
      }

      const qs = body.data?.questionSet;
      const okMsg = qs
        ? `QuestionSet 초안이 저장되었습니다.\nID: ${qs.id}\n상태: ${qs.status}`
        : "QuestionSet 초안이 저장되었습니다.";
      alert(okMsg);

      const extra = qs ? `${qs.title} — ${qs.id}` : undefined;
      setFeedback({
        variant: "ok",
        summary: qs ? `생성 완료: ${qs.id}` : "생성 완료",
        extra,
      });

      refresh();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "알 수 없는 오류로 저장에 실패했습니다.";
      setFeedback({
        variant: "err",
        summary: msg,
      });
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="공부호 질문셋 초안 저장"
      className="rounded-xl border border-violet-200 bg-violet-50/70 p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-violet-950">
        QuestionSet Project (Phase 4-C)
      </h2>

      {props.ui.staffReadOnlyBanner ? (
        <p className="mt-2 text-sm leading-relaxed text-violet-900">
          {props.ui.staffReadOnlyBanner}
        </p>
      ) : null}

      {props.ui.duplicateLinkedSetId ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">이미 저장된 초안 QuestionSet 이 있습니다.</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/95">
            중복 저장은 허용되지 않으며, API에서는{" "}
            <span className="font-mono text-[11px]">
              409 · QUESTION_SET_FROM_GONGBUHO_EXISTS
            </span>
            로 응답합니다.
          </p>
          <Link
            href={`/admin/question-sets/${props.ui.duplicateLinkedSetId}`}
            className="mt-3 inline-block text-xs font-semibold text-violet-800 underline underline-offset-2 hover:text-violet-950"
          >
            질문셋 상세 열기 → ({props.ui.duplicateLinkedSetId})
          </Link>
        </div>
      ) : null}

      {feedback ? (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed ${
            feedback.variant === "ok"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="font-semibold">{feedback.summary}</p>
          {feedback.extra ? <p className="mt-1 opacity-95">{feedback.extra}</p> : null}
          {feedback.variant === "ok" ? (
            <div className="mt-3">
              <Link
                href="/admin/question-sets"
                className="inline-block rounded-lg border border-violet-300 bg-white px-3 py-2 text-[11px] font-medium text-violet-900 hover:bg-violet-100"
              >
                질문셋 카탈로그로 이동
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {props.ui.project.showButton ? (
          <button
            type="button"
            disabled={busy || props.ui.project.disabled}
            onClick={() => void handleProject()}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              props.ui.project.disabled
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                : "border border-violet-800 bg-violet-900 text-white hover:bg-violet-950 disabled:opacity-70"
            }`}
          >
            질문셋 초안으로 저장(Project)
          </button>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2 text-xs leading-relaxed text-violet-950/95">
        <div>
          <dt className="font-semibold">정책</dt>
          <dd>{props.ui.project.caption}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[11px] leading-relaxed text-violet-900/85">
        저장 성공 또는 409 이후 페이지를 router.refresh 로 다시 불러오면, 같은 패킷에 대한 초안 링크
        표시가 즉시 갱신됩니다.
      </p>
    </section>
  );
}
