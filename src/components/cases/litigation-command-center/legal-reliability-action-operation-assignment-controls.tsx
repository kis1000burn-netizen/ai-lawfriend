"use client";

import { useState } from "react";
import type { LegalReliabilityActionOperation } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
import { requireOkData } from "@/lib/client/api-error";

export function LegalReliabilityActionOperationAssignmentControls({
  caseId,
  operation,
  currentUserId,
  canAct,
  onDone,
}: {
  caseId: string;
  operation: LegalReliabilityActionOperation;
  currentUserId: string;
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [assignedToUserId, setAssignedToUserId] = useState(
    operation.assignedToUserId ?? currentUserId,
  );
  const [priority, setPriority] = useState(operation.priority);

  if (!canAct || operation.status === "COMPLETED" || operation.status === "CANCELED") {
    return null;
  }

  async function handleAssign() {
    setPending(true);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/legal-reliability/action-operations/${operation.id}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedToUserId, priority }),
        },
      );
      const raw = await res.json();
      requireOkData(res, raw, "담당자 배정에 실패했습니다.");
      await onDone();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid={`lcc-action-operation-assign-${operation.id}`}>
      <input
        className="rounded border px-2 py-1 text-xs"
        value={assignedToUserId}
        onChange={(event) => setAssignedToUserId(event.target.value)}
        placeholder="담당자 userId"
      />
      <select
        className="rounded border px-2 py-1 text-xs"
        value={priority}
        onChange={(event) =>
          setPriority(event.target.value as LegalReliabilityActionOperation["priority"])
        }
      >
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
        <option value="URGENT">URGENT</option>
      </select>
      <button
        type="button"
        className="rounded bg-slate-900 px-2 py-1 text-xs text-white disabled:opacity-50"
        disabled={pending}
        onClick={() => void handleAssign()}
      >
        {pending ? "배정 중…" : "담당자 배정"}
      </button>
    </div>
  );
}
