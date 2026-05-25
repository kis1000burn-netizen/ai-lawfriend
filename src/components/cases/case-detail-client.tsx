"use client";
/* [FILE-012] 상태 라벨·`getAllowedCaseActions`·전이는 서버 DTO·Batch A와 정합; 직접 `status` PATCH 없음. */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CASE_STATUS_LABELS,
  DOCUMENT_STATUS_LABELS,
  INTERVIEW_STATUS_LABELS,
} from "@/lib/definitions";
import { computeCaseFacts } from "@/lib/case-facts";
import { getAllowedCaseActions } from "@/lib/case-action-guard";
import { CaseStatusCard } from "@/components/cases/case-status-card";
import { CaseStatusActions } from "@/components/cases/case-status-actions";
import { DocumentCreateModal } from "@/components/cases/document-create-modal";
import { DocumentReviewPanel } from "@/components/cases/document-review-panel";
import { VoiceDocumentFinalizeGatePanel } from "@/components/cases/voice-document-finalize-gate-panel";
import { ParagraphStructurePanel } from "@/components/cases/paragraph-structure-panel";
import { TimelinePanel } from "@/components/cases/timeline-panel";
import { CaseSummaryPanel } from "@/components/cases/case-summary-panel";
import { ClientDisclosureDeliveryPanel } from "@/components/cases/client-disclosure-delivery-panel";
import { ClientSupplementTrackingPanel } from "@/components/supplement-requests/client-supplement-tracking-panel";
import { CasePackageShareSettingsPanel } from "@/components/case-package/case-package-share-settings-panel";
import type { SerializedCaseDetail } from "@/lib/cases/case-detail-serialize";
import {
  requireOkData,
  readJsonApiErrorMessage,
  readVoiceDocumentFinalizeBlockedFromJson,
} from "@/lib/client/api-error";
import { postDocumentDelivery } from "@/lib/client/post-document-delivery";
import {
  caseDetailHubReturnHref,
  supplementHubHref,
  supplementHubLinkTitle,
} from "@/features/cases/case.utils";
import type { UiFourPanelRole } from "@/lib/role-map";
import type { VoiceDocumentFinalizeGateUiSnapshot } from "@/lib/voice/voice-document-finalize-gate-ui";
import { shouldShowVoiceDocumentFinalizeGatePanel } from "@/lib/voice/voice-document-finalize-gate-ui";

type CaseDetailClientProps = {
  caseRecord: SerializedCaseDetail;
  currentUser: {
    id: string;
    role: UiFourPanelRole;
  };
  voiceDocumentFinalizeGateSnapshot?: VoiceDocumentFinalizeGateUiSnapshot | null;
};

function needsStatusReason(action: string) {
  return ["PUT_ON_HOLD", "REJECT_CASE", "REOPEN_CASE"].includes(action);
}

function resolveStatusReason(action: string, reason?: string) {
  if (!needsStatusReason(action)) {
    return reason ?? null;
  }

  if (reason?.trim()) {
    return reason;
  }

  const promptedReason = globalThis.prompt("사유를 입력하세요.") ?? "";
  if (!promptedReason.trim()) {
    alert("사유가 필요합니다.");
    return null;
  }

  return promptedReason;
}

