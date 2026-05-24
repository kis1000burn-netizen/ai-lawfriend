import Link from "next/link";
import type { DataGovernanceVisibilitySnapshot } from "@/features/data-governance/data-governance-visibility.schema";
import type { DataGovernancePurgePreviewSnapshot } from "@/features/data-governance/data-governance-purge-preview.service";
import type { DataGovernancePurgeUnlockEvaluation } from "@/features/data-governance/data-governance-purge-execution.policy";
import { DataGovernancePurgeRcPanel } from "@/components/admin/operations/data-governance-purge-rc-panel";
import {
  DATA_GOVERNANCE_PURGE_PREVIEW_API_PATH,
  DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH,
  DATA_GOVERNANCE_VISIBILITY_SNAPSHOT_API_PATH,
} from "@/features/data-governance/data-governance-rc-lock";
import { formatBlockedReason } from "@/features/data-governance/data-governance-visibility.service";

type Props = {
  snapshot: DataGovernanceVisibilitySnapshot;
  preview: DataGovernancePurgePreviewSnapshot;
  unlockEvaluation: DataGovernancePurgeUnlockEvaluation;
};

function LockBadge({ locked }: { locked: boolean }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        locked
          ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      ].join(" ")}
    >
      {locked ? "LOCKED" : "UNLOCKED"}
    </span>
  );
}

function DisabledActionBar() {
  return (
    <div className="flex flex-wrap gap-2">
      {(["Purge", "Delete", "Blob reclaim"] as const).map((label) => (
        <button
          key={label}
          type="button"
          disabled
          title="Phase 19-F RC unlock 전까지 실행 불가"
          className="cursor-not-allowed rounded-lg border border-aibeop-border bg-aibeop-surface px-3 py-1.5 text-xs font-medium text-aibeop-muted opacity-60"
        >
          {label} (19-F)
        </button>
      ))}
    </div>
  );
}

type RowTableProps = {
  title: string;
  rows: Array<{
    id: string;
    caseId: string | null;
    summary: string;
    expiresAt: string | null;
    effectiveStatus: string | null;
    category: string;
    eligibility: { eligible: boolean; blockedReason: string | null };
  }>;
};

