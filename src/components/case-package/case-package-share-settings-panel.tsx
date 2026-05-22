"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CASE_PACKAGE_AI_LAWYER_ACT_NOTICE,
  CASE_PACKAGE_CLIENT_CONSENT_TEXT,
} from "@/features/case-package/case-package-privacy-security-policy";

type CasePackageShareStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

type CasePackageAccessAction =
  | "VIEW"
  | "DOWNLOAD"
  | "DENIED"
  | "EXPIRED"
  | "REVOKED";

type CasePackageAccessLogItem = {
  id: string;
  shareId: string;
  caseId: string;
  actorUserId?: string | null;
  action: CasePackageAccessAction;
  targetType: string;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  resultMessage?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

type CasePackageShareItem = {
  id: string;
  caseId: string;
  ownerUserId: string;
  lawyerUserId?: string | null;
  publicCode: string;
  status: CasePackageShareStatus;
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowAttachmentDownload: boolean;
  allowDocumentDraft: boolean;
  allowPackagePdf: boolean;
  snapshotSha256?: string | null;
  consentedAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreatedShareResult = {
  share: CasePackageShareItem;
  plainAccessToken: string;
  warning?: string;
};

type CasePackageShareSettingsPanelProps = {
  caseId: string;
};

type ShareFormState = {
  lawyerUserId: string;
  optionalPin: string;
  expiresAt: string;
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowDocumentDraft: boolean;
  allowAttachmentDownload: boolean;
  allowPackagePdf: boolean;
  allowDocumentDownload: boolean;
};

const DEFAULT_FORM_STATE: ShareFormState = {
  lawyerUserId: "",
  optionalPin: "",
  expiresAt: "",
  allowSummary: true,
  allowInterview: true,
  allowAttachmentList: true,
  allowDocumentDraft: false,
  allowAttachmentDownload: false,
  allowPackagePdf: false,
  allowDocumentDownload: false,
};

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeShareStatus(value: unknown): CasePackageShareStatus {
  if (value === "ACTIVE" || value === "EXPIRED" || value === "REVOKED") {
    return value;
  }

  return "ACTIVE";
}

function normalizeShareItem(value: unknown): CasePackageShareItem | null {
  const record = asRecord(value);

  if (
    typeof record.id !== "string" ||
    typeof record.caseId !== "string" ||
    typeof record.ownerUserId !== "string" ||
    typeof record.publicCode !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    caseId: record.caseId,
    ownerUserId: record.ownerUserId,
    lawyerUserId: normalizeNullableString(record.lawyerUserId),
    publicCode: record.publicCode,
    status: normalizeShareStatus(record.status),
    allowSummary: normalizeBoolean(record.allowSummary, true),
    allowInterview: normalizeBoolean(record.allowInterview, true),
    allowAttachmentList: normalizeBoolean(record.allowAttachmentList, true),
    allowAttachmentDownload: normalizeBoolean(record.allowAttachmentDownload),
    allowDocumentDraft: normalizeBoolean(record.allowDocumentDraft),
    allowPackagePdf: normalizeBoolean(record.allowPackagePdf),
    snapshotSha256: normalizeNullableString(record.snapshotSha256),
    consentedAt: normalizeString(record.consentedAt),
    expiresAt: normalizeNullableString(record.expiresAt),
    revokedAt: normalizeNullableString(record.revokedAt),
    revokeReason: normalizeNullableString(record.revokeReason),
    createdAt: normalizeString(record.createdAt),
    updatedAt: normalizeString(record.updatedAt),
  };
}

function normalizeShareList(value: unknown): CasePackageShareItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const normalized = normalizeShareItem(item);

    return normalized ? [normalized] : [];
  });
}

function normalizeAccessAction(value: unknown): CasePackageAccessAction {
  if (
    value === "VIEW" ||
    value === "DOWNLOAD" ||
    value === "DENIED" ||
    value === "EXPIRED" ||
    value === "REVOKED"
  ) {
    return value;
  }

  return "DENIED";
}

