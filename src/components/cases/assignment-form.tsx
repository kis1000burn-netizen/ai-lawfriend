"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";

type LawyerOption = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  caseId: string;
  lawyers: LawyerOption[];
};

export default function AssignmentForm({ caseId, lawyers }: Props) {
  const router = useRouter();
  const [assigneeUserId, setAssigneeUserId] = useState(lawyers[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (lawyers.length === 0) {
    return (
      <p className="text-sm text-aibeop-subtle">
        배정 가능한 변호사 계정이 없습니다.
      </p>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assigneeUserId) {
      alert("배정할 변호사를 선택해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeUserId, note }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "배정 생성에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "배정 생성에 실패했습니다.",
        );
        return;
      }

      setNote("");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select
        value={assigneeUserId}
        onChange={(e) => setAssigneeUserId(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
      >
        {lawyers.map((lawyer) => (
          <option key={lawyer.id} value={lawyer.id}>
            {lawyer.name ?? "이름없음"} ({lawyer.email})
          </option>
        ))}
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full rounded-xl border px-4 py-3"
        placeholder="배정 메모"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "배정 중..." : "변호사 배정"}
      </button>
    </form>
  );
}
