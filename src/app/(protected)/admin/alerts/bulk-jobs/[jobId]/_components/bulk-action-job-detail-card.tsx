"use client";

import { PrettyJsonViewer } from "@/app/(protected)/admin/cron-runs/[logId]/_components/pretty-json-viewer";

export function BulkActionJobDetailCard({ job }: { job: Record<string, unknown> }) {
  const action = String(job.action ?? "");
  const id = String(job.id ?? "");
  const status = String(job.status ?? "");
  const errorMessage = typeof job.errorMessage === "string" ? job.errorMessage : null;
  const cancelReason = typeof job.cancelReason === "string" ? job.cancelReason : null;

  const actor = job.actor as { name?: string | null; email?: string | null } | undefined;
  const canceledBy = job.canceledBy as { name?: string | null; email?: string | null } | undefined;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-aibeop-text">{action}</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">Bulk Action Job 상세</p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-aibeop-subtle">{status}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Info label="Job ID" value={id} />
        <Info label="액션" value={action} />
        <Info label="실행자" value={actor?.name || actor?.email || "-"} />
        <Info label="생성 시각" value={formatDate(job.createdAt)} />
        <Info label="시작 시각" value={job.startedAt ? formatDate(job.startedAt) : "-"} />
        <Info label="종료 시각" value={job.finishedAt ? formatDate(job.finishedAt) : "-"} />
        <Info label="재시도 원본" value={job.retryOfJobId ? String(job.retryOfJobId) : "-"} />
        <Info label="우선순위" value={job.priority ? String(job.priority) : "-"} />
        <Info label="큐 그룹" value={job.queueGroup ? String(job.queueGroup) : "-"} />
        <Info label="동시성 키" value={job.concurrencyKey ? String(job.concurrencyKey) : "-"} />
        <Info label="동시 실행 상한" value={String(job.maxConcurrency ?? "-")} />
        <Info label="취소 시각" value={job.canceledAt ? formatDate(job.canceledAt) : "-"} />
        <Info label="취소자" value={canceledBy?.name || canceledBy?.email || "-"} />
        <Info
          label="Lock 만료 시각"
          value={job.lockExpiresAt ? formatDate(job.lockExpiresAt) : "-"}
        />
        <Info
          label="마지막 Heartbeat"
          value={job.lastHeartbeatAt ? formatDate(job.lastHeartbeatAt) : "-"}
        />
        <Info label="Heartbeat 횟수" value={String(job.heartbeatCount ?? 0)} />
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-semibold text-rose-700">오류 메시지</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-rose-700">{errorMessage}</div>
        </div>
      )}

      {cancelReason && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-aibeop-subtle">취소 사유</div>
          <div className="mt-2 text-sm text-aibeop-subtle">{cancelReason}</div>
        </div>
      )}

      <div>
        <div className="mb-2 text-sm font-semibold text-aibeop-subtle">요청 Payload</div>
        <PrettyJsonViewer value={job.payloadJson ?? null} />
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-aibeop-subtle">대상 ID 목록</div>
        <PrettyJsonViewer value={job.targetIdsJson ?? []} />
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-aibeop-subtle">결과 JSON</div>
        <PrettyJsonViewer value={job.resultJson ?? null} />
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

function formatDate(value: unknown) {
  if (value instanceof Date) {
    return value.toLocaleString("ko-KR");
  }
  if (typeof value === "string") {
    return new Date(value).toLocaleString("ko-KR");
  }
  return "-";
}
