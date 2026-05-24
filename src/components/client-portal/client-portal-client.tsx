"use client";

/**
 * Phase 15-A — Client-Lawyer Collaboration Portal (client shell).
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SupplementRequestStatusBadge } from "@/components/supplement-requests/supplement-request-status-badge";
import { canClientRespondToSupplement } from "@/features/supplement-request/supplement-request.portal";
import type { SupplementRequestStatus } from "@prisma/client";
import type { ClientPortalCaseSummary } from "@/features/client-portal/client-portal.schema";
import type { ClientPortalMobileTabKey } from "@/features/client-portal/client-portal-mobile.policy";
import { requireOkData } from "@/lib/client/api-error";
import { ClientMobileBottomNav } from "@/components/client-portal/client-mobile-bottom-nav";
import { ClientMobileUploadPanel } from "@/components/client-portal/client-mobile-upload-panel";
import { useClientPortalMobileUploadQueue } from "@/hooks/use-client-portal-mobile-upload-queue";
import { saveClientPortalLastVisit } from "@/features/client-portal/client-portal-pwa.policy";

export const CLIENT_PORTAL_CLIENT_MARKER_PHASE15A =
  "phase15a-client-lawyer-collaboration-portal-client" as const;

export const CLIENT_PORTAL_CLIENT_MOBILE_MARKER_PHASE21A =
  "phase21a-client-portal-mobile-shell" as const;

export const CLIENT_PORTAL_CLIENT_MOBILE_UPLOAD_MARKER_PHASE21B =
  "phase21b-client-portal-mobile-upload-shell" as const;

export const CLIENT_PORTAL_CLIENT_PWA_MARKER_PHASE21C =
  "phase21c-client-portal-pwa-restore-shell" as const;

type TabKey = ClientPortalMobileTabKey;

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "supplements", label: "요청사항" },
  { key: "uploads", label: "자료 제출" },
  { key: "shared", label: "공유 문서" },
  { key: "chat", label: "사건 대화" },
  { key: "deadlines", label: "기일·마감" },
  { key: "history", label: "제출 이력" },
];
type SupplementItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueAt?: string | null;
  requestType?: string;
};

type SubmissionItem = {
  id: string;
  status: string;
  message?: string | null;
  submittedAt?: string | null;
  files: Array<{ originalFileName: string; pipelineLabel: string }>;
};

type SharedDoc = {
  id: string;
  title: string;
  sharedAt: string;
  expiresAt?: string | null;
  firstViewedAt?: string | null;
};

type SharedDocDetail = SharedDoc & {
  previewText?: string | null;
  notice?: string;
};

type ChatMessage = {
  id: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

type DeadlineItem = {
  id: string;
  title: string;
  dueAt: string | null;
  displayLine: string;
  isNext: boolean;
};

type Props = {
  caseId: string;
  initialTab?: TabKey;
  initialShareId?: string | null;
};

export function ClientPortalClient({ caseId, initialTab, initialShareId }: Props) {
  const [tab, setTab] = useState<TabKey>(initialTab ?? "supplements");
  const [summary, setSummary] = useState<ClientPortalCaseSummary | null>(null);
  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSupplementId, setSelectedSupplementId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [freeUploadMessage, setFreeUploadMessage] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatAttachmentIds, setChatAttachmentIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingShareId, setViewingShareId] = useState<string | null>(null);
  const [shareDetail, setShareDetail] = useState<SharedDocDetail | null>(null);
  const [shareViewPending, setShareViewPending] = useState(false);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [deadlineNotice, setDeadlineNotice] = useState<string | null>(null);
  const deepLinkShareHandled = useRef(false);

  const submissionUploadQueue = useClientPortalMobileUploadQueue({
    caseId,
    onFileUploaded: (fileId) => {
      setUploadedFileIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    },
  });

  const chatUploadQueue = useClientPortalMobileUploadQueue({
    caseId,
    onFileUploaded: (fileId) => {
      setChatAttachmentIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    },
  });

  const selectedSupplement = useMemo(
    () => supplements.find((item) => item.id === selectedSupplementId) ?? supplements[0] ?? null,
    [supplements, selectedSupplementId],
  );

  const canRespondSelected =
    selectedSupplement !== null &&
    canClientRespondToSupplement(selectedSupplement.status as SupplementRequestStatus);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [summaryRes, supplementRes, submissionRes, sharedRes, messageRes, deadlineRes] =
        await Promise.all([
        fetch(`/api/client/cases/${caseId}`, { credentials: "include", cache: "no-store" }),
        fetch(`/api/client/cases/${caseId}/supplement-requests`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/client/cases/${caseId}/submissions`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/client/cases/${caseId}/shared-documents`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/client/cases/${caseId}/messages`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/client/cases/${caseId}/deadlines`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const summaryRaw = await summaryRes.json().catch(() => null);
      const supplementRaw = await supplementRes.json().catch(() => null);
      const submissionRaw = await submissionRes.json().catch(() => null);
      const sharedRaw = await sharedRes.json().catch(() => null);
      const messageRaw = await messageRes.json().catch(() => null);
      const deadlineRaw = await deadlineRes.json().catch(() => null);

      setSummary(requireOkData(summaryRes, summaryRaw, "포털 정보를 불러오지 못했습니다."));
      const supplementData = requireOkData<{ items?: SupplementItem[] }>(
        supplementRes,
        supplementRaw,
        "보완요청을 불러오지 못했습니다.",
      );
      setSupplements(supplementData.items ?? []);
      const submissionData = requireOkData<{ items?: SubmissionItem[] }>(
        submissionRes,
        submissionRaw,
        "제출 이력을 불러오지 못했습니다.",
      );
      setSubmissions(submissionData.items ?? []);
      const sharedData = requireOkData<{ items?: SharedDoc[] }>(
        sharedRes,
        sharedRaw,
        "공유 자료를 불러오지 못했습니다.",
      );
      setSharedDocs(sharedData.items ?? []);
      const messageData = requireOkData<{ items?: ChatMessage[] }>(
        messageRes,
        messageRaw,
        "메시지를 불러오지 못했습니다.",
      );
      setMessages(messageData.items ?? []);
      const deadlineData = requireOkData<{
        deadlines?: DeadlineItem[];
        notice?: string;
      }>(deadlineRes, deadlineRaw, "기일 정보를 불러오지 못했습니다.");
      setDeadlines(deadlineData.deadlines ?? []);
      setDeadlineNotice(deadlineData.notice ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    saveClientPortalLastVisit({ caseId, tab });
  }, [caseId, tab]);

  async function openSharedDocument(shareId: string) {
    setShareViewPending(true);
    setViewingShareId(shareId);
    try {
      const markRes = await fetch(
        `/api/client/cases/${caseId}/shared-documents/${shareId}/mark-viewed`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      await markRes.json().catch(() => null);
      const detailRes = await fetch(`/api/client/cases/${caseId}/shared-documents/${shareId}`, {
        credentials: "include",
      });
      const raw = await detailRes.json().catch(() => null);
      const detail = requireOkData<SharedDocDetail>(
        detailRes,
        raw,
        "공유 문서를 열람하지 못했습니다.",
      );
      setShareDetail(detail);
      await refreshAll();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "공유 문서 열람에 실패했습니다.");
      setViewingShareId(null);
      setShareDetail(null);
    } finally {
      setShareViewPending(false);
    }
  }

  async function handleSupplementSubmit() {
    if (!selectedSupplement) return;
    if (submissionUploadQueue.hasActiveUploads) {
      setMessage("파일 업로드가 끝난 뒤 제출해 주세요.");
      return;
    }
    if (!responseText.trim()) {
      setMessage("보완 설명을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(
        `/api/client/cases/${caseId}/supplement-requests/${selectedSupplement.id}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: responseText,
            litigationFileIds: uploadedFileIds,
          }),
        },
      );
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "보완 제출에 실패했습니다.");
      setResponseText("");
      setUploadedFileIds([]);
      submissionUploadQueue.clearSuccessful();
      await refreshAll();
      setTab("history");
      setMessage("보완 자료 제출이 완료되었습니다. 제출 이력에서 확인할 수 있습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "제출 실패");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFreeUploadSubmit() {
    if (submissionUploadQueue.hasActiveUploads) {
      setMessage("파일 업로드가 끝난 뒤 제출해 주세요.");
      return;
    }
    if (uploadedFileIds.length === 0) {
      setMessage("제출할 파일을 업로드해 주세요.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/client/cases/${caseId}/submissions/free-upload`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: freeUploadMessage.trim() || undefined,
          litigationFileIds: uploadedFileIds,
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "자료 제출에 실패했습니다.");
      setFreeUploadMessage("");
      setUploadedFileIds([]);
      submissionUploadQueue.clearSuccessful();
      await refreshAll();
      setTab("history");
      setMessage("자료 제출이 완료되었습니다. 제출 이력에서 확인할 수 있습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "제출 실패");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendChat() {
    if (!chatText.trim() && chatAttachmentIds.length === 0) return;
    if (chatUploadQueue.hasActiveUploads) {
      setMessage("첨부 파일 업로드가 끝난 뒤 메시지를 보내 주세요.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch(`/api/client/cases/${caseId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: chatText.trim() || "(첨부 파일)",
          attachmentIds: chatAttachmentIds,
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "메시지 전송에 실패했습니다.");
      setChatText("");
      setChatAttachmentIds([]);
      chatUploadQueue.clearSuccessful();
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "메시지 전송 실패");
    }
  }

  const submissionBusy = submitting || submissionUploadQueue.hasActiveUploads;
  const chatBusy = chatUploadQueue.hasActiveUploads;

  return (
    <div className="space-y-6" data-testid="client-portal">
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Phase 21-A · Mobile Client Portal
            </p>
            <h1 className="mt-1 text-2xl font-black text-indigo-950">
              {summary?.title ?? "의뢰인 포털"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-indigo-900/80">
              {summary?.phaseLabel ?? "사건 진행"} · {summary?.nextActionLabel}
            </p>
            {summary?.nextCourtDeadlineDisplay ? (
              <div
                className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3"
                data-testid="client-portal-next-court-deadline"
              >
                <p className="text-xs font-semibold text-sky-900">다음 재판기일</p>
                <p className="mt-1 text-sm font-medium text-sky-950">
                  {summary.nextCourtDeadlineDisplay}
                </p>
                <p className="mt-2 text-xs leading-5 text-sky-900/80">
                  기일 전 준비자료가 필요한 경우 변호사가 별도 요청할 수 있습니다.
                </p>
              </div>
            ) : null}
          </div>
          <aside
            className="rounded-xl border border-indigo-200 bg-white p-4 text-sm text-indigo-950"
            data-testid="client-portal-guide-character"
          >
            <p className="font-bold">법친이 안내</p>
            <p className="mt-1 leading-6 text-indigo-900/85">
              보완요청함에서 요청별로 파일과 설명을 제출하세요. 제출 자료는 변호사 검토 후
              사건자료로 편입됩니다. 채팅 내용은 자동으로 확정 사실이 되지 않습니다.
            </p>
          </aside>
        </div>
      </section>

      {message ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {message}
        </div>
      ) : null}

      <nav className="hidden flex-wrap gap-2 md:flex">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === item.key
                ? "bg-indigo-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
            data-testid={`client-portal-tab-${item.key}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="text-sm text-slate-500">불러오는 중…</p>
      ) : null}

      {summary ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="보완요청 대기" value={summary.pendingSupplementCount} />
          <StatCard label="제출 검토 중" value={summary.pendingSubmissionCount} />
          <StatCard label="미읽은 메시지" value={summary.unreadMessageCount} />
          <StatCard label="공유 문서" value={summary.sharedDocumentCount} />
        </section>
      ) : null}

      {tab !== "history" ? (
        <p className="md:hidden">
          <button
            type="button"
            onClick={() => setTab("history")}
            className="text-xs font-semibold text-indigo-800 underline"
            data-testid="client-portal-mobile-history-link"
          >
            제출 이력 보기
          </button>
        </p>
      ) : null}

      {tab === "supplements" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">요청사항</h2>
            <ul className="mt-4 space-y-3">
              {supplements.length === 0 ? (
                <li className="text-sm text-slate-500">받은 보완요청이 없습니다.</li>
              ) : (
                supplements.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedSupplementId(item.id)}
                      className={[
                        "w-full rounded-xl border p-4 text-left",
                        selectedSupplement?.id === item.id
                          ? "border-indigo-500 bg-indigo-50/40"
                          : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.requestType}</p>
                        </div>
                        <SupplementRequestStatusBadge status={item.status} />
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">요청별 제출</h2>
            {selectedSupplement ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm">
                  <p className="font-semibold text-amber-950">변호사가 추가 자료를 요청했습니다.</p>
                  <p className="mt-2 whitespace-pre-wrap leading-6 text-amber-900">
                    {selectedSupplement.description}
                  </p>
                </div>
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  공유 범위: 담당 변호사·스태프에게 공유됩니다. 제출 전까지 확정 사건자료가
                  아닙니다.
                </p>
                {canRespondSelected ? (
                  <>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={5}
                      placeholder="간단한 설명 작성"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                    <ClientMobileUploadPanel
                      queue={submissionUploadQueue}
                      disabled={submitting}
                      testId="client-portal-supplement-upload"
                      heading="보완요청 증거자료"
                    />
                    {uploadedFileIds.length > 0 ? (
                      <p className="text-xs text-emerald-700">
                        제출 대기 {uploadedFileIds.length}건 (제출 완료 시 변호사에게 전달)
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={submissionBusy}
                      onClick={() => void handleSupplementSubmit()}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      data-testid="client-portal-supplement-submit"
                    >
                      {submitting ? "제출 중…" : "제출 완료"}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">현재 상태에서는 추가 제출이 필요하지 않습니다.</p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">보완요청을 선택하세요.</p>
            )}
          </section>
        </div>
      ) : null}

      {tab === "uploads" ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm" data-testid="client-portal-free-upload">
          <h2 className="text-lg font-bold">자료 제출 (사건 단위)</h2>
          <p className="mt-2 text-sm text-slate-600">
            보완요청 없이도 사건 관련 자료를 제출할 수 있습니다. 업로드 파일은 Document
            Intelligence(13-B~13-I) 파이프라인으로 연결되며, 변호사 채택 전까지 확정
            사건자료가 아닙니다.
          </p>
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            공유 범위: 담당 변호사·스태프
          </p>
          <textarea
            value={freeUploadMessage}
            onChange={(e) => setFreeUploadMessage(e.target.value)}
            rows={4}
            placeholder="이 자료가 무엇인지 설명해 주세요."
            className="mt-4 w-full rounded-xl border px-3 py-2 text-sm"
          />
          <ClientMobileUploadPanel
            queue={submissionUploadQueue}
            disabled={submitting}
            testId="client-portal-free-upload-panel"
            heading="사건 증거자료 업로드"
          />
          {uploadedFileIds.length > 0 ? (
            <p className="mt-2 text-xs text-emerald-700">
              제출 대기 {uploadedFileIds.length}건
            </p>
          ) : null}
          <button
            type="button"
            disabled={submissionBusy || uploadedFileIds.length === 0}
            onClick={() => void handleFreeUploadSubmit()}
            className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "제출 중…" : "제출 완료"}
          </button>
        </section>
      ) : null}

      {tab === "shared" ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">공유 자료함</h2>
          <p className="mt-1 text-xs text-slate-500">
            변호사가 공유한 문서는 로그인 후에만 열람됩니다. 카카오 등 외부 메시지에는 파일 원본이
            포함되지 않습니다.
          </p>
          <ul className="mt-4 space-y-2">
            {sharedDocs.length === 0 ? (
              <li className="text-sm text-slate-500">공유된 문서가 없습니다.</li>
            ) : (
              sharedDocs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(doc.sharedAt).toLocaleString("ko-KR")}
                      {doc.firstViewedAt ? " · 열람함" : " · 미열람"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    data-testid={`client-portal-shared-open-${doc.id}`}
                    disabled={shareViewPending && viewingShareId === doc.id}
                    onClick={() => void openSharedDocument(doc.id)}
                  >
                    {shareViewPending && viewingShareId === doc.id ? "열람 중…" : "보안 열람"}
                  </button>
                </li>
              ))
            )}
          </ul>
          {shareDetail && viewingShareId ? (
            <div
              className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"
              data-testid="client-portal-shared-detail"
            >
              <p className="font-semibold text-slate-900">{shareDetail.title}</p>
              {shareDetail.notice ? (
                <p className="mt-1 text-xs text-slate-600">{shareDetail.notice}</p>
              ) : null}
              {shareDetail.previewText ? (
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-slate-800">
                  {shareDetail.previewText}
                </pre>
              ) : (
                <p className="mt-3 text-sm text-slate-600">미리보기 텍스트가 없습니다.</p>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "chat" ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">사건 대화</h2>
          <p className="mt-1 text-xs text-slate-500">
            채팅 메시지는 법률 판단의 확정자료가 아닙니다. 변호사가 별도로 채택해야 합니다.
          </p>
          <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto">
            {messages.map((msg) => (
              <li key={msg.id} className="rounded-xl border px-3 py-2 text-sm">
                <p className="font-semibold">
                  {msg.senderName}{" "}
                  <span className="text-xs font-normal text-slate-500">{msg.senderRole}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap">{msg.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="변호사에게 메시지 작성"
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void handleSendChat()}
              disabled={chatBusy}
              className="rounded-xl bg-indigo-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              전송
            </button>
          </div>
          <div className="mt-4">
            <ClientMobileUploadPanel
              queue={chatUploadQueue}
              testId="client-portal-chat-upload"
              heading="대화 첨부"
            />
          </div>
          {chatAttachmentIds.length > 0 ? (
            <p className="mt-2 text-xs text-emerald-700">첨부 준비 {chatAttachmentIds.length}건</p>
          ) : null}
        </section>
      ) : null}

      {tab === "deadlines" ? (
        <section
          className="rounded-2xl border bg-white p-5 shadow-sm"
          data-testid="client-portal-deadlines"
        >
          <h2 className="text-lg font-bold">기일·마감</h2>
          {deadlineNotice ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{deadlineNotice}</p>
          ) : null}
          <ul className="mt-4 space-y-3">
            {deadlines.length === 0 ? (
              <li className="text-sm text-slate-500">등록된 기일이 없습니다.</li>
            ) : (
              deadlines.map((item) => (
                <li
                  key={item.id}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm",
                    item.isNext ? "border-sky-300 bg-sky-50" : "border-slate-200",
                  ].join(" ")}
                  data-testid={`client-portal-deadline-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    {item.isNext ? (
                      <span className="rounded-full bg-sky-200 px-2 py-0.5 text-[11px] font-semibold text-sky-950">
                        다음
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 leading-6 text-slate-700">{item.displayLine}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "history" ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">제출 이력</h2>
          <ul className="mt-4 space-y-3">
            {submissions.length === 0 ? (
              <li className="text-sm text-slate-500">제출 이력이 없습니다.</li>
            ) : (
              submissions.map((item) => (
                <li key={item.id} className="rounded-xl border px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.status}</p>
                    <p className="text-xs text-slate-500">
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleString("ko-KR")
                        : "-"}
                    </p>
                  </div>
                  {item.message ? (
                    <p className="mt-2 whitespace-pre-wrap text-slate-700">{item.message}</p>
                  ) : null}
                  {item.files.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {item.files.map((file, index) => (
                        <li key={`${item.id}-${index}`}>
                          {file.originalFileName} · {file.pipelineLabel}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      <p className="text-center text-xs text-slate-500">
        <Link href="/client/cases" className="underline">
          다른 사건 포털
        </Link>
        {" · "}
        <Link href={`/cases/${caseId}`} className="underline">
          사건 상세
        </Link>
      </p>

      <ClientMobileBottomNav activeTab={tab} onSelect={setTab} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}
