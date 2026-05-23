"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";

type VersionItem = {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  content: string;
  changeSummary: string;
  createdAt: string | null;
  createdById: string | null;
  isLocked?: boolean;
  lockReason?: string;
  lockedAt?: string | null;
};

type DiffLine = {
  lineNumber: number;
  type: "UNCHANGED" | "ADDED" | "REMOVED" | "MODIFIED";
  before: string;
  after: string;
};

type DiffPayload = {
  currentDocument: {
    id: string;
    title: string;
    content: string;
  };
  version: VersionItem;
  titleChanged: boolean;
  contentDiff: DiffLine[];
  summary: {
    totalLines: number;
    changedLines: number;
  };
};

type Props = {
  documentId: string;
  /** `LOCKED`·`ARCHIVED`이면 스냅샷 생성·버전 복원 UI 비활성 */
  documentStatus?: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DocumentVersionPanel({
  documentId,
  documentStatus,
}: Props) {
  const readOnly =
    documentStatus === "LOCKED" || documentStatus === "ARCHIVED";

  const router = useRouter();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffPayload | null>(null);
  const [restoreComment, setRestoreComment] = useState("선택 버전으로 복원");
  const [loading, setLoading] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/versions`);
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ versions?: VersionItem[] }>(
        res,
        raw,
        "버전 목록을 불러오지 못했습니다.",
      );
      const items = data.versions ?? [];
      setVersions(items);

      setSelectedVersionId((prev) => {
        if (prev && items.some((v) => v.id === prev)) return prev;
        return items.length > 0 ? items[0].id : null;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "버전 목록 조회 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const loadDiff = useCallback(
    async (versionId: string) => {
      setError(null);

      try {
        const res = await fetch(
          `/api/documents/${documentId}/versions/${versionId}/diff`,
        );
        const raw = await res.json().catch(() => null);
        const data = requireOkData<{ diff?: DiffPayload }>(
          res,
          raw,
          "버전 비교 정보를 불러오지 못했습니다.",
        );
        setDiff(data.diff ?? null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "버전 비교 중 오류가 발생했습니다.",
        );
      }
    },
    [documentId],
  );

  useEffect(() => {
    void loadVersions();
  }, [loadVersions]);

  useEffect(() => {
    if (selectedVersionId) {
      void loadDiff(selectedVersionId);
    }
  }, [selectedVersionId, loadDiff]);

  /** 잠금·보관 전환 직전 스냅샷/복원 성공 메시지가 남지 않도록 정리 */
  useEffect(() => {
    if (readOnly) {
      setMessage(null);
      setError(null);
    }
  }, [readOnly]);

  async function createSnapshot() {
    if (readOnly) return;
    setSnapshotLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/versions/snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          changeSummary: "수동 버전 생성",
        }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ message?: string }>(res, raw, "버전 생성에 실패했습니다.");
      setMessage(data.message ?? "문서 버전이 생성되었습니다.");
      await loadVersions();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "버전 생성 중 오류가 발생했습니다.");
    } finally {
      setSnapshotLoading(false);
    }
  }

  async function restoreVersion() {
    if (readOnly || !selectedVersionId) return;

    setRestoreLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/documents/${documentId}/versions/${selectedVersionId}/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            changeSummary: restoreComment,
          }),
        },
      );

      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ message?: string }>(res, raw, "버전 복원에 실패했습니다.");
      setMessage(data.message ?? "문서를 선택 버전으로 복원했습니다.");
      await loadVersions();
      await loadDiff(selectedVersionId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "버전 복원 중 오류가 발생했습니다.");
    } finally {
      setRestoreLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-aibeop-text">
            문서 버전 관리{readOnly ? " (읽기 전용)" : ""}
          </h2>
          <p className="mt-1 text-sm text-aibeop-muted">
            {readOnly
              ? "버전 목록과 비교는 조회만 가능합니다. 잠금·보관 문서는 새 스냅샷이나 복원을 수행할 수 없습니다."
              : "저장 시점 스냅샷과 수동 버전 생성을 통해 문서 이력을 관리합니다."}
          </p>
        </div>

        {!readOnly ? (
          <button
            type="button"
            onClick={createSnapshot}
            disabled={snapshotLoading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {snapshotLoading ? "생성 중..." : "현재 상태 버전 생성"}
          </button>
        ) : null}
      </div>

      {message ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 text-sm font-semibold text-aibeop-text">버전 목록</div>

          {loading ? <div className="text-sm text-aibeop-subtle">불러오는 중...</div> : null}

          {!loading && versions.length === 0 ? (
            <div className="text-sm text-aibeop-subtle">저장된 버전이 없습니다.</div>
          ) : null}

          <div className="space-y-2">
            {versions.map((version) => {
              const selected = selectedVersionId === version.id;

              return (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => setSelectedVersionId(version.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-aibeop-text">
                      v{version.versionNumber}
                    </div>
                    {version.isLocked ? (
                      <span className="rounded-full border border-slate-800 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-aibeop-subtle">
                        승인 잠금
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 line-clamp-1 text-sm text-aibeop-subtle">
                    {version.title}
                  </div>
                  <div className="mt-1 text-xs text-aibeop-subtle">
                    {formatDateTime(
                      version.createdAt != null
                        ? typeof version.createdAt === "string"
                          ? version.createdAt
                          : new Date(version.createdAt).toISOString()
                        : null,
                    )}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-aibeop-subtle">
                    {version.changeSummary || "요약 없음"}
                  </div>
                  {version.isLocked ? (
                    <div className="mt-2 rounded-lg bg-slate-100 px-2 py-2 text-[11px] text-aibeop-subtle">
                      잠금 사유: {version.lockReason || "승인 기준 버전"}
                      <br />
                      이 버전이 승인본 PDF/출력본 생성의 기준점으로 사용됩니다.
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-aibeop-text">선택 버전 비교</div>
              {diff ? (
                <div className="mt-1 text-xs text-aibeop-subtle">
                  총 {diff.summary.totalLines}줄 / 변경 {diff.summary.changedLines}줄
                </div>
              ) : null}
            </div>

            {readOnly ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-aibeop-muted">
                잠금·보관 문서는 이 화면에서 복원할 수 없습니다.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <input
                  value={restoreComment}
                  onChange={(e) => setRestoreComment(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="복원 사유"
                />
                <button
                  type="button"
                  onClick={restoreVersion}
                  disabled={!selectedVersionId || restoreLoading}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {restoreLoading ? "복원 중..." : "이 버전으로 복원"}
                </button>
              </div>
            )}
          </div>

          {!diff ? (
            <div className="text-sm text-aibeop-subtle">
              버전을 선택하면 비교 내용이 표시됩니다.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <div className="font-medium text-aibeop-text">제목 비교</div>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs text-aibeop-subtle">선택 버전</div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      {diff.version.title}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-aibeop-subtle">현재 문서</div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      {diff.currentDocument.title}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-aibeop-subtle">
                  제목 변경 여부: {diff.titleChanged ? "변경됨" : "동일"}
                </div>
              </div>

              <div className="space-y-2">
                {diff.contentDiff.map((line) => {
                  const tone =
                    line.type === "UNCHANGED"
                      ? "border-slate-200 bg-white"
                      : line.type === "ADDED"
                        ? "border-emerald-200 bg-emerald-50"
                        : line.type === "REMOVED"
                          ? "border-rose-200 bg-rose-50"
                          : "border-amber-200 bg-amber-50";

                  return (
                    <div
                      key={`${line.lineNumber}-${line.type}`}
                      className={`rounded-xl border p-3 ${tone}`}
                    >
                      <div className="mb-2 text-xs font-medium text-aibeop-subtle">
                        {line.lineNumber}행 / {line.type}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="mb-1 text-xs text-aibeop-subtle">선택 버전</div>
                          <pre className="whitespace-pre-wrap break-words text-sm text-aibeop-subtle">
                            {line.before || " "}
                          </pre>
                        </div>
                        <div>
                          <div className="mb-1 text-xs text-aibeop-subtle">현재 문서</div>
                          <pre className="whitespace-pre-wrap break-words text-sm text-aibeop-subtle">
                            {line.after || " "}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
