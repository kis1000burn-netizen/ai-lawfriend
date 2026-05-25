"use client";

import type { SupplementActionCandidate } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema";

type Props = {
  candidate: SupplementActionCandidate | null;
  busy: boolean;
  readOnly: boolean;
  onApprove: () => void;
  onEditApprove: () => void;
  onReject: () => void;
  onDefer: () => void;
};

export function RiskRadarSupplementDecisionPanel({
  candidate,
  busy,
  readOnly,
  onApprove,
  onEditApprove,
  onReject,
  onDefer,
}: Readonly<Props>) {
  if (!candidate) return null;

  return (
    <section className="mt-6 border-t border-aibeop-line pt-4" data-testid="risk-radar-supplement-decision-panel">
      <h3 className="text-sm font-semibold text-aibeop-text">3. 변호사 결정</h3>
      <p className="mt-1 text-xs text-aibeop-muted">
        LAWYER_DECISION_LEDGER_REQUIRED · NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || readOnly}
          onClick={onApprove}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          data-testid="supplement-candidate-approve"
        >
          승인하고 보완요청 초안 생성
        </button>
        <button
          type="button"
          disabled={busy || readOnly}
          onClick={onEditApprove}
          className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          data-testid="supplement-candidate-edit-approve"
        >
          수정 후 승인
        </button>
        <button
          type="button"
          disabled={busy || readOnly}
          onClick={onReject}
          className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          data-testid="supplement-candidate-reject"
        >
          기각
        </button>
        <button
          type="button"
          disabled={busy || readOnly}
          onClick={onDefer}
          className="rounded-lg border border-aibeop-line px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          data-testid="supplement-candidate-defer"
        >
          보류
        </button>
      </div>
    </section>
  );
}
