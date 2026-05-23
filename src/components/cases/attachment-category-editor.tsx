"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CASE_ATTACHMENT_CATEGORY_LABELS,
  CASE_ATTACHMENT_CATEGORY_VALUES,
} from "@/features/case-attachments/case-attachment-category";
import type { CaseAttachmentCategory } from "@prisma/client";

type Props = {
  caseId: string;
  attachmentId: string;
  initialCategory: CaseAttachmentCategory;
};

export default function AttachmentCategoryEditor({
  caseId,
  attachmentId,
  initialCategory,
}: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSave = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(
        `/api/cases/${caseId}/attachments/${attachmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        },
      );
      const body = (await res.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || body.ok !== true) {
        setErrorMessage(
          typeof body.message === "string"
            ? body.message
            : "분류 저장에 실패했습니다.",
        );
        return;
      }
      router.refresh();
    } catch {
      setErrorMessage("분류 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-[10rem] flex-1">
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-aibeop-subtle">
          분류
        </label>
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as CaseAttachmentCategory)
          }
          className="w-full rounded-lg border px-2 py-1.5 text-xs"
          disabled={loading}
        >
          {CASE_ATTACHMENT_CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {CASE_ATTACHMENT_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => void onSave()}
        disabled={loading || category === initialCategory}
        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-aibeop-subtle disabled:opacity-50"
      >
        {loading ? "저장 중…" : "분류 저장"}
      </button>
      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
