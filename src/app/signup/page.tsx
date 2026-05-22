"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import { useAuthForm } from "@/hooks/use-auth-form";

type SignupResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
  };
  message: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { loading, errorMessage, submit } = useAuthForm();

  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
  });

  const [localError, setLocalError] = useState("");

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

    await submit<
      { email: string; password: string; name: string; phone: string },
      SignupResponse
    >({
      endpoint: "/api/auth/signup",
      body: {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
      },
      onSuccess: async () => {
        router.push("/login?registered=1");
        router.refresh();
      },
    });
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-aibeop-text">회원가입</h1>
          <p className="mt-2 text-sm text-aibeop-muted">
            AI법친 계정을 만들고 사건 정리를 시작하세요.
          </p>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
            가입이 완료되면 바로 로그인할 수 있습니다. (이메일·휴대폰 본인확인 절차는 운영 정책에 따라
            단계적으로 적용합니다.)
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
            label="비밀번호"
            type="password"
            value={form.password}
            placeholder="8자 이상 입력"
            autoComplete="new-password"
            onChange={(value) =>
              setForm((prev) => ({ ...prev, password: value }))
            }
          />

          <AuthInput
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            placeholder="비밀번호를 다시 입력"
            autoComplete="new-password"
            onChange={(value) =>
              setForm((prev) => ({ ...prev, passwordConfirm: value }))
            }
          />

          <AuthInput
            label="이름"
            value={form.name}
            placeholder="홍길동"
            autoComplete="name"
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />

          <AuthInput
            label="전화번호(선택)"
            value={form.phone}
            placeholder="01012345678"
            autoComplete="tel"
            onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
          />

          <FormError message={localError || errorMessage} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-aibeop-green px-4 py-3 text-white transition hover:bg-aibeop-deep disabled:opacity-50"
          >
            {loading ? "가입 처리 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-6 text-sm text-aibeop-muted">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-aibeop-text underline">
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
