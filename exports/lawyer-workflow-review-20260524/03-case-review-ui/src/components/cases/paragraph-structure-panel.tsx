"use client";

import { useEffect, useMemo, useState } from "react";
import { ParagraphHistoryModal } from "@/components/cases/paragraph-history-modal";
import type { UiFourPanelRole } from "@/lib/role-map";
import { requireOkData } from "@/lib/client/api-error";

type Paragraph = {
  id: string;
  sectionKey: string;
  paragraphKey: string;
  title: string;
  displayOrder: number;
  content: string;
  status: string;
  generationMode: string;
  aiPromptKey: string | null;
  lockOnApproval: boolean;
  supportsRegeneration: boolean;
  supportsRestore: boolean;
  lockedAt: string | null;
  updatedAt: string;
};

type Props = {
  document: {
    id: string;
    title: string;
    status: string;
    paragraphs: Paragraph[];
  };
  currentRole: UiFourPanelRole;
  onRefresh: () => Promise<void> | void;
};

export function ParagraphStructurePanel({ document, currentRole, onRefresh }: Props) {
  const documentReadOnly =
    document.status === "LOCKED" || document.status === "ARCHIVED";

  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(
    document.paragraphs[0]?.id ?? null,
  );
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const selectedParagraph = useMemo(
    () =>
      document.paragraphs.find((p) => p.id === selectedParagraphId) ??
      document.paragraphs[0] ??
      null,
    [document.paragraphs, selectedParagraphId],
  );

  /** 문서 전환·잠금·보관 직후 재작성 입력·이력 모달이 이전 문서/편집 흐름을 보이지 않게 함 */
  useEffect(() => {
    setInstruction("");
    setHistoryOpen(false);
  }, [document.id, documentReadOnly]);

  async function regenerateParagraph() {
    if (documentReadOnly || !selectedParagraph) return;

    try {
      setBusy(true);
      const res = await fetch(
        `/api/legal-documents/${document.id}/paragraphs/${selectedParagraph.id}/regenerate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instruction,
            reason: instruction || null,
          }),
        },
      );

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "문단 재생성에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "문단 재생성에 실패했습니다.",
        );
        return;
      }

      setInstruction("");
      await onRefresh();
      alert("문단이 재생성되었습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function lockParagraph() {
    if (documentReadOnly || !selectedParagraph) return;

    try {
      setBusy(true);
      const res = await fetch(
        `/api/legal-documents/${document.id}/paragraphs/${selectedParagraph.id}/lock`,
        {
          method: "POST",
        },
      );

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "문단 잠금에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "문단 잠금에 실패했습니다.",
        );
        return;
      }

      await onRefresh();
      alert("문단이 잠금되었습니다.");
    } finally {
      setBusy(false);
    }
  }

  const canManage =
    !documentReadOnly && ["ADMIN", "LAWYER", "STAFF"].includes(currentRole);
  const canLock =
    !documentReadOnly && ["ADMIN", "LAWYER"].includes(currentRole);
  const paragraphLocked = !!selectedParagraph?.lockedAt;

  return (
    <>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold">
            문단 구조 패널{documentReadOnly ? " (읽기 전용)" : ""}
          </h3>
          <p className="mt-1 text-sm text-aibeop-subtle">
            {documentReadOnly
              ? "문단을 선택해 내용과 이력을 확인합니다. 재생성·잠금·복원은 사용할 수 없습니다."
              : "문단별 재생성, 이력 확인, 잠금 작업을 수행합니다."}
          </p>
        </div>

        <div className="space-y-2">
          {document.paragraphs.map((paragraph) => {
            const active = paragraph.id === selectedParagraph?.id;
            return (
              <button
                key={paragraph.id}
                type="button"
                onClick={() => setSelectedParagraphId(paragraph.id)}
                className={`w-full rounded-xl border p-3 text-left ${
                  active ? "border-black bg-gray-50" : "border-gray-200"
                }`}
              >
                <div className="text-sm font-semibold">{paragraph.title}</div>
                <div className="mt-1 text-xs text-aibeop-subtle">
                  {paragraph.sectionKey} / {paragraph.paragraphKey} / {paragraph.status}
                </div>
              </button>
            );
          })}
        </div>

        {selectedParagraph && (
          <div className="mt-5 space-y-4 border-t pt-4">
            <div>
              <div className="text-sm font-semibold">{selectedParagraph.title}</div>
              <div className="mt-1 text-xs text-aibeop-subtle">
                generationMode: {selectedParagraph.generationMode}
              </div>
            </div>

            {documentReadOnly ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-aibeop-muted">
                문서가 잠금 또는 보관된 상태입니다. 재작성 지시 입력·재생성·문단 잠금은 사용할 수 없으며,
                이력은 조회만 가능합니다.
              </p>
            ) : (
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={5}
                placeholder="문단 재작성 지시를 입력하세요."
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            )}

            <div className="flex flex-wrap gap-2">
              {canManage ? (
                <button
                  type="button"
                  disabled={busy || !selectedParagraph.supportsRegeneration}
                  onClick={regenerateParagraph}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  문단 재생성
                </button>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (busy) return;
                  setHistoryOpen(true);
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {documentReadOnly ? "이력 조회" : "이력/복원 보기"}
              </button>

              {canLock ? (
                <button
                  type="button"
                  disabled={busy || paragraphLocked}
                  onClick={lockParagraph}
                  className="rounded-xl border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  문단 잠금
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {historyOpen && selectedParagraph ? (
        <ParagraphHistoryModal
          open
          onClose={() => setHistoryOpen(false)}
          legalDocumentId={document.id}
          paragraph={selectedParagraph}
          readOnly={documentReadOnly}
          onRestored={async () => {
            setHistoryOpen(false);
            await onRefresh();
          }}
        />
      ) : null}
    </>
  );
}
