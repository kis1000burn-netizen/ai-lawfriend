"use client";

import { useCallback, useEffect, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

type VersionGroup = {
  versionGroupId: string;
  createdAt: Date | string;
  actorUserId: string;
  reason?: string | null;
  count: number;
};

type Props = {
  documentId: string;
};

export default function DocumentParagraphVersionPanel({ documentId }: Props) {
  const [groups, setGroups] = useState<VersionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshotting, setSnapshotting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [reason, setReason] = useState("MANUAL_SNAPSHOT");
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/paragraph-versions`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{ groups?: VersionGroup[] }>(
        res,
        raw,
        "문단 버전 목록 조회에 실패했습니다.",
      );
      setGroups(Array.isArray(payload?.groups) ? payload.groups : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 버전 목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  async function createSnapshot() {
    setSnapshotting(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/paragraph-versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
        }),
      });

      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "문단 스냅샷 생성에 실패했습니다.");

      await loadGroups();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 스냅샷 생성 중 오류가 발생했습니다.");
    } finally {
      setSnapshotting(false);
    }
  }

  async function restoreGroup(versionGroupId: string) {
    setRestoringId(versionGroupId);
    setError(null);

    try {
      const res = await fetch(
        `/api/documents/${documentId}/paragraph-versions/${versionGroupId}/restore`,
        {
          method: "POST",
        },
      );

      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "문단 버전 복원에 실패했습니다.");

      await loadGroups();
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 버전 복원 중 오류가 발생했습니다.");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold">문단 버전 스냅샷</h3>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="rounded-xl border px-3 py-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="예: 승인 전 수동 스냅샷"
        />
        <button
          type="button"
          onClick={createSnapshot}
          disabled={snapshotting}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {snapshotting ? "스냅샷 생성 중..." : "스냅샷 생성"}
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-aibeop-muted">버전 목록을 불러오는 중입니다...</div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.versionGroupId} className="rounded-xl border p-4">
              <div className="mb-2 text-xs text-aibeop-subtle">
                {String(group.createdAt)} / actor: {group.actorUserId}
              </div>
              <div className="mb-2 text-sm font-medium">{group.reason ?? "SNAPSHOT"}</div>
              <div className="mb-3 text-sm text-aibeop-muted">문단 수 {group.count}개</div>
              <button
                type="button"
                onClick={() => restoreGroup(group.versionGroupId)}
                disabled={restoringId === group.versionGroupId}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {restoringId === group.versionGroupId ? "복원 중..." : "이 버전으로 복원"}
              </button>
            </div>
          ))}

          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-aibeop-subtle">
              아직 생성된 문단 스냅샷이 없습니다.
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
