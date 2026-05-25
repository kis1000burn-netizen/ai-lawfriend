"use client";

import { useState } from "react";
import type { LegalReliabilityActionOperation } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";

const HANDOFF_ALLOWED_STATUSES = new Set<LegalReliabilityActionOperation["status"]>([
  "CLIENT_RESPONDED",
  "EVIDENCE_INTAKE_LINKED",
]);

export function LegalReliabilityActionOperationReviewHandoffControl({
  caseId,
  operation,
  canAct,
  onDone,
}: {
  caseId: string;
  operation: LegalReliabilityActionOperation;
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canAct || !HANDOFF_ALLOWED_STATUSES.has(operation.status)) {
    return null;
  }

  async function handleHandoff() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/cases/${caseId}/legal-reliability/action-operations/${operation.id}/handoff-lawyer-review`,
        { method: "POST" },
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "검토 큐 전달에 실패했습니다.");
      }
      await onDone();
    } catch (handoffError) {
      setError(handoffError instanceof Error ? handoffError.message : "검토 큐 전달에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        data-testid={`lcc-action-operation-handoff-${operation.id}`}
        disabled={pending}
        onClick={() => void handleHandoff()}
      >
        {pending ? "전달 중…" : "검토 큐로 보내기"}
      </button>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
