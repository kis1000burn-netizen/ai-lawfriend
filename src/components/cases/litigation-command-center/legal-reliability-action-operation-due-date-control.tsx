"use client";

import { useState } from "react";
import type { LegalReliabilityActionOperation } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
import { requireOkData } from "@/lib/client/api-error";

export function LegalReliabilityActionOperationDueDateControl({
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
  const [dueAt, setDueAt] = useState(
    operation.dueAt ? operation.dueAt.slice(0, 16) : "",
  );

  if (!canAct || operation.status === "COMPLETED" || operation.status === "CANCELED") {
    return null;
  }

  async function handleSetDueDate() {
    if (!dueAt) return;
    setPending(true);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/legal-reliability/action-operations/${operation.id}/due-date`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueAt: new Date(dueAt).toISOString() }),
        },
      );
      await requireOkData(res);
      await onDone();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid={`lcc-action-operation-due-date-${operation.id}`}>
      <input
        type="datetime-local"
        className="rounded border px-2 py-1 text-xs"
        value={dueAt}
        onChange={(event) => setDueAt(event.target.value)}
      />
      <button
        type="button"
        className="rounded border px-2 py-1 text-xs disabled:opacity-50"
        disabled={pending || !dueAt}
        onClick={() => void handleSetDueDate()}
      >
        {pending ? "저장 중…" : "기한 설정"}
      </button>
    </div>
  );
}