export function CaseDetailClient({
  caseRecord,
  currentUser,
  voiceDocumentFinalizeGateSnapshot = null,
}: Readonly<CaseDetailClientProps>) {
  const [localCase, setLocalCase] = useState(caseRecord);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    caseRecord.documents[0]?.id ?? null,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  /** `router.refresh()` 등으로 서버에서 내려온 `caseRecord`가 바뀌면 로컬 상태를 맞춤(클라이언트만 fetch한 경우와 동일한 화면). */
  useEffect(() => {
    setLocalCase(caseRecord);
    setSelectedDocumentId((prev) => {
      const docs = caseRecord.documents;
      if (!docs.length) return null;
      if (prev && docs.some((d) => d.id === prev)) return prev;
      return docs[0].id;
    });
  }, [caseRecord]);

  const selectedDocument = useMemo(
    () =>
      localCase.documents.find((doc) => doc.id === selectedDocumentId) ??
      localCase.documents[0] ??
      null,
    [localCase.documents, selectedDocumentId],
  );

  const facts = useMemo(
    () =>
      computeCaseFacts({
        latestInterviewStatus: localCase.latestInterview?.status ?? null,
        documents: localCase.documents.map((d) => ({ status: d.status, type: d.type })),
      }),
    [localCase.documents, localCase.latestInterview?.status],
  );

  const allowedCaseActions = useMemo(
    () =>
      getAllowedCaseActions({
        role: currentUser.role,
        caseStatus: localCase.status,
        facts: {
          interviewCompleted: facts.interviewCompleted,
          hasDraftDocument: facts.hasDraftDocument,
          hasApprovedDocument: facts.hasApprovedDocument,
          hasLockedDocument: facts.hasLockedDocument,
        },
      }),
    [currentUser.role, localCase.status, facts],
  );

  /** 전달은 선택 문서가 잠금된 뒤에만 노출(사건은 APPROVED여도 미선택·미잠금 문서면 숨김). */
  const caseActionsForUi = useMemo(
    () => ({
      ...allowedCaseActions,
      DELIVER_DOCUMENT:
        Boolean(allowedCaseActions.DELIVER_DOCUMENT && selectedDocument?.status === "LOCKED"),
    }),
    [allowedCaseActions, selectedDocument?.status],
  );

  /** 종료·반려·삭제 사건에서는 새 문서 생성 UI만 막음(목록 선택·조회는 유지). */
  const cannotCreateDocument = ["CLOSED", "REJECTED", "DELETED"].includes(localCase.status);

  const refreshCase = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${localCase.id}/detail`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const next = requireOkData<SerializedCaseDetail>(
        res,
        raw,
        "사건 정보를 새로고침하는 중 오류가 발생했습니다.",
      );
      setLocalCase(next);
      setSelectedDocumentId((prev) => {
        const docs = next.documents;
        if (!docs.length) return null;
        if (prev && docs.some((d) => d.id === prev)) return prev;
        return docs[0].id;
      });
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "사건 정보를 새로고침하는 중 오류가 발생했습니다.",
      );
    }
  }, [localCase.id]);

  async function completeInterviewAction() {
    const res = await fetch(`/api/cases/${localCase.id}/interview/complete`, {
      method: "POST",
    });
    const raw = await res.json().catch(() => null);
    requireOkData(res, raw, "인터뷰 완료 처리에 실패했습니다.");
    await refreshCase();
    alert("인터뷰가 완료 처리되었습니다.");
  }

  async function deliverDocumentAction(documentId: string) {
    const channel =
      globalThis.prompt("전달 채널을 입력하세요. (예: 이메일, 등기)", "이메일")?.trim() ?? "";

    if (!channel) {
      alert("전달 채널이 필요합니다.");
      return;
    }

    await postDocumentDelivery(documentId, {
      channel,
      recipient: null,
    });
    await refreshCase();
    alert("문서 전달이 반영되었습니다. 타임라인에 채널 정보가 기록됩니다.");
  }

  async function updateCaseStatusAction(action: string, reason: string | null) {
    const res = await fetch(`/api/cases/${localCase.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        reason,
      }),
    });

    const raw = await res.json().catch(() => null);
    requireOkData(res, raw, "상태 변경에 실패했습니다.");

    await refreshCase();
    alert("상태가 변경되었습니다.");
  }

  async function handleStatusAction(action: string, reason?: string) {
    const resolvedReason = resolveStatusReason(action, reason);
    if (needsStatusReason(action) && !resolvedReason) {
      return;
    }

    try {
      setIsBusy(true);

      if (action === "COMPLETE_INTERVIEW") {
        await completeInterviewAction();
        return;
      }

      if (action === "DELIVER_DOCUMENT") {
        if (!selectedDocumentId) {
          alert("전달할 문서를 목록에서 선택하세요.");
          return;
        }
        await deliverDocumentAction(selectedDocumentId);
        return;
      }

      await updateCaseStatusAction(action, resolvedReason);
    } catch (error) {
      alert(error instanceof Error ? error.message : "상태 처리 중 오류가 발생했습니다.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleApproveDocument(documentId: string) {
    try {
      setIsBusy(true);
      const res = await fetch(`/api/legal-documents/${documentId}/approve`, {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      if (!res.ok) {
        const blocked = readVoiceDocumentFinalizeBlockedFromJson(raw);
        throw new Error(blocked?.message ?? readJsonApiErrorMessage(raw, "문서 승인에 실패했습니다."));
      }
      requireOkData(res, raw, "문서 승인에 실패했습니다.");
      await refreshCase();
      alert("문서가 승인되었습니다.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "문서 승인에 실패했습니다.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLockDocument(documentId: string) {
    try {
      setIsBusy(true);
      const res = await fetch(`/api/legal-documents/${documentId}/lock`, {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "문서 잠금에 실패했습니다.");
      await refreshCase();
      alert("문서가 잠금되었습니다.");
    } finally {
      setIsBusy(false);
    }
  }

  const showReviewPendingGuide =
    localCase.status === "REVIEW_PENDING" &&
    ["ADMIN", "LAWYER", "STAFF"].includes(currentUser.role);

  const showReviewPendingClientGuide =
    localCase.status === "REVIEW_PENDING" && currentUser.role === "CLIENT";

  const supplementHubPath = supplementHubHref(localCase.id, localCase.status, currentUser.role);

  const showVoiceDocumentFinalizeGatePanel =
    voiceDocumentFinalizeGateSnapshot != null &&
    shouldShowVoiceDocumentFinalizeGatePanel(voiceDocumentFinalizeGateSnapshot);

  const voiceFinalizeGateBlocked = voiceDocumentFinalizeGateSnapshot?.allowed === false;

  return (
    <div className="space-y-6 p-0">
      {showVoiceDocumentFinalizeGatePanel && voiceDocumentFinalizeGateSnapshot ? (
        <VoiceDocumentFinalizeGatePanel
          caseId={localCase.id}
          snapshot={voiceDocumentFinalizeGateSnapshot}
        />
      ) : null}
      {localCase.status === "INTAKE_PENDING" ? (
        <section
          id="case-detail-intake-banner"
          className="scroll-mt-24 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
          aria-label={`${CASE_STATUS_LABELS.INTAKE_PENDING} 안내`}
        >
          <span className="font-semibold">
            {CASE_STATUS_LABELS.INTAKE_PENDING}
          </span>
          {" — "}
          기본 정보·인터뷰로 접수 내용을 채운 뒤, 사건 상세 오른쪽 「진행 액션」으로 마무리하세요. 일반
          순서는{" "}
          <Link
            href={`/cases/${localCase.id}/edit`}
            className="font-medium text-amber-950 underline"
            title="제목·요지·일자 등 사건 기본 정보"
          >
            사건 수정
          </Link>
          →{" "}
          <Link
            href={`/cases/${localCase.id}/interview`}
            className="font-medium text-amber-950 underline"
            title="사실관계 보완용 AI 인터뷰"
          >
            AI 인터뷰
          </Link>
          →{" "}
          <Link
            href={supplementHubPath}
            className="font-medium text-amber-950 underline"
            title={supplementHubLinkTitle("INTAKE_PENDING", currentUser.role)}
          >
            보완 안내
          </Link>
          (단계 요약)입니다.
          {currentUser.role === "CLIENT" ? (
            <span className="mt-2 block text-xs text-amber-900/95">
              의뢰인: 위 순서를 직접 진행하는 경우가 많습니다. 막히면 「보완 안내」 페이지의 체크리스트를
              먼저 보세요.
            </span>
          ) : (
            <span className="mt-2 block text-xs text-amber-900/95">
              담당: 의뢰인 대신 입력하거나, 「보완 안내」 URL을 공유해 같은 순서를 맞출 수 있습니다.
            </span>
          )}
          <p className="mt-2 text-xs">
            <Link
              href={caseDetailHubReturnHref(localCase.id, "INTAKE_PENDING")}
              className="font-medium text-amber-950 underline"
              title="이 화면에서 오른쪽 「진행 액션」으로 스크롤"
            >
              → 진행 액션 영역으로 이동
            </Link>
          </p>
        </section>
      ) : null}

      {showReviewPendingGuide ? (
        <section
          id="case-detail-review-staff-banner"
          className="scroll-mt-24 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-950"
          aria-label={`${CASE_STATUS_LABELS.REVIEW_PENDING} 담당 안내`}
        >
          <p className="text-xs font-medium text-sky-900/90">
            <Link
              href={caseDetailHubReturnHref(localCase.id, "REVIEW_PENDING")}
              className="underline"
              title="왼쪽 문서 목록으로 스크롤"
            >
              이 사건 상세
            </Link>
            에서 바로 작업하면 됩니다. (아래는 순서 설명)
          </p>
          <p className="mt-2">
            <span className="font-semibold">
              {CASE_STATUS_LABELS.REVIEW_PENDING}
            </span>
            {" — "}
            <strong className="font-semibold">먼저</strong> 왼쪽 문서 목록에서 초안을 고른 뒤, 가운데·
            오른쪽에서 문단을 확인·보완하세요. 「진행 액션」의{" "}
            <strong className="font-semibold">검토 요청</strong>은 초안 작성 단계에서 쓰는 경우가 많고,
            이미 검토 대기 상태라면 문단 정리와{" "}
            <strong className="font-semibold">지금 화면에 보이는</strong> 버튼만 따르면 됩니다.{" "}
            <Link
              href={supplementHubPath}
              className="font-medium text-sky-950 underline"
              title={supplementHubLinkTitle("REVIEW_PENDING", currentUser.role)}
            >
              보완 안내
            </Link>
            에서 같은 흐름을 한 페이지로 요약해 두었습니다.
          </p>
          <span className="mt-2 block text-xs text-sky-900/95">
            담당(관리자·변호사·스태프): 문서가 없으면 이 화면에서 문서를 만든 뒤, 같은 순서로 이어가면
            됩니다.
          </span>
        </section>
      ) : null}

      {showReviewPendingClientGuide ? (
        <section
          id="case-detail-review-client-banner"
          className="scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-aibeop-subtle"
          aria-label={`${CASE_STATUS_LABELS.REVIEW_PENDING} 의뢰인 안내`}
        >
          <p className="mb-2 text-xs text-aibeop-muted">
            <Link
              href={caseDetailHubReturnHref(localCase.id, "REVIEW_PENDING")}
              className="font-medium text-aibeop-subtle underline"
              title="문서 목록·타임라인 근처로 스크롤"
            >
              사건 상세로 돌아가기
            </Link>
          </p>
          <span className="font-semibold">{CASE_STATUS_LABELS.REVIEW_PENDING}</span>
          {" — "}
          담당(변호사·스태프) 측에서 문서를 검토하는 단계입니다. 추가 자료나 문의는 이 화면의 문서·
          타임라인을 활용하거나,{" "}
          <Link
            href={supplementHubPath}
            className="font-medium underline"
            title={supplementHubLinkTitle("REVIEW_PENDING", currentUser.role)}
          >
            보완 안내
          </Link>
          의 의뢰인 안내 문구를 참고하세요.
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CaseStatusCard
            caseTitle={localCase.title}
            caseDescription={localCase.description}
            caseStatus={
              CASE_STATUS_LABELS[localCase.status as keyof typeof CASE_STATUS_LABELS] ??
              localCase.status
            }
            interviewStatus={
              localCase.latestInterview
                ? INTERVIEW_STATUS_LABELS[
                    localCase.latestInterview.status as keyof typeof INTERVIEW_STATUS_LABELS
                  ] ?? localCase.latestInterview.status
                : "없음"
            }
            documentStatus={
              selectedDocument
                ? DOCUMENT_STATUS_LABELS[
                    selectedDocument.status as keyof typeof DOCUMENT_STATUS_LABELS
                  ] ?? selectedDocument.status
                : "미생성"
            }
            createdAt={localCase.createdAt}
            updatedAt={localCase.updatedAt}
            facts={facts}
          />
        </div>

        <div id="case-detail-actions" className="scroll-mt-24">
          <CaseStatusActions
            allowed={caseActionsForUi}
            disabled={isBusy}
            onAction={handleStatusAction}
            onOpenCreateDocument={() => setIsCreateModalOpen(true)}
          />
          {caseActionsForUi.DELIVER_DOCUMENT ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
              <span className="font-semibold text-emerald-950">다음 액션:</span>
              {" "}
              같은 열 상단 「<strong>전달 완료 처리</strong>」를 잠금·검증 확인 후 실제 전달을 마칠 때만
              누르세요. (채널 입력 → 타임라인 기록)
            </p>
          ) : null}
        </div>
      </div>

      {currentUser.role === "CLIENT" ? (
        <>
          <ClientSupplementTrackingPanel caseId={localCase.id} />
          <ClientDisclosureDeliveryPanel caseId={localCase.id} />
        </>
      ) : (
        <CaseSummaryPanel caseId={localCase.id} interviewCompleted={facts.interviewCompleted} />
      )}

      {facts.interviewCompleted &&
      ["ADMIN", "LAWYER", "STAFF"].includes(currentUser.role) ? (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-indigo-950">사건 지능 검토 (Graph · Radar · Ledger)</h3>
          <p className="mt-1 text-sm text-indigo-900/80">
            AI가 구조화한 Claim·Radar·모순 신호를 변호사가 확인·기각·수정합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/cases/${localCase.id}/litigation-command-center`}
              className="inline-flex rounded-xl bg-indigo-900 px-4 py-2 text-sm font-semibold text-white"
              data-testid="open-litigation-command-center"
            >
              소송 지휘실 열기
            </Link>
            <Link
              href={`/cases/${localCase.id}/lawyer-workbench`}
              className="inline-flex rounded-xl bg-violet-800 px-4 py-2 text-sm font-semibold text-white"
              data-testid="open-lawyer-workbench"
            >
              Legal Reliability Workbench
            </Link>
            <Link
              href={`/cases/${localCase.id}/intelligence-review`}
              className="inline-flex rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Lawyer Review Console
            </Link>
            <Link
              href={`/cases/${localCase.id}/client-disclosure-preview`}
              className="inline-flex rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-800"
            >
              Client Disclosure Preview
            </Link>
          </div>
        </section>
      ) : null}

      <CasePackageShareSettingsPanel caseId={localCase.id} />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div
            id="case-detail-document-list"
            className="scroll-mt-24 rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">문서 목록</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={cannotCreateDocument || isBusy}
                title={
                  cannotCreateDocument
                    ? "종료·반려·삭제된 사건에서는 문서를 추가할 수 없습니다."
                    : undefined
                }
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                문서 생성
              </button>
            </div>

            <div className="space-y-2">
              {localCase.documents.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-aibeop-subtle">
                  생성된 문서가 없습니다.
                </div>
              ) : (
                localCase.documents.map((doc) => {
                  const active = selectedDocument?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-black bg-gray-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm font-semibold">{doc.title}</div>
                      <div className="mt-1 text-xs text-aibeop-subtle">
                        {doc.type} ·{" "}
                        {DOCUMENT_STATUS_LABELS[doc.status as keyof typeof DOCUMENT_STATUS_LABELS] ??
                          doc.status}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <TimelinePanel timelineEvents={localCase.timelineEvents} />
        </div>

        <div className="space-y-6">
          {selectedDocument ? (
            <>
              <DocumentReviewPanel
                document={selectedDocument}
                currentRole={currentUser.role}
                onApprove={() => handleApproveDocument(selectedDocument.id)}
                onLock={() => handleLockDocument(selectedDocument.id)}
                busy={isBusy}
                voiceFinalizeGateBlocked={voiceFinalizeGateBlocked}
                voiceFinalizeGateSnapshot={voiceDocumentFinalizeGateSnapshot}
              />

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-semibold">문서 본문 미리보기</h3>
                  <p className="mt-1 text-sm text-aibeop-subtle">
                    선택된 문단 구조를 기준으로 현재 문서 내용을 확인합니다.
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedDocument.paragraphs.map((p) => (
                    <div key={p.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold">{p.title}</div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-aibeop-muted">
                          {p.status}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm leading-6 text-aibeop-subtle">
                        {p.content || "내용 없음"}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-aibeop-subtle shadow-sm">
              문서를 선택해 주세요.
            </div>
          )}
        </div>

        <div>
          {selectedDocument ? (
            <ParagraphStructurePanel
              document={selectedDocument}
              currentRole={currentUser.role}
              onRefresh={refreshCase}
            />
          ) : (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-aibeop-subtle shadow-sm">
              문단 구조 패널은 문서 선택 후 표시됩니다.
            </div>
          )}
        </div>
      </div>

      <DocumentCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        caseId={localCase.id}
        interviewCompleted={facts.interviewCompleted}
        onCreated={async () => {
          setIsCreateModalOpen(false);
          await refreshCase();
        }}
      />
    </div>
  );
}
