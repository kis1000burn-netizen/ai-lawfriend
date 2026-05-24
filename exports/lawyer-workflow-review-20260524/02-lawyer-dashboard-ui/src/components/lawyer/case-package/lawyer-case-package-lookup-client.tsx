"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CASE_PACKAGE_LAWYER_REVIEW_NOTICE,
} from "@/features/case-package/case-package-privacy-security-policy";

type LookupSuccessShare = {
  id: string;
  caseId: string;
  publicCode: string;
  status: string;
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowAttachmentDownload: boolean;
  allowDocumentDraft: boolean;
  allowPackagePdf: boolean;
  expiresAt?: string | null;
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

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeLookupShare(value: unknown): LookupSuccessShare | null {
  const record = asRecord(value);

  if (
    typeof record.id !== "string" ||
    typeof record.caseId !== "string" ||
    typeof record.publicCode !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    caseId: record.caseId,
    publicCode: record.publicCode,
    status: normalizeString(record.status, "ACTIVE"),
    allowSummary: normalizeBoolean(record.allowSummary, true),
    allowInterview: normalizeBoolean(record.allowInterview, true),
    allowAttachmentList: normalizeBoolean(record.allowAttachmentList, true),
    allowAttachmentDownload: normalizeBoolean(record.allowAttachmentDownload),
    allowDocumentDraft: normalizeBoolean(record.allowDocumentDraft),
    allowPackagePdf: normalizeBoolean(record.allowPackagePdf),
    expiresAt:
      typeof record.expiresAt === "string" ? record.expiresAt : null,
  };
}

function getErrorMessage(record: Record<string, unknown>): string {
  return normalizeString(
    record.message,
    "사건 패키지 고유번호를 조회하지 못했습니다.",
  );
}

export function LawyerCasePackageLookupClient() {
  const router = useRouter();
  const [publicCode, setPublicCode] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastShare, setLastShare] = useState<LookupSuccessShare | null>(null);

  async function handleLookup() {
    const trimmedPublicCode = publicCode.trim();

    if (!trimmedPublicCode) {
      setErrorMessage("사건 패키지 고유번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastShare(null);

    try {
      const response = await fetch("/api/lawyer/case-packages/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicCode: trimmedPublicCode,
          pin: pin.trim() || null,
        }),
      });

      const result: unknown = await response.json();
      const resultRecord = asRecord(result);

      if (!response.ok) {
        throw new Error(getErrorMessage(resultRecord));
      }

      const share = normalizeLookupShare(resultRecord.share);

      if (!share) {
        throw new Error("조회 응답의 사건 패키지 정보가 올바르지 않습니다.");
      }

      setLastShare(share);
      router.push(`/lawyer/case-packages/${share.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "사건 패키지 조회 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-aibeop-subtle">
          AI법친 변호사 열람
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-aibeop-text">
          사건 패키지 고유번호 조회
        </h1>

        <p className="mt-3 text-sm leading-6 text-aibeop-muted">
          의뢰인이 전달한 사건 패키지 고유번호를 입력하면, 허용된 범위 내에서
          사건 요약과 첨부자료 목록, 문서 초안의 기초를 확인할 수 있습니다.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-aibeop-muted">
              사건 패키지 고유번호
            </span>
            <input
              value={publicCode}
              onChange={(event) => setPublicCode(event.target.value)}
              placeholder="예: AIF-2026-000184"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-aibeop-muted">
              접근 PIN
            </span>
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="선택 입력"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            {errorMessage}
          </div>
        ) : null}

        {lastShare ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            사건 패키지를 확인했습니다. 상세 화면으로 이동합니다.
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handleLookup()}
          disabled={isSubmitting}
          className="mt-5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "조회 중..." : "사건 패키지 조회"}
        </button>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-semibold">안전 고지</p>
        <p className="mt-1">{CASE_PACKAGE_LAWYER_REVIEW_NOTICE}</p>
      </section>
    </main>
  );
}
