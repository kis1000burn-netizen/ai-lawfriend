"use client";

/**
 * Phase 14-A/14-B/14-C — Litigation Command Center (소송 지휘실).
 */
import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { LitigationCommandCenterResponse } from "@/features/document-intelligence/litigation-command-center.schema";
import type { LitigationCommandCenterActionFeedItem } from "@/features/document-intelligence/litigation-command-center-action-feed";
import { requireOkData } from "@/lib/client/api-error";
import { useLitigationCommandCenterActions } from "@/hooks/use-litigation-command-center-actions";
import { LegalReliabilityActionOperationsPanel } from "@/components/cases/litigation-command-center/legal-reliability-action-operations-panel";
import { LegalReliabilityActionOperationsDashboardPanel } from "@/components/cases/litigation-command-center/legal-reliability-action-operations-dashboard-panel";

export const LITIGATION_COMMAND_CENTER_CLIENT_MARKER_PHASE14C =
  "phase14c-litigation-command-center-client" as const;

type Props = {
  caseId: string;
  initialData: LitigationCommandCenterResponse;
  readOnly: boolean;
  currentUserId: string;
};

const TASK_KIND_LABELS: Record<string, string> = {
  RISK: "위험",
  ISSUE: "쟁점",
  EVIDENCE_GAP: "증거 보완",
  REBUTTAL: "반박",
  GENERAL: "일반",
};

function Section({
  title,
  description,
  children,
  testId,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid={testId}
    >
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {message}
    </p>
  );
}

function ConfirmedBadge() {
  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
      확정
    </span>
  );
}

function AiCandidateBadge() {
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
      AI 후보 · 검토 필요
    </span>
  );
}

function AccessModeBanner({
  readOnly,
  actionsEnabled,
}: {
  readOnly: boolean;
  actionsEnabled: boolean;
}) {
  if (readOnly || !actionsEnabled) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        data-testid="lcc-mode-readonly"
      >
        <span className="font-semibold text-slate-900">열람 전용</span>
        <span className="ml-2">
          작업 처리는 배정 변호사·스태프만 가능합니다. 검토 콘솔 링크와 데이터 조회는
          이용할 수 있습니다.
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      data-testid="lcc-mode-actions-enabled"
    >
      <span className="font-semibold">작업 가능</span>
      <span className="ml-2">
        업무·기일·보완·초안 생성을 이 화면에서 바로 처리할 수 있습니다.
      </span>
    </div>
  );
}

function FeedOutcomeBadge({ item }: { item: LitigationCommandCenterActionFeedItem }) {
  if (item.outcome === "PENDING") {
    return (
      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
        처리 중
      </span>
    );
  }
  if (item.outcome === "FAILED") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        실패
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
      {item.source === "AUDIT" ? "AuditLog" : "완료"}
    </span>
  );
}

