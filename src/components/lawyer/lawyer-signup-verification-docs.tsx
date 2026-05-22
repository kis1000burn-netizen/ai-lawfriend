"use client";

import { useState } from "react";
import FormError from "@/components/auth/form-error";
import {
  LAWYER_VERIFICATION_DOCUMENT_TYPE,
  lawyerVerificationDocumentTypeLabelKo,
} from "@/lib/lawyer/lawyer-verification-document-types";

export type LawyerSignupVerificationDocPayload = {
  type: string;
  fileName: string;
  storageKey: string;
  bucket: string | null;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
};

type SlotKey =
  | typeof LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE
  | typeof LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID;

const SLOTS: { key: SlotKey; helper: string }[] = [
  {
    key: LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE,
    helper:
      "대한변호사협회 변호사 등록증 또는 등록 사실 확인에 쓰이는 발급물(PDF 스캔 등)을 업로드해 주세요.",
  },
  {
    key: LAWYER_VERIFICATION_DOCUMENT_TYPE.LEGAL_REPRESENTATIVE_ID,
    helper:
      "실명 확인을 위한 신분증(주민등록증·면허증 등). 주민등록번호 뒷자리·외국인등록증 민감 항목은 가리거나 블러 처리 후 제출해 주세요.",
  },
];

async function stagingUpload(slot: SlotKey, file: File): Promise<LawyerSignupVerificationDocPayload> {
  const form = new FormData();
  form.set("type", slot);
  form.set("file", file);
  const res = await fetch("/api/auth/signup-lawyer/staging-upload", {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => null as unknown);
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "message" in json && typeof json.message === "string"
        ? json.message
        : "증빙 업로드에 실패했습니다.";
    throw new Error(msg);
  }
  const payload =
    json && typeof json === "object" && "data" in json && typeof json.data === "object"
      ? (json.data as { document?: LawyerSignupVerificationDocPayload })
      : null;
  if (!payload?.document) throw new Error("서버 응답 형식이 올바르지 않습니다.");
  const d = payload.document;
  if (d.type !== slot) throw new Error("업로드 유형 불일치");
  return d;
}

type Props = {
  value: LawyerSignupVerificationDocPayload[];
  onChange: (next: LawyerSignupVerificationDocPayload[]) => void;
};

/** 변호사 가입 폼 안에 끼우는 증빙 업로드(스테이징 → 가입 신청 시 서버에서 프로필 키로 이관). */
export function LawyerSignupVerificationDocsPanel({ value, onChange }: Props) {
  const [uploading, setUploading] = useState<SlotKey | null>(null);
  const [error, setError] = useState("");

  function updateSlot(slot: SlotKey, doc: LawyerSignupVerificationDocPayload | null) {
    const rest = value.filter((d) => d.type !== slot);
    onChange(doc ? [...rest, doc] : rest);
  }

  function docFor(slot: SlotKey) {
    return value.find((d) => d.type === slot) ?? null;
  }

  async function onPickFile(slot: SlotKey, file: File | null) {
    setError("");
    if (!file) return;
    setUploading(slot);
    try {
      const doc = await stagingUpload(slot, file);
      updateSlot(slot, doc);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-aibeop-line bg-aibeop-surface/40 p-4">
      <div>
        <h2 className="text-sm font-semibold text-aibeop-text">자격·본인 확인 서류(필수)</h2>
        <p className="mt-1 text-xs leading-relaxed text-aibeop-muted">
          일반적인 전문가 자격 확인 절차에 따라 <strong>등록 증명</strong>과{" "}
          <strong>본인 확인용 신분증</strong>을 각각 제출해야 합니다. PDF·이미지(JPEG/PNG/WebP)만
          가능하며, 파일당 최대 20MB입니다.
        </p>
      </div>

      {SLOTS.map(({ key, helper }) => {
        const current = docFor(key);
        return (
          <div key={key} className="rounded-lg border border-aibeop-line bg-aibeop-card p-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-aibeop-text">
                {lawyerVerificationDocumentTypeLabelKo(key)}
              </span>
              {current ? (
                <span className="truncate text-xs text-aibeop-muted">{current.fileName}</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-aibeop-muted">{helper}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-lg border border-aibeop-line bg-aibeop-surface px-3 py-1.5 text-xs font-semibold text-aibeop-deep hover:bg-aibeop-soft">
                {uploading === key ? "업로드 중…" : current ? "다시 선택" : "파일 선택"}
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    void onPickFile(key, f);
                  }}
                />
              </label>
              {current ? (
                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:underline"
                  onClick={() => updateSlot(key, null)}
                >
                  제거
                </button>
              ) : null}
            </div>
          </div>
        );
      })}

      <FormError message={error} />
    </div>
  );
}
