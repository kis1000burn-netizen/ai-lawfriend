"use client";

import { PrettyJsonViewer } from "./pretty-json-viewer";

type Props = {
  run: {
    id: string;
    jobCode: string;
    jobName: string;
    status: string;
    startedAt: string;
    finishedAt?: string | null;
    durationMs?: number | null;
    message?: string | null;
    errorStack?: string | null;
    retryOfRunId?: string | null;
    triggeredBy?: string | null;
    metaJson?: unknown;
    scannedCount?: number | null;
    affectedCount?: number | null;
    createdAt: string;
  };
};

export function CronRunDetailCard({ run }: Props) {
  const durationMs =
    run.finishedAt && run.startedAt
      ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
      : run.durationMs ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">{run.jobName}</h1>
          <p className="mt-1 font-mono text-xs text-aibeop-subtle">{run.jobCode}</p>
          <p className="mt-1 text-sm text-aibeop-subtle">Cron 실행 상세 로그</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            run.status === "SUCCESS"
              ? "bg-emerald-100 text-emerald-700"
              : run.status === "FAILED"
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {run.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Info label="실행 ID" value={run.id} />
        <Info label="트리거" value={run.triggeredBy ?? "-"} />
        <Info label="시작 시각" value={formatDate(run.startedAt)} />
        <Info label="종료 시각" value={run.finishedAt ? formatDate(run.finishedAt) : "-"} />
        <Info label="소요 시간" value={durationMs !== null ? `${durationMs} ms` : "-"} />
        <Info label="재시도 원본" value={run.retryOfRunId ?? "-"} />
        <Info label="스캔 수" value={String(run.scannedCount ?? "-")} />
        <Info label="반영 수" value={String(run.affectedCount ?? "-")} />
        <Info label="기록 생성" value={formatDate(run.createdAt)} />
      </div>

      {run.message && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-aibeop-subtle">메시지</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-aibeop-subtle">{run.message}</pre>
        </div>
      )}

      {run.errorStack && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-semibold text-rose-700">오류 스택</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-rose-800">{run.errorStack}</pre>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-3 text-sm font-semibold text-aibeop-subtle">결과 Pretty Viewer (metaJson)</div>
        <PrettyJsonViewer value={run.metaJson ?? null} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs text-aibeop-subtle">{label}</div>
      <div className="mt-2 break-all text-sm font-medium text-aibeop-subtle">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}
