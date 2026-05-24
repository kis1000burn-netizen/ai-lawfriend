"use client";

import { useState } from "react";
import type { DataGovernancePurgePreviewSnapshot } from "@/features/data-governance/data-governance-purge-preview.service";
import type { DataGovernancePurgeUnlockEvaluation } from "@/features/data-governance/data-governance-purge-execution.policy";
import {
  DATA_GOVERNANCE_PURGE_DRY_RUN_API_PATH,
  DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE,
  DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING,
} from "@/features/data-governance/data-governance-rc-lock";

type Props = {
  preview: DataGovernancePurgePreviewSnapshot;
  unlockEvaluation: DataGovernancePurgeUnlockEvaluation;
};

export function DataGovernancePurgeRcPanel({ preview, unlockEvaluation }: Props) {
  const [phrase, setPhrase] = useState("");
  const [rollbackAck, setRollbackAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDryRunExport() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(DATA_GOVERNANCE_PURGE_DRY_RUN_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorConfirmationPhrase: phrase,
          rollbackWarningAcknowledged: rollbackAck,
          bundledRcVerifyPassed: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? json.message ?? "Dry-run export failed");
      }
      setResult(JSON.stringify(json.data ?? json, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dry-run export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-violet-200 bg-violet-50/50 p-5">
      <div>
        <h2 className="text-lg font-semibold text-violet-950">Phase 19-F — Purge RC · dry-run</h2>
        <p className="mt-1 text-sm text-violet-900/80">
          Preview {preview.candidateCount}건 · legal hold recheck{" "}
          {preview.legalHoldRecheckPassed ? "PASS" : "FAIL"} · mode{" "}
          {unlockEvaluation.mode}
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {unlockEvaluation.gates.map((gate) => (
          <li
            key={gate.id}
            className="flex items-start justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-violet-950">{gate.label}</p>
              <p className="text-xs text-violet-800/70">{gate.detail}</p>
            </div>
            <span
              className={
                gate.passed
                  ? "text-xs font-semibold text-emerald-700"
                  : "text-xs font-semibold text-amber-700"
              }
            >
              {gate.passed ? "PASS" : "PENDING"}
            </span>
          </li>
        ))}
      </ul>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {DATA_GOVERNANCE_PURGE_ROLLBACK_WARNING}
      </p>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={rollbackAck}
          onChange={(e) => setRollbackAck(e.target.checked)}
          className="mt-1"
        />
        <span>Rollback 불가 항목 warning을 확인했습니다.</span>
      </label>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-violet-900">
          Operator confirmation phrase
        </label>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder={DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE}
          className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || !rollbackAck}
          onClick={handleDryRunExport}
          className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Exporting…" : "Dry-run export + AuditLog"}
        </button>
        {(["Purge", "Delete", "Blob reclaim"] as const).map((label) => (
          <button
            key={label}
            type="button"
            disabled
            title={
              unlockEvaluation.actualExecutionAllowed
                ? "Limited flag on — job wiring still required"
                : "19-F gates + limited execution flag 필요"
            }
            className="cursor-not-allowed rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-medium text-violet-400 opacity-60"
          >
            {label} (disabled)
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {result ? (
        <pre className="max-h-64 overflow-auto rounded-lg bg-white p-3 text-xs">{result}</pre>
      ) : null}
    </section>
  );
}
