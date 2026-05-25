"use client";

import type { EvidenceRequestActionCandidate } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema";

type Props = {
  open: boolean;
  candidate: EvidenceRequestActionCandidate | null;
  busy: boolean;
  readOnly: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDefer: () => void;
};

export function GraphGapEvidenceRequestCandidateDrawer({
  open,
  candidate,
  busy,
  readOnly,
  onClose,
  onApprove,
  onReject,
  onDefer,
}: Readonly<Props>) {
  if (!open || !candidate) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-aibeop-line bg-white p-6 shadow-2xl"
      data-testid="graph-gap-evidence-request-candidate-drawer"
      role="dialog"
      aria-label="Evidence request candidate drawer"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-aibeop-muted">Phase 49-B · Evidence Request Candidate</p>
          <h2 className="mt-1 text-lg font-semibold text-aibeop-text">증거 요청 후보 검토</h2>
        </div>
        <button type="button" className="text-sm underline" onClick={onClose}>
          닫기
        </button>
      </div>

      <section className="mt-4 space-y-3 text-sm">
        <div>
          <h3 className="font-semibold text-aibeop-text">1. Graph gap (변호사 내부)</h3>
          <p className="mt-1 font-medium">{candidate.lawyerFacingTitle}</p>
          <p className="mt-1 text-aibeop-muted">{candidate.lawyerFacingReason}</p>
        </div>
        <div>
          <h3 className="font-semibold text-aibeop-text">2. 의뢰인 자료제출 요청 후보</h3>
          <p className="mt-1 text-xs text-aibeop-muted">제목: {candidate.proposedClientRequestTitle}</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-aibeop-line bg-aibeop-soft/30 p-3 text-sm">
            {candidate.proposedClientRequestBody}
          </pre>
        </div>
      </section>

      <section className="mt-6 border-t border-aibeop-line pt-4">
        <h3 className="text-sm font-semibold text-aibeop-text">3. 변호사 결정</h3>
        <p className="mt-1 text-xs text-aibeop-muted">
          NO_UNVERIFIED_EVIDENCE_LABELING · LAWYER_DECISION_LEDGER_REQUIRED
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || readOnly}
            onClick={onApprove}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            data-testid="evidence-request-candidate-approve"
          >
            승인하고 자료요청 초안 생성
          </button>
          <button
            type="button"
            disabled={busy || readOnly}
            onClick={onReject}
            className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            기각
          </button>
          <button
            type="button"
            disabled={busy || readOnly}
            onClick={onDefer}
            className="rounded-lg border border-aibeop-line px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            보류
          </button>
        </div>
      </section>
    </aside>
  );
}
