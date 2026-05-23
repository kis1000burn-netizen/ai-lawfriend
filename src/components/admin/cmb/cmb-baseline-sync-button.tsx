"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  canSync: boolean;
};

export function CmbBaselineSyncButton({ canSync }: Readonly<Props>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!canSync) return null;

  async function sync() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cmb/sync-baseline", {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json();
      if (!body.ok) {
        throw new Error(body.message ?? "sync 실패");
      }
      setMessage("Baseline sync 완료");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "sync 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={busy}
        data-testid="cmb-baseline-sync"
        onClick={sync}
        className="rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft disabled:opacity-50"
      >
        Baseline sync (TS → DB LOCKED)
      </button>
      {message ? <span className="text-xs text-aibeop-muted">{message}</span> : null}
    </div>
  );
}
