import type { LegalReliabilityActionOperation } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation.schema";
import { LegalReliabilityActionOperationRow } from "./legal-reliability-action-operation-row";

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-slate-500">{message}</p>;
}

export function LegalReliabilityActionOperationsPanel({
  caseId,
  operations,
  currentUserId,
  canAct,
  onDone,
}: {
  caseId: string;
  operations: LegalReliabilityActionOperation[];
  currentUserId: string;
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  return (
    <section data-testid="lcc-section-action-operations-queue">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">
          Legal Reliability Action Operations
        </h2>
        <span className="text-xs text-slate-500">{operations.length}건</span>
      </div>
      {operations.length === 0 ? (
        <EmptyState message="승인된 Legal Reliability Action 운영 항목이 없습니다." />
      ) : (
        <ul className="space-y-2">
          {operations.map((operation) => (
            <LegalReliabilityActionOperationRow
              key={operation.id}
              caseId={caseId}
              operation={operation}
              currentUserId={currentUserId}
              canAct={canAct}
              onDone={onDone}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
