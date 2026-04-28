"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "aibeopchin_intro_popup_hidden_until";

const features = [
  "사건 패키지 생성",
  "변호사 고유번호 열람",
  "AI 문서작성 보조",
  "전문분야 법률자료 리서치",
  "첨부자료·증거자료 정리",
  "전자소송 제출 보조 패키지",
];

export function AibeopchinIntroPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hiddenUntil = globalThis.localStorage.getItem(STORAGE_KEY);

    if (hiddenUntil && Number(hiddenUntil) > Date.now()) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      setOpen(true);
    }, 500);

    return () => globalThis.clearTimeout(timer);
  }, []);

  function close() {
    setOpen(false);
  }

  function hideForToday() {
    const oneDay = 24 * 60 * 60 * 1000;
    globalThis.localStorage.setItem(STORAGE_KEY, String(Date.now() + oneDay));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-aibeop-deep/35 px-4 backdrop-blur-sm">
      <dialog
        open
        aria-labelledby="aibeopchin-intro-title"
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-0 text-left shadow-2xl backdrop:bg-transparent"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-5 top-5 z-10 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-bold text-white backdrop-blur hover:bg-white/25"
          aria-label="안내 팝업 닫기"
        >
          ×
        </button>

        <div className="bg-gradient-to-br from-aibeop-deep via-aibeop-green to-aibeop-accent px-8 py-9 text-white">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
            Promotion / Demo Access Notice
          </div>

          <h2
            id="aibeopchin-intro-title"
            className="mt-5 text-4xl font-extrabold tracking-[-0.05em]"
          >
            AI법친
          </h2>

          <p className="mt-3 text-lg font-semibold leading-7 text-white/95">
            변호사와 의뢰인을 연결하는 AI 법률업무 협업 플랫폼
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/88">
            의뢰인은 사건자료를 체계적으로 정리하고, 변호사는 AI와 함께 법률문서,
            답변서, 증거자료, 전문분야 리서치, 전자소송 제출 준비를 더 빠르고
            정확하게 수행할 수 있습니다.
          </p>
        </div>

        <div className="px-8 py-7">
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-aibeop-line bg-aibeop-accentSoft px-4 py-3 text-sm font-bold text-aibeop-deep"
              >
                ✓ {item}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-[#fff7e8] px-4 py-4 text-sm leading-6 text-amber-950">
            <div className="font-extrabold">변호사법 준수 안내</div>
            <p className="mt-2">
              AI법친은 비변호사의 법률상담·법률대리·사건수임 알선 서비스를
              제공하지 않습니다.
            </p>
            <p className="mt-2">
              AI가 생성한 자료는 변호사의 검토를 위한 초안 및 참고자료이며,
              최종 법률판단, 문서 확정, 전자소송 제출은 변호사가 직접 수행합니다.
            </p>
            <p className="mt-2">
              AI법친은 특정 변호사를 추천·순위화·자동매칭하지 않으며,
              수임료 또는 성공보수의 일부를 분배받는 구조로 운영하지 않습니다.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-aibeop-line bg-aibeop-soft px-4 py-4 text-sm leading-6 text-aibeop-text">
            <div className="font-extrabold">업무지원 범위</div>
            <p className="mt-2">
              AI법친은 사건자료 정리, 법률문서 초안 작성, 근거자료 확인, 첨부자료
              정리, 제출 보조 패키지 생성을 지원합니다.
            </p>
            <p className="mt-2">
              전자소송 자동 제출 서비스를 제공하지 않으며, 변호사가 직접 제출할 수
              있도록 문서·첨부자료·증거목록·체크리스트를 정리하는 제출 보조 패키지만 제공합니다.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-aibeop-line bg-white px-4 py-4 text-sm leading-6 text-aibeop-muted">
            <div className="font-extrabold text-aibeop-text">데모 접근 안내</div>
            <p className="mt-2">
              데모 프리패스 로그인은 운영 환경변수에서 활성화된 경우에만 동작하며,
              비활성화 상태에서는 일반 계정 인증만 허용됩니다.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              onClick={close}
              className="flex-1 rounded-2xl bg-aibeop-green px-5 py-3 text-center text-sm font-extrabold text-white shadow-soft hover:bg-aibeop-deep"
            >
              로그인 / 데모 접속
            </Link>

            <button
              type="button"
              onClick={hideForToday}
              className="flex-1 rounded-2xl border border-aibeop-line bg-white px-5 py-3 text-sm font-extrabold text-aibeop-muted hover:bg-aibeop-soft"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}