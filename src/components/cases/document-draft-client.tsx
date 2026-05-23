"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  requireOkData,
  readJsonApiErrorMessage,
  readVoiceDocumentFinalizeBlockedFromJson,
} from "@/lib/client/api-error";
import { VoiceDocumentFinalizeGatePanel } from "@/components/cases/voice-document-finalize-gate-panel";
import type { VoiceDocumentFinalizeGateUiSnapshot } from "@/lib/voice/voice-document-finalize-gate-ui";
import { shouldShowVoiceDocumentFinalizeGatePanel } from "@/lib/voice/voice-document-finalize-gate-ui";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

type PreviewParagraph = {
  id: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  order: number;
  sourceQuestionKey: string;
  included: boolean;
  locked?: boolean;
  aiHint?: string | null;
};

type PreviewResult = {
  title: string;
  templateType: DocumentTemplateType;
  paragraphs: PreviewParagraph[];
  body: string;
};

type HistoryItem = {
  id: string;
  paragraphId: string;
  beforeContent: string;
  afterContent: string;
  instruction?: string | null;
  aiModel?: string | null;
  createdAt: string;
};

type Props = {
  caseId: string;
  voiceDocumentFinalizeGateSnapshot?: VoiceDocumentFinalizeGateUiSnapshot | null;
};

function sortParagraphs(paragraphs: PreviewParagraph[]) {
  return [...paragraphs].sort((a, b) => a.order - b.order);
}

function formatHistoryDate(value: string | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("ko-KR");
}

