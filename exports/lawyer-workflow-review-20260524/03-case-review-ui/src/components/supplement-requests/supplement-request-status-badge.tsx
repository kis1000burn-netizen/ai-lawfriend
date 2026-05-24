const STATUS_LABELS: Record<string, string> = {
  DRAFT: "작성 중",
  SENT: "발송됨",
  CLIENT_VIEWED: "확인됨",
  CLIENT_RESPONDED: "응답 완료",
  UNDER_REVIEW: "재검토 중",
  NEEDS_MORE_INFO: "추가 보완 필요",
  ACCEPTED: "수용됨",
  CLOSED: "종료",
  CANCELLED: "취소",
  EXPIRED: "만료",
};

const STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-aibeop-subtle ring-slate-200",
  SENT: "bg-blue-50 text-blue-700 ring-blue-200",
  CLIENT_VIEWED: "bg-sky-50 text-sky-700 ring-sky-200",
  CLIENT_RESPONDED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UNDER_REVIEW: "bg-violet-50 text-violet-700 ring-violet-200",
  NEEDS_MORE_INFO: "bg-amber-50 text-amber-700 ring-amber-200",
  ACCEPTED: "bg-green-50 text-green-700 ring-green-200",
  CLOSED: "bg-slate-200 text-aibeop-subtle ring-slate-300",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  EXPIRED: "bg-orange-50 text-orange-700 ring-orange-200",
};

export function SupplementRequestStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        STATUS_TONES[status] ?? "bg-slate-100 text-aibeop-subtle ring-slate-200",
      ].join(" ")}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