function normalizeAccessLogItem(value: unknown): CasePackageAccessLogItem | null {
  const record = asRecord(value);

  if (
    typeof record.id !== "string" ||
    typeof record.shareId !== "string" ||
    typeof record.caseId !== "string" ||
    typeof record.targetType !== "string"
  ) {
    return null;
  }

  const actor = asRecord(record.actor);

  return {
    id: record.id,
    shareId: record.shareId,
    caseId: record.caseId,
    actorUserId: normalizeNullableString(record.actorUserId),
    action: normalizeAccessAction(record.action),
    targetType: record.targetType,
    targetId: normalizeNullableString(record.targetId),
    ip: normalizeNullableString(record.ip),
    userAgent: normalizeNullableString(record.userAgent),
    resultMessage: normalizeNullableString(record.resultMessage),
    createdAt: normalizeString(record.createdAt),
    actor:
      typeof actor.id === "string"
        ? {
            id: actor.id,
            name: normalizeNullableString(actor.name),
            email: normalizeNullableString(actor.email),
            role: normalizeNullableString(actor.role),
          }
        : null,
  };
}

function normalizeAccessLogList(value: unknown): CasePackageAccessLogItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const normalized = normalizeAccessLogItem(item);

    return normalized ? [normalized] : [];
  });
}

function getAccessActionLabel(action: CasePackageAccessAction): string {
  switch (action) {
    case "VIEW":
      return "열람";

    case "DOWNLOAD":
      return "다운로드";

    case "DENIED":
      return "차단";

    case "EXPIRED":
      return "만료 차단";

    case "REVOKED":
      return "취소 차단";
  }
}