export default function DocumentDraftClient({
  caseId,
  voiceDocumentFinalizeGateSnapshot = null,
}: Props) {
  const router = useRouter();
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const [loadingRegenerate, setLoadingRegenerate] = useState(false);
  const [loadingHistoryFor, setLoadingHistoryFor] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<DocumentTemplateType>("STATEMENT");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedParagraphIds, setSelectedParagraphIds] = useState<string[]>([]);
  const [instructionByParagraphId, setInstructionByParagraphId] = useState<Record<string, string>>(
    {},
  );
  const [historyByParagraphId, setHistoryByParagraphId] = useState<Record<string, HistoryItem[]>>(
    {},
  );

  const sortedParagraphs = useMemo(
    () => sortParagraphs(preview?.paragraphs ?? []),
    [preview],
  );

  const showVoiceDocumentFinalizeGatePanel =
    voiceDocumentFinalizeGateSnapshot != null &&
    shouldShowVoiceDocumentFinalizeGatePanel(voiceDocumentFinalizeGateSnapshot);
  const voiceFinalizeGateBlocked = voiceDocumentFinalizeGateSnapshot?.allowed === false;

  async function handlePreview() {
    setLoadingPreview(true);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${caseId}/documents/draft/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<PreviewResult>(res, raw, "문서 미리보기에 실패했습니다.");
      setPreview(data);
      setDraftTitle(data.title ?? "");
      setSelectedParagraphIds([]);
      setInstructionByParagraphId({});
      setHistoryByParagraphId({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문서 미리보기 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingPreview(false);
    }
  }

  function updateParagraph(
    paragraphId: string,
    updater: (paragraph: PreviewParagraph) => PreviewParagraph,
  ) {
    setPreview((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        paragraphs: prev.paragraphs.map((paragraph) =>
          paragraph.id === paragraphId ? updater(paragraph) : paragraph,
        ),
      };
    });
  }

  function toggleSelectedParagraph(paragraphId: string, checked: boolean) {
    setSelectedParagraphIds((prev) => {
      if (checked) return prev.includes(paragraphId) ? prev : [...prev, paragraphId];
      return prev.filter((id) => id !== paragraphId);
    });
  }

  function moveParagraph(paragraphId: string, direction: "up" | "down") {
    setPreview((prev) => {
      if (!prev) return prev;

      const sorted = sortParagraphs(prev.paragraphs);
      const index = sorted.findIndex((paragraph) => paragraph.id === paragraphId);
      if (index < 0) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      const next = [...sorted];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      const resequenced = next.map((paragraph, idx) => ({
        ...paragraph,
        order: idx + 1,
      }));

      return {
        ...prev,
        paragraphs: resequenced,
      };
    });
  }

  async function handleRegenerate(force = false) {
    if (!preview) return;
    if (selectedParagraphIds.length === 0) {
      setError("재생성할 문단을 먼저 선택해 주세요.");
      return;
    }

    setLoadingRegenerate(true);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${caseId}/documents/draft/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: preview.templateType,
          title: draftTitle,
          paragraphs: preview.paragraphs,
          targetParagraphIds: selectedParagraphIds,
          instructionByParagraphId,
          force,
        }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<{
        title: string;
        templateType: DocumentTemplateType;
        paragraphs: PreviewParagraph[];
        body: string;
        skippedIds?: string[];
      }>(res, raw, "문단 재생성에 실패했습니다.");
      setPreview({
        title: data.title,
        templateType: data.templateType,
        paragraphs: data.paragraphs,
        body: data.body,
      });

      if (Array.isArray(data.skippedIds) && data.skippedIds.length > 0 && !force) {
        setError(`잠금된 문단 ${data.skippedIds.length}개는 건너뛰었습니다.`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 재생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingRegenerate(false);
    }
  }

  async function loadHistory(paragraphId: string) {
    setLoadingHistoryFor(paragraphId);

    try {
      const res = await fetch(
        `/api/cases/${caseId}/documents/draft/history?paragraphId=${encodeURIComponent(paragraphId)}`,
      );
      const raw = await res.json().catch(() => null);
      const page = requireOkData<{ items?: unknown[] }>(res, raw, "이력 조회에 실패했습니다.");
      const rawItems = Array.isArray(page.items) ? page.items : [];
      const items: HistoryItem[] = rawItems.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          id: String(row.id),
          paragraphId: String(row.paragraphId),
          beforeContent: String(row.beforeContent ?? ""),
          afterContent: String(row.afterContent ?? ""),
          instruction: row.instruction != null ? String(row.instruction) : null,
          aiModel: row.aiModel != null ? String(row.aiModel) : null,
          createdAt:
            row.createdAt instanceof Date
              ? row.createdAt.toISOString()
              : String(row.createdAt ?? ""),
        } satisfies HistoryItem;
      });

      setHistoryByParagraphId((prev) => ({
        ...prev,
        [paragraphId]: items,
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "이력 조회 중 오류가 발생했습니다.");
    } finally {
      setLoadingHistoryFor(null);
    }
  }

  async function handleFinalize() {
    if (!preview) return;

    setLoadingFinalize(true);
    setError(null);

    try {
      const res = await fetch(`/api/cases/${caseId}/documents/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: preview.templateType,
          title: draftTitle,
          paragraphs: preview.paragraphs,
        }),
      });

      const raw = await res.json().catch(() => null);
      if (!res.ok) {
        const blocked = readVoiceDocumentFinalizeBlockedFromJson(raw);
        throw new Error(
          blocked?.message ?? readJsonApiErrorMessage(raw, "문서 최종 생성에 실패했습니다."),
        );
      }
      const payload = requireOkData<{
        document?: { id: string };
        data?: { document?: { id: string } };
      }>(res, raw, "문서 최종 생성에 실패했습니다.");
      const documentId = payload.document?.id ?? payload.data?.document?.id;

      if (documentId) {
        router.push(`/documents/${documentId}`);
        return;
      }

      setError("문서는 생성되었지만 문서 상세 경로 이동에 실패했습니다.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문서 최종 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingFinalize(false);
    }
  }

  const includedCount =
    preview?.paragraphs.filter((paragraph) => paragraph.included).length ?? 0;

  return (
    <div className="space-y-6">
      {showVoiceDocumentFinalizeGatePanel && voiceDocumentFinalizeGateSnapshot ? (
        <VoiceDocumentFinalizeGatePanel
          caseId={caseId}
          snapshot={voiceDocumentFinalizeGateSnapshot}
          compact
        />
      ) : null}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">문서 초안 생성</h2>
        <p className="mt-2 text-sm text-aibeop-muted">
          실제 AI 재생성 엔진으로 선택 문단만 다시 쓰고, 문단별 재생성 이력을 확인할 수 있습니다.
          (OPENAI_API_KEY 미설정 시 규칙 기반 정리로 동작합니다.)
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-[240px_auto]">
          <label className="space-y-1">
            <span className="text-sm text-aibeop-muted">문서 템플릿</span>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as DocumentTemplateType)}
            >
              <option value="STATEMENT">진술서</option>
              <option value="LEGAL_OPINION">의견서</option>
              <option value="CONSULTATION_NOTE">상담기록서</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void handlePreview()}
              disabled={loadingPreview}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loadingPreview ? "미리보기 생성 중..." : "미리보기 생성"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      {preview ? (
        <>
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
              <label className="space-y-1">
                <span className="text-sm text-aibeop-muted">문서 제목</span>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                />
              </label>

              <div className="text-sm text-aibeop-subtle">포함 문단 {includedCount}개</div>

              <button
                type="button"
                onClick={() => void handleRegenerate(false)}
                disabled={loadingRegenerate || selectedParagraphIds.length === 0}
                className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
              >
                {loadingRegenerate ? "재생성 중..." : "선택 문단 재생성"}
              </button>

              <button
                type="button"
                onClick={() => void handleRegenerate(true)}
                disabled={loadingRegenerate || selectedParagraphIds.length === 0}
                className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
              >
                잠금 무시 재생성
              </button>
            </div>
          </section>

          <section className="space-y-4">
            {sortedParagraphs.map((paragraph, index) => {
              const selected = selectedParagraphIds.includes(paragraph.id);
              const historyItems = historyByParagraphId[paragraph.id] ?? [];

              return (
                <article
                  key={paragraph.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-aibeop-faint">
                        source: {paragraph.sourceQuestionKey}
                      </div>
                      <div className="text-sm text-aibeop-subtle">순서 {paragraph.order}</div>
                      {paragraph.aiHint ? (
                        <div className="mt-1 text-xs text-blue-600">
                          AI 힌트: {paragraph.aiHint}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) =>
                            toggleSelectedParagraph(paragraph.id, e.target.checked)
                          }
                        />
                        <span>재생성 선택</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={paragraph.included}
                          onChange={(e) =>
                            updateParagraph(paragraph.id, (item) => ({
                              ...item,
                              included: e.target.checked,
                            }))
                          }
                        />
                        <span>포함</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(paragraph.locked)}
                          onChange={(e) =>
                            updateParagraph(paragraph.id, (item) => ({
                              ...item,
                              locked: e.target.checked,
                            }))
                          }
                        />
                        <span>잠금</span>
                      </label>

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveParagraph(paragraph.id, "up")}
                        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                      >
                        위로
                      </button>

                      <button
                        type="button"
                        disabled={index === sortedParagraphs.length - 1}
                        onClick={() => moveParagraph(paragraph.id, "down")}
                        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                      >
                        아래로
                      </button>

                      <button
                        type="button"
                        onClick={() => void loadHistory(paragraph.id)}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                      >
                        {loadingHistoryFor === paragraph.id ? "이력 조회 중..." : "이력 보기"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm text-aibeop-muted">섹션 제목</span>
                      <input
                        className="w-full rounded-xl border px-3 py-2"
                        value={paragraph.sectionTitle ?? ""}
                        onChange={(e) =>
                          updateParagraph(paragraph.id, (item) => ({
                            ...item,
                            sectionTitle: e.target.value || null,
                          }))
                        }
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-sm text-aibeop-muted">문단 라벨</span>
                      <input
                        className="w-full rounded-xl border px-3 py-2"
                        value={paragraph.label ?? ""}
                        onChange={(e) =>
                          updateParagraph(paragraph.id, (item) => ({
                            ...item,
                            label: e.target.value || null,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <label className="mt-4 block space-y-1">
                    <span className="text-sm text-aibeop-muted">재생성 추가 지시</span>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={instructionByParagraphId[paragraph.id] ?? ""}
                      onChange={(e) =>
                        setInstructionByParagraphId((prev) => ({
                          ...prev,
                          [paragraph.id]: e.target.value,
                        }))
                      }
                      placeholder="예: 더 간결하게, 피해사실 중심으로, 날짜 표현 정리 등"
                    />
                  </label>

                  <label className="mt-4 block space-y-1">
                    <span className="text-sm text-aibeop-muted">문단 내용</span>
                    <textarea
                      className="min-h-[140px] w-full rounded-xl border px-3 py-2"
                      value={paragraph.content}
                      onChange={(e) =>
                        updateParagraph(paragraph.id, (item) => ({
                          ...item,
                          content: e.target.value,
                        }))
                      }
                    />
                  </label>

                  {historyItems.length > 0 ? (
                    <div className="mt-4 rounded-xl border bg-neutral-50 p-4">
                      <h4 className="mb-3 font-medium">재생성 이력</h4>
                      <div className="space-y-3">
                        {historyItems.map((item) => (
                          <div key={item.id} className="rounded-lg border bg-white p-3">
                            <div className="mb-2 text-xs text-aibeop-subtle">
                              {formatHistoryDate(item.createdAt)} / 모델: {item.aiModel ?? "-"}
                            </div>
                            {item.instruction ? (
                              <div className="mb-2 text-xs text-blue-700">
                                지시: {item.instruction}
                              </div>
                            ) : null}
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <div className="mb-1 text-xs font-medium text-aibeop-subtle">
                                  이전
                                </div>
                                <pre className="whitespace-pre-wrap text-xs text-aibeop-subtle">
                                  {item.beforeContent}
                                </pre>
                              </div>
                              <div>
                                <div className="mb-1 text-xs font-medium text-aibeop-subtle">
                                  이후
                                </div>
                                <pre className="whitespace-pre-wrap text-xs text-aibeop-subtle">
                                  {item.afterContent}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">최종 생성</h3>
                <p className="mt-1 text-sm text-aibeop-subtle">
                  체크된 문단만 포함해 문서를 생성합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleFinalize()}
                disabled={loadingFinalize || includedCount === 0 || voiceFinalizeGateBlocked}
                className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {loadingFinalize ? "최종 생성 중..." : "최종 생성"}
              </button>
            </div>
            {voiceFinalizeGateBlocked && voiceDocumentFinalizeGateSnapshot ? (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950">
                Voice document finalize gate에 의해 최종 생성이 차단되었습니다.{" "}
                {voiceDocumentFinalizeGateSnapshot.serverMessage}
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
