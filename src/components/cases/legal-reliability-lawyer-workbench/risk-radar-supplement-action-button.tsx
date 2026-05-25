"use client";

type Props = {
  disabled?: boolean;
  busy?: boolean;
  onCreateCandidate: () => void;
  onDeferReview: () => void;
  onDismiss: () => void;
};

export function RiskRadarSupplementActionButton({
  disabled,
  busy,
  onCreateCandidate,
  onDeferReview,
  onDismiss,
}: Readonly<Props>) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="risk-radar-supplement-action-buttons">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={onCreateCandidate}
        className="rounded-lg bg-violet-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        data-testid="risk-radar-create-supplement-candidate"
      >
        보완요청 후보 만들기
      </button>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={onDeferReview}
        className="rounded-lg border border-aibeop-line px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        나중에 검토
      </button>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={onDismiss}
        className="rounded-lg border border-aibeop-line px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        기각
      </button>
    </div>
  );
}
