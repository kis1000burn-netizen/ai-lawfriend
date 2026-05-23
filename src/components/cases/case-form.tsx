"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";

type CaseFormValues = {
  title: string;
  category: string;
  subcategory?: string;
  incidentDate?: string;
  opponentType?: string;
  briefSummary?: string;
  /** edit 전용 — 스키마 필드 */
  courtName?: string;
};

type Props = {
  mode?: "create" | "edit";
  caseId?: string;
  initialValues?: Partial<CaseFormValues>;
};

function buildDescription(subcategory?: string, briefSummary?: string) {
  const parts: string[] = [];
  const sub = subcategory?.trim();
  const brief = briefSummary?.trim();
  if (sub) parts.push(`세부 유형: ${sub}`);
  if (brief) parts.push(brief);
  return parts.length > 0 ? parts.join("\n\n") : "";
}

export default function CaseForm({
  mode = "create",
  caseId,
  initialValues,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<CaseFormValues>({
    title: initialValues?.title ?? "",
    category: initialValues?.category ?? "",
    subcategory: initialValues?.subcategory ?? "",
    incidentDate: initialValues?.incidentDate ?? "",
    opponentType: initialValues?.opponentType ?? "",
    briefSummary: initialValues?.briefSummary ?? "",
    courtName: initialValues?.courtName ?? "",
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function update<K extends keyof CaseFormValues>(key: K, value: CaseFormValues[K]) {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function fieldMessage(name: string) {
    return fieldErrors[name]?.[0] ?? "";
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const endpoint =
          mode === "edit" && caseId ? `/api/cases/${caseId}` : `/api/cases`;
        const method = mode === "edit" ? "PATCH" : "POST";

        const description = buildDescription(values.subcategory, values.briefSummary);
        const incidentDate =
          values.incidentDate && values.incidentDate.length > 0
            ? new Date(values.incidentDate).toISOString()
            : "";

        const baseBody: Record<string, unknown> = {
          title: values.title,
          category: values.category,
          description: description || undefined,
          opponentName: values.opponentType?.trim() || undefined,
          courtName: values.courtName?.trim() || undefined,
          incidentDate: incidentDate || undefined,
        };

        const res = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(baseBody),
        });

        const raw = await res.json().catch(() => null);
        let data: { id?: string };
        try {
          data = requireOkData<{ id?: string }>(
            res,
            raw,
            "사건 저장 중 오류가 발생했습니다.",
          );
        } catch (e) {
          if (raw && typeof raw === "object") {
            const j = raw as {
              details?: { fieldErrors?: Record<string, string[]> };
              error?: { details?: { fieldErrors?: Record<string, string[]> } };
            };
            setFieldErrors(
              j.details?.fieldErrors ?? j.error?.details?.fieldErrors ?? {},
            );
          } else {
            setFieldErrors({});
          }
          setError(
            e instanceof Error
              ? e.message
              : "사건 저장 중 오류가 발생했습니다.",
          );
          return;
        }

        const nextCaseId = data.id ?? caseId;

        if (!nextCaseId) {
          throw new Error("생성된 사건 ID를 찾을 수 없습니다.");
        }

        if (mode === "create") {
          router.push(`/cases/${nextCaseId}/interview`);
          router.refresh();
          return;
        }

        router.push(`/cases/${nextCaseId}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "사건 저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-aibeop-subtle">사건 제목</label>
          <input
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="예: 대여금 반환 문제"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            required
          />
          {fieldMessage("title") ? (
            <p className="text-sm text-red-600">{fieldMessage("title")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-aibeop-subtle">사건 유형</label>
          <select
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            required
          >
            <option value="">선택해 주세요</option>
            <option value="형사">형사</option>
            <option value="민사">민사</option>
            <option value="가사">가사</option>
          </select>
          {fieldMessage("category") ? (
            <p className="text-sm text-red-600">{fieldMessage("category")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-aibeop-subtle">세부 유형</label>
          <input
            value={values.subcategory ?? ""}
            onChange={(e) => update("subcategory", e.target.value)}
            placeholder="예: 사기, 대여금, 이혼"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-aibeop-subtle">사건 발생일</label>
          <input
            type="date"
            value={values.incidentDate ?? ""}
            onChange={(e) => update("incidentDate", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          {fieldMessage("incidentDate") ? (
            <p className="text-sm text-red-600">{fieldMessage("incidentDate")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-aibeop-subtle">상대방 관계</label>
          <input
            value={values.opponentType ?? ""}
            onChange={(e) => update("opponentType", e.target.value)}
            placeholder="예: 지인, 배우자, 거래처"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          {fieldMessage("opponentName") ? (
            <p className="text-sm text-red-600">{fieldMessage("opponentName")}</p>
          ) : null}
        </div>

        {mode === "edit" ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-aibeop-subtle">법원명</label>
              <input
                value={values.courtName ?? ""}
                onChange={(e) => update("courtName", e.target.value)}
                placeholder="예: 서울중앙지방법원"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
            <p className="text-xs text-aibeop-subtle md:col-span-2">
              사건 상태는 상세 화면의 액션(인터뷰 완료·상태 변경)으로만 바꿀 수 있습니다.
            </p>
          </>
        ) : null}

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-aibeop-subtle">간단 요약</label>
          <textarea
            value={values.briefSummary ?? ""}
            onChange={(e) => update("briefSummary", e.target.value)}
            rows={5}
            placeholder="현재 상황을 간단히 적어주세요."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          {fieldMessage("description") ? (
            <p className="text-sm text-red-600">{fieldMessage("description")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-slate-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="aibeop-btn-primary disabled:opacity-60"
        >
          {isPending
            ? mode === "create"
              ? "사건 생성 중..."
              : "사건 저장 중..."
            : mode === "create"
              ? "사건 생성 후 인터뷰 시작"
              : "사건 저장"}
        </button>
      </div>
    </form>
  );
}
