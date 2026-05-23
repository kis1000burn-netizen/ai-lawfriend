import AssignmentForm from "@/components/cases/assignment-form";
import EndAssignmentButton from "@/components/cases/end-assignment-button";
import {
  listAssignableLawyersService,
  listCaseAssignmentsService,
} from "@/features/case-assignments/case-assignment.service";
import { formatDate } from "@/features/cases/case.utils";
import { isPlatformAdmin } from "@/features/cases/case.permissions";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  caseId: string;
};

export default async function CaseAssignmentsPanel({
  currentUser,
  caseId,
}: Props) {
  const assignments = await listCaseAssignmentsService(currentUser, caseId);
  const lawyers = isPlatformAdmin(currentUser.role)
    ? await listAssignableLawyersService(currentUser)
    : [];

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-aibeop-text">사건 배정</h2>

      {isPlatformAdmin(currentUser.role) ? (
        <div className="mt-4">
          <AssignmentForm caseId={caseId} lawyers={lawyers} />
        </div>
      ) : null}

      {assignments.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-aibeop-subtle">
          현재 배정된 변호사가 없습니다.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl border p-4"
            >
              <div>
                <div className="font-medium text-aibeop-text">
                  {item.assignee.name ?? item.assignee.email}
                </div>
                <div className="mt-1 text-xs text-aibeop-subtle">
                  배정일: {formatDate(item.createdAt)}
                </div>
                {item.note ? (
                  <div className="mt-3 text-sm text-aibeop-subtle">{item.note}</div>
                ) : null}
              </div>

              {isPlatformAdmin(currentUser.role) ? (
                <EndAssignmentButton caseId={caseId} assignmentId={item.id} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
