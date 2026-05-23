"use client";

import { useEffect, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

type Props = {
  open: boolean;
  onClose: () => void;
  legalDocumentId: string;
  paragraph: {
    id: string;
    title: string;
    content: string;
  };
  /** 문서 잠금·보관 시 복원 버튼 숨김 */
  readOnly?: boolean;
  onRestored: () => Promise<void> | void;
};

type HistoryItem = {
  id: string;
  versionNo: number;
  action: string;
  beforeContent: string | null;
  afterContent: string | null;
  actorUserId: string | null;
  reason: string | null;
  createdAt: string;
};

export function ParagraphHistoryModal({
  open,
  onClose,
  legalDocumentId,
  paragraph,
  readOnly = false,
  onRestored,
}: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/legal-documents/${legalDocumentId}/paragraphs/${paragraph.id}/histories`,
          { cache: "no-store" },
        );
        const raw = await res.json().catch(() => null);
        if (cancelled) return;
        let data: HistoryItem[];
        try {
          data = requireOkData<HistoryItem[]>(res, raw, "이력을 불러오지 못했습니다.");
        } catch (e) {
          setItems([]);
          setSelectedHistoryId(null);
          setLoadError(
            e instanceof Error ? e.message : "이력을 불러오지 못했습니다.",
          );
          return;
        }
        if (!Array.isArray(data)) {
          setItems([]);
          setSelectedHistoryId(null);
          setLoadError("응답 형식이 올바르지 않습니다.");
          return;
        }
        setItems(data);
        setSelectedHistoryId(data[0]?.id ?? null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, legalDocumentId, paragraph.id]);

  if (!open) return null;

  const selected = items.find((item) => item.id === selectedHistoryId) ?? null;

  async function restore() {
    if (!open || readOnly || !selected) return;

    const res = await fetch(
      `/api/legal-documents/${legalDocumentId}/paragraphs/${paragraph.id}/restore`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          historyId: selected.id,
          reason: `version:${selected.versionNo} 복원`,
        }),
      },
    );

    const raw = await res.json().catch(() => null);
    try {
      requireOkData(res, raw, "문단 복원에 실패했습니다.");
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "문단 복원에 실패했습니다.",
      );
      return;
    }

    await onRestored();
    alert("문단이 복원되었습니다.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="grid h-[80vh] w-full max-w-6xl grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-xl lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b p-3 text-sm font-semibold">문단 이력</div>
          <div className="max-h-[65vh] overflow-auto p-2">
            {loading ? (
              <div className="p-3 text-sm text-aibeop-subtle">불러오는 중...</div>
            ) : loadError ? (
              <div className="p-3 text-sm text-red-600">{loadError}</div>
            ) : items.length === 0 ? (
              <div className="p-3 text-sm text-aibeop-subtle">이력이 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedHistoryId(item.id)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      selectedHistoryId === item.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      v{item.versionNo} · {item.action}
                    </div>
                    <div className="mt-1 text-xs text-aibeop-subtle">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b p-3">
            <div>
              <div className="text-sm font-semibold">{paragraph.title}</div>
              <div className="text-xs text-aibeop-subtle">
                {readOnly ? "이력 diff (읽기 전용)" : "이력 diff / 복원"}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm">
                닫기
              </button>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={restore}
                  disabled={!selected}
                  className="rounded-lg bg-black px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  선택 이력 복원
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid h-[65vh] grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold">Before</div>
              <pre className="min-h-[300px] whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm">
                {selected?.beforeContent || "-"}
              </pre>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">After</div>
              <pre className="min-h-[300px] whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm">
                {selected?.afterContent || "-"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
