"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

type ParagraphItem = {
  id: string;
  documentId: string;
  caseId: string;
  sectionTitle?: string | null;
  label?: string | null;
  content: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  orderIndex: number;
  included: boolean;
  locked: boolean;
  aiHint?: string | null;
  sourceQuestionKey?: string | null;
};

type ReviewState = {
  reviewChecked: boolean;
  diffReviewed: boolean;
  checklistConfirmed: boolean;
};

type ReviewPayload = {
  reviewChecked?: boolean;
  diffReviewed?: boolean;
  checklistConfirmed?: boolean;
};

type Props = {
  documentId: string;
};

function sortParagraphs(paragraphs: ParagraphItem[]) {
  return [...paragraphs].sort((a, b) => a.orderIndex - b.orderIndex);
}

export default function DocumentParagraphEditorPanel({ documentId }: Props) {
  const [paragraphs, setParagraphs] = useState<ParagraphItem[]>([]);
  const [review, setReview] = useState<ReviewState>({
    reviewChecked: false,
    diffReviewed: false,
    checklistConfirmed: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/paragraphs`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{
        paragraphs?: ParagraphItem[];
        review?: ReviewPayload;
      }>(res, raw, "문단 조회에 실패했습니다.");

      setParagraphs(Array.isArray(data?.paragraphs) ? data.paragraphs : []);
      const r: ReviewPayload | undefined = data?.review;
      setReview({
        reviewChecked: Boolean(r?.reviewChecked),
        diffReviewed: Boolean(r?.diffReviewed),
        checklistConfirmed: Boolean(r?.checklistConfirmed),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 패널 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sortedParagraphs = useMemo(() => sortParagraphs(paragraphs), [paragraphs]);

  function updateParagraph(paragraphId: string, updater: (item: ParagraphItem) => ParagraphItem) {
    setParagraphs((prev) =>
      prev.map((paragraph) => (paragraph.id === paragraphId ? updater(paragraph) : paragraph)),
    );
  }

  function moveParagraph(paragraphId: string, direction: "up" | "down") {
    setParagraphs((prev) => {
      const sorted = sortParagraphs(prev);
      const index = sorted.findIndex((item) => item.id === paragraphId);
      if (index < 0) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      const next = [...sorted];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next.map((item, idx) => ({
        ...item,
        orderIndex: idx + 1,
      }));
    });
  }

  async function saveParagraphs() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/paragraphs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraphs: sortedParagraphs,
        }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ paragraphs?: ParagraphItem[] }>(
        res,
        raw,
        "문단 저장에 실패했습니다.",
      );

      setParagraphs(Array.isArray(data?.paragraphs) ? data.paragraphs : []);
      setReview({
        reviewChecked: false,
        diffReviewed: false,
        checklistConfirmed: false,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "문단 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function saveReview(nextReview: ReviewState) {
    setSavingReview(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/approval-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextReview),
      });

      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{
        reviewChecked?: boolean;
        diffReviewed?: boolean;
        checklistConfirmed?: boolean;
      }>(res, raw, "검토 체크 저장에 실패했습니다.");

      setReview({
        reviewChecked: Boolean(payload.reviewChecked),
        diffReviewed: Boolean(payload.diffReviewed),
        checklistConfirmed: Boolean(payload.checklistConfirmed),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "검토 체크 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-aibeop-muted shadow-sm">
        문단 편집 패널을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">문단 단위 영속화 편집</h3>
          <button
            type="button"
            onClick={saveParagraphs}
            disabled={saving}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "문단 저장"}
          </button>
        </div>

        <div className="space-y-4">
          {sortedParagraphs.map((paragraph, index) => (
            <article key={paragraph.id} className="rounded-xl border p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-aibeop-subtle">순서 {paragraph.orderIndex}</div>
                <div className="flex gap-2">
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
                        sectionTitle: e.target.value,
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
                        label: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

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

              <div className="mt-4 flex flex-wrap gap-4">
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
                    checked={paragraph.locked}
                    onChange={(e) =>
                      updateParagraph(paragraph.id, (item) => ({
                        ...item,
                        locked: e.target.checked,
                      }))
                    }
                  />
                  <span>잠금</span>
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">승인 전 강제 검토 플로우</h3>
          <button
            type="button"
            onClick={() => saveReview(review)}
            disabled={savingReview}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
          >
            {savingReview ? "저장 중..." : "검토 상태 저장"}
          </button>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={review.reviewChecked}
              onChange={(e) =>
                setReview((prev) => ({
                  ...prev,
                  reviewChecked: e.target.checked,
                }))
              }
            />
            <span>문단 구성과 포함 여부를 검토했습니다.</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={review.diffReviewed}
              onChange={(e) =>
                setReview((prev) => ({
                  ...prev,
                  diffReviewed: e.target.checked,
                }))
              }
            />
            <span>최근 AI 재생성 이력과 diff를 검토했습니다.</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={review.checklistConfirmed}
              onChange={(e) =>
                setReview((prev) => ({
                  ...prev,
                  checklistConfirmed: e.target.checked,
                }))
              }
            />
            <span>최종 승인 전 체크리스트를 확인했습니다.</span>
          </label>
        </div>
      </section>
    </div>
  );
}
