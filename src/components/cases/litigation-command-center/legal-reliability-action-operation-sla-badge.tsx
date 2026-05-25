import type { LegalReliabilityActionSlaStatus } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";

const SLA_CLASS: Record<LegalReliabilityActionSlaStatus, string> = {
  NO_OWNER: "bg-slate-100 text-slate-700",
  NO_DUE_DATE: "bg-slate-100 text-slate-600",
  ON_TRACK: "bg-emerald-100 text-emerald-800",
  DUE_SOON: "bg-amber-100 text-amber-800",
  OVERDUE: "bg-rose-100 text-rose-800",
  BLOCKED_BY_CLIENT: "bg-orange-100 text-orange-800",
  WAITING_LAWYER_REVIEW: "bg-indigo-100 text-indigo-800",
};

export function LegalReliabilityActionOperationSlaBadge({
  slaStatus,
  slaBadgeLabel,
}: {
  slaStatus: LegalReliabilityActionSlaStatus;
  slaBadgeLabel: string;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${SLA_CLASS[slaStatus]}`}
      data-testid={`lcc-action-operation-sla-${slaStatus}`}
    >
      {slaBadgeLabel}
    </span>
  );
}
