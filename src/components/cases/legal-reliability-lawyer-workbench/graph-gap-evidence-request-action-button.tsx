"use client";

type Props = {
  disabled?: boolean;
  busy?: boolean;
  onCreateCandidate: () => void;
};

export function GraphGapEvidenceRequestActionButton({
  disabled,
  busy,
  onCreateCandidate,
}: Readonly<Props>) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onCreateCandidate}
      className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      data-testid="graph-gap-create-evidence-request-candidate"
    >
      증거 요청 후보 만들기
    </button>
  );
}
