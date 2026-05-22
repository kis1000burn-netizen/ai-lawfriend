"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import {
  LawyerSignupVerificationDocsPanel,
  type LawyerSignupVerificationDocPayload,
} from "@/components/lawyer/lawyer-signup-verification-docs";
import { useAuthForm } from "@/hooks/use-auth-form";

export default function SignupLawyerPage() {
  const router = useRouter();
  const { loading, errorMessage, submit } = useAuthForm();

  const [form, setForm] = useState({
    email: "",
    emailConfirm: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    phoneConfirm: "",
    registrationNumber: "",
    barAssociation: "",
    officeName: "",
    officeAddress: "",
    officePhone: "",
    websiteUrl: "",
    specialtiesNote: "",
  });

  const [integrityAttestationAccepted, setIntegrityAttestationAccepted] = useState(false);

  const [localError, setLocalError] = useState("");

  const [verificationDocs, setVerificationDocs] = useState<LawyerSignupVerificationDocPayload[]>(
    [],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (form.password !== form.passwordConfirm) {
      setLocalError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 8) {
      setLocalError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (verificationDocs.length < 2) {
      setLocalError("등록 증명·본인 확인용 신분증을 각각 업로드한 뒤 가입 신청해 주세요.");
      return;
    }

    if (!integrityAttestationAccepted) {
      setLocalError("무결 서약에 동의해야 가입할 수 있습니다.");
      return;
    }

    await submit({
      endpoint: "/api/auth/signup-lawyer",
      body: {
        email: form.email,
        emailConfirm: form.emailConfirm,
        password: form.password,
        name: form.name,
        phone: form.phone,
        phoneConfirm: form.phoneConfirm,
        registrationNumber: form.registrationNumber,
        barAssociation: form.barAssociation,
        officeName: form.officeName || undefined,
        officeAddress: form.officeAddress || undefined,
        officePhone: form.officePhone || undefined,
        websiteUrl: form.websiteUrl || undefined,
        specialtiesNote: form.specialtiesNote || undefined,
        acceptanceIntegrityAttestation: integrityAttestationAccepted,
        documents: verificationDocs,
      },
      onSuccess: async () => {
        router.push("/login?lawyerRegistered=1");
        router.refresh();
      },
    });
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-aibeop-text">변호사 회원가입</h1>
          <p className="mt-2 text-sm text-aibeop-muted">
            계정은 가입 직후 로그인할 수 있습니다. 단, <strong>등록 증명과 본인 확인용 신분증</strong>
            을 제출하고 관리자가 자격을 검증·승인한 뒤에만 사건 검토 등 전문 기능이 열립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="이메일"
            type="email"
            value={form.email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          />
          <AuthInput
            label="이메일 확인"
            type="email"
            value={form.emailConfirm}
            placeholder="다시 입력"
            autoComplete="email"
            onChange={(value) => setForm((prev) => ({ ...prev, emailConfirm: value }))}
          />
          <AuthInput
            label="비밀번호"
            type="password"
            value={form.password}
            placeholder="8자 이상"
            autoComplete="new-password"
            onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
          />
          <AuthInput
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            autoComplete="new-password"
            onChange={(value) => setForm((prev) => ({ ...prev, passwordConfirm: value }))}
          />
          <AuthInput
            label="이름"
            value={form.name}
            autoComplete="name"
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />
          <AuthInput
            label="휴대폰"
            value={form.phone}
            placeholder="01012345678"
            autoComplete="tel"
            onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
          />
          <AuthInput
            label="휴대폰 확인"
            value={form.phoneConfirm}
            placeholder="다시 입력"
            autoComplete="tel"
            onChange={(value) => setForm((prev) => ({ ...prev, phoneConfirm: value }))}
          />
          <AuthInput
            label="변호사 등록번호"
            value={form.registrationNumber}
            onChange={(value) => setForm((prev) => ({ ...prev, registrationNumber: value }))}
          />
          <AuthInput
            label="소속 지방변호사회"
            value={form.barAssociation}
            onChange={(value) => setForm((prev) => ({ ...prev, barAssociation: value }))}
          />
          <AuthInput
            label="사무소명(선택)"
            value={form.officeName}
            onChange={(value) => setForm((prev) => ({ ...prev, officeName: value }))}
          />
          <AuthInput
            label="사무소 주소(선택)"
            value={form.officeAddress}
            onChange={(value) => setForm((prev) => ({ ...prev, officeAddress: value }))}
          />
          <AuthInput
            label="사무소 전화(선택)"
            value={form.officePhone}
            onChange={(value) => setForm((prev) => ({ ...prev, officePhone: value }))}
          />
          <AuthInput
            label="홈페이지 URL(선택)"
            value={form.websiteUrl}
            onChange={(value) => setForm((prev) => ({ ...prev, websiteUrl: value }))}
          />
          <AuthInput
            label="전문분야·메모(선택)"
            value={form.specialtiesNote}
            onChange={(value) => setForm((prev) => ({ ...prev, specialtiesNote: value }))}
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-aibeop-line bg-aibeop-card p-4 text-sm leading-relaxed text-aibeop-text">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-aibeop-line"
              checked={integrityAttestationAccepted}
              onChange={(e) => setIntegrityAttestationAccepted(e.target.checked)}
            />
            <span>
              제출하는 자료는 제 본인 명의이며, 공개 자료의 무단 도용·위조 없이 정확히 제출함을
              확인합니다. 허위로 밝혀질 경우 자격 검증 무효·이용 제한 등 조치에 이의가 없습니다.
            </span>
          </label>

          <LawyerSignupVerificationDocsPanel
            value={verificationDocs}
            onChange={setVerificationDocs}
          />

          <FormError message={localError || errorMessage} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-aibeop-green px-4 py-3 text-white transition hover:bg-aibeop-deep disabled:opacity-50"
          >
            {loading ? "처리 중..." : "가입 신청"}
          </button>
        </form>

        <div className="mt-6 text-sm text-aibeop-muted">
          일반 회원이신가요?{" "}
          <Link href="/signup" className="font-medium text-aibeop-text underline">
            일반 회원가입
          </Link>
        </div>
      </div>
    </main>
  );
}
