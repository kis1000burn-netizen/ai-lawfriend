"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CASE_PACKAGE_AI_LAWYER_ACT_NOTICE,
} from "@/features/case-package/case-package-privacy-security-policy";

type AttachmentItem = {
  id: string;
  filename: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt?: string | null;
};

type DocumentItem = {
  id: string;
  title: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type InterviewPreview = {
  completed: boolean;
  answerCount: number;
  publicSafeAnswers: Array<{
    questionKey: string;
    questionLabel: string;
    answerPreview: string;
  }>;
};

type LawyerCasePackageDetail = {
  share: {
    id: string;
    publicCode: string;
    expiresAt?: string | null;
    snapshotCaptured?: boolean;
    allowSummary: boolean;
    allowInterview: boolean;
    allowAttachmentList: boolean;
    allowAttachmentDownload: boolean;
    allowDocumentDraft: boolean;
    allowPackagePdf: boolean;
  };
  case: {
    id: string;
    title: string;
    status: string;
    caseType?: string | null;
    summary?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  owner: {
    id: string;
    name?: string | null;
  };
  attachments: AttachmentItem[];
  documents: DocumentItem[];
  interview?: InterviewPreview | null;
};

type LawyerCasePackageDetailClientProps = {
  shareId: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeAttachment(value: unknown): AttachmentItem | null {
  const record = asRecord(value);

  if (typeof record.id !== "string" || typeof record.filename !== "string") {
    return null;
  }

  return {
    id: record.id,
    filename: record.filename,
    mimeType: normalizeNullableString(record.mimeType),
    sizeBytes:
      typeof record.sizeBytes === "number" ? record.sizeBytes : null,
    createdAt: normalizeNullableString(record.createdAt),
  };
}

function normalizeDocument(value: unknown): DocumentItem | null {
  const record = asRecord(value);

  if (typeof record.id !== "string") {
    return null;
  }

  return {
    id: record.id,
    title: normalizeString(record.title, "제목 없음"),
    status: normalizeString(record.status, "UNKNOWN"),
    createdAt: normalizeNullableString(record.createdAt),
    updatedAt: normalizeNullableString(record.updatedAt),
  };
}

function normalizeInterviewPreview(value: unknown): InterviewPreview | null {
  const record = asRecord(value);
  if (
    typeof record.completed !== "boolean" ||
    typeof record.answerCount !== "number" ||
    !Array.isArray(record.publicSafeAnswers)
  ) {
    return null;
  }

  const answers = record.publicSafeAnswers.flatMap((item) => {
    const row = asRecord(item);
    if (
      typeof row.questionKey !== "string" ||
      typeof row.questionLabel !== "string" ||
      typeof row.answerPreview !== "string"
    ) {
      return [];
    }
    return [
      {
        questionKey: row.questionKey,
        questionLabel: row.questionLabel,
        answerPreview: row.answerPreview,
      },
    ];
  });

  return {
    completed: record.completed,
    answerCount: record.answerCount,
    publicSafeAnswers: answers,
  };
}

function normalizeDetail(value: unknown): LawyerCasePackageDetail | null {
  const record = asRecord(value);
  const share = asRecord(record.share);
  const caseRecord = asRecord(record.case);
  const owner = asRecord(record.owner);

  if (
    typeof share.id !== "string" ||
    typeof share.publicCode !== "string" ||
    typeof caseRecord.id !== "string" ||
    typeof caseRecord.title !== "string" ||
    typeof owner.id !== "string"
  ) {
    return null;
  }

  return {
    share: {
      id: share.id,
      publicCode: share.publicCode,
      expiresAt: normalizeNullableString(share.expiresAt),
      snapshotCaptured: normalizeBoolean(share.snapshotCaptured),
      allowSummary: normalizeBoolean(share.allowSummary, true),
      allowInterview: normalizeBoolean(share.allowInterview, true),
      allowAttachmentList: normalizeBoolean(share.allowAttachmentList, true),
      allowAttachmentDownload: normalizeBoolean(share.allowAttachmentDownload),
      allowDocumentDraft: normalizeBoolean(share.allowDocumentDraft),
      allowPackagePdf: normalizeBoolean(share.allowPackagePdf),
    },
    case: {
      id: caseRecord.id,
      title: caseRecord.title,
      status: normalizeString(caseRecord.status, "UNKNOWN"),
      caseType: normalizeNullableString(caseRecord.caseType),
      summary: normalizeNullableString(caseRecord.summary),
      createdAt: normalizeNullableString(caseRecord.createdAt),
      updatedAt: normalizeNullableString(caseRecord.updatedAt),
    },
    owner: {
      id: owner.id,
      name: normalizeNullableString(owner.name),
    },
    attachments: Array.isArray(record.attachments)
      ? record.attachments.flatMap((item) => {
          const normalized = normalizeAttachment(item);

          return normalized ? [normalized] : [];
        })
      : [],
    documents: Array.isArray(record.documents)
      ? record.documents.flatMap((item) => {
          const normalized = normalizeDocument(item);

          return normalized ? [normalized] : [];
        })
      : [],
    interview: record.interview
      ? normalizeInterviewPreview(record.interview)
      : null,
  };
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

function formatFileSize(sizeBytes?: number | null): string {
  if (!sizeBytes) {
    return "-";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function getErrorMessage(record: Record<string, unknown>): string {
  return normalizeString(
    record.message,
    "사건 패키지 상세 정보를 불러오지 못했습니다.",
  );
}

function PermissionBadge({
  allowed,
  label,
}: {
  allowed: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
        allowed
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {label}: {allowed ? "허용" : "불허"}
    </span>
  );
}

export function LawyerCasePackageDetailClient({
  shareId,
}: LawyerCasePackageDetailClientProps) {
  const [detail, setDetail] = useState<LawyerCasePackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/lawyer/case-packages/${shareId}`, {
        method: "GET",
      });

      const result: unknown = await response.json();
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessage(resultRecord));
      }

      const packagePayload = resultRecord.package;
      const normalized = normalizeDetail(packagePayload);

      if (!normalized) {
        throw new Error("사건 패키지 상세 응답이 올바르지 않습니다.");
      }

      setDetail(normalized);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "사건 패키지를 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          사건 패키지를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
          {errorMessage}
        </div>
      </main>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-semibold text-slate-500">
              {detail.share.publicCode}
            </p>

            {detail.share.snapshotCaptured ? (
              <p className="mt-1 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                공유 시점 사건파일 고정(스냅샷)
              </p>
            ) : null}

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {detail.case.title}
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              사건 유형: {detail.case.caseType ?? "미분류"} · 상태:{" "}
              {detail.case.status}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">공유 만료일</p>
            <p className="mt-1">{formatDateTime(detail.share.expiresAt)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <PermissionBadge
            allowed={detail.share.allowSummary}
            label="요약"
          />
          <PermissionBadge
            allowed={detail.share.allowInterview}
            label="인터뷰"
          />
          <PermissionBadge
            allowed={detail.share.allowAttachmentList}
            label="첨부목록"
          />
          <PermissionBadge
            allowed={detail.share.allowAttachmentDownload}
            label="첨부다운로드"
          />
          <PermissionBadge
            allowed={detail.share.allowDocumentDraft}
            label="문서초안"
          />
          <PermissionBadge
            allowed={detail.share.allowPackagePdf}
            label="패키지PDF"
          />
        </div>

        {detail.share.allowPackagePdf ? (
          <a
            href={`/api/lawyer/case-packages/${detail.share.id}/package-pdf`}
            className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            사건 패키지 요약본 다운로드
          </a>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-base font-semibold text-slate-950">사건 요약</p>

        {detail.share.allowSummary ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {detail.case.summary || "공유된 사건 요약이 없습니다."}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            의뢰인이 사건 요약 열람을 허용하지 않았습니다.
          </p>
        )}
      </section>

      {detail.share.allowInterview && detail.interview ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-base font-semibold text-slate-950">AI 인터뷰 요약(공유 스냅샷)</p>
          <p className="mt-1 text-xs text-slate-500">
            상태: {detail.interview.completed ? "완료" : "미완료"} · 응답{" "}
            {detail.interview.answerCount}건
          </p>
          <ul className="mt-4 space-y-3">
            {detail.interview.publicSafeAnswers.map((row) => (
              <li
                key={row.questionKey}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{row.questionLabel}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">
                  {row.answerPreview}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-base font-semibold text-slate-950">첨부자료 목록</p>

        {!detail.share.allowAttachmentList ? (
          <p className="mt-3 text-sm text-slate-500">
            의뢰인이 첨부자료 목록 열람을 허용하지 않았습니다.
          </p>
        ) : detail.attachments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            공유된 첨부자료가 없습니다.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">파일명</th>
                  <th className="px-3 py-2">유형</th>
                  <th className="px-3 py-2">크기</th>
                  <th className="px-3 py-2">등록일</th>
                  <th className="px-3 py-2">다운로드</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.attachments.map((attachment) => (
                  <tr key={attachment.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {attachment.filename}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {attachment.mimeType ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {formatFileSize(attachment.sizeBytes)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {formatDateTime(attachment.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {detail.share.allowAttachmentDownload ? (
                        <a
                          href={`/api/lawyer/case-packages/${detail.share.id}/attachments/${attachment.id}/download`}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          다운로드
                        </a>
                      ) : (
                        "불허"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-base font-semibold text-slate-950">
          문서 초안 / 문서 목록
        </p>

        {!detail.share.allowDocumentDraft ? (
          <p className="mt-3 text-sm text-slate-500">
            의뢰인이 문서 초안의 기초 열람을 허용하지 않았습니다.
          </p>
        ) : detail.documents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            공유된 문서 초안 또는 문서가 없습니다.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {detail.documents.map((document) => (
              <article
                key={document.id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <p className="font-semibold text-slate-950">
                  {document.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  상태: {document.status} · 수정일:{" "}
                  {formatDateTime(document.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-semibold">검토 안내</p>
        <p className="mt-1">{CASE_PACKAGE_AI_LAWYER_ACT_NOTICE}</p>
      </section>
    </main>
  );
}