function toIsoDateTime(dateInput: string): string | null {
  const trimmed = dateInput.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes("T")
    ? trimmed.endsWith("Z")
      ? trimmed
      : `${trimmed}${/:\d{2}$/.test(trimmed) ? "" : ":00"}.000Z`
    : `${trimmed}T09:00:00.000Z`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function ClientSubmissionReviewRow({
  caseId,
  submission,
  canAct,
  onDone,
}: {
  caseId: string;
  submission: LitigationCommandCenterResponse["clientSubmissions"][number];
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  const { pushToast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const [reviewMemo, setReviewMemo] = useState("");
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  async function run(action: string, path: string, label: string, body?: unknown) {
    if (!canAct) return;
    setPending(action);
    try {
      const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, `${label}에 실패했습니다.`);
      pushToast({ kind: "success", title: `${label} 완료` });
      await onDone();
    } catch (error) {
      pushToast({
        kind: "error",
        title: `${label} 실패`,
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <li
      className="rounded-xl border px-4 py-3"
      data-testid={`lcc-client-submission-${submission.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">
            {submission.submitterName} · {submission.statusLabel}
          </p>
          <p className="text-xs text-slate-500">
            {submission.kind}
            {submission.supplementTitle ? ` · ${submission.supplementTitle}` : ""} · 파일{" "}
            {submission.fileCount}건
          </p>
          {submission.message ? (
            <p className="mt-1 text-sm text-slate-700">{submission.message}</p>
          ) : null}
          {submission.pipelineLabels.length > 0 ? (
            <p className="mt-1 text-xs text-slate-500">{submission.pipelineLabels.join(" · ")}</p>
          ) : null}
        </div>
        {canAct ? (
          <div className="flex flex-wrap gap-2">
            {submission.status === "SUBMITTED" ? (
              <ActionButton
                testId={`lcc-client-submission-${submission.id}-receive`}
                loading={pending === "receive"}
                onClick={() =>
                  void run(
                    "receive",
                    `/api/cases/${caseId}/client-submissions/${submission.id}/receive`,
                    "수신",
                  )
                }
              >
                수신
              </ActionButton>
            ) : null}
            {["SUBMITTED", "RECEIVED"].includes(submission.status) ? (
              <ActionButton
                testId={`lcc-client-submission-${submission.id}-review`}
                loading={pending === "review"}
                onClick={() =>
                  void run(
                    "review",
                    `/api/cases/${caseId}/client-submissions/${submission.id}/start-review`,
                    "검토 시작",
                  )
                }
              >
                검토 시작
              </ActionButton>
            ) : null}
            {["SUBMITTED", "RECEIVED", "UNDER_REVIEW"].includes(submission.status) ? (
              <>
                <ActionButton
                  testId={`lcc-client-submission-${submission.id}-accept`}
                  loading={pending === "accept"}
                  onClick={() =>
                    void run(
                      "accept",
                      `/api/cases/${caseId}/client-submissions/${submission.id}/accept`,
                      "채택",
                    )
                  }
                >
                  사건자료 채택
                </ActionButton>
                <ActionButton
                  testId={`lcc-client-submission-${submission.id}-more`}
                  loading={pending === "more"}
                  onClick={() => setShowMoreInfo(true)}
                >
                  추가요청
                </ActionButton>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {showMoreInfo ? (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
          <label className="block text-sm font-medium text-amber-950">
            추가 요청 메모
            <textarea
              value={reviewMemo}
              onChange={(e) => setReviewMemo(e.target.value)}
              rows={3}
              placeholder="의뢰인에게 필요한 자료·설명을 입력하세요."
              className="mt-1 w-full rounded-lg border px-2 py-1 text-sm"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <ActionButton
              testId={`lcc-client-submission-${submission.id}-more-confirm`}
              loading={pending === "more"}
              onClick={() =>
                void run(
                  "more",
                  `/api/cases/${caseId}/client-submissions/${submission.id}/request-more-info`,
                  "추가요청",
                  {
                    reviewMemo:
                      reviewMemo.trim() || "추가 자료 또는 설명이 필요합니다.",
                  },
                ).then(() => {
                  setShowMoreInfo(false);
                  setReviewMemo("");
                })
              }
            >
              전송
            </ActionButton>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm"
              onClick={() => {
                setShowMoreInfo(false);
                setReviewMemo("");
              }}
            >
              취소
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function CommandCenterConversationRow({
  caseId,
  message,
  canAct,
  onDone,
}: {
  caseId: string;
  message: LitigationCommandCenterResponse["conversationMessages"][number];
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  const { pushToast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const [reviewLink, setReviewLink] = useState<string | null>(null);

  async function adopt(scope: "body" | "attachment", uploadedFileId?: string) {
    if (!canAct) return;
    const actionKey = scope === "body" ? "body" : `att-${uploadedFileId}`;
    setPending(actionKey);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/messages/${message.id}/adopt-record`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope,
            ...(uploadedFileId ? { uploadedFileId } : {}),
          }),
        },
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{
        reviewItemId: string;
        intelligenceReviewPath?: string;
      }>(
        res,
        raw,
        scope === "body" ? "사건기록 후보 채택에 실패했습니다." : "증거 후보 채택에 실패했습니다.",
      );
      const href = data.intelligenceReviewPath ?? `/cases/${caseId}/intelligence-review`;
      setReviewLink(href);
      pushToast({
        kind: "success",
        title:
          scope === "body"
            ? "CLIENT_STATEMENT 검토 큐에 등록했습니다."
            : "증거 후보 검토 큐에 등록했습니다.",
        description: "13-G Review Gate에서 확정해 주세요.",
      });
      await onDone();
    } catch (error) {
      pushToast({
        kind: "error",
        title: "채택 실패",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <li
      className="rounded-xl border px-4 py-3"
      data-testid={`lcc-conversation-message-${message.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">
            {message.senderName}{" "}
            <span className="text-xs font-normal text-slate-500">{message.senderRole}</span>
            {!message.isRead ? (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                미확인
              </span>
            ) : null}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{message.body}</p>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(message.createdAt).toLocaleString("ko-KR")}
          </p>
          {message.attachments.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <li
                  key={attachment.uploadedFileId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  data-testid={`lcc-conversation-attachment-${attachment.uploadedFileId}`}
                >
                  <span className="text-sm text-slate-700">{attachment.originalFileName}</span>
                  {canAct ? (
                    attachment.adopted ? (
                      <span className="text-xs font-medium text-emerald-700">증거 후보 등록됨</span>
                    ) : (
                      <ActionButton
                        testId={`lcc-conversation-attachment-${attachment.uploadedFileId}-adopt`}
                        loading={pending === `att-${attachment.uploadedFileId}`}
                        onClick={() =>
                          void adopt("attachment", attachment.uploadedFileId)
                        }
                      >
                        증거 후보로 채택
                      </ActionButton>
                    )
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {canAct ? (
          <div className="flex flex-col items-end gap-2">
            {message.bodyAdopted ? (
              <span className="text-xs font-medium text-emerald-700">사건기록 후보 등록됨</span>
            ) : (
              <ActionButton
                testId={`lcc-conversation-message-${message.id}-adopt-body`}
                loading={pending === "body"}
                onClick={() => void adopt("body")}
              >
                사건기록 후보로 채택
              </ActionButton>
            )}
          </div>
        ) : null}
      </div>
      {reviewLink ? (
        <p className="mt-3 text-sm">
          <Link
            href={reviewLink}
            className="font-medium text-indigo-700 underline"
            data-testid={`lcc-conversation-review-link-${message.id}`}
          >
            Review Queue에서 CLIENT_STATEMENT 후보 확인 →
          </Link>
        </p>
      ) : null}
    </li>
  );
}

function CommandCenterDeadlineRow({
  caseId,
  deadline,
  canAct,
  onDone,
  isGlobalBusy,
  isPending,
}: {
  caseId: string;
  deadline: LitigationCommandCenterResponse["deadlines"][number];
  canAct: boolean;
  onDone: () => Promise<void>;
  isGlobalBusy: boolean;
  isPending: (key: string) => boolean;
}) {
  const { pushToast } = useToast();
  const [notifyPending, setNotifyPending] = useState(false);

  async function scheduleNotify(offsets?: string[]) {
    if (!canAct || !deadline.dueAt) return;
    setNotifyPending(true);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/deadlines/${deadline.id}/notify-client`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offsets: offsets ?? ["D14", "D7", "D3", "D1", "D0"],
          }),
        },
      );
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "알림 예약에 실패했습니다.");
      pushToast({
        kind: "success",
        title: "기일 알림 예약 완료",
        description: "의뢰인 동의 상태에 따라 채널별 예약·스킵이 기록됩니다.",
      });
      await onDone();
    } catch (error) {
      pushToast({
        kind: "error",
        title: "알림 예약 실패",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setNotifyPending(false);
    }
  }

  return (
    <>
      {deadline.courtName || deadline.hearingKind ? (
        <p className="mt-1 text-xs text-slate-500">
          {[deadline.courtName, deadline.hearingKind].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      {deadline.notificationScheduledCount > 0 || deadline.kakaoPendingCount > 0 ? (
        <p className="mt-1 text-xs text-indigo-700">
          알림 예약 {deadline.notificationScheduledCount}건
          {deadline.kakaoPendingCount > 0
            ? ` · 카카오 알림톡 대기 ${deadline.kakaoPendingCount}건`
            : ""}
        </p>
      ) : null}
      {canAct && deadline.status === "OPEN" && deadline.dueAt ? (
        <div className="mt-2 flex flex-wrap justify-end gap-1">
          <ActionButton
            testId={`lcc-deadline-${deadline.id}-notify-client`}
            loading={notifyPending}
            disabled={isGlobalBusy && !notifyPending}
            onClick={() => void scheduleNotify()}
          >
            의뢰인에게 알림 예약
          </ActionButton>
          <ActionButton
            variant="ghost"
            testId={`lcc-deadline-${deadline.id}-notify-d7`}
            loading={notifyPending}
            disabled={isGlobalBusy && !notifyPending}
            onClick={() => void scheduleNotify(["D7"])}
          >
            D-7 알림
          </ActionButton>
        </div>
      ) : null}
    </>
  );
}

function CommandCenterSharedDocumentSection({
  caseId,
  data,
  canAct,
  onDone,
}: {
  caseId: string;
  data: LitigationCommandCenterResponse;
  canAct: boolean;
  onDone: () => Promise<void>;
}) {
  const { pushToast } = useToast();
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [sharePending, setSharePending] = useState(false);
  const [kakaoPendingId, setKakaoPendingId] = useState<string | null>(null);

  async function createShare() {
    if (!canAct || !selectedDocumentId) return;
    setSharePending(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/shared-documents`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          notifyChannels: ["IN_APP", "KAKAO_ALIMTALK"],
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "문서 공유 생성에 실패했습니다.");
      pushToast({
        kind: "success",
        title: "보안 문서 공유 완료",
        description: "카카오 알림톡은 동의 상태에 따라 예약·스킵됩니다.",
      });
      setSelectedDocumentId("");
      await onDone();
    } catch (error) {
      pushToast({
        kind: "error",
        title: "문서 공유 실패",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSharePending(false);
    }
  }

  async function sendKakao(shareId: string) {
    if (!canAct) return;
    setKakaoPendingId(shareId);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/shared-documents/${shareId}/send-kakao`,
        { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" },
      );
      const raw = await res.json().catch(() => null);
      const result = requireOkData<{ status?: string }>(res, raw, "카카오 알림 발송에 실패했습니다.");
      pushToast({
        kind: result.status === "SENT" ? "success" : "warning",
        title: result.status === "SENT" ? "카카오 알림 발송(스텁)" : "카카오 미동의 — 대체 기록",
        description: "메시지 본문에는 보안 링크만 포함됩니다.",
      });
      await onDone();
    } catch (error) {
      pushToast({
        kind: "error",
        title: "알림 발송 실패",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setKakaoPendingId(null);
    }
  }

  return (
    <Section
      title="의뢰인 보안 문서 공유"
      description="원본 파일은 카카오에 첨부하지 않습니다. 로그인 기반 보안 링크만 전달합니다."
      testId="lcc-section-shared-documents"
    >
      {canAct ? (
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
          <label className="block text-xs text-slate-600">
            공유할 LegalDocument
            <select
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              className="mt-1 block min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
              data-testid="lcc-shared-document-select"
            >
              <option value="">문서 선택…</option>
              {data.shareableDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.status})
                </option>
              ))}
            </select>
          </label>
          <ActionButton
            testId="lcc-shared-document-create"
            loading={sharePending}
            disabled={!selectedDocumentId}
            onClick={() => void createShare()}
          >
            보안 공유 생성
          </ActionButton>
        </div>
      ) : null}
      {data.sharedDocuments.length === 0 ? (
        <EmptyState message="의뢰인에게 공유한 문서가 없습니다." />
      ) : (
        <ul className="space-y-2">
          {data.sharedDocuments.map((share) => (
            <li
              key={share.id}
              className="flex items-start justify-between gap-3 rounded-xl border px-4 py-3"
              data-testid={`lcc-shared-document-${share.id}`}
            >
              <div>
                <p className="font-medium text-slate-900">{share.documentTitle}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(share.sharedAt).toLocaleString("ko-KR")}
                  {share.firstViewedAt
                    ? ` · 열람 ${new Date(share.firstViewedAt).toLocaleString("ko-KR")}`
                    : " · 미열람"}
                </p>
                <p className="mt-1 text-xs text-indigo-700">
                  {share.inAppSent ? "앱 알림 ✓" : ""}
                  {share.kakaoSent ? " · 카카오 발송 ✓" : share.kakaoPending ? " · 카카오 대기" : ""}
                </p>
              </div>
              {canAct && share.shareStatus === "ACTIVE" && !share.kakaoSent ? (
                <ActionButton
                  testId={`lcc-shared-document-${share.id}-send-kakao`}
                  loading={kakaoPendingId === share.id}
                  onClick={() => void sendKakao(share.id)}
                >
                  카카오 알림톡
                </ActionButton>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  loading,
  testId,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  testId?: string;
  variant?: "primary" | "ghost";
}) {
  const cls =
    variant === "primary"
      ? "rounded-lg bg-indigo-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
      : "rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 disabled:opacity-50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cls}
      data-testid={testId}
      aria-busy={loading || undefined}
    >
      {loading ? "처리 중…" : children}
    </button>
  );
}

export function LitigationCommandCenterClient({
  caseId,
  initialData,
  readOnly,
  currentUserId,
}: Readonly<Props>) {
  const { pushToast } = useToast();
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [opsPending, setOpsPending] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [deadlineFormOpen, setDeadlineFormOpen] = useState(false);
  const [deadlineCreating, setDeadlineCreating] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState("");
  const [newDeadlineDueAt, setNewDeadlineDueAt] = useState("");
  const [newDeadlineCourt, setNewDeadlineCourt] = useState("");
  const [newDeadlineKind, setNewDeadlineKind] = useState("변론기일");

  const canAct = data.actionsEnabled && !readOnly;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setDateError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/litigation-command-center`, {
        credentials: "include",
      });
      const raw = await res.json().catch(() => null);
      const next = requireOkData<LitigationCommandCenterResponse>(
        res,
        raw,
        "소송 지휘실 데이터를 불러오지 못했습니다.",
      );
      setData(next);
    } catch (err) {
      pushToast({
        kind: "error",
        title: "새로고침 실패",
        description: err instanceof Error ? err.message : "데이터를 다시 불러오지 못했습니다.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [caseId, pushToast]);

  const {
    isPending,
    isGlobalBusy,
    mergedFeed,
    patchTask,
    patchDeadline,
    sendSupplement,
    startSupplementReview,
    generateDraft,
  } = useLitigationCommandCenterActions({
    caseId,
    data,
    setData,
    canAct,
    refresh,
  });

  const runOpsSync = useCallback(async () => {
    if (readOnly) return;
    setOpsPending(true);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/document-intelligence/operations/sync`,
        { method: "POST", credentials: "include" },
      );
      const raw = await res.json().catch(() => null);
      const result = requireOkData<{
        deadlinesCreated: number;
        tasksCreated: number;
        supplementDraftsCreated: number;
        draftContextsCreated: number;
      }>(res, raw, "운영 연동에 실패했습니다.");
      pushToast({
        kind: "success",
        title: "운영 연동 완료",
        description: `기일 ${result.deadlinesCreated} · 업무 ${result.tasksCreated} · 보완 ${result.supplementDraftsCreated} · 서면 ${result.draftContextsCreated}`,
      });
      await refresh();
    } catch (err) {
      pushToast({
        kind: "error",
        title: "운영 연동 실패",
        description: err instanceof Error ? err.message : "운영 연동에 실패했습니다.",
      });
    } finally {
      setOpsPending(false);
    }
  }, [caseId, pushToast, readOnly, refresh]);

  const createManualDeadline = useCallback(async () => {
    if (!canAct) return;
    if (!newDeadlineTitle.trim() || !newDeadlineDueAt.trim()) {
      pushToast({
        kind: "warning",
        title: "입력 확인",
        description: "기일 제목과 일시를 입력하세요.",
      });
      return;
    }
    const iso = toIsoDateTime(newDeadlineDueAt);
    if (!iso) {
      setDateError("날짜 형식이 올바르지 않습니다. YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm 형식으로 입력하세요.");
      pushToast({
        kind: "warning",
        title: "날짜 형식 오류",
        description: "YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm 형식으로 입력하세요.",
      });
      return;
    }
    setDateError(null);
    setDeadlineCreating(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/deadlines`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDeadlineTitle.trim(),
          dueAt: iso,
          courtName: newDeadlineCourt.trim() || undefined,
          hearingKind: newDeadlineKind.trim() || undefined,
          clientVisible: true,
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "기일 등록에 실패했습니다.");
      pushToast({
        kind: "success",
        title: "기일 등록 완료",
        description: "의뢰인 포털에 표시되며 알림을 예약할 수 있습니다.",
      });
      setNewDeadlineTitle("");
      setNewDeadlineDueAt("");
      setNewDeadlineCourt("");
      setNewDeadlineKind("변론기일");
      setDeadlineFormOpen(false);
      await refresh();
    } catch (err) {
      pushToast({
        kind: "error",
        title: "기일 등록 실패",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeadlineCreating(false);
    }
  }, [
    canAct,
    caseId,
    newDeadlineCourt,
    newDeadlineDueAt,
    newDeadlineKind,
    newDeadlineTitle,
    pushToast,
    refresh,
  ]);

  const openDeadlines = data.deadlines.filter((d) => d.status === "OPEN");
  const headerBusy = refreshing || opsPending;

  return (
    <div className="space-y-6" data-testid="litigation-command-center">
      <header className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Litigation Command Center · Phase 14-C
            </p>
            <h1 className="mt-1 text-2xl font-bold text-indigo-950">{data.caseTitle}</h1>
            <p className="mt-2 text-sm text-indigo-900/80" data-testid="lcc-phase-label">
              {data.narrative.phaseLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/cases/${caseId}/intelligence-review`}
              className="inline-flex rounded-xl border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-800"
              data-testid="lcc-link-intelligence-review"
            >
              검토 콘솔
            </Link>
            {!readOnly ? (
              <button
                type="button"
                onClick={runOpsSync}
                disabled={headerBusy || isGlobalBusy}
                className="inline-flex rounded-xl bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                data-testid="lcc-ops-sync"
              >
                {opsPending ? "연동 중…" : "운영 연동 (13-H)"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={refresh}
              disabled={headerBusy || isGlobalBusy}
              className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              data-testid="lcc-refresh"
            >
              {refreshing ? "새로고침 중…" : "새로고침"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <AccessModeBanner readOnly={readOnly} actionsEnabled={data.actionsEnabled} />
        </div>

        <div
          className="mt-5 rounded-xl border border-indigo-100 bg-white/80 p-4"
          data-testid="lcc-narrative"
        >
          <p className="text-base font-semibold text-slate-900">
            이 사건은 {data.narrative.phaseLabel}입니다.
          </p>
          <p className="mt-2 text-sm text-slate-700">{data.narrative.headline}</p>
          {data.narrative.nextDeadlineText ? (
            <p className="mt-2 text-sm font-medium text-rose-800">
              {data.narrative.nextDeadlineText}
            </p>
          ) : null}
        </div>

        {dateError ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {dateError}
          </p>
        ) : null}
      </header>

      <Section
        title="최근 실행 작업"
        description="AuditLog와 동기화된 Command Center 액션 피드입니다."
        testId="lcc-section-action-feed"
      >
        {mergedFeed.length === 0 ? (
          <EmptyState message="아직 실행된 Command Center 작업이 없습니다." />
        ) : (
          <ul className="space-y-2">
            {mergedFeed.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                data-testid={`lcc-action-feed-${item.id}`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.occurredAt).toLocaleString("ko-KR")} · {item.auditAction}
                  </p>
                </div>
                <FeedOutcomeBadge item={item} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">사건 상태</p>
          <p className="mt-1 font-semibold text-slate-900">{data.caseStatusLabel}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">다음 마감</p>
          <p className="mt-1 font-semibold text-slate-900">
            {openDeadlines[0]?.title ?? "등록된 기일 없음"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">오늘 업무</p>
          <p className="mt-1 font-semibold text-slate-900">{data.todayTasks.length}건</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">검토 대기</p>
          <p className="mt-1 font-semibold text-amber-900">{data.reviewPendingCount}건</p>
        </div>
      </div>

      <Section
        title="오늘 해야 할 일"
        description={
          canAct
            ? "확정된 LitigationTask 중 미완료 항목입니다."
            : "미완료 업무 목록입니다. (열람 전용 — 상태 변경 불가)"
        }
        testId="lcc-section-today-tasks"
      >
        {data.todayTasks.length === 0 ? (
          <EmptyState message="미완료 업무가 없습니다." />
        ) : (
          <ul className="space-y-2">
            {data.todayTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                data-testid={`lcc-task-${task.id}`}
              >
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  {task.description ? (
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ConfirmedBadge />
                  <span className="text-xs text-slate-500">
                    {TASK_KIND_LABELS[task.taskKind] ?? task.taskKind} · {task.status}
                  </span>
                  {canAct && task.status !== "COMPLETED" ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      {task.status === "OPEN" ? (
                        <ActionButton
                          testId={`lcc-task-${task.id}-in-progress`}
                          loading={isPending(`task:${task.id}:IN_PROGRESS`)}
                          disabled={isGlobalBusy && !isPending(`task:${task.id}:IN_PROGRESS`)}
                          onClick={() => patchTask(task.id, "IN_PROGRESS", "업무 진행중")}
                        >
                          진행중
                        </ActionButton>
                      ) : null}
                      <ActionButton
                        testId={`lcc-task-${task.id}-complete`}
                        loading={isPending(`task:${task.id}:COMPLETED`)}
                        disabled={isGlobalBusy && !isPending(`task:${task.id}:COMPLETED`)}
                        onClick={() => patchTask(task.id, "COMPLETED", "업무 완료")}
                      >
                        완료
                      </ActionButton>
                    </div>
                  ) : !canAct && task.status !== "COMPLETED" ? (
                    <span className="text-xs text-slate-400">열람 전용</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="기일 · 마감" testId="lcc-section-deadlines">
        {canAct ? (
          <div className="mb-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
            {deadlineFormOpen ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">재판기일 · 마감 직접 등록</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs text-slate-600">
                    제목
                    <input
                      type="text"
                      value={newDeadlineTitle}
                      onChange={(e) => setNewDeadlineTitle(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="예: 변론기일"
                      data-testid="lcc-deadline-create-title"
                    />
                  </label>
                  <label className="block text-xs text-slate-600">
                    일시 (YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm)
                    <input
                      type="text"
                      value={newDeadlineDueAt}
                      onChange={(e) => setNewDeadlineDueAt(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="2026-06-15T10:30"
                      data-testid="lcc-deadline-create-due-at"
                    />
                  </label>
                  <label className="block text-xs text-slate-600">
                    법원
                    <input
                      type="text"
                      value={newDeadlineCourt}
                      onChange={(e) => setNewDeadlineCourt(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="서울중앙지방법원"
                      data-testid="lcc-deadline-create-court"
                    />
                  </label>
                  <label className="block text-xs text-slate-600">
                    기일 종류
                    <input
                      type="text"
                      value={newDeadlineKind}
                      onChange={(e) => setNewDeadlineKind(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="변론기일"
                      data-testid="lcc-deadline-create-kind"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    testId="lcc-deadline-create-submit"
                    loading={deadlineCreating}
                    disabled={isGlobalBusy && !deadlineCreating}
                    onClick={() => void createManualDeadline()}
                  >
                    기일 등록
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    disabled={deadlineCreating}
                    onClick={() => setDeadlineFormOpen(false)}
                  >
                    취소
                  </ActionButton>
                </div>
              </div>
            ) : (
              <ActionButton
                testId="lcc-deadline-create-open"
                onClick={() => setDeadlineFormOpen(true)}
              >
                기일 등록
              </ActionButton>
            )}
          </div>
        ) : null}
        {data.deadlines.length === 0 ? (
          <EmptyState message="등록된 기일·마감이 없습니다. 기일 등록 또는 13-G 검토 후 운영 연동을 실행하세요." />
        ) : (
          <ul className="space-y-2">
            {data.deadlines.map((deadline) => (
              <li
                key={deadline.id}
                className="flex items-start justify-between gap-3 rounded-xl border px-4 py-3"
                data-testid={`lcc-deadline-${deadline.id}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{deadline.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {deadline.dueAt
                      ? new Date(deadline.dueAt).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : deadline.candidateDueText ?? "기한 미확정"}
                  </p>
                  {deadline.description ? (
                    <p className="mt-1 text-xs text-slate-500">{deadline.description}</p>
                  ) : null}
                  <CommandCenterDeadlineRow
                    caseId={caseId}
                    deadline={deadline}
                    canAct={canAct}
                    onDone={refresh}
                    isGlobalBusy={isGlobalBusy}
                    isPending={isPending}
                  />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ConfirmedBadge />
                  {deadline.daysUntilDue !== null && deadline.daysUntilDue !== undefined ? (
                    <span className="text-xs font-medium text-rose-700">
                      D{deadline.daysUntilDue >= 0 ? "-" : "+"}
                      {Math.abs(deadline.daysUntilDue)}
                    </span>
                  ) : null}
                  {canAct && deadline.status === "OPEN" ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      <ActionButton
                        testId={`lcc-deadline-${deadline.id}-complete`}
                        loading={isPending(
                          `deadline:${deadline.id}:${JSON.stringify({ status: "COMPLETED" })}`,
                        )}
                        disabled={
                          isGlobalBusy &&
                          !isPending(
                            `deadline:${deadline.id}:${JSON.stringify({ status: "COMPLETED" })}`,
                          )
                        }
                        onClick={() =>
                          patchDeadline(deadline.id, { status: "COMPLETED" }, "기일 완료")
                        }
                      >
                        완료
                      </ActionButton>
                      <ActionButton
                        variant="ghost"
                        testId={`lcc-deadline-${deadline.id}-postpone`}
                        loading={isPending(
                          `deadline:${deadline.id}:${JSON.stringify({ dueAt: deadline.dueAt })}`,
                        )}
                        disabled={isGlobalBusy}
                        onClick={() => {
                          const raw = globalThis.prompt(
                            "연기할 날짜(YYYY-MM-DD)를 입력하세요.",
                            deadline.dueAt
                              ? new Date(deadline.dueAt).toISOString().slice(0, 10)
                              : "",
                          );
                          if (raw === null) return;
                          const iso = toIsoDateTime(raw);
                          if (!iso) {
                            setDateError(
                              "날짜 형식이 올바르지 않습니다. YYYY-MM-DD로 입력하세요.",
                            );
                            pushToast({
                              kind: "warning",
                              title: "날짜 형식 오류",
                              description: "YYYY-MM-DD 형식으로 입력하세요.",
                            });
                            return;
                          }
                          setDateError(null);
                          patchDeadline(deadline.id, { dueAt: iso }, "기일 연기");
                        }}
                      >
                        연기
                      </ActionButton>
                      <ActionButton
                        variant="ghost"
                        testId={`lcc-deadline-${deadline.id}-memo`}
                        disabled={isGlobalBusy}
                        onClick={() => {
                          const memo = globalThis.prompt(
                            "기일·마감 메모를 입력하세요.",
                            deadline.description ?? "",
                          );
                          if (memo === null) return;
                          patchDeadline(deadline.id, { memo }, "기일 메모 저장");
                        }}
                      >
                        메모
                      </ActionButton>
                    </div>
                  ) : !canAct && deadline.status === "OPEN" ? (
                    <span className="text-xs text-slate-400">열람 전용</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="상대방 서면"
        description="13-E 분석 완료 문서 · AI 후보는 검토 콘솔에서 확정하세요."
        testId="lcc-section-opponent-briefs"
      >
        {data.opponentBriefs.length === 0 ? (
          <EmptyState message="상대방 서면 분석 결과가 없습니다." />
        ) : (
          <ul className="space-y-3">
            {data.opponentBriefs.map((brief) => (
              <li key={brief.fileId} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{brief.fileName}</p>
                  <AiCandidateBadge />
                </div>
                {brief.badgeSummaryLine ? (
                  <p className="mt-2 text-sm text-slate-700">{brief.badgeSummaryLine}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">분석 상태: {brief.analysisStatus}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  반박 쟁점 {brief.rebuttalIssuesCount}건 · 확정 {brief.confirmedRebuttalCount}건
                </p>
                <Link
                  href={`/cases/${caseId}/intelligence-review`}
                  className="mt-3 inline-flex text-sm font-medium text-indigo-700 underline"
                  data-testid={`lcc-opponent-brief-review-${brief.fileId}`}
                >
                  Review Console에서 검토 →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="증거 매핑" testId="lcc-section-evidence-mapping">
        {!data.evidenceMapping ? (
          <EmptyState message="증거 매핑(13-F) 결과가 없습니다." />
        ) : (
          <div className="space-y-3 text-sm text-slate-700">
            {data.evidenceMapping.summaryLine ? (
              <p className="font-medium">{data.evidenceMapping.summaryLine}</p>
            ) : null}
            <p>
              주장-증거 연결 {data.evidenceMapping.claimEvidenceLinksCount}건 · 미지원 주장{" "}
              {data.evidenceMapping.unsupportedClaimsCount}건 · 충돌{" "}
              {data.evidenceMapping.contradictedClaimsCount}건
            </p>
            <p className="text-xs text-amber-800">
              AI 후보 항목 — downstream 실행 전 변호사 검토가 필요합니다.
            </p>
            {data.evidenceMappingPendingItems.length > 0 ? (
              <ul className="space-y-2" data-testid="lcc-evidence-pending-list">
                {data.evidenceMappingPendingItems.slice(0, 6).map((item) => (
                  <li
                    key={item.itemId}
                    className="flex items-start justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                    data-testid={`lcc-evidence-pending-${item.itemId}`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.displayText}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.itemKind} · {item.reviewStatus}
                      </p>
                    </div>
                    <Link
                      href={`/cases/${caseId}/intelligence-review`}
                      className="shrink-0 text-xs font-medium text-indigo-700 underline"
                      data-testid={`lcc-evidence-pending-review-${item.itemId}`}
                    >
                      검토 결정 →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </Section>

      <Section
        title="변호사 검토 필요"
        description="13-G review queue 잔여 항목 · 확정 전 downstream 버튼 비활성."
        testId="lcc-section-review-pending"
      >
        {data.reviewPendingItems.length === 0 ? (
          <EmptyState message="검토 대기 항목이 없습니다." />
        ) : (
          <ul className="space-y-2">
            {data.reviewPendingItems.slice(0, 8).map((item) => (
              <li
                key={item.itemId}
                className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                data-testid={`lcc-review-pending-${item.itemId}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{item.displayText}</p>
                  <AiCandidateBadge />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.sourcePhase} · {item.itemCategory}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/cases/${caseId}/intelligence-review`}
          className="mt-3 inline-flex text-sm font-medium text-indigo-700 underline"
        >
          검토 콘솔에서 전체 보기 →
        </Link>
      </Section>

      <Section
        title="사건 대화"
        description="채팅 메시지·첨부는 13-G Review Gate 확정 전까지 확정 사건자료가 아닙니다."
        testId="lcc-section-conversation"
      >
        {data.conversationMessages.length === 0 ? (
          <EmptyState message="사건 대화 메시지가 없습니다." />
        ) : (
          <ul className="space-y-3">
            {data.conversationMessages.map((message) => (
              <CommandCenterConversationRow
                key={message.id}
                caseId={caseId}
                message={message}
                canAct={!readOnly && data.actionsEnabled}
                onDone={refresh}
              />
            ))}
          </ul>
        )}
        <Link
          href={`/cases/${caseId}/intelligence-review`}
          className="mt-3 inline-flex text-sm font-medium text-indigo-700 underline"
          data-testid="lcc-link-conversation-review-queue"
        >
          Review Queue(13-G)에서 확정하기 →
        </Link>
      </Section>

      <Section title="운영 연동 결과 (13-H)" testId="lcc-section-operations">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{data.operations.deadlineCount}</p>
            <p className="text-xs text-slate-600">기일</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{data.operations.taskCount}</p>
            <p className="text-xs text-slate-600">업무</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {data.operations.supplementDraftCount}
            </p>
            <p className="text-xs text-slate-600">보완 초안</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {data.operations.draftContextCount}
            </p>
            <p className="text-xs text-slate-600">서면 컨텍스트</p>
          </div>
        </div>
      </Section>

      <Section title="의뢰인 제출자료" testId="lcc-section-client-submissions">
        <div className="mb-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-900">
            도착 {data.clientSubmissionPendingCount}건
          </span>
          {data.caseUnreadMessageCount > 0 ? (
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-900">
              채팅 미확인 {data.caseUnreadMessageCount}건
            </span>
          ) : null}
        </div>
        {data.clientSubmissions.length === 0 ? (
          <EmptyState message="검토 대기 중인 의뢰인 제출 자료가 없습니다." />
        ) : (
          <ul className="space-y-2">
            {data.clientSubmissions.map((sub) => (
              <ClientSubmissionReviewRow
                key={sub.id}
                caseId={caseId}
                submission={sub}
                canAct={canAct}
                onDone={refresh}
              />
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-500">
          제출 자료는 채택(ACCEPTED) 전까지 확정 사건자료가 아닙니다. 수신 시 Document
          Intelligence extract가 큐됩니다.
        </p>
      </Section>

      <CommandCenterSharedDocumentSection
        caseId={caseId}
        data={data}
        canAct={canAct}
        onDone={refresh}
      />

      <Section
        title="Legal Reliability Action Execution"
        description="Phase 50-E — SLA·응답·증거·검토·downstream 집계 대시보드"
        testId="lcc-section-action-operations-dashboard-wrapper"
      >
        <LegalReliabilityActionOperationsDashboardPanel
          summary={data.actionOperationsDashboard}
        />
      </Section>

      <Section
        title="Legal Reliability Action Operations"
        description="Phase 49에서 변호사가 승인한 보완·증거요청 액션의 운영 큐"
        testId="lcc-section-action-operations-wrapper"
      >
        <LegalReliabilityActionOperationsPanel
          caseId={caseId}
          operations={data.actionOperations}
          currentUserId={currentUserId}
          canAct={canAct}
          onDone={refresh}
        />
      </Section>

      <Section title="보완요청" testId="lcc-section-supplements">
        {data.supplements.length === 0 ? (
          <EmptyState message="보완요청이 없습니다." />
        ) : (
          <ul className="space-y-2">
            {data.supplements.map((sup) => (
              <li
                key={sup.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                data-testid={`lcc-supplement-${sup.id}`}
              >
                <div>
                  <p className="font-medium text-slate-900">{sup.title}</p>
                  <p className="text-xs text-slate-500">{sup.status}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {sup.isDraft ? (
                    <span className="text-xs font-medium text-purple-700">DRAFT</span>
                  ) : sup.awaitingReview ? (
                    <span className="text-xs font-medium text-emerald-700">의뢰인 응답 도착</span>
                  ) : sup.awaitingClient ? (
                    <span className="text-xs font-medium text-amber-700">의뢰인 확인 대기</span>
                  ) : sup.needsMoreInfo ? (
                    <span className="text-xs font-medium text-orange-700">추가 보완 필요</span>
                  ) : (
                    <ConfirmedBadge />
                  )}
                  {canAct && sup.isDraft ? (
                    <ActionButton
                      testId={`lcc-supplement-${sup.id}-send`}
                      loading={isPending(`supplement:${sup.id}:send`)}
                      disabled={isGlobalBusy && !isPending(`supplement:${sup.id}:send`)}
                      onClick={() => sendSupplement(sup.id)}
                    >
                      발송
                    </ActionButton>
                  ) : canAct && sup.awaitingReview ? (
                    <ActionButton
                      testId={`lcc-supplement-${sup.id}-review`}
                      loading={isPending(`supplement:${sup.id}:review`)}
                      disabled={isGlobalBusy && !isPending(`supplement:${sup.id}:review`)}
                      onClick={() => startSupplementReview(sup.id)}
                    >
                      재검토 시작
                    </ActionButton>
                  ) : !canAct && (sup.isDraft || sup.awaitingReview) ? (
                    <span className="text-xs text-slate-400">열람 전용</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/cases/${caseId}/supplement`}
          className="mt-3 inline-flex text-sm font-medium text-indigo-700 underline"
        >
          보완 허브 →
        </Link>
      </Section>

      <Section title="준비서면 컨텍스트" testId="lcc-section-draft-contexts">
        {data.draftContexts.length === 0 ? (
          <EmptyState message="확정된 준비서면 draft context가 없습니다." />
        ) : (
          <ul className="space-y-2">
            {data.draftContexts.map((ctx) => (
              <li
                key={ctx.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                data-testid={`lcc-draft-context-${ctx.id}`}
              >
                <div>
                  <p className="font-medium text-slate-900">{ctx.title}</p>
                  <p className="text-xs text-slate-500">
                    reviewDecision {ctx.reviewDecisionIds.length}건 · {ctx.status}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ConfirmedBadge />
                  {canAct && ctx.status === "DRAFT" ? (
                    <ActionButton
                      testId={`lcc-draft-context-${ctx.id}-generate`}
                      loading={isPending(`draft:${ctx.id}:generate`)}
                      disabled={isGlobalBusy && !isPending(`draft:${ctx.id}:generate`)}
                      onClick={() => generateDraft(ctx.id)}
                    >
                      초안 생성
                    </ActionButton>
                  ) : !canAct && ctx.status === "DRAFT" ? (
                    <span className="text-xs text-slate-400">열람 전용</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
