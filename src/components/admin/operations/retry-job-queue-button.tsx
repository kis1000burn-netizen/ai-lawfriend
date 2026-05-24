"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  retryJobId: string;
  disabled: boolean;
  disabledReason?: string;
};

export function RetryJobQueueButton({ retryJobId, disabled, disabledReason }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/operations/retry-jobs/${retryJobId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success !== true) {
        throw new Error(json.error?.message ?? `Retry failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleRetry}
        title={disabled ? disabledReason : undefined}
        className={[
          "rounded-lg px-3 py-1.5 text-xs font-semibold",
          disabled || loading
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-aibeop-accent text-white hover:opacity-90",
        ].join(" ")}
      >
        {loading ? "…" : "재시도 큐"}
      </button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