function getAccessActionClassName(action: CasePackageAccessAction): string {
  switch (action) {
    case "VIEW":
      return "border-sky-200 bg-sky-50 text-sky-900";

    case "DOWNLOAD":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";

    case "DENIED":
      return "border-rose-200 bg-rose-50 text-rose-900";

    case "EXPIRED":
      return "border-amber-200 bg-amber-50 text-amber-900";

    case "REVOKED":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: CasePackageShareStatus): string {
  switch (status) {
    case "ACTIVE":
      return "활성";

    case "EXPIRED":
      return "만료";

    case "REVOKED":
      return "취소";
  }
}

function getStatusClassName(status: CasePackageShareStatus): string {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";

    case "EXPIRED":
      return "border-amber-200 bg-amber-50 text-amber-900";

    case "REVOKED":
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}

function toDatetimeLocalValue(date: Date): string {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return offsetDate.toISOString().slice(0, 16);
}

function buildDefaultExpiresAt(): string {
  const date = new Date();

  date.setDate(date.getDate() + 7);

  return toDatetimeLocalValue(date);
}

function toIsoFromDatetimeLocal(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getErrorMessage(resultRecord: Record<string, unknown>): string {
  return normalizeString(
    resultRecord.message,
    "사건 패키지 공유 처리 중 오류가 발생했습니다.",
  );
}

export function CasePackageShareSettingsPanel({
  caseId,
}: CasePackageShareSettingsPanelProps) {
  const [shares, setShares] = useState<CasePackageShareItem[]>([]);
  const [form, setForm] = useState<ShareFormState>({
    ...DEFAULT_FORM_STATE,
    expiresAt: buildDefaultExpiresAt(),
  });
  const [createdShare, setCreatedShare] = useState<CreatedShareResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [revokingShareId, setRevokingShareId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessLogsByShareId, setAccessLogsByShareId] = useState<
    Record<string, CasePackageAccessLogItem[]>
  >({});
  const [loadingLogsShareId, setLoadingLogsShareId] = useState<string | null>(
    null,
  );
  const [expandedLogShareId, setExpandedLogShareId] = useState<string | null>(
    null,
  );
  const [revokeReasons, setRevokeReasons] = useState<Record<string, string>>({});

  const activeShares = useMemo(
    () => shares.filter((share) => share.status === "ACTIVE"),
    [shares],
  );

  const loadShares = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/cases/${caseId}/package-shares`, {
        method: "GET",
      });

      const result: unknown = await response.json();
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessage(resultRecord));
      }

      setShares(normalizeShareList(resultRecord.shares));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "공유 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadShares();
  }, [loadShares]);

  function updateForm<K extends keyof ShareFormState>(
    key: K,
    value: ShareFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleCreateShare() {
    setIsCreating(true);
    setErrorMessage(null);
    setCreatedShare(null);

    try {
      const expiresAt = toIsoFromDatetimeLocal(form.expiresAt);

      const response = await fetch(`/api/cases/${caseId}/package-shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lawyerUserId: form.lawyerUserId.trim() || null,
          optionalPin: form.optionalPin.trim() || null,
          expiresAt,
          scope: {
            allowSummary: form.allowSummary,
            allowInterview: form.allowInterview,
            allowAttachmentList: form.allowAttachmentList,
            allowDocumentDraft: form.allowDocumentDraft,
          },
          downloadPermissions: {
            allowAttachmentDownload: form.allowAttachmentDownload,
            allowPackagePdf: form.allowPackagePdf,
            allowDocumentDownload: form.allowDocumentDownload,
          },
        }),
      });

      const result: unknown = await response.json();
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessage(resultRecord));
      }

      const share = normalizeShareItem(resultRecord.share);
      const plainAccessToken = normalizeString(resultRecord.plainAccessToken);
      const warning = normalizeString(resultRecord.warning);

      if (!share || !plainAccessToken) {
        throw new Error("공유 생성 응답이 올바르지 않습니다.");
      }

      setCreatedShare({
        share,
        plainAccessToken,
        warning: warning || undefined,
      });
      setForm({
        ...DEFAULT_FORM_STATE,
        expiresAt: buildDefaultExpiresAt(),
      });

      await loadShares();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "사건 패키지 공유를 생성하지 못했습니다.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevokeShare(shareId: string) {
    const confirmed = window.confirm(
      "이 사건 패키지 공유를 취소하시겠습니까? 취소 후에는 변호사가 더 이상 열람할 수 없습니다.",
    );

    if (!confirmed) {
      return;
    }

    setRevokingShareId(shareId);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/cases/${caseId}/package-shares/${shareId}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: revokeReasons[shareId]?.trim() || "의뢰인 공유 취소",
          }),
        },
      );

      const result: unknown = await response.json();
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessage(resultRecord));
      }

      await loadShares();

      if (expandedLogShareId === shareId) {
        await loadAccessLogs(shareId);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "공유를 취소하지 못했습니다.",
      );
    } finally {
      setRevokingShareId(null);
    }
  }

  async function loadAccessLogs(shareId: string) {
    setLoadingLogsShareId(shareId);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/cases/${caseId}/package-shares/${shareId}/access-logs`,
        {
          method: "GET",
        },
      );

      const result: unknown = await response.json();
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessage(resultRecord));
      }

      setAccessLogsByShareId((current) => ({
        ...current,
        [shareId]: normalizeAccessLogList(resultRecord.logs),
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "공유 접근 로그를 불러오지 못했습니다.",
      );
    } finally {
      setLoadingLogsShareId(null);
    }
  }

  function toggleAccessLogs(shareId: string) {
    setExpandedLogShareId((current) => {
      const next = current === shareId ? null : shareId;

      if (next && !accessLogsByShareId[next]) {
        void loadAccessLogs(next);
      }

      return next;
    });
  }

  function updateRevokeReason(shareId: string, reason: string) {
    setRevokeReasons((current) => ({
      ...current,
      [shareId]: reason,
    }));
  }

  return (
    <section
      aria-label="사건 패키지 공유 설정"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-950">
            사건 패키지 공유 설정
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            변호사가 검토할 수 있도록 사건 요약, 인터뷰 요약, 첨부자료 목록,
            문서 초안의 기초를 고유번호로 공유합니다.{" "}
            <span className="font-medium text-slate-800">
              고유번호 발급 순간의 패키지가 스냅샷으로 고정되며, 이후 사건을
              수정해도 해당 공유 건의 열람 내용은 발급 당시 기준으로 유지됩니다.
            </span>
          </p>
        </div>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          활성 공유 {activeShares.length}건
        </span>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      {createdShare ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-950">
            사건 패키지 고유번호가 발급되었습니다.
          </p>
          <p className="mt-2 text-xs leading-5 text-emerald-900">
            이 시점의 사건 패키지가 스냅샷으로 고정됩니다. 이후 내용을 수정해도
            이 공유로 보이는 자료는 발급 당시 버전입니다.
          </p>

          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/80 p-3">
              <dt className="text-xs font-semibold text-slate-500">
                공유 고유번호
              </dt>
              <dd className="mt-1 font-mono text-lg font-bold text-slate-950">
                {createdShare.share.publicCode}
              </dd>
            </div>

            <div className="rounded-xl bg-white/80 p-3">
              <dt className="text-xs font-semibold text-slate-500">
                접근 토큰
              </dt>
              <dd className="mt-1 break-all font-mono text-sm font-semibold text-slate-950">
                {createdShare.plainAccessToken}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-xs leading-5 text-emerald-900">
            {createdShare.warning ||
              "접근 토큰은 발급 직후 한 번만 표시됩니다. 변호사에게 안전한 방식으로 전달하십시오."}
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900">
            새 공유 만들기
          </p>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">
                변호사 사용자 ID
              </span>
              <input
                value={form.lawyerUserId}
                onChange={(event) =>
                  updateForm("lawyerUserId", event.target.value)
                }
                placeholder="선택 입력 - 미입력 시 공개 고유번호 기반 후보 공유"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">
                선택형 접근 PIN
              </span>
              <input
                value={form.optionalPin}
                onChange={(event) =>
                  updateForm("optionalPin", event.target.value)
                }
                placeholder="선택 입력 - 최소 4자리"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">
                공유 만료일
              </span>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) => updateForm("expiresAt", event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                공유 범위
              </p>

              <div className="mt-2 grid gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowSummary}
                    onChange={(event) =>
                      updateForm("allowSummary", event.target.checked)
                    }
                  />
                  사건 요약 열람 허용
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowInterview}
                    onChange={(event) =>
                      updateForm("allowInterview", event.target.checked)
                    }
                  />
                  AI 인터뷰 요약 열람 허용
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowAttachmentList}
                    onChange={(event) =>
                      updateForm("allowAttachmentList", event.target.checked)
                    }
                  />
                  첨부자료 목록 열람 허용
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowDocumentDraft}
                    onChange={(event) =>
                      updateForm("allowDocumentDraft", event.target.checked)
                    }
                  />
                  문서 초안의 기초 열람 허용
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                다운로드 권한
              </p>

              <div className="mt-2 grid gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowAttachmentDownload}
                    onChange={(event) =>
                      updateForm("allowAttachmentDownload", event.target.checked)
                    }
                  />
                  첨부파일 다운로드 허용
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowDocumentDownload}
                    onChange={(event) =>
                      updateForm("allowDocumentDownload", event.target.checked)
                    }
                  />
                  문서 다운로드 허용
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.allowPackagePdf}
                    onChange={(event) =>
                      updateForm("allowPackagePdf", event.target.checked)
                    }
                  />
                  사건 패키지 PDF 다운로드 허용
                </label>
              </div>
            </div>
          </div>

          <details className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <summary className="cursor-pointer font-semibold">공유 동의 및 안전 고지 보기</summary>
            <p className="mt-2 whitespace-pre-wrap">{CASE_PACKAGE_CLIENT_CONSENT_TEXT}</p>
            <p className="mt-2">{CASE_PACKAGE_AI_LAWYER_ACT_NOTICE}</p>
          </details>

          <button
            type="button"
            onClick={() => void handleCreateShare()}
            disabled={isCreating}
            className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "고유번호 발급 중..." : "고유번호 발급"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              기존 공유 목록
            </p>

            <button
              type="button"
              onClick={() => void loadShares()}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50"
            >
              새로고침
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {shares.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                아직 발급된 사건 패키지 공유가 없습니다.
              </div>
            ) : (
              shares.map((share) => (
                <article
                  key={share.id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-bold text-slate-950">
                        {share.publicCode}
                      </p>
                      {share.snapshotSha256 ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-800">
                          사건파일 스냅샷 고정(공유 시점)
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500">
                        생성: {formatDateTime(share.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClassName(
                        share.status,
                      )}`}
                    >
                      {getStatusLabel(share.status)}
                    </span>
                  </div>

                  <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-500">만료일</dt>
                      <dd>{formatDateTime(share.expiresAt)}</dd>
                    </div>

                    <div>
                      <dt className="font-semibold text-slate-500">
                        변호사 지정
                      </dt>
                      <dd>{share.lawyerUserId ?? "미지정"}</dd>
                    </div>

                    <div>
                      <dt className="font-semibold text-slate-500">
                        첨부 다운로드
                      </dt>
                      <dd>{share.allowAttachmentDownload ? "허용" : "불허"}</dd>
                    </div>

                    <div>
                      <dt className="font-semibold text-slate-500">
                        패키지 PDF
                      </dt>
                      <dd>{share.allowPackagePdf ? "허용" : "불허"}</dd>
                    </div>
                  </dl>

                  {share.status === "ACTIVE" ? (
                    <div className="mt-3 grid gap-2">
                      <label className="grid gap-1">
                        <span className="text-xs font-semibold text-slate-500">
                          공유 취소 사유
                        </span>
                        <input
                          value={revokeReasons[share.id] ?? ""}
                          onChange={(event) =>
                            updateRevokeReason(share.id, event.target.value)
                          }
                          placeholder="예: 상담 종료, 잘못 발급, 공유 대상 변경 등"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => void handleRevokeShare(share.id)}
                        disabled={revokingShareId === share.id}
                        className="w-fit rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 disabled:opacity-50"
                      >
                        {revokingShareId === share.id ? "취소 중..." : "공유 취소"}
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleAccessLogs(share.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {expandedLogShareId === share.id
                        ? "열람 로그 닫기"
                        : "열람 로그 보기"}
                    </button>

                    {share.allowPackagePdf ? (
                      <a
                        href={`/api/cases/${caseId}/package-shares/${share.id}/package-pdf`}
                        className="ml-2 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        사건 패키지 요약본 다운로드
                      </a>
                    ) : null}

                    {expandedLogShareId === share.id ? (
                      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        {loadingLogsShareId === share.id ? (
                          <p className="text-xs text-slate-500">
                            로그를 불러오는 중입니다.
                          </p>
                        ) : accessLogsByShareId[share.id]?.length ? (
                          <div className="space-y-2">
                            {accessLogsByShareId[share.id].map((log) => (
                              <article
                                key={log.id}
                                className="rounded-lg border border-slate-200 bg-white p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getAccessActionClassName(log.action)}`}
                                  >
                                    {getAccessActionLabel(log.action)}
                                  </span>

                                  <span className="text-xs text-slate-500">
                                    {formatDateTime(log.createdAt)}
                                  </span>
                                </div>

                                <dl className="mt-2 grid gap-1 text-xs text-slate-600">
                                  <div>
                                    <dt className="font-semibold text-slate-500">
                                      대상
                                    </dt>
                                    <dd>
                                      {log.targetType}
                                      {log.targetId ? ` / ${log.targetId}` : ""}
                                    </dd>
                                  </div>

                                  <div>
                                    <dt className="font-semibold text-slate-500">
                                      행위자
                                    </dt>
                                    <dd>
                                      {log.actor?.name ||
                                        log.actor?.email ||
                                        log.actorUserId ||
                                        "미확인"}
                                    </dd>
                                  </div>

                                  <div>
                                    <dt className="font-semibold text-slate-500">
                                      결과
                                    </dt>
                                    <dd>{log.resultMessage ?? "-"}</dd>
                                  </div>
                                </dl>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">
                            아직 열람 또는 다운로드 기록이 없습니다.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
