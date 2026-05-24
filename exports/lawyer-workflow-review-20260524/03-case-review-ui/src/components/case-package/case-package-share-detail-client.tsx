"use client";

import { useEffect, useMemo, useState } from "react";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  message?: string;
  error?: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type CasePackageShareDetail = {
  id: string;
  caseId: string;
  publicCode: string;
  shareMode: "DESIGNATED_LAWYER" | "PUBLIC_CODE_REQUEST";
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  consentedAt: string;
  createdAt: string;
  updatedAt: string;
  scope: {
    allowSummary: boolean;
    allowInterview: boolean;
    allowAttachmentList: boolean;
    allowAttachmentDownload: boolean;
    allowDocumentDraft: boolean;
    allowDocumentPdf: boolean;
    allowPackagePdf: boolean;
    allowClientContact: boolean;
    allowOpponentDetail: boolean;
  };
  case: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    opponentName: string | null;
    incidentDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  lawyer: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  attachments: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    category: string | null;
    createdAt: string;
    downloadAllowed: boolean;
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    pdfAllowed: boolean;
  }>;
};

type CasePackageAccessLog = {
  id: string;
  shareId: string;
  caseId: string;
  actorUserId: string | null;
  actor: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  action: "VIEW" | "DOWNLOAD" | "DENIED" | "EXPIRED" | "REVOKED";
  targetType: string;
  targetId: string | null;
  resultMessage: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

const REVOKE_REASONS = [
  "잘못 공유함",
  "공유 범위를 변경하고 싶음",
  "공유 기간을 변경하고 싶음",
  "다른 변호사에게 공유 예정",
  "사건 정보 수정 필요",
  "기타",
];

export function CasePackageShareDetailClient({
  caseId,
  shareId,
}: {
  caseId: string;
  shareId: string;
}) {
  const [share, setShare] = useState<CasePackageShareDetail | null>(null);
  const [logs, setLogs] = useState<CasePackageAccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REVOKE_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const stats = useMemo(() => {
    return {
      viewCount: logs.filter((log) => log.action === "VIEW").length,
      downloadCount: logs.filter((log) => log.action === "DOWNLOAD").length,
      deniedCount: logs.filter((log) => log.action === "DENIED").length,
      expiredCount: logs.filter((log) => log.action === "EXPIRED").length,
      revokedCount: logs.filter((log) => log.action === "REVOKED").length,
    };
  }, [logs]);

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, shareId]);

  async function loadAll() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [shareResult, logResult] = await Promise.all([
        fetch(`/api/cases/${caseId}/package-shares/${shareId}`),
        fetch(`/api/cases/${caseId}/package-shares/${shareId}/access-logs`),
      ]);

      const sharePayload =
        (await shareResult.json()) as ApiResponse<CasePackageShareDetail>;
      const logPayload =
        (await logResult.json()) as ApiResponse<CasePackageAccessLog[]>;

      if (!sharePayload.ok) {
        setErrorMessage(
          sharePayload.message ?? "공유 상세 정보를 불러오지 못했습니다.",
        );
        return;
      }

      if (!logPayload.ok) {
        setErrorMessage(logPayload.message ?? "접근 로그를 불러오지 못했습니다.");
        return;
      }

      setShare(sharePayload.data);
      setLogs(logPayload.data);
    } catch {
      setErrorMessage("공유 상세 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRevoke() {
    if (!share) return;

    const revokeReason =
      selectedReason === "기타" ? customReason.trim() || "기타" : selectedReason;

    const confirmed = window.confirm(
      "공유를 취소하면 해당 고유번호로 더 이상 사건 패키지를 열람할 수 없습니다. 취소하시겠습니까?",
    );

    if (!confirmed) return;

    setIsRevoking(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/cases/${caseId}/package-shares/${share.id}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            revokeReason,
          }),
        },
      );

      const payload = (await response.json()) as ApiResponse<{
        id: string;
        status: "REVOKED";
        revokedAt: string;
        revokeReason: string;
      }>;

      if (!payload.ok) {
        setErrorMessage(payload.message ?? "공유 취소에 실패했습니다.");
        return;
      }

      setShare((prev) =>
        prev
          ? {
              ...prev,
              status: payload.data.status,
              revokedAt: payload.data.revokedAt,
              revokeReason: payload.data.revokeReason,
            }
          : prev,
      );

      setMessage("사건 패키지 공유가 취소되었습니다.");
      await loadAll();
    } catch {
      setErrorMessage("공유 취소 중 오류가 발생했습니다.");
    } finally {
      setIsRevoking(false);
    }
  }

  if (isLoading && !share) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-aibeop-muted shadow-sm">
        공유 상세 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (errorMessage && !share) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {errorMessage}
      </div>
    );
  }

  if (!share) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-aibeop-muted shadow-sm">
        공유 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex flex-col gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold text-aibeop-subtle">사건 고유번호</p>
              <p className="mt-1 font-mono text-2xl font-bold text-aibeop-text">{share.publicCode}</p>
            </div>

            <StatusBadge status={share.status} />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <InfoItem label="사건 제목" value={share.case.title} />
            <InfoItem label="공유 방식" value={share.shareMode} />
            <InfoItem
              label="공유 만료일"
              value={share.expiresAt ? formatDateTime(share.expiresAt) : "미설정"}
            />
            <InfoItem
              label="지정 변호사"
              value={share.lawyer?.name ?? share.lawyer?.email ?? "미지정"}
            />
            <InfoItem label="공유 생성일" value={formatDateTime(share.createdAt)} />
            <InfoItem
              label="공유 취소일"
              value={share.revokedAt ? formatDateTime(share.revokedAt) : "해당 없음"}
            />
          </div>

          {share.revokeReason ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              취소 사유: {share.revokeReason}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-aibeop-text">공유 범위</h2>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <ScopeItem label="사건 요약" enabled={share.scope.allowSummary} />
            <ScopeItem label="AI 인터뷰" enabled={share.scope.allowInterview} />
            <ScopeItem label="첨부자료 목록" enabled={share.scope.allowAttachmentList} />
            <ScopeItem
              label="첨부파일 다운로드"
              enabled={share.scope.allowAttachmentDownload}
            />
            <ScopeItem label="문서 초안" enabled={share.scope.allowDocumentDraft} />
            <ScopeItem label="문서 PDF" enabled={share.scope.allowDocumentPdf} />
            <ScopeItem label="사건 패키지 요약본 출력" enabled={share.scope.allowPackagePdf} />
            <ScopeItem
              label="의뢰인 연락처"
              enabled={share.scope.allowClientContact}
            />
            <ScopeItem
              label="상대방 상세 정보"
              enabled={share.scope.allowOpponentDetail}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-aibeop-text">열람 / 다운로드 이력</h2>
              <p className="mt-1 text-sm text-aibeop-muted">
                최근 100건까지 표시합니다. IP는 일부 마스킹됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadAll()}
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-aibeop-subtle hover:bg-slate-50"
            >
              새로고침
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <Metric label="열람" value={stats.viewCount} />
            <Metric label="다운로드" value={stats.downloadCount} />
            <Metric label="거부" value={stats.deniedCount} />
            <Metric label="만료 차단" value={stats.expiredCount} />
            <Metric label="취소 차단" value={stats.revokedCount} />
          </div>

          {logs.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-aibeop-muted">
              아직 열람 또는 다운로드 기록이 없습니다.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-aibeop-subtle">
                  <tr>
                    <th className="px-4 py-3">시간</th>
                    <th className="px-4 py-3">행위</th>
                    <th className="px-4 py-3">대상</th>
                    <th className="px-4 py-3">사용자</th>
                    <th className="px-4 py-3">결과</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-aibeop-muted">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-4 py-3 text-aibeop-muted">{log.targetType}</td>
                      <td className="px-4 py-3 text-aibeop-muted">
                        {log.actor?.name ?? log.actor?.email ?? "알 수 없음"}
                      </td>
                      <td className="px-4 py-3 text-aibeop-muted">
                        {log.resultMessage ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-aibeop-text">공유 취소</h2>
          <p className="mt-2 text-sm leading-6 text-aibeop-muted">
            공유를 취소하면 해당 고유번호로 더 이상 사건 패키지를 열람할 수
            없습니다. 취소 후 같은 고유번호는 재사용하지 않는 것이 원칙입니다.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-aibeop-subtle">취소 사유</span>
              <select
                value={selectedReason}
                onChange={(event) => setSelectedReason(event.target.value)}
                disabled={share.status !== "ACTIVE"}
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
              >
                {REVOKE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </label>

            {selectedReason === "기타" ? (
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-aibeop-subtle">기타 사유</span>
                <textarea
                  value={customReason}
                  onChange={(event) => setCustomReason(event.target.value)}
                  rows={3}
                  disabled={share.status !== "ACTIVE"}
                  className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
                />
              </label>
            ) : null}

            <button
              type="button"
              onClick={handleRevoke}
              disabled={share.status !== "ACTIVE" || isRevoking}
              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRevoking ? "공유 취소 중..." : "공유 취소"}
            </button>
          </div>
        </section>

        {message ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-semibold text-aibeop-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-aibeop-text">{value}</p>
    </div>
  );
}

function ScopeItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3 text-sm">
      <span className="font-medium text-aibeop-subtle">{label}</span>
      <span
        className={
          enabled
            ? "rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
            : "rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-aibeop-muted"
        }
      >
        {enabled ? "허용" : "비허용"}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs font-semibold text-aibeop-subtle">{label}</p>
      <p className="mt-1 text-lg font-bold text-aibeop-text">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : status === "REVOKED"
        ? "bg-red-100 text-red-700"
        : "bg-slate-100 text-aibeop-subtle";

  return (
    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {status}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const className =
    action === "VIEW"
      ? "bg-blue-100 text-blue-700"
      : action === "DOWNLOAD"
        ? "bg-green-100 text-green-700"
        : action === "DENIED"
          ? "bg-red-100 text-red-700"
          : "bg-slate-100 text-aibeop-subtle";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${className}`}>
      {action}
    </span>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}