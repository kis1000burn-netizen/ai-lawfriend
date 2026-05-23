"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { buildLegalKnowledgeIntakeCreatePayload } from "@/features/gongbuho/legal-knowledge-intake-form-defaults";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; message?: string; code?: string };

async function parseApi<T>(res: Response): Promise<ApiEnvelope<T>> {
  const raw = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!raw || typeof raw !== "object" || typeof raw.ok !== "boolean") {
    return { ok: false, message: "응답 형식 오류입니다." };
  }
  return raw;
}

type Props = {
  viewerCanWrite: boolean;
};

export function LegalKnowledgeIntakeCreatePanel({ viewerCanWrite }: Readonly<Props>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [normalizedKeyword, setNormalizedKeyword] = useState("");
  const [mappedCaseType, setMappedCaseType] = useState("");
  const [mappingRationale, setMappingRationale] = useState("");
  const [demandStrength, setDemandStrength] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("MEDIUM");

  const refresh = useCallback(() => router.refresh(), [router]);

  if (!viewerCanWrite) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Intake 등록은 ADMIN 이상만 가능합니다.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    try {
      const payload = buildLegalKnowledgeIntakeCreatePayload({
        normalizedKeyword,
        mappedCaseType,
        mappingRationale: mappingRationale || undefined,
        demandStrength,
        status: "READY_FOR_RESEARCH",
      });

      const res = await fetch("/api/admin/gongbuho/legal-knowledge/intake", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await parseApi<{ intake: { id: string } }>(res);
      if (!body.ok) {
        throw new Error(body.message ?? `Intake 생성 실패 (${res.status})`);
      }
      refresh();
      if (body.data?.intake?.id) {
        router.push(
          `/admin/gongbuho/legal-knowledge/intake/${body.data.intake.id}`,
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Intake 생성 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="legal-knowledge-intake-create-form"
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Intake 등록</h2>
      <p className="text-sm text-slate-600">
        UGC·네이버 원문 없이 정규화 키워드와 caseType만 등록합니다. 생성 시{" "}
        <code className="text-xs">READY_FOR_RESEARCH</code> 로 시작합니다.
      </p>

      <label className="block text-sm">
        <span className="text-xs font-medium text-slate-600">normalizedKeyword</span>
        <input
          required
          data-testid="intake-normalized-keyword"
          value={normalizedKeyword}
          onChange={(e) => setNormalizedKeyword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="예: 전세보증금 반환"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium text-slate-600">mappedCaseType</span>
          <input
            required
            data-testid="intake-mapped-case-type"
            value={mappedCaseType}
            onChange={(e) => setMappedCaseType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="예: JEONSE"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-slate-600">demandStrength</span>
          <select
            data-testid="intake-demand-strength"
            value={demandStrength}
            onChange={(e) =>
              setDemandStrength(
                e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-xs font-medium text-slate-600">mappingRationale</span>
        <textarea
          data-testid="intake-mapping-rationale"
          value={mappingRationale}
          onChange={(e) => setMappingRationale(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          rows={2}
          placeholder="매핑 근거(UGC 인용 금지)"
        />
      </label>

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        data-testid="intake-create-submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Intake 생성 (READY_FOR_RESEARCH)
      </button>
    </form>
  );
}
