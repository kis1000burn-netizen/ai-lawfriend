"use client";

import Link from "next/link";

import type { VoiceDocumentFinalizeGateUiSnapshot } from "@/lib/voice/voice-document-finalize-gate-ui";

type VoiceDocumentFinalizeGatePanelProps = {
  caseId: string;
  snapshot: VoiceDocumentFinalizeGateUiSnapshot;
  compact?: boolean;
};

/**
 * Phase 5-H-UI-6 — Document Finalize Gate UI / Block Reason Panel
 * verify markers: phase5h-ui-6-voice-document-finalize-gate-ui · data-voice-document-finalize-gate-panel
 */
export function VoiceDocumentFinalizeGatePanel({
  caseId,
  snapshot,
  compact = false,
}: Readonly<VoiceDocumentFinalizeGatePanelProps>) {
  const blocked = !snapshot.allowed;
  const panelState = blocked ? "blocked" : "pass";

  return (
    <section
      className={
        blocked
          ? "rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-950 shadow-sm"
          : "rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm text-emerald-950 shadow-sm"
      }
      aria-label="Voice document finalize gate"
      data-voice-document-finalize-gate-panel="phase5h-ui-6-voice-document-finalize-gate-ui"
      data-document-finalize-gate={panelState}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{snapshot.headline}</h2>
          <p className="mt-2 leading-relaxed">{snapshot.detail}</p>
        </div>
        {!compact && snapshot.actionHref && snapshot.actionLabel ? (
          <Link
            href={snapshot.actionHref}
            className={
              blocked
                ? "rounded-xl bg-rose-900 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-950"
                : "rounded-xl border border-emerald-700 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            }
          >
            {snapshot.actionLabel}
          </Link>
        ) : null}
      </div>

      {blocked ? (
        <dl className="mt-4 grid gap-2 rounded-xl border border-rose-200/80 bg-white/70 p-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-rose-900">blockReason</dt>
            <dd className="mt-0.5 font-mono text-rose-950">{snapshot.blockReason ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-rose-900">questionKey</dt>
            <dd className="mt-0.5 font-mono text-rose-950">{snapshot.questionKey ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-rose-900">supplementRequestId</dt>
            <dd className="mt-0.5 break-all font-mono text-rose-950">
              {snapshot.supplementRequestId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-rose-900">gate</dt>
            <dd className="mt-0.5 font-mono text-rose-950">{snapshot.gate}</dd>
          </div>
        </dl>
      ) : null}

      {compact && snapshot.actionHref && snapshot.actionLabel ? (
        <p className="mt-3">
          <Link href={snapshot.actionHref} className="font-medium underline underline-offset-2">
            {snapshot.actionLabel}
          </Link>
        </p>
      ) : null}

      {!compact ? (
        <p className="mt-3 text-xs opacity-80">
          caseId: <span className="font-mono">{caseId}</span>
          {" · "}
          GET /api/cases/{caseId}/voice/document-finalize-gate
        </p>
      ) : null}
    </section>
  );
}
