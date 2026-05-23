"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CASE_ATTACHMENT_CATEGORY_LABELS,
  CASE_ATTACHMENT_CATEGORY_VALUES,
} from "@/features/case-attachments/case-attachment-category";

type Props = {
  caseId: string;
};

export default function AttachmentUploadForm({ caseId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [category, setCategory] =
    useState<(typeof CASE_ATTACHMENT_CATEGORY_VALUES)[number]>("OTHER");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage("파일을 선택해 주세요.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const result = await new Promise<{
        httpOk: boolean;
        json: { ok?: boolean; message?: string; error?: { message?: string } };
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", `/api/cases/${caseId}/attachments`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || "{}") as {
              ok?: boolean;
              message?: string;
              error?: { message?: string };
            };
            resolve({
              httpOk: xhr.status >= 200 && xhr.status < 300,
              json,
            });
          } catch (error) {
            reject(error);
          }
        };

        xhr.onerror = () => {
          reject(new Error("업로드 중 네트워크 오류가 발생했습니다."));
        };

        xhr.send(formData);
      });

      const body = result.json;
      if (!result.httpOk || body.ok !== true) {
        const msg =
          (typeof body.message === "string" && body.message) ||
          body.error?.message ||
          "업로드에 실패했습니다.";
        setErrorMessage(msg);
        return;
      }

      setProgress(100);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "업로드에 실패했습니다."
      );
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-aibeop-muted">
          자료 분류
        </label>
        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value as (typeof CASE_ATTACHMENT_CATEGORY_VALUES)[number],
            )
          }
          className="w-full max-w-md rounded-xl border px-4 py-2 text-sm"
          disabled={loading}
        >
          {CASE_ATTACHMENT_CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {CASE_ATTACHMENT_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          ref={inputRef}
          type="file"
          className="block w-full rounded-xl border px-4 py-3 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "업로드 중..." : "첨부파일 업로드"}
        </button>
      </div>

      {loading || progress > 0 ? (
        <div className="space-y-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-aibeop-subtle">업로드 진행률: {progress}%</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
