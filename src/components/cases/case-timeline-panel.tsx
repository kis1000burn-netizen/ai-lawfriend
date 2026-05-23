import DeleteTimelineMemoButton from "@/components/cases/delete-timeline-memo-button";
import { CaseTimelineNoteCard } from "@/components/cases/case-timeline-note-card";
import TimelineMemoForm from "@/components/cases/timeline-memo-form";
import { listTimelineMemosService } from "@/features/case-timeline/case-timeline.service";
import { isPlatformAdmin } from "@/features/cases/case.permissions";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  caseId: string;
  /** 경고 상세에서 타임라인 메모 흐름으로 연결할 때 전달 */
  focusAlertId?: string;
  /** `?draft=` 쿼리로 전달된 조치 초안 */
  draftContent?: string;
};

export default async function CaseTimelinePanel({
  currentUser,
  caseId,
  focusAlertId,
  draftContent,
}: Props) {
  const memos = await listTimelineMemosService(currentUser, caseId);
  const canUseStaffNote =
    isPlatformAdmin(currentUser.role) || currentUser.role === "LAWYER";

  return (
    <section
      id="case-timeline"
      className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-aibeop-text">사건 타임라인 메모</h2>

      {focusAlertId ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          현재 선택된 경고 ID{" "}
          <span className="font-mono font-semibold">{focusAlertId}</span> 와 연결된 메모를 우선
          확인할 수 있습니다.
        </div>
      ) : null}

      <div className="mt-4">
        <TimelineMemoForm
          caseId={caseId}
          canUseStaffNote={canUseStaffNote}
          initialDraft={draftContent}
          linkedAlertEventId={focusAlertId}
        />
      </div>

      {memos.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-6 text-sm text-aibeop-subtle">
          등록된 메모가 없습니다.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {memos.map((memo) => {
            const canDelete =
              isPlatformAdmin(currentUser.role) ||
              memo.authorUserId === currentUser.id;

            return (
              <CaseTimelineNoteCard
                key={memo.id}
                item={{
                  ...memo,
                  alertEvent: memo.alertEvent ?? null,
                }}
                focused={!!focusAlertId && memo.alertEventId === focusAlertId}
                actions={
                  canDelete ? (
                    <DeleteTimelineMemoButton caseId={caseId} memoId={memo.id} />
                  ) : null
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
