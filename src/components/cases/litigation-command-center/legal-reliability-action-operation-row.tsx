import type { LegalReliabilityActionOperation } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
import { LegalReliabilityActionOperationCompletionControls } from "./legal-reliability-action-operation-completion-controls";
import { LegalReliabilityActionOperationAssignmentControls } from "./legal-reliability-action-operation-assignment-controls";
import { LegalReliabilityActionOperationDueDateControl } from "./legal-reliability-action-operation-due-date-control";
import { LegalReliabilityActionOperationResponseBadge } from "./legal-reliability-action-operation-response-badge";
import { LegalReliabilityActionOperationReviewHandoffControl } from "./legal-reliability-action-operation-review-handoff-control";
import { LegalReliabilityActionOperationSlaBadge } from "./legal-reliability-action-operation-sla-badge";

const STATUS_LABELS: Record<LegalReliabilityActionOperation["status"], string> = {
  READY: "준비됨",
  ASSIGNED: "담당자 배정",
  WAITING_TO_SEND: "발송 대기",
  SENT_TO_CLIENT: "의뢰인 발송됨",
  CLIENT_RESPONDED: "의뢰인 응답",
  EVIDENCE_INTAKE_LINKED: "자료 intake 연결",
  LAWYER_REVIEWING_RESPONSE: "변호사 검토 중",
  NEEDS_MORE_INFO: "추가 정보 필요",
  COMPLETED: "완료",
  REOPENED: "재오픈",
  DEFERRED: "보류",
  CANCELED: "취소",
};

const PRIORITY_CLASS: Record<LegalReliabilityActionOperation["priority"], string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-800",
  URGENT: "bg-rose-100 text-rose-800",
};

export function LegalReliabilityActionOperationRow({
  caseId,
  operation,
  currentUserId,
  canAct,
  onDone,
}: {
  caseId: string;
  operation: LegalReliabilityActionOperation;
  currentUserId: string;
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  return (
    <li
      className="rounded-xl border px-4 py-3"
      data-testid={`lcc-action-operation-${operation.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CLASS[operation.priority]}`}
            >
              {operation.priority}
            </span>
            <p className="font-medium text-slate-900">{operation.lawyerFacingTitle}</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            출처: {operation.sourceLabel} · {operation.operationType}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            상태: {STATUS_LABELS[operation.status]}
          </p>
          <p className="mt-1 text-xs text-slate-500" data-testid={`lcc-action-operation-owner-${operation.id}`}>
            담당자: {operation.assignedToName ?? operation.assignedToUserId ?? "미배정"}
          </p>
          <p className="mt-1 text-xs text-slate-500" data-testid={`lcc-action-operation-due-at-${operation.id}`}>
            기한: {operation.dueAt ? new Date(operation.dueAt).toLocaleString("ko-KR") : "미설정"}
          </p>
        </div>
        <LegalReliabilityActionOperationSlaBadge
          slaStatus={operation.slaStatus}
          slaBadgeLabel={operation.slaBadgeLabel}
        />
      </div>
      <LegalReliabilityActionOperationResponseBadge operation={operation} />
      {canAct ? (
        <div className="mt-3 space-y-2 border-t pt-3">
          <LegalReliabilityActionOperationReviewHandoffControl
            caseId={caseId}
            operation={operation}
            canAct={canAct}
            onDone={onDone}
          />
          <LegalReliabilityActionOperationCompletionControls
            caseId={caseId}
            operationId={operation.id}
            status={operation.status}
            evidenceIntakeStatus={operation.evidenceIntakeStatus}
            canAct={canAct}
            onUpdated={onDone}
          />
          <LegalReliabilityActionOperationAssignmentControls
            caseId={caseId}
            operation={operation}
            currentUserId={currentUserId}
            canAct={canAct}
            onDone={onDone}
          />
          <LegalReliabilityActionOperationDueDateControl
            caseId={caseId}
            operation={operation}
            canAct={canAct}
            onDone={onDone}
          />
        </div>
      ) : null}
    </li>
  );
}
