import type { LegalReliabilityActionOperation } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";

const RESPONSE_STATUS_LABELS: Partial<
  Record<LegalReliabilityActionOperation["status"], string>
> = {
  CLIENT_RESPONDED: "의뢰인 응답 도착",
  EVIDENCE_INTAKE_LINKED: "자료 검토 대기",
  LAWYER_REVIEWING_RESPONSE: "변호사 검토 중",
};

const EVIDENCE_INTAKE_LABELS: Record<
  LegalReliabilityActionOperation["evidenceIntakeStatus"],
  string | null
> = {
  NONE: null,
  LINKED: "증거 intake 연결됨",
  UNDER_REVIEW: "증거 검토 필요",
  LAWYER_CONFIRMED: "변호사 확정",
  REJECTED: "증거 반려",
};

export function LegalReliabilityActionOperationResponseBadge({
  operation,
}: {
  operation: LegalReliabilityActionOperation;
}) {
  const statusLabel = RESPONSE_STATUS_LABELS[operation.status];
  const evidenceLabel = EVIDENCE_INTAKE_LABELS[operation.evidenceIntakeStatus];

  if (!statusLabel && !operation.clientResponseReceivedAt && operation.linkedUploadedFileCount === 0) {
    return null;
  }

  return (
    <div
      className="mt-2 flex flex-wrap gap-2"
      data-testid={`lcc-action-operation-response-badge-${operation.id}`}
    >
      {statusLabel ? (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          {statusLabel}
        </span>
      ) : null}
      {operation.clientResponseReceivedAt ? (
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-800">
          의뢰인 응답 있음
        </span>
      ) : null}
      {operation.linkedUploadedFileCount > 0 ? (
        <span
          className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800"
          data-testid={`lcc-action-operation-uploaded-file-count-${operation.id}`}
        >
          파일 {operation.linkedUploadedFileCount}개 제출
        </span>
      ) : null}
      {evidenceLabel ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
          {evidenceLabel}
        </span>
      ) : null}
      {operation.lawyerReviewRequired ? (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800">
          변호사 검토 필요
        </span>
      ) : null}
    </div>
  );
}
