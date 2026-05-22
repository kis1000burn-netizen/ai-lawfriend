"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  message?: string;
  error?: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type CasePackageShare = {
  id: string;
  caseId: string;
  publicCode: string;
  shareMode: "DESIGNATED_LAWYER" | "PUBLIC_CODE_REQUEST";
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  consentedAt: string;
  createdAt: string;
  updatedAt: string;
  scope: {
    allowSummary: boolean;
    allowInterview: boolean;
    allowAttachmentList: boolean;
    allowAttachmentDownload: boolean;
    allowDocumentDraft: boolean;
    allowDocumentPdf: boolean;
    allowPackagePdf: boolean;
    allowClientContact: boolean;
    allowOpponentDetail: boolean;
  };
  case: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    opponentName: string | null;
    incidentDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  lawyer: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  attachments: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    category: string | null;
    createdAt: string;
    downloadAllowed: boolean;
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    pdfAllowed: boolean;
  }>;
};

type ShareFormState = {
  lawyerUserId: string;
  shareMode: "DESIGNATED_LAWYER" | "PUBLIC_CODE_REQUEST";
  expiresAt: string;
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowAttachmentDownload: boolean;
  allowDocumentDraft: boolean;
  allowDocumentPdf: boolean;
  allowPackagePdf: boolean;
  allowClientContact: boolean;
  allowOpponentDetail: boolean;
  consentChecked: boolean;
};

const DEFAULT_FORM: ShareFormState = {
  lawyerUserId: "",
  shareMode: "PUBLIC_CODE_REQUEST",
  expiresAt: "",
  allowSummary: true,
  allowInterview: true,
  allowAttachmentList: true,
  allowAttachmentDownload: false,
  allowDocumentDraft: true,
  allowDocumentPdf: false,
  allowPackagePdf: false,
  allowClientContact: false,
  allowOpponentDetail: false,
  consentChecked: false,
};

const CONSENT_TEXT = `본인은 선택한 사건 정보, 사건 요약, AI 인터뷰 내용, 첨부자료 목록, 문서 초안의 기초가 지정한 변호사 또는 전문가에게 제공될 수 있음을 확인합니다.

본인은 공유 범위, 첨부파일 다운로드 허용 여부, 공유 기간을 확인했습니다.

본인은 공유된 사건 패키지가 변호사의 사전 검토를 위한 자료이며, AI가 정리한 내용이 법률 자문, 소송 대리, 사건 수임 또는 최종 법률 판단이 아님을 이해합니다.

본인은 필요 시 공유를 취소할 수 있으며, 변호사의 열람 및 다운로드 기록이 시스템에 남을 수 있음을 확인합니다.`;

