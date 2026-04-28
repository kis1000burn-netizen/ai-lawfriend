"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import { useAuthForm } from "@/hooks/use-auth-form";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
  message: string;
};

type LoginFormSubmitEvent = Parameters<
  NonNullable<React.ComponentProps<"form">["onSubmit"]>
>[0];

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const registered = searchParams.get("registered") === "1";

  const { loading, errorMessage, submit } = useAuthForm();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: LoginFormSubmitEvent) {
    e.preventDefault();

    await submit<typeof form, LoginResponse>({
      endpoint: "/api/auth/login",
      body: form,
      onSuccess: async () => {
        router.push(redirect);
        router.refresh();
      },
    });
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
        <div className="mb-8">
          <AibeopchinLogo compact />
          <h1 className="text-3xl font-bold text-aibeop-text">로그인</h1>
          <p className="mt-2 text-sm text-aibeop-muted">
            가입한 이메일 또는 데모 로그인 ID와 비밀번호로 로그인하세요.
          </p>
        {registered ? (
          <p className="mt-3 rounded-xl border border-aibeop-pale bg-aibeop-pale/60 px-3 py-2 text-xs leading-relaxed text-aibeop-deep">
            가입 신청이 접수되었습니다. <strong className="font-semibold">관리자 승인 후</strong>{" "}
            로그인할 수 있습니다.
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-aibeop-muted">
          승인 대기(PENDING)·정지(SUSPENDED) 계정은 로그인할 수 없습니다.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-aibeop-muted">
          승인이 끝났는데도 로그인되지 않으면 이메일·비밀번호를 확인하거나, 플랫폼 관리자에게 계정 상태를 문의하세요.
        </p>
        <div className="mt-4 rounded-2xl border border-aibeop-line bg-aibeop-soft px-4 py-3 text-sm leading-6 text-aibeop-text">
          <div className="font-extrabold">홍보/테스트 관계자 안내</div>
          <p className="mt-1 text-aibeop-muted">
            제공받은 데모 계정이 있는 관계자는 해당 아이디와 비밀번호로 AI법친의 주요 기능을 둘러볼 수 있습니다.
          </p>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="이메일 또는 데모 로그인 ID"
            value={form.email}
            placeholder="you@example.com 또는 nurionholdings"
            autoComplete="username"
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          />

          <AuthInput
            label="비밀번호"
            type="password"
            value={form.password}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            onChange={(value) =>
              setForm((prev) => ({ ...prev, password: value }))
            }
          />

          <FormError message={errorMessage} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-aibeop-green px-4 py-3 text-white transition hover:bg-aibeop-deep disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 text-sm text-aibeop-muted">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-aibeop-text underline">
            회원가입
          </Link>
        </div>
      </div>
    </main>
  );
}