function VisibilityTable({ title, rows }: RowTableProps) {
  return (
    <section className="rounded-xl border border-aibeop-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-aibeop-deep">{title}</h2>
        <span className="text-xs text-aibeop-muted">{rows.length} samples</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-aibeop-muted">표시할 후보 없음</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-aibeop-muted">
                <th className="py-2 pr-4">id</th>
                <th className="py-2 pr-4">case</th>
                <th className="py-2 pr-4">summary</th>
                <th className="py-2 pr-4">expires</th>
                <th className="py-2 pr-4">status</th>
                <th className="py-2 pr-4">category</th>
                <th className="py-2">blocked reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-aibeop-border/60">
                  <td className="py-2 pr-4 font-mono text-xs">{row.id.slice(0, 10)}…</td>
                  <td className="py-2 pr-4 font-mono text-xs">{row.caseId?.slice(0, 8) ?? "—"}</td>
                  <td className="py-2 pr-4 max-w-[200px] truncate">{row.summary}</td>
                  <td className="py-2 pr-4 text-xs">
                    {row.expiresAt ? row.expiresAt.slice(0, 10) : "—"}
                  </td>
                  <td className="py-2 pr-4">{row.effectiveStatus ?? "—"}</td>
                  <td className="py-2 pr-4 text-xs">{row.category}</td>
                  <td className="py-2 text-xs">
                    {formatBlockedReason(
                      row.eligibility.blockedReason as Parameters<
                        typeof formatBlockedReason
                      >[0],
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function DataGovernanceConsole({ snapshot, preview, unlockEvaluation }: Props) {
  const locks = snapshot.purgeExecutionLocked;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-aibeop-muted">
          Phase 19-E / 19-F — Data Governance Visibility · Purge RC
        </p>
        <h1 className="text-2xl font-bold text-aibeop-deep">데이터 거버넌스 · lifecycle 가시성</h1>
        <p className="text-sm text-aibeop-muted">
          삭제 후보 · 만료 후보 · 공유 만료 · ExternalMessageLog retention · orphan dry-run ·
          legal hold 차단 사유를 조회합니다. Snapshot: {snapshot.capturedAt}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/operations/monitoring" className="text-aibeop-accent hover:underline">
            Ops Console
          </Link>
          <Link href="/admin/audit-logs" className="text-aibeop-accent hover:underline">
            감사로그
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
        <h2 className="text-lg font-semibold text-amber-900">실행 잠금 (19-F RC 전)</h2>
        <p className="mt-2 text-sm text-amber-900/90">{snapshot.executionDisabledMessage}</p>
        <div className="mt-4">
          <DisabledActionBar />
        </div>
      </section>

      <DataGovernancePurgeRcPanel preview={preview} unlockEvaluation={unlockEvaluation} />

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Purge preview candidates</h2>
        <p className="mt-1 text-xs text-aibeop-muted">
          API: {DATA_GOVERNANCE_PURGE_PREVIEW_API_PATH} · {preview.candidateCount} would-purge-if-unlocked
        </p>
        {preview.candidates.length === 0 ? (
          <p className="mt-3 text-sm text-aibeop-muted">현재 preview purge 후보 없음</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {preview.candidates.slice(0, 10).map((c) => (
              <li key={`${c.model}-${c.id}`} className="font-mono text-xs">
                {c.model} · {c.id.slice(0, 12)}… · {c.summary}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">삭제 후보 (sample)</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.summary.deletionCandidateCount}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">만료 후보 (sample)</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.summary.expiryCandidateCount}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Legal hold 차단</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.summary.legalHoldBlockedCount}</p>
        </div>
        <div className="rounded-xl border border-aibeop-border bg-white p-4">
          <p className="text-xs text-aibeop-muted">Orphan dry-run</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.summary.orphanSamples}</p>
        </div>
      </section>

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Purge execution locks</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-aibeop-surface px-3 py-2">
            <span>19-A constitution</span>
            <LockBadge locked={locks.phase19a} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-aibeop-surface px-3 py-2">
            <span>19-C AuditLog</span>
            <LockBadge locked={locks.phase19cAuditLog} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-aibeop-surface px-3 py-2">
            <span>19-D Attachment</span>
            <LockBadge locked={locks.phase19dAttachment} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-aibeop-surface px-3 py-2">
            <span>19-E Admin UI</span>
            <LockBadge locked={locks.phase19eUi} />
          </div>
        </dl>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-aibeop-muted">Console path</dt>
            <dd className="font-mono text-xs">{DATA_GOVERNANCE_VISIBILITY_ADMIN_PATH}</dd>
          </div>
          <div>
            <dt className="text-aibeop-muted">Snapshot API</dt>
            <dd className="font-mono text-xs">{DATA_GOVERNANCE_VISIBILITY_SNAPSHOT_API_PATH}</dd>
          </div>
        </dl>
      </section>

      <VisibilityTable title="LitigationUploadedFile · 삭제/보존 후보" rows={snapshot.litigationFiles} />
      <VisibilityTable
        title="LitigationExtractedText · 추출본문 후보"
        rows={snapshot.litigationExtracted}
      />
      <VisibilityTable title="CaseSharedDocument · 공유 만료" rows={snapshot.sharedDocuments} />
      <VisibilityTable
        title="CaseDocumentDelivery · secure link 만료"
        rows={snapshot.documentDeliveries}
      />
      <VisibilityTable title="CasePackageShare · 패키지 공유 만료" rows={snapshot.packageShares} />
      <VisibilityTable
        title="ExternalMessageLog · secure link retention (180d)"
        rows={snapshot.externalMessages}
      />

      <section className="rounded-xl border border-aibeop-border bg-white p-5">
        <h2 className="text-lg font-semibold text-aibeop-deep">Storage orphan dry-run</h2>
        {snapshot.orphans.length === 0 ? (
          <p className="mt-3 text-sm text-aibeop-muted">orphan 후보 없음</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-aibeop-muted">
                  <th className="py-2 pr-4">kind</th>
                  <th className="py-2 pr-4">storagePath</th>
                  <th className="py-2 pr-4">fileId</th>
                  <th className="py-2">blocked reason</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.orphans.map((row) => (
                  <tr key={`${row.kind}-${row.storagePath}`} className="border-b">
                    <td className="py-2 pr-4">{row.kind}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.storagePath}</td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {row.litigationUploadedFileId?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="py-2 text-xs">
                      {formatBlockedReason(row.eligibility.blockedReason)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