export function CasePackageShareClient({ caseId }: { caseId: string }) {
  const [form, setForm] = useState<ShareFormState>(DEFAULT_FORM);
  const [shares, setShares] = useState<CasePackageShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const activeShares = useMemo(
    () => shares.filter((share) => share.status === "ACTIVE"),
    [shares],
  );

  useEffect(() => {
    void loadShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function loadShares() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/cases/${caseId}/package-shares`, {
        method: "GET",
      });

      const payload = (await response.json()) as ApiResponse<CasePackageShare[]>;

      if (!payload.ok) {
        setErrorMessage(normalizeApiMessage(payload.message, "공유 목록을 불러오지 못했습니다."));
        return;
      }

      setShares(payload.data);
    } catch {
      setErrorMessage("공유 목록 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateForm<K extends keyof ShareFormState>(
    key: K,
    value: ShareFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function buildExpiresAtIso(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  async function handleCreateShare() {
    setMessage("");
    setErrorMessage("");

    if (!form.consentChecked) {
      setErrorMessage("공유 동의 내용을 확인해야 고유번호를 발급할 수 있습니다.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/package-shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lawyerUserId: form.lawyerUserId.trim() || null,
          shareMode: form.shareMode,
          expiresAt: buildExpiresAtIso(form.expiresAt),
          consentText: CONSENT_TEXT,
          allowSummary: form.allowSummary,
          allowInterview: form.allowInterview,
          allowAttachmentList: form.allowAttachmentList,
          allowAttachmentDownload: form.allowAttachmentDownload,
          allowDocumentDraft: form.allowDocumentDraft,
          allowDocumentPdf: form.allowDocumentPdf,
          allowPackagePdf: form.allowPackagePdf,
          allowClientContact: form.allowClientContact,
          allowOpponentDetail: form.allowOpponentDetail,
        }),
      });

      const payload = (await response.json()) as ApiResponse<CasePackageShare>;

      if (!payload.ok) {
        setErrorMessage(
          normalizeApiMessage(payload.message, "사건 패키지 공유 생성에 실패했습니다."),
        );
        return;
      }

      setShares((prev) => [payload.data, ...prev]);
      setForm(DEFAULT_FORM);
      setMessage(
        "사건 고유번호가 발급되었습니다. 이 순간의 사건 패키지가 스냅샷으로 고정되어, 이후 수정하더라도 이 공유 건으로 열람·출력되는 자료는 발급 당시 내용입니다.",
      );
    } catch {
      setErrorMessage("사건 패키지 공유 생성 중 오류가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevokeShare(shareId: string) {
    const reason = window.prompt("공유 취소 사유를 입력해 주세요.", "의뢰인 공유 취소");

    if (reason === null) return;

    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/cases/${caseId}/package-shares/${shareId}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            revokeReason: reason,
          }),
        },
      );

      const payload = (await response.json()) as ApiResponse<{
        id: string;
        status: "REVOKED";
        revokedAt: string;
        revokeReason: string;
      }>;

      if (!payload.ok) {
        setErrorMessage(normalizeApiMessage(payload.message, "공유 취소에 실패했습니다."));
        return;
      }

      setShares((prev) =>
        prev.map((share) =>
          share.id === shareId
            ? {
                ...share,
                status: payload.data.status,
                revokedAt: payload.data.revokedAt,
                revokeReason: payload.data.revokeReason,
              }
            : share,
        ),
      );

      setMessage("사건 패키지 공유가 취소되었습니다.");
    } catch {
      setErrorMessage("공유 취소 중 오류가 발생했습니다.");
    }
  }

  async function handleCopyGuide(share: CasePackageShare) {
    try {
      const guide = buildLawyerGuideMessage(share);
      await navigator.clipboard.writeText(guide);
      setCopiedShareId(share.id);
      setMessage("변호사 전달 문구를 복사했습니다.");
      setErrorMessage("");
    } catch {
      setErrorMessage("클립보드 복사에 실패했습니다.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">공유 범위 설정</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            변호사가 열람할 수 있는 사건 정보 범위를 선택합니다. 첨부파일
            다운로드와 문서 PDF 다운로드는 별도 권한으로 분리됩니다.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          6.3 `add-case-package-share` migration과 6.4~6.8 1차 런타임 검증이
          완료되었습니다. 현재 화면은 실제 공유 생성, 목록 조회, 상세 이력,
          공유 취소 흐름을 기준으로 운영 점검을 이어가면 됩니다.
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">공유 방식</span>
            <select
              value={form.shareMode}
              onChange={(event) =>
                updateForm(
                  "shareMode",
                  event.target.value as ShareFormState["shareMode"],
                )
              }
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="PUBLIC_CODE_REQUEST">고유번호 기반 공유</option>
              <option value="DESIGNATED_LAWYER">지정 변호사 공유</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">지정 변호사 ID</span>
            <input
              value={form.lawyerUserId}
              onChange={(event) => updateForm("lawyerUserId", event.target.value)}
              placeholder="선택 입력 — 지정 변호사 공유 시 사용"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <span className="text-xs leading-5 text-slate-500">
              변호사 선택 UI는 6.4 후속 고도화에서 붙일 수 있습니다. 지금은
              기존 사용자 ID를 입력하는 보수형 구조입니다.
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">공유 만료일</span>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => updateForm("expiresAt", event.target.value)}
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <span className="text-xs leading-5 text-slate-500">
              비워두면 API 기준에 따라 만료일 없이 생성됩니다. 운영 기본값 7일
              적용은 후속 정책에서 자동화할 수 있습니다.
            </span>
          </label>

          <div className="grid gap-3 rounded-2xl border bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-900">열람 허용 범위</h3>

            <CheckboxRow
              checked={form.allowSummary}
              onChange={(value) => updateForm("allowSummary", value)}
              title="사건 요약 열람"
              description="사건 경위, 주요 날짜, 주요 금액, 추가 확인 필요 항목을 공유합니다."
            />

            <CheckboxRow
              checked={form.allowInterview}
              onChange={(value) => updateForm("allowInterview", value)}
              title="AI 인터뷰 요약 열람"
              description="의뢰인이 답변한 AI 인터뷰 요약 또는 정리 내용을 공유합니다."
            />

            <CheckboxRow
              checked={form.allowAttachmentList}
              onChange={(value) => updateForm("allowAttachmentList", value)}
              title="첨부자료 목록 열람"
              description="파일명, 형식, 업로드 일자 등 첨부자료 목록을 공유합니다."
            />

            <CheckboxRow
              checked={form.allowDocumentDraft}
              onChange={(value) => updateForm("allowDocumentDraft", value)}
              title="문서 초안의 기초 열람"
              description="고소장, 진술서, 의견서 등 문서 초안의 기초 정보를 공유합니다."
            />

            <CheckboxRow
              checked={form.allowClientContact}
              onChange={(value) => updateForm("allowClientContact", value)}
              title="의뢰인 연락처 공유"
              description="이름, 이메일, 연락처 등 연락 가능한 정보를 공유합니다."
            />

            <CheckboxRow
              checked={form.allowOpponentDetail}
              onChange={(value) => updateForm("allowOpponentDetail", value)}
              title="상대방 상세 정보 공유"
              description="상대방 상세 정보는 민감정보를 제외하고 공유해야 합니다."
            />
          </div>

          <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-bold text-amber-950">다운로드 허용 범위</h3>

            <CheckboxRow
              checked={form.allowAttachmentDownload}
              onChange={(value) => updateForm("allowAttachmentDownload", value)}
              title="첨부파일 원본 다운로드 허용"
              description="계약서, 문자, 사진 등 첨부 원본 다운로드를 허용합니다."
            />

            <CheckboxRow
              checked={form.allowDocumentPdf}
              onChange={(value) => updateForm("allowDocumentPdf", value)}
              title="문서 PDF 다운로드 허용"
              description="문서 초안 또는 승인 문서 PDF 다운로드를 허용합니다."
            />

            <CheckboxRow
              checked={form.allowPackagePdf}
              onChange={(value) => updateForm("allowPackagePdf", value)}
              title="사건 패키지 PDF 다운로드 허용"
              description="사건 패키지 요약본 PDF 다운로드를 허용합니다."
            />
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <h3 className="text-sm font-bold text-slate-950">공유 동의문</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
              {CONSENT_TEXT}
            </pre>

            <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.consentChecked}
                onChange={(event) => updateForm("consentChecked", event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>
                위 내용을 확인했으며, 선택한 사건 패키지를 변호사 검토용으로
                공유하는 데 동의합니다.
              </span>
            </label>
          </div>

          {message ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCreateShare}
            disabled={isCreating}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "고유번호 발급 중..." : "사건 고유번호 발급"}
          </button>
        </div>
      </section>

      <aside className="flex flex-col gap-6">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">현재 공유 상태</h2>
          <p className="mt-2 text-sm text-slate-600">
            활성 공유 {activeShares.length}건 / 전체 {shares.length}건
          </p>

          {isLoading ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              공유 목록을 불러오는 중입니다.
            </div>
          ) : null}

          {!isLoading && shares.length === 0 ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              아직 발급된 사건 고유번호가 없습니다.
            </div>
          ) : null}

          <div className="mt-4 grid gap-4">
            {shares.map((share) => (
              <ShareCard
                key={share.id}
                caseId={caseId}
                share={share}
                copied={copiedShareId === share.id}
                onCopy={() => void handleCopyGuide(share)}
                onRevoke={() => void handleRevokeShare(share.id)}
              />
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl bg-white p-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300"
      />
      <span>
        <span className="block font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block leading-5 text-slate-500">{description}</span>
      </span>
    </label>
  );
}

function ShareCard({
  caseId,
  share,
  copied,
  onCopy,
  onRevoke,
}: {
  caseId: string;
  share: CasePackageShare;
  copied: boolean;
  onCopy: () => void;
  onRevoke: () => void;
}) {
  const isActive = share.status === "ACTIVE";

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">사건 고유번호</p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-950">{share.publicCode}</p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {share.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex justify-between gap-3">
          <dt>공유 방식</dt>
          <dd className="font-medium text-slate-900">{share.shareMode}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>만료일</dt>
          <dd className="font-medium text-slate-900">
            {share.expiresAt ? formatDateTime(share.expiresAt) : "미설정"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>첨부 다운로드</dt>
          <dd className="font-medium text-slate-900">
            {share.scope.allowAttachmentDownload ? "허용" : "비허용"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>문서 PDF</dt>
          <dd className="font-medium text-slate-900">
            {share.scope.allowDocumentPdf ? "허용" : "비허용"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-2">
        <Link
          href={`/cases/${caseId}/share/${share.id}`}
          className="rounded-xl border px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          상세 / 열람 이력 보기
        </Link>

        <button
          type="button"
          onClick={onCopy}
          className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {copied ? "전달 문구 복사됨" : "변호사 전달 문구 복사"}
        </button>

        {isActive ? (
          <button
            type="button"
            onClick={onRevoke}
            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            공유 취소
          </button>
        ) : null}
      </div>
    </div>
  );
}

function buildLawyerGuideMessage(share: CasePackageShare): string {
  return [
    "AI법친 사건 패키지가 공유되었습니다.",
    "",
    `사건 고유번호: ${share.publicCode}`,
    "",
    "AI법친에 변호사 계정으로 로그인한 뒤,",
    "사건 패키지 조회 화면에서 고유번호를 입력하면",
    "의뢰인이 공유한 사건 요약과 자료를 확인할 수 있습니다.",
    "",
    "조회 주소:",
    "https://ai-lawfriend.netlify.app/lawyer/case-packages/lookup",
  ].join("\n");
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeApiMessage(message: string | undefined, fallback: string): string {
  if (message?.includes("CasePackageShare") || message?.includes("does not exist")) {
    return "공유 API는 연결되었지만 DB migration이 아직 적용되지 않았을 수 있습니다. add-case-package-share migration 완료 후 다시 확인해 주세요.";
  }

  return message ?? fallback;
}