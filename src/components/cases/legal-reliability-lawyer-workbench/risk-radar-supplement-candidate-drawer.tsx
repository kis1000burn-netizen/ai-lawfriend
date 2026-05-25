"use client";

import type { SupplementActionCandidate } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema";
import { RiskRadarSupplementDecisionPanel } from "./risk-radar-supplement-decision-panel";

type Props = {
  open: boolean;
  candidate: SupplementActionCandidate | null;
  busy: boolean;
  readOnly: boolean;
  onClose: () => void;
  onApprove: () => void;
  onEditApprove: () => void;
  onReject: () => void;
  onDefer: () => void;
};

export function RiskRadarSupplementCandidateDrawer({
  open,
  candidate,
  busy,
  readOnly,
  onClose,
  onApprove,
  onEditApprove,
  onReject,
  onDefer,
}: Readonly<Props>) {
  if (!open || !candidate) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-aibeop-line bg-white p-6 shadow-2xl"
      data-testid="risk-radar-supplement-candidate-drawer"
      role="dialog"
      aria-label="Supplement candidate review drawer"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-aibeop-muted">Phase 49-A · Supplement Candidate</p>
          <h2 className="mt-1 text-lg font-semibold text-aibeop-text">보완요청 후보 검토</h2>
        </div>
        <button type="button" className="text-sm underline" onClick={onClose}>
          닫기
        </button>
      </div>

      <section className="mt-4 space-y-3 text-sm">
        <div>
          <h3 className="font-semibold text-aibeop-text">1. 내부 위험 신호</h3>
          <p className="mt-1 font-medium">{candidate.lawyerFacingTitle}</p>
          <p className="mt-1 text-aibeop-muted">{candidate.lawyerFacingReason}</p>
        </div>
        <div>
          <h3 className="font-semibold text-aibeop-text">2. 의뢰인에게 보낼 요청문 후보</h3>
          <p className="mt-1 text-xs text-aibeop-muted">제목: {candidate.proposedClientRequestTitle}</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-aibeop-line bg-aibeop-soft/30 p-3 text-sm">
            {candidate.proposedClientRequestBody}
          </pre>
        </div>
      </section>

      <RiskRadarSupplementDecisionPanel
        candidate={candidate}
        busy={busy}
        readOnly={readOnly}
        onApprove={onApprove}
        onEditApprove={onEditApprove}
        onReject={onReject}
        onDefer={onDefer}
      />
    </aside>
  );
}
