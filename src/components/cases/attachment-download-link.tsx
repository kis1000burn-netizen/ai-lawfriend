"use client";

import { useState, type ReactNode } from "react";
import { readJsonApiErrorMessage } from "@/lib/client/api-error";

type Props = {
  caseId: string;
  attachmentId: string;
  fileName: string;
  className?: string;
  children: ReactNode;
};

export default function AttachmentDownloadLink({
  caseId,
  attachmentId,
  fileName,
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/attachments/${attachmentId}/download`,
      );

      if (!res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        const fallback = "다운로드에 실패했습니다.";
        let msg = fallback;
        if (ct.includes("application/json")) {
          const raw = await res.json().catch(() => null);
          msg = readJsonApiErrorMessage(raw, fallback);
        }
        alert(msg);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ??
        "inline p-0 text-left font-medium text-aibeop-text underline decoration-slate-900/30 disabled:opacity-50"
      }
    >
      {loading ? "다운로드 중…" : children}
    </button>
  );
}
