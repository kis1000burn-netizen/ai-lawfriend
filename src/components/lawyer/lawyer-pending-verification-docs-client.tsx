"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormError from "@/components/auth/form-error";
import {
  LAWYER_VERIFICATION_DOCUMENT_TYPE_ORDER,
  LAWYER_VERIFICATION_DOCUMENT_TYPE,
  REQUIRED_LAWYER_VERIFICATION_DOCUMENT_TYPES,
  lawyerVerificationDocumentTypeLabelKo,
  getMissingRequiredLawyerVerificationDocumentTypes,
} from "@/lib/lawyer/lawyer-verification-document-types";

type DocRow = { id: string; type: string; fileName: string; uploadedAt: string };

type Props = {
  documents: DocRow[];
};

export function LawyerPendingVerificationDocsClient({ documents: initialDocuments }: Props) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [type, setType] = useState(LAWYER_VERIFICATION_DOCUMENT_TYPE.BAR_REGISTRATION_CERTIFICATE);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const missing = getMissingRequiredLawyerVerificationDocumentTypes(
    documents.map((d) => d.type),
  );

  async function uploadFile(file: File | null) {
    setError("");
    if (!file) return;

    const form = new FormData();
    form.set("type", type);
    form.set("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/lawyer/verification-documents", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null as unknown);
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "message" in json && typeof json.message === "string"
            ? json.message
            : "업로드에 실패했습니다.";
        throw new Error(msg);
      }
      const doc =
        json && typeof json === "object" && "data" in json && typeof json.data === "object"
          ? (json.data as { document?: DocRow & { uploadedAt?: string } }).document
          : undefined;
      if (doc?.id) {
        setDocuments((prev) => [
          {
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "업로드 오류");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mt-8 space-y-4 rounded-xl border border-aibeop-line bg-aibeop-surface p-5">
      <h2 className="text-sm font-semibold text-aibeop-text">자격·본인 확인 서류</h2>
      <p className="text-xs leading-relaxed text-aibeop-muted">
        플랫폼에서는 일반적인 전문가 자격 확인 절차에 따라 <strong>등록 증명</strong>과{" "}
        <strong>본인 확인용 신분증</strong>이 모두 있어야 심사를 진행할 수 있습니다. 신분증은
        민감정보를 가리거나 블러 처리한 뒤 제출해 주세요.
      </p>

      {missing.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <strong>미제출 필수 증빙:</strong>{" "}
          {missing.map((m) => lawyerVerificationDocumentTypeLabelKo(m)).join(", ")}
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950">
          필수 증빙 유형이 모두 접수된 상태입니다. 관리자 검토만 남았습니다.
        </div>
      )}

      {documents.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap justify-between gap-2 rounded-lg border border-aibeop-line bg-aibeop-card px-3 py-2"
            >
              <span className="font-medium text-aibeop-text">
                {lawyerVerificationDocumentTypeLabelKo(d.type)}
              </span>
              <span className="truncate text-xs text-aibeop-muted">{d.fileName}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-aibeop-muted">아직 제출된 파일이 없습니다.</p>
      )}

      <div className="space-y-2 border-t border-aibeop-line pt-4">
        <label className="block text-xs font-medium text-aibeop-text">추가·보완 업로드</label>
        <select
          className="w-full rounded-lg border border-aibeop-line bg-aibeop-card px-3 py-2 text-sm text-aibeop-text"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {LAWYER_VERIFICATION_DOCUMENT_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {lawyerVerificationDocumentTypeLabelKo(t)}
              {REQUIRED_LAWYER_VERIFICATION_DOCUMENT_TYPES.includes(t) ? " (필수)" : " (선택)"}
            </option>
          ))}
        </select>
        <p className="text-[11px] leading-relaxed text-aibeop-muted">
          동일 유형을 다시 올리면 추가 건으로 쌓입니다. 보완 요청 시 관리자 안내에 맞춰 제출해 주세요.
        </p>
        <label className="inline-flex cursor-pointer rounded-lg border border-aibeop-line bg-aibeop-card px-3 py-2 text-xs font-semibold text-aibeop-deep hover:bg-aibeop-soft">
          {uploading ? "업로드 중…" : "파일 선택 · 업로드"}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              e.target.value = "";
              void uploadFile(f);
            }}
          />
        </label>
      </div>

      <FormError message={error} />
    </section>
  );
}
